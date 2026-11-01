#!/usr/bin/env bash
# Links everything under claude/ into ~/.claude; a file already in its place moves aside to <name>.bak.
set -euo pipefail

repo=$(cd "$(dirname "$0")" && pwd)
mkdir -p ~/.claude

for source in "$repo"/claude/*; do
  target=~/.claude/$(basename "$source")
  [[ $(readlink "$target" || true) == "$source" ]] && continue
  if [[ -e $target || -L $target ]]; then
    mv "$target" "$target.bak"
  fi
  ln -s "$source" "$target"
done
