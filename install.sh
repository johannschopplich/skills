#!/usr/bin/env bash
# Links claude/ into ~/.claude and every skill into ~/.agents/skills, with ~/.claude/skills pointing there.
set -euo pipefail

repo=$(cd "$(dirname "$0")" && pwd)
mkdir -p ~/.claude/skills ~/.agents/skills

# A real directory in a skill's place stays: a .bak beside it would load as a second skill.
link_skill() {
  if [[ -e $1 && ! -L $1 ]]; then
    echo "skipped $1: not a symlink" >&2
    return
  fi
  ln -sfn "$2" "$1"
}

# A file already in a config's place moves aside to <name>.bak.
for source in "$repo"/claude/*; do
  target=~/.claude/$(basename "$source")
  [[ $(readlink "$target" || true) == "$source" ]] && continue
  if [[ -e $target && ! -L $target ]]; then
    mv "$target" "$target.bak"
  fi
  ln -sfn "$source" "$target"
done

for source in "$repo"/skills/*/; do
  name=$(basename "$source")
  link_skill ~/.agents/skills/"$name" "$repo/skills/$name"
  link_skill ~/.claude/skills/"$name" "../../.agents/skills/$name"
done

# Drops the links to skills this repo no longer has, agents first so the Claude links they leave dangling go too.
for target in ~/.agents/skills/* ~/.claude/skills/*; do
  if [[ -L $target && ! -e $target ]] && [[ $(readlink "$target") == "$repo"/skills/* || $(readlink "$target") == ../../.agents/skills/* ]]; then
    rm "$target"
  fi
done
