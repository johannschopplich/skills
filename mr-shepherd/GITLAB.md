# GitLab Inline Drafts

Drafts form a pending review, private until the user presses **Submit review**.

Post from the MR's worktree, or with `GITLAB_HOST` set to the MR's host – elsewhere `glab` picks the wrong remote:

```bash
<this skill's dir>/scripts/draft-note.sh <project path or id> <mr iid> <file path> <new line | -> [old line] [--dry-run] < body.md
```

The script fails, and deletes the draft again, unless GitLab anchored it to a line (`line_code` set). `--dry-run` prints the payload.

- Added line: `new line` only. Context line: both. Removed line: `-` then `old line`. Lines outside the hunks can't anchor – use the nearest changed line.
- `suggestion` block (```` ```suggestion:-0+0 ````, offsets relative to the anchored line): an empty one deletes the lines. Name anything else the fix removes in the text.
- Changing a draft's text: delete and repost. Editing in place drops the position while `line_code` still reads as set.
- Record each `draft <id>` the script prints and list them in the brief. To repost, delete this skill's drafts by id and post against the new `diff_refs`. In a new session, this skill's drafts are those whose text matches a finding being drafted again. Every other draft is the user's; leave it.
- A reply to an existing thread: `jq -n --rawfile note body.md --arg discussion <discussion id> '{note: $note, in_reply_to_discussion_id: $discussion}' | glab api --method POST projects/<numeric project id>/merge_requests/<iid>/draft_notes --input - -H 'Content-Type: application/json'`.
- `glab mr note` and `-f position[...]` both create a lineless general comment.
