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
- Record each `draft <id>` the script prints and list them in the checkpoint confirmation. After the author pushes, anchors go stale: delete this skill's drafts by id – in a new session, those whose text matches a finding being drafted again – and repost against the new `diff_refs`. Every other draft is the user's; leave it.
- `glab mr note` and `-f position[...]` both create a lineless general comment.
