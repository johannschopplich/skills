#!/usr/bin/env bash
# Posts one GitLab review draft anchored to a diff line, reading the note body from stdin.
# Usage: draft-note.sh <project path or id> <mr iid> <file path> <new line | -> [old line] [--dry-run] < body.md
# A removed line passes "-" as the new line and its old line. GITLAB_HOST, when set, picks the host;
# otherwise glab takes the current directory's remote, falling back to gitlab.com.
set -euo pipefail

usage="Usage: draft-note.sh <project path or id> <mr iid> <file path> <new line | -> [old line] [--dry-run] < body.md"
if [[ $# -lt 4 ]]; then
  echo "$usage" >&2
  exit 1
fi

project="$1" iid="$2" file_path="$3" new_line="$4"
old_line="" is_dry_run=false
for argument in "${@:5}"; do
  if [[ "$argument" == "--dry-run" ]]; then is_dry_run=true; else old_line="$argument"; fi
done

if [[ "$new_line" == "-" && -z "$old_line" ]]; then
  echo "error: a removed line needs its old line" >&2
  echo "$usage" >&2
  exit 1
fi
if [[ "$new_line" == "-" ]]; then location="$file_path:$old_line (removed line)"; else location="$file_path:$new_line"; fi

host_args=()
if [[ -n "${GITLAB_HOST:-}" ]]; then
  host="${GITLAB_HOST#*://}"
  host_args=(--hostname "${host%%/*}")
fi

encoded_project="$(jq -rn --arg value "$project" '$value | @uri')"
api_base="projects/$encoded_project/merge_requests/$iid"
body="$(cat)"

diff_refs="$(glab api ${host_args[@]+"${host_args[@]}"} "$api_base" | jq -c '.diff_refs')"
if [[ "$diff_refs" == "null" ]]; then
  echo "error: MR $iid has no diff_refs yet" >&2
  exit 1
fi

# A renamed file keeps its old path in the MR's diff; every other file has the same path on both sides.
old_path="$(glab api ${host_args[@]+"${host_args[@]}"} --paginate "$api_base/diffs?per_page=100" \
  | jq -rs --arg path "$file_path" '[.[][] | select(.new_path == $path) | .old_path][0] // $path')"

payload="$(jq -n \
  --arg note "$body" \
  --argjson refs "$diff_refs" \
  --arg new_path "$file_path" \
  --arg old_path "$old_path" \
  --arg new_line "$new_line" \
  --arg old_line "$old_line" \
  '{
    note: $note,
    position: ({
      position_type: "text",
      base_sha: $refs.base_sha,
      start_sha: $refs.start_sha,
      head_sha: $refs.head_sha,
      new_path: $new_path,
      old_path: $old_path
    }
    + (if $new_line == "-" then {} else { new_line: ($new_line | tonumber) } end)
    + (if $old_line == "" then {} else { old_line: ($old_line | tonumber) } end))
  }')"

if [[ "$is_dry_run" == true ]]; then
  echo "$payload"
  exit 0
fi

response="$(printf '%s' "$payload" | glab api ${host_args[@]+"${host_args[@]}"} --method POST "$api_base/draft_notes" --input - -H "Content-Type: application/json")"
draft_id="$(jq -r '.id' <<<"$response")"
line_code="$(jq -r '.line_code // empty' <<<"$response")"

if [[ -z "$line_code" ]]; then
  if glab api ${host_args[@]+"${host_args[@]}"} --method DELETE "$api_base/draft_notes/$draft_id" >/dev/null; then
    echo "error: $location is outside the diff's hunks – draft $draft_id deleted, nothing posted" >&2
  else
    echo "error: $location is outside the diff's hunks, and draft $draft_id could not be deleted – delete it from the review drawer" >&2
  fi
  exit 1
fi

echo "draft $draft_id anchored at $location ($line_code)"
