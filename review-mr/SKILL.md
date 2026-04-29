---
name: review-mr
description: Deep review of a GitLab merge request or GitHub pull request against the local codebase. Use when the user asks to review an MR/PR, pastes an MR/PR link, or invokes /review-mr.
disable-model-invocation: true
---

# Review MR

Fetch the MR/PR via `glab` or `gh`. Read the diff against the codebase around it: sibling files and the directory one level up. The lens is fit – does this diff belong in the code around it? Look for drift, half-applied changes, missing cleanup on a path, and tests that don't cover what the MR actually changes.

Don't post to the platform.

## Output

### What this MR does

Plain-English summary of the change, grounded in the diff and the ticket or MR description. Up to four sentences. One small code sketch only if a sketch clarifies more than prose. Don't restate the diff line-by-line. Don't invent intent the diff doesn't support.

### Punch list

Grouped by severity. Cite each item as `path:line`.

- **must**: broken on its own terms – wrong behavior on the fix path, breaking inconsistency with callers, missing coverage for the change, unsafe migration, security regression.
- **should**: drift, redundancy, hygiene, surprising defaults a user will hit.
- **nit**: name, cosmetic, low-impact.

Don't grade process and coordination concerns (target branch, CI config, PR labels, stacked-branch flow).

Offer one narrow follow-up.
