---
name: audit-skill
description: Audit a SKILL.md against loading, discoverability, and style rules, then produce a severity-grouped report. Use when asked to review, audit, critique, or validate an existing skill. Don't use for code reviews, PRs, or writing new skills.
disable-model-invocation: true
---

# Audit Skill

Produce a severity-grouped report listing every rule violation found in the skill's SKILL.md and folder layout, with file, line, and quoted evidence for each finding.

## Process

1. **Read** the skill's SKILL.md and list its folder tree.
2. **Run the checklist** below. Record each violation with specific evidence: file, line number, and the actual value or quoted text.
3. **Report** the findings using this template.

<report-template>
## Blockers
- <violation with evidence>

## Discoverability
- <violation with evidence>

## Quality
- <violation with evidence>

## Summary
N blockers, N discoverability, N quality.
</report-template>

Omit any severity heading with zero findings. If nothing is flagged, report `Skill passes audit.` followed by the summary line.

## Checklist

### Blockers

Skill won't load, won't trigger, or will malfunction.

- `name` matches the parent directory exactly.
- `name` is 1–64 characters, lowercase `a-z` / digits / hyphens only, with no leading hyphen, no trailing hyphen, and no consecutive hyphens.
- `name` does not contain `claude` or `anthropic` anywhere (reserved).
- Frontmatter is wrapped in matching `---` delimiters and contains no XML angle brackets (`<` or `>`).
- `description` is under 1024 characters.
- `SKILL.md` exists at the skill root with the exact case-sensitive filename.

### Discoverability

Skill loads but won't trigger reliably, or triggers on wrong requests.

- `description` names the capability in the first 80 characters.
- `description` includes `Use when...` with concrete trigger verbs a user would say.
- `description` includes `Don't use for...` with at least one concrete exclusion.
- `description` and skill body use third person – no `I`, `we`, `our`, `my`, `me`, `you`, or `your`.
- Skill name is specific, not vague (`helper`, `utils`, `tool`, `agent`, `skill`).

### Quality

Skill works but violates style or structure rules.

- `SKILL.md` is under 500 lines. Move detail into sibling files under `references/` if longer.
- Folder layout: only `scripts/`, `references/`, and `assets/` appear as subdirectories, each one level deep; no `README.md`, `CHANGELOG.md`, or human-facing documentation at the skill root.
- Instructions are declarative: no hedging (`typically`, `usually`, `might want to`, `aim for`, `consider`, `try to`), no callout boxes (`> **Note:**`), no closing summaries, no preamble sections (`## Overview`, `## Introduction`, `## Background`), and no self-confirmation prompts (`confirm you understand`).
- Terminology is consistent: one term per concept across the skill, with no drift between synonyms.
- Workflows are numbered lists with explicit decision branches (`if X → Y; else → Z`); rules and checklists are bulleted, never numbered.
