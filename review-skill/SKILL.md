---
name: review-skill
description: Review an agent skill's SKILL.md for structure, discoverability, and writing-style issues. Use when the user asks to review, audit, critique, or validate an existing skill, typically pointing at a SKILL.md file or skill directory. Don't use for reviewing code, PRs, diffs, or non-skill documentation; don't use for creating new skills.
---

# Review Skill

Review an agent skill against structure, discoverability, and writing-style rules. Report findings grouped by severity.

## Process

1. **Read** the target SKILL.md and list its directory tree.
2. **Simulate** – mentally execute the skill against a plausible user request. Flag any step that forces a guess: missing decision criteria, undefined inputs, ambiguous terminology.
3. **Run the checklist** below. Note every violation with specific evidence (file, line, or actual value).
4. **Report** findings using the template at the bottom.

## Checklist

### Frontmatter

- [ ] `name` is 1–64 chars, lowercase letters/numbers/hyphens only, no consecutive hyphens → **blocker**
- [ ] `name` matches the parent directory exactly → **blocker**
- [ ] `name` doesn't start with "claude" or "anthropic" (reserved) → **blocker**
- [ ] No XML angle brackets (`<` / `>`) anywhere in frontmatter → **blocker**
- [ ] `description` is under 1024 chars → **blocker**
- [ ] `description` states what the skill does in the first sentence → **discoverability**
- [ ] `description` includes "Use when..." with concrete trigger phrases users would actually say → **discoverability**
- [ ] `description` includes "Don't use for..." if the trigger surface is wide (common verbs like "review", "build", "fix") → **discoverability**
- [ ] `description` is written in third person, no "I" or "you" → **quality**

### Structure

- [ ] `SKILL.md` exists at skill root with exact case-sensitive filename → **blocker**
- [ ] `SKILL.md` is under 500 lines → **blocker**
- [ ] `SKILL.md` is under 200 lines (aim for terse; move detail to sibling files if longer) → **quality**
- [ ] `references/`, `assets/`, `scripts/` are one level deep only → **quality**
- [ ] No `README.md`, `CHANGELOG.md`, or human-facing docs inside the skill → **quality**
- [ ] No long-lived library code in `scripts/` (tiny single-purpose CLIs only) → **quality**

### Writing style

- [ ] Instructions use third-person imperative ("Read the file", not "You should read" or "I will read") → **quality**
- [ ] Workflows are numbered, with decision branches made explicit ("Step 2: if X, run Y; otherwise, skip to Step 3") → **quality**
- [ ] Terminology is consistent – one term per concept, no alternation → **quality**
- [ ] Reference files are loaded via explicit JiT instruction ("Read `references/x.md` for ...") → **quality**
- [ ] File paths are relative and use forward slashes → **quality**
- [ ] Output templates and schemas are concrete examples inside the skill, not described in prose → **quality**

### Scripts (if present)

- [ ] Each script is single-purpose → **quality**
- [ ] Scripts emit descriptive errors to stdout/stderr so the agent can self-correct → **quality**
- [ ] Scripts don't duplicate work the agent reliably does in-context → **quality**

## Severity

- **blocker**: skill won't load, won't trigger, or will malfunction. Must fix.
- **discoverability**: skill loads but won't trigger reliably, or triggers on wrong requests.
- **quality**: skill works but violates style or structure rules.

## Report format

Present findings as:

```md
## Blockers
- <specific violation with evidence>

## Discoverability
- <specific violation with evidence>

## Quality
- <specific violation with evidence>

## Summary
N blockers, N discoverability, N quality.
```

Omit any severity heading with zero findings. If nothing is flagged, report `Skill passes review.` with the summary line.
