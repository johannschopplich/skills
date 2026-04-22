---
name: review-mr
description: Deep review of a GitLab merge request or GitHub pull request against the local codebase. Produces a prioritized punch list (must/should/nit). Use when the user asks to review an MR/PR, pastes an MR/PR link, or invokes /review-mr. Don't use for writing new code, triaging bugs, or posting comments to the platform.
---

# Review MR

Fetch a GitLab MR or GitHub PR, read the diff against the local codebase, return a prioritized punch list. Hands-off.

## Inputs

- MR/PR number or URL.
- Optional focus hint in the invocation (e.g. "focus on test quality").

## Defaults

- Report in chat. Never post to the platform unless the user explicitly asks.
- Read the diff plus one level of surrounding code: files cited, direct consumers, sibling tests.
- Do not run tests or build.

## Process

### 1. Discover local conventions

List `.claude/skills/` and `.agents/skills/` in the repo, and `~/.claude/skills/`. Note any skill whose name matches the repo stack (language, framework, state manager). These compose in step 4.

### 2. Fetch

Call the `glab` (GitLab) or `gh` (GitHub) CLI. Pull title, description, and full diff.

### 3. Read surrounding code

For each changed file, open enough adjacent code to judge the change: the getter being modified, the caller consuming a new return shape, the sibling test file.

### 4. Run the checks

Apply each check below to the diff.

For drift: search the changed file's directory and one level up for the new pattern. Flag when it is rare and a competing pattern dominates.

For test files: invoke the `/tdd` skill.

For matching project convention skills from step 1: invoke them against the diff.

### 5. Return the punch list

## Checks

- Description vs reality: claim in the MR body matches the actual diff.
- Codebase drift: diff introduces a pattern that diverges from sibling files or existing convention.
- Cross-file consistency: same change applied everywhere it should be, not just where the author happened to edit.
- Dead weight: restated-name docstrings, duplicate tests, stale comments, commented-out code.
- Resource cleanup: dispose, tearDown, controllers, subscriptions, timers released on every path.
- Dependency diff: lockfile bumps, new transitive deps, widened version ranges.
- Migration safety: schema changes are reversible, destructive ops gated, backfill ordered correctly.
- Security surface: secrets in the diff, auth/authz paths, untrusted input reaching sinks.

## Output

Prioritized punch list, grouped by severity:

- **must**: correctness, missing coverage on the fix path, breaking inconsistency, unsafe migration, security regression.
- **should**: drift, redundancy, hygiene.
- **nit**: name, cosmetic, low-impact.

Cite each item as `path:line`.

End with one offer for a narrow follow-up spot-check.
