---
name: review-mr
description: Deep review of a GitLab merge request or GitHub pull request against the local codebase. Produces a prioritized punch list (must/should/nit). Use when the user asks to review an MR/PR, pastes an MR/PR link, or invokes /review-mr. Don't use for writing new code, triaging bugs, or posting comments to the platform.
---

# Review MR

Fetch the MR/PR via `glab` (GitLab) or `gh` (GitHub): title, description, full diff. Read the diff against the codebase around it: sibling files and the directory one level up. The lens is fit – does this diff belong in the code around it? Look for drift, half-applied changes, missing cleanup on a path, and tests that don't cover what the MR actually changes.

Don't post to the platform. Don't run tests or build.

## Severity

- **must**: the diff is wrong on its own terms – broken behavior on the fix path, breaking inconsistency with callers, missing coverage on the change being made, unsafe migration, security regression.
- **should**: drift, redundancy, hygiene, surprising defaults a user will hit.
- **nit**: name, cosmetic, low-impact.

Don't grade process and coordination concerns (target branch, CI config, PR labels, stacked-branch flow). Note them in one line at the end if relevant.

## Output

Punch list grouped by severity. Cite each item as `path:line`. End with one offer for a narrow follow-up spot-check.
