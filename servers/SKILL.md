---
name: servers
description: The user's Hetzner servers – web (Kirby sites) and dev (remote Claude Code and T3 Code). Use when provisioning, patching, or debugging a box, or adding or deploying a site.
---

# Servers

Two Hetzner Cloud boxes, Ubuntu 26.04, reached through the SSH aliases in the Mac's `~/.ssh/config`. Host data – IPs, the site list – lives there and on the boxes, never in this skill.

| Alias | Box | Login |
|---|---|---|
| `web` | the sites | `root`; sites, builds, and PHP run as `johann` |
| `dev` | coding agents | `johann` with passwordless sudo; T3 Code over Tailscale only |

Each box is the output of its idempotent `provision.sh`. A change to a box is an edit here plus a rerun; a hand edit on the box is drift the next run overwrites. `PHP_VERSIONS` and `NODE_VERSION` are set in both `provision.sh`: a new version goes into both. Drop a PHP version only once `ssh web site list` shows no site on it, then purge its `php8.x-*` on both boxes. Locked out: the Hetzner Console's rescue system.

## Web

**Provision or apply a change:** `rsync -a --delete <skill>/web/ web:/root/servers/ && ssh web bash /root/servers/provision.sh` – it re-renders every vhost from `web/nginx/site-*.conf`.

- **Site** – `/home/johann/<domain>`, a checkout of `main`. `ssh web site` prints its commands.
- **Box-only data** – `.env` and `storage/` (Panel content, accounts) exist only on the box. Hetzner Backups, 7 daily, are their only copy: no `git clean` in a site. Restore one site: in the Console, create a temporary server from a backup, rsync that site's `storage/` (or `.env`) back to web, then delete the temporary server. Rebuilding web from a backup rolls back every site. Deleting web deletes its backups – convert the one to keep into a snapshot first.
- **PHP** – every version in `PHP_VERSIONS` (`web/provision.sh`) runs its own PHP-FPM; a new site gets the newest, `site php` switches one.
- **Logs** – PHP and nginx errors: `/var/log/nginx/<domain>.error.log`; PHP-FPM pool warnings: `/var/log/php<version>-fpm.log`.

### Add a Site

1. `<skill>/web/add-site.sh <domain> <owner/repo> [web-root]` – the plugin playgrounds pass `playground/public`. Its deploy keys belong to the gh token: revoking the GitHub CLI's authorization deletes them all.
2. Add `.github/workflows/deploy.yml` from `web/repo/` if the repo lacks it. Every site builds with `web/build`; a build it doesn't cover is an edit there. The commit and push wait for the user's go; the push runs the first deploy. Done when that Deploy run is green.
3. Smoke test before DNS: `ssh web site test <domain>`, then `ssh web site test <domain> /panel`. `Status:` absent or 200/30x, no PHP error in the body. A failure that names PHP: `site php <domain> <older version>`, then test again.
4. The user points DNS at `web`: apex and `www` at IONOS, subdomains in Cloudflare, a proxied record set to DNS only – an edge forcing HTTPS sends the challenge to an origin without a certificate. Done when `dig +short <domain>` – and `www.<domain>` for an apex – answers with web's IP.
5. `ssh web site cert <domain>`, then a Cloudflare record goes back to proxied.

### Deploy

A push to `main` deploys. By hand, or to read a red run's output: `ssh web deploy <domain>`. A red deploy restores the previous commit.

### Patch

Unattended, rebooting itself at 04:30 when a package asks. Health check:

```sh
ssh web 'apt list --upgradable; cat /var/run/reboot-required; systemctl --failed --no-legend; certbot certificates 2>/dev/null | grep -E "Certificate Name|Expiry"; grep -h max_children /var/log/php*-fpm.log | tail -3; df -h /'
```

A full disk: `ssh web 'du -sh /home/johann/.local/share/pnpm /home/johann/.cache'`, then prune with `ssh web "runuser -l johann -c '. ~/.nvm/nvm.sh && pnpm store prune && composer clear-cache'"`.

## Dev

**Provision:** `scp <skill>/dev/provision.sh dev:/tmp/ && ssh dev sudo bash /tmp/provision.sh`. The first run goes in as root – `-o User=root` on both commands, no `sudo` – and closes root login.

After the first run, the user completes each login in their own terminal, inside `ssh dev`:

1. Once the tailnet's access controls hold [`dev/tailnet-policy.hujson`](dev/tailnet-policy.hujson) and its DNS settings have MagicDNS and HTTPS Certificates on: `sudo tailscale up --advertise-tags=tag:dev`, then rerun provision, which hands `tailscale serve` to `johann`.
2. `gh auth login` and `glab auth login`, both over HTTPS, so git uses their tokens – glab's browser login redirects to `localhost:7171`, so it runs inside `ssh -L 7171:localhost:7171 dev` – then `git config --global user.name '<name>'` and `git config --global user.email '<email>'`
3. `claude`, then `/login`
4. `t3 service install`, then `t3 pair --tailscale` – the pairing link or QR code goes to the phone's T3 app.

- **Credentials** – GitHub, GitLab, and Claude, plus what a private setup script adds. A lost phone: remove it in the Tailscale admin console, then on dev `t3 auth session list` and `t3 auth session revoke <id>`.
- **Dotfiles** – `DOTFILES_REPO` is cloned to `~/dotfiles` and linked into `~/.claude`; its `skills.txt` lists the skills dev installs. After a push to it, rerun provision.
- **Claude Code settings** – `provision.sh` writes them as managed settings, which outrank `~/.claude/settings.json`.
- **T3 Code** – permission mode stays off Auto (t3code #15353, #15503). A provision run that moves Node restarts it, ending its sessions.
- **PHP** – the CLI runs the newest of `PHP_VERSIONS`; `sudo update-alternatives --set php /usr/bin/php<version>` switches it.
- **Docker** – published ports bind to localhost; reach them through `tailscale serve` or an SSH tunnel.
- **Reboots** – manual: `ssh dev 'cat /var/run/reboot-required'`, then `sudo reboot` once no session runs.
