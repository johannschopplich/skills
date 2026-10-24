#!/usr/bin/env bash
# Provisions the dev box: hardening, Tailscale, Docker, PHP, gh, and nvm, Claude Code, T3 Code, and the dotfiles for the user.
set -euo pipefail

PHP_VERSIONS="8.5"
DEV_USER=johann
NODE_VERSION=24
DOTFILES_REPO=https://github.com/johannschopplich/dotfiles.git
SWAP_SIZE=4G

[[ $(id -u) == 0 ]] || { echo "run as root" >&2; exit 1; }
export DEBIAN_FRONTEND=noninteractive

# #region System
hostnamectl set-hostname dev
echo 'preserve_hostname: true' > /etc/cloud/cloud.cfg.d/99-hostname.cfg
timedatectl set-timezone Europe/Berlin

if [[ ! -f /swapfile ]]; then
  fallocate -l "$SWAP_SIZE" /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  swapon /swapfile
fi

# Security, -updates, and the third-party repos; reboots are manual.
cat > /etc/apt/apt.conf.d/20auto-upgrades <<'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
EOF
cat > /etc/apt/apt.conf.d/52servers <<'EOF'
Unattended-Upgrade::Origins-Pattern {
  "origin=Ubuntu,archive=${distro_codename}-updates";
  "origin=deb.sury.org,codename=${distro_codename}";
  "origin=Tailscale,codename=${distro_codename}";
  "origin=gh,codename=stable";
};
Dpkg::Options {
  "--force-confdef";
  "--force-confold";
};
EOF

install -d -m 755 /etc/apt/keyrings
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg -o /etc/apt/keyrings/githubcli.gpg
cat > /etc/apt/sources.list.d/github-cli.sources <<'EOF'
Types: deb
URIs: https://cli.github.com/packages
Suites: stable
Components: main
Signed-By: /etc/apt/keyrings/githubcli.gpg
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

php_packages=()
for version in $PHP_VERSIONS; do
  php_packages+=("php$version-"{cli,curl,gd,intl,mbstring,xml,zip})
done

# Docker writes its own iptables rules past ufw: published ports bind to localhost only.
install -d /etc/docker
echo '{ "ip": "127.0.0.1" }' > /etc/docker/daemon.json

apt-get update -q
apt-get upgrade -yq
apt-get install -yq --no-install-recommends \
  ufw unattended-upgrades \
  build-essential git curl unzip jq rsync tmux mosh ripgrep fd-find gh \
  docker.io docker-compose-v2 docker-buildx composer "${php_packages[@]}"

command -v tailscale > /dev/null || curl -fsSL https://tailscale.com/install.sh | sh
# Ubuntu's glab lags far behind; the latest release's .deb, checked against its checksums.
glab_version=$(curl -fsS 'https://gitlab.com/api/v4/projects/gitlab-org%2Fcli/releases?per_page=1' | jq -r '.[0].tag_name | ltrimstr("v")')
glab_release=https://gitlab.com/gitlab-org/cli/-/releases/v$glab_version/downloads
if [[ $(dpkg-query -W -f='${Version}' glab 2> /dev/null) != "$glab_version" ]]; then
  glab_deb=glab_${glab_version}_linux_$(dpkg --print-architecture).deb
  (cd /tmp && curl -fsSLO "$glab_release/$glab_deb" && curl -fsSL "$glab_release/checksums.txt" | grep " $glab_deb\$" | sha256sum -c -)
  apt-get install -yq "/tmp/$glab_deb"
  rm "/tmp/$glab_deb"
fi
ln -sf /usr/bin/fdfind /usr/local/bin/fd
# #endregion

# #region Firewall
ufw allow in on tailscale0
ufw allow 22/tcp
ufw --force enable
# `t3 pair --tailscale` drives `tailscale serve` as the user.
tailscale status > /dev/null 2>&1 && tailscale set --operator="$DEV_USER"
# #endregion

# #region User
id "$DEV_USER" &> /dev/null || useradd --create-home --shell /bin/bash "$DEV_USER"
usermod -aG sudo,docker "$DEV_USER"
echo "$DEV_USER ALL=(ALL) NOPASSWD:ALL" > "/etc/sudoers.d/$DEV_USER"
chmod 440 "/etc/sudoers.d/$DEV_USER"
visudo -cq

