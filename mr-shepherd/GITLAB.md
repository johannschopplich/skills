# GitLab Inline Drafts

Reached from [`mr-shepherd`](SKILL.md) before drafting inline comments and again when the tray's inline-drafts item is checked. Drafts are a pending review: private to the user until they press **Submit review** in GitLab, which sends the author one notification instead of one per comment.

Post each draft from the MR's worktree, or with `GITLAB_HOST` set to the MR's host – elsewhere `glab` resolves the host from the wrong remote:

```bash
<this skill's dir>/scripts/draft-note.sh <project path or id> <mr iid> <file path> <new line | -> [old line] [--dry-run] < body.md
```

It reads the MR's current `diff_refs`, sends the position as a JSON body, and fails unless GitLab anchored the draft to a line (`line_code` set) – a draft that isn't anchored is deleted again rather than left detached in the review drawer. `--dry-run` prints the payload without posting.

- An added line takes only `new line`; a context line takes both; a removed line takes only `old line`, passed as `-` for `new line`. Lines outside the diff's hunks can't be anchored – comment on the nearest changed line.
- A `suggestion` block (```` ```suggestion:-0+0 ````, offsets relative to the anchored line) holds only the lines that change; an empty block deletes them. Anything else the fix removes is named in the text.
- Changing a draft's text: delete it and post it again. Editing it in place drops its position while `line_code` still reads as set.
- Record each `draft <id>` the script prints and list the ids in the checkpoint confirmation. After the author pushes, the anchors go stale: delete this skill's drafts by those ids – in a new session, the drafts whose text matches a finding being drafted again – and post them again against the new `diff_refs`. Every other draft is the user's own; leave it in the review.
- `glab mr note` and `-f position[...]` both create a general comment with no line, which is the failure this file exists to prevent.
