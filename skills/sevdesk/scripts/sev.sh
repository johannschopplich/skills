#!/usr/bin/env bash

set -u
set -o pipefail

usage() {
  echo "Usage: sev.sh <GET|POST|PUT|DELETE> <path> [curl args...]" >&2
  echo "Example: sev.sh GET '/Voucher/123/getPositions?embed=accountDatev'" >&2
  echo "Example: sev.sh POST /Voucher/Factory/saveVoucher -H 'Content-Type: application/json' --data @payload.json" >&2
  exit 2
}

[[ $# -ge 2 ]] || usage

if [[ -z "${SEVDESK_API_KEY:-}" && -f .env ]]; then
  SEVDESK_API_KEY=$(sed -n 's/^SEVDESK_API_KEY=//p' .env | tr -d "\"' \r")
fi

[[ -n "${SEVDESK_API_KEY:-}" ]] || {
  echo "SEVDESK_API_KEY is not set (environment or ./.env)" >&2
  exit 2
}

METHOD=$1
API_PATH=$2
shift 2

[[ "$API_PATH" != *enshrine* ]] || {
  echo "enshrine (Festschreiben) never runs through this script" >&2
  exit 2
}

for arg in "$@"; do
  case "$arg" in
    -v | --verbose | --trace*) echo "$arg would print the token" >&2; exit 2 ;;
  esac
done

curl -sS --globoff --fail-with-body -X "$METHOD" "https://my.sevdesk.de/api/v1$API_PATH" \
  -H @<(printf 'Authorization: %s' "$SEVDESK_API_KEY") \
  -H "Accept: application/json" \
  -H "User-Agent: sevdesk-skill" \
  "$@"