home=/home/$DEV_USER
install -d -m 700 -o "$DEV_USER" -g "$DEV_USER" "$home/.ssh"
if [[ ! -s $home/.ssh/authorized_keys ]]; then
  install -m 600 -o "$DEV_USER" -g "$DEV_USER" /root/.ssh/authorized_keys "$home/.ssh/authorized_keys"
fi
loginctl enable-linger "$DEV_USER"

# Root login closes here, once the user holds root's keys.
cat > /etc/ssh/sshd_config.d/10-servers.conf <<'EOF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin no
EOF
sshd -t
systemctl restart ssh

if [[ ! -d $home/.nvm ]]; then
  runuser -l "$DEV_USER" -c 'curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh | bash'
fi
# Node 25+ no longer bundles corepack.
runuser -l "$DEV_USER" -c ". ~/.nvm/nvm.sh && nvm install $NODE_VERSION && nvm alias default $NODE_VERSION && npm install -g corepack@latest && corepack enable"
# Uninstalls every Node version but the default, which nvm never does on its own.
removed_node_versions=$(runuser -l "$DEV_USER" -c '. ~/.nvm/nvm.sh && for dir in ~/.nvm/versions/node/*; do [[ ${dir##*/} == $(nvm version default) ]] || { nvm uninstall "${dir##*/}" > /dev/null && echo "${dir##*/}"; }; done')
# T3's sessions keep the PATH of the Node it started under, so it restarts once that Node is gone – ending the running sessions.
if [[ -n $removed_node_versions && -f $home/.config/systemd/user/t3code.service ]]; then
  systemctl --user -M "$DEV_USER@" restart t3code
fi

runuser -l "$DEV_USER" -c '[[ -x ~/.local/bin/claude ]] || curl -fsSL https://claude.ai/install.sh | bash'
if [[ -d $home/dotfiles ]]; then
  runuser -l "$DEV_USER" -c 'git -C ~/dotfiles pull -q --ff-only'
else
  runuser -l "$DEV_USER" -c "git clone -q $DOTFILES_REPO ~/dotfiles"
fi
runuser -l "$DEV_USER" -c '~/dotfiles/install.sh'
# Managed settings outrank the user's own, which Claude Code itself writes to.
install -d /etc/claude-code
cat > /etc/claude-code/managed-settings.json <<'EOF'
{
  "attribution": {
    "commit": "",
    "pr": ""
  },
  "disableClaudeAiConnectors": true,
  "syncClaudeAiSkills": false,
  "disableArtifact": true,
  "disableRemoteControl": true,
  "cleanupPeriodDays": 180,
  "enabledPlugins": {
    "cowork-plugin-management@synced": false
  },
  "hooks": {
    "UserPromptSubmit": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/hooks/skill-mentions.mjs"
          }
        ]
      }
    ]
  },
  "permissions": {
    "allow": [
      "Bash(git status*)",
      "Bash(git log*)",
      "Bash(git diff*)",
      "Bash(git show*)",
      "Bash(git rev-parse*)",
      "Bash(git commit --fixup*)",
      "Bash(git commit --amend*)",
      "Bash(git rebase --autosquash*)",
      "Bash(pnpm -s lint*)",
      "Bash(pnpm -s test:types*)",
      "Bash(pnpm -s vitest run*)",
      "Bash(vendor/bin/phpunit*)"
    ],
    "deny": [
      "EnterPlanMode",
      "ExitPlanMode",
      "AskUserQuestion",
      "DesignSync"
    ],
    "defaultMode": "auto"
  }
}
EOF
# Installs the skills the dotfiles' skills.txt lists and removes the CLI's installs it no longer does.
runuser -l "$DEV_USER" -c "$(cat <<'EOF'
set -euo pipefail
. ~/.nvm/nvm.sh
listed=()
while read -r repo skills <&3; do
  [[ -z $repo || $repo == '#'* ]] && continue
  npx -y skills add "$repo" -g -y --skill $skills < /dev/null > /dev/null
  listed+=($skills)
done 3< ~/dotfiles/skills.txt
for installed in $(jq -r '.skills | keys[]' ~/.agents/.skill-lock.json); do
  [[ " ${listed[*]} " == *" $installed "* ]] || npx -y skills remove -g -y "$installed" < /dev/null > /dev/null
done
EOF
)"
runuser -l "$DEV_USER" -c '[[ -x ~/.local/bin/t3 ]] || curl -fsSL https://t3.codes/install.sh | sh'
# Ubuntu's AppArmor blocks the sandbox of T3's browser until this runs.
"$home/.local/bin/t3" browser setup
# #endregion

echo "dev provisioned"
