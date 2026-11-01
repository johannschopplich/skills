#!/usr/bin/env bash
# Adds a site to the web box from the Mac: deploy key, checkout, HTTP vhost, and the GitHub Actions secrets.
set -euo pipefail

domain=${1:?usage: add-site.sh <domain> <owner/repo> [web-root]}
repo=${2:?usage: add-site.sh <domain> <owner/repo> [web-root]}
web_root=${3:-}
host=$(ssh -G web | awk '$1 == "hostname" { print $2 }')

deploy_pub=$(ssh web site key "$domain")
existing_keys=$(gh repo deploy-key list -R "$repo" --json key -q '.[].key')
if ! grep -qxF "$(awk '{ print $1, $2 }' <<< "$deploy_pub")" <<< "$existing_keys"; then
  gh repo deploy-key add /dev/stdin -R "$repo" -t web <<< "$deploy_pub"
fi

# `site add` owns the web-root default and keeps a stored root on a rerun.
ssh web site add "$domain" "$repo" ${web_root:+"$web_root"}

ssh web site action-key "$domain" | gh secret set DEPLOY_SSH_KEY -R "$repo"
gh variable set DEPLOY_HOST -R "$repo" --body "$host"
gh variable set DEPLOY_KNOWN_HOSTS -R "$repo" --body "$host $(ssh web cat /etc/ssh/ssh_host_ed25519_key.pub | awk '{ print $1, $2 }')"

echo "added $domain"
