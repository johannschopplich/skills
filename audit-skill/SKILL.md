---
name: audit-skill
description: Audit a SKILL.md against loading, discoverability, effectiveness, and style rules, then produce a severity-grouped report.
disable-model-invocation: true
---

# Audit Skill

Produce a severity-grouped report listing every rule violation found in the skill's SKILL.md and folder layout, with file, line, and quoted evidence for each finding.

## Process

1. **Read** the skill's SKILL.md and list its folder tree.
2. **Run the checklist** below – every rule against the entire skill, each yielding a pass or a violation with evidence: file, line number, and the actual value or quoted text.
3. **Report** the findings using this template.

<report-template>
## Blockers
- <violation with evidence>

## Discoverability
- <violation with evidence>

## Effectiveness
- <violation with evidence>

## Quality
- <violation with evidence>

## Summary
N blockers, N discoverability, N effectiveness, N quality.
</report-template>

Omit any severity heading with zero findings. If nothing is flagged, report `Skill passes audit.` followed by the summary line.

## Checklist

### Blockers

Skill won't load, won't trigger, or will malfunction.

- `name` is 1–64 characters, lowercase `a-z` / digits / hyphens only, with no leading hyphen, no trailing hyphen, and no consecutive hyphens.
- `name` does not contain `claude` or `anthropic` anywhere (reserved).
- Frontmatter is wrapped in matching `---` delimiters and contains no XML angle brackets (`<` or `>`).
- `description` is under 1024 characters.
- `SKILL.md` exists at the skill root with the exact case-sensitive filename.

### Discoverability

Skill loads but won't trigger reliably, or triggers on wrong requests.

- `description` names the capability in the first 80 characters.
- `description` includes `Use when...` with concrete trigger verbs a user would say – **model-invoked skills only**; a `disable-model-invocation` skill strips triggers to a one-line human-facing summary.
- `description` includes a `Don't use for...` exclusion only when a sibling skill could plausibly be confused for this one; omit it when there's no real overlap, rather than pad with a contrived one.
- `description` uses third person (`the user`); the body is imperative or second person. Flag first person anywhere and second person in the description.
- Each `Use when...` trigger names a distinct case; flag synonym triggers that restate one.
- Trigger guidance lives only in the `description`; flag `When to use...` content in the body – it loads after the skill has already fired.
- Skill name is specific, not vague (`helper`, `utils`, `tool`, `agent`, `skill`).

### Effectiveness

Skill loads and triggers but steers the agent weakly.

- Every line changes behaviour versus the model's default; flag no-op instructions (`be thorough`, `write clean code`, `use best practices`) and exposition the model already knows.
- Every prohibition names the replacement behaviour; flag a bare `don't X` without a `do Y instead`.
- Alternatives are given as one default plus an escape hatch; flag a menu of interchangeable options with no stated default.
- Each rule or fact lives in exactly one place; flag the same meaning restated across sections.
- Completion criteria are checkable (`every modified file accounted for`); flag vague bounds (`understand the code`, `review thoroughly`).
- A concept's definition, rules, and caveats sit under one heading; flag one concept scattered across the file.
- `SKILL.md` inlines what every invocation path needs; material only some paths reach lives in a sibling file behind a pointer that states when to load it.

### Quality

Skill works but violates style or structure rules.

- `SKILL.md` is under 500 lines. Move detail into named sibling files if longer.
- `name` matches the parent directory exactly.
- Folder layout: only `scripts/`, `references/`, `assets/`, and `agents/` appear as subdirectories, each one level deep; no `README.md`, `CHANGELOG.md`, or human-facing documentation at the skill root.
- Sibling files link directly from `SKILL.md` – no reference-to-reference chains – and a reference file over 100 lines opens with a table of contents.
- Instructions are declarative: flag compliance hedging (`might want to`, `aim for`, `try to`), callout boxes (`> **Note:**`), closing summaries, preamble sections (`## Overview`, `## Introduction`, `## Background`), and self-confirmation prompts (`confirm you understand`). Calibrated facts (`logs are usually wrong`) and imperative `Consider X` pass.
- Terminology is consistent: one term per concept across the skill, with no drift between synonyms.
- Sequences are explicitly ordered (numbered list or phase headings) with decision branches (`if X → Y; else → Z`); rules are bulleted unless count or order is load-bearing (`all three must hold`).
