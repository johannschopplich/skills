#!/usr/bin/env bash
# Provisions the web box: hardening, nginx.org nginx, PHP-FPM, certbot, nvm, the `site` and `deploy` commands.
set -euo pipefail

PHP_VERSIONS="8.5"
SITE_USER=johann
NODE_VERSION=24
SWAP_SIZE=2G
here=$(cd "$(dirname "$0")" && pwd)

[[ $(id -u) == 0 ]] || { echo "run as root" >&2; exit 1; }
export DEBIAN_FRONTEND=noninteractive

# #region System
hostnamectl set-hostname web
echo 'preserve_hostname: true' > /etc/cloud/cloud.cfg.d/99-hostname.cfg
timedatectl set-timezone Europe/Berlin

if [[ ! -f /swapfile ]]; then
  fallocate -l "$SWAP_SIZE" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  swapon /swapfile
fi

install -d -m 755 /etc/apt/keyrings
curl -fsSL https://nginx.org/keys/nginx_signing.key | gpg --dearmor --yes -o /etc/apt/keyrings/nginx.gpg
cat > /etc/apt/sources.list.d/nginx.sources <<EOF
Types: deb
URIs: https://nginx.org/packages/ubuntu
Suites: $(lsb_release -cs)
Components: nginx
Signed-By: /etc/apt/keyrings/nginx.gpg
EOF
curl -fsSL https://packages.sury.org/debsuryorg-archive-keyring.deb -o /tmp/debsuryorg-archive-keyring.deb
dpkg -i /tmp/debsuryorg-archive-keyring.deb
cat > /etc/apt/sources.list.d/php.sources <<EOF
Types: deb
URIs: https://packages.sury.org/php
Suites: $(lsb_release -cs)
Components: main
Signed-By: /usr/share/keyrings/debsuryorg-archive-keyring.gpg
EOF
cat > /etc/apt/preferences.d/99nginx <<'EOF'
Package: *
Pin: origin nginx.org
Pin: release o=nginx
Pin-Priority: 900
EOF

cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
cat > /etc/apt/apt.conf.d/52servers <<'EOF'
Unattended-Upgrade::Origins-Pattern {
  "origin=Ubuntu,archive=${distro_codename}-updates";
  "origin=nginx,codename=${distro_codename}";
  "origin=deb.sury.org,codename=${distro_codename}";
};
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "04:30";
Dpkg::Options {
  "--force-confdef";
  "--force-confold";
};
EOF

php_packages=()
for version in $PHP_VERSIONS; do
  php_packages+=("php$version-"{fpm,cli,curl,gd,intl,mbstring,xml,zip})
done

apt-get update -q
apt-get upgrade -yq
apt-get install -yq --no-install-recommends \
  nginx certbot ufw fail2ban unattended-upgrades \
  git curl unzip jq rsync libfcgi-bin composer "${php_packages[@]}"
# #endregion

# #region Hardening
cat > /etc/ssh/sshd_config.d/10-servers.conf <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
EOF
sshd -t
systemctl restart ssh

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# The package's own jail covers sshd.
systemctl enable --now fail2ban
# #endregion

# #region Site user
if ! id "$SITE_USER" &>/dev/null; then
  useradd --create-home --shell /bin/bash "$SITE_USER"
fi
home=/home/$SITE_USER
chmod 750 "$home"
usermod -aG "$SITE_USER" nginx

# Writes into the site user's home run as that user, so a planted symlink can't redirect a root write.
# Admin keys reach the site user too; the `deploy:` keys of `site action-key` survive a rerun.
runuser -l "$SITE_USER" -c 'umask 077 && mkdir -p ~/.ssh/deploy ~/.ssh/config.d && cd ~/.ssh && echo "Include config.d/*" > config && { grep " deploy:[^ ]*$" authorized_keys 2> /dev/null || true; cat; } > authorized_keys.new && mv authorized_keys.new authorized_keys' \
  < /root/.ssh/authorized_keys
curl -fsS https://api.github.com/meta | jq -r '.ssh_keys[] | "github.com " + .' |
  runuser -l "$SITE_USER" -c 'umask 077 && cat > ~/.ssh/known_hosts'

if [[ ! -d $home/.nvm ]]; then
  runuser -l "$SITE_USER" -c 'curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash'
fi
# Node 25+ no longer bundles corepack.
runuser -l "$SITE_USER" -c ". ~/.nvm/nvm.sh && nvm install $NODE_VERSION && nvm alias default $NODE_VERSION && npm install -g corepack@latest && corepack enable"
# #endregion

# #region PHP
for version in $PHP_VERSIONS; do
  sed -i \
    -e "s/^user = .*/user = $SITE_USER/" \
    -e "s/^group = .*/group = $SITE_USER/" \
    -e "s/^listen.owner = .*/listen.owner = nginx/" \
    -e "s/^listen.group = .*/listen.group = nginx/" \
    -e "s/^pm = .*/pm = ondemand/" \
    -e "s/^pm.max_children = .*/pm.max_children = 8/" \
    -e "s/^;\?request_terminate_timeout = .*/request_terminate_timeout = 120s/" \
    "/etc/php/$version/fpm/pool.d/www.conf"
  printf '%s\n' 'memory_limit = 1024M' 'upload_max_filesize = 64M' 'post_max_size = 64M' \
    'opcache.memory_consumption = 256' 'opcache.max_accelerated_files = 32531' \
    > "/etc/php/$version/fpm/conf.d/99-servers.ini"
  systemctl restart "php$version-fpm"
  # `deploy` puts this directory first on PATH; composer gets a wrapper, since its shebang names /usr/bin/php.
  install -d "/usr/local/lib/servers/php$version"
  ln -sf "/usr/bin/php$version" "/usr/local/lib/servers/php$version/php"
  printf '#!/bin/sh\nexec /usr/bin/php%s /usr/bin/composer "$@"\n' "$version" > "/usr/local/lib/servers/php$version/composer"
  chmod 755 "/usr/local/lib/servers/php$version/composer"
done
# #endregion

# #region nginx
rm -f /etc/nginx/conf.d/default.conf
install -d /etc/nginx/snippets /var/www/acme
install -m 644 "$here"/nginx/00-http.conf "$here"/nginx/00-default.conf "$here"/nginx/cloudflare.conf /etc/nginx/conf.d/
install -m 644 "$here"/nginx/kirby.conf /etc/nginx/snippets/
install -d /usr/local/share/servers /etc/servers/sites
install -m 644 "$here"/nginx/site-*.conf /usr/local/share/servers/
install -m 755 "$here"/site /usr/local/sbin/site
install -m 755 "$here"/deploy /usr/local/bin/deploy
install -m 755 "$here"/build /usr/local/lib/servers/build
for state in /etc/servers/sites/*; do
  if [[ -f $state ]]; then site render "$(basename "$state")"; fi
done
nginx -t
systemctl enable nginx
systemctl reload-or-restart nginx

install -d /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx <<'EOF'
#!/bin/sh
nginx -t && systemctl reload nginx
EOF
chmod 755 /etc/letsencrypt/renewal-hooks/deploy/reload-nginx
# #endregion

echo "web provisioned: nginx $(nginx -v 2>&1 | cut -d/ -f2), PHP $(php -r 'echo PHP_VERSION;')"
