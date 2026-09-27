---
name: audit-skill
description: Audit a SKILL.md against loading, discoverability, effectiveness, and style rules, then produce a severity-grouped report.
disable-model-invocation: true
---

# Audit Skill

Produce a severity-grouped report listing every rule violation found in the skill's SKILL.md, linked files, scripts, and folder layout, with file, line, and quoted evidence for each finding.

## Process

1. **Read** the skill's SKILL.md, every file it links, and every script it runs; list its folder tree.
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
- `description` plus `when_to_use` total at most 1,536 characters (Claude Code truncates beyond that), with the key use case first.
- `description` includes `Use when...` with concrete trigger verbs a user would say – **model-invoked skills only**; a `disable-model-invocation` skill strips triggers to a one-line human-facing summary.
- `description` includes a `Don't use for...` exclusion only when a sibling skill could plausibly be confused for this one; omit it when there's no real overlap, rather than pad with a contrived one.
- `description` uses third person (`the user`); the body is imperative or second person. Flag first person anywhere and second person in the description.
- Each `Use when...` trigger names a distinct case; flag synonym triggers that restate one.
- Trigger guidance lives only in `description` or `when_to_use`; flag `When to use...` content in the body – it loads after the skill has already fired.
- Skill name is specific, not vague (`helper`, `utils`, `tool`, `agent`, `skill`).
- Invocation fits the use: side-effecting or manual workflows (commits, deploys, external writes) set `disable-model-invocation: true`; background knowledge sets `user-invocable: false`; `paths` is set when relevance depends on file globs. Model-invoked only when the agent or another skill must reach it.

### Effectiveness

Skill loads and triggers but steers the agent weakly.

- Every line changes behavior versus the model's default; flag no-op instructions (`be thorough`, `write clean code`, `use best practices`) and exposition the model already knows.
- Every prohibition names the replacement behavior; flag a bare `don't X` without a `do Y instead`.
- Alternatives are given as one default plus an escape hatch; flag a menu of interchangeable options with no stated default.
- Each rule or fact lives in exactly one place; flag the same meaning restated across sections.
- Completion criteria are checkable (`every modified file accounted for`); flag vague bounds (`understand the code`, `review thoroughly`).
- A concept's definition, rules, and caveats sit under one heading; flag one concept scattered across the file.
- `SKILL.md` inlines what every invocation path needs; material only some paths reach lives in a sibling file behind a pointer that states when to load it.
- Emphasis is placement and reason, not volume: flag ALL-CAPS, `CRITICAL`, `IMPORTANT`, or `MUST` used for emphasis; replace with a plain conditional (`Use X when…`) plus a one-clause reason. Absolutes stay only for real invariants, each with a satisfaction criterion or fallback.
- No self-verification: flag instructions or steps that re-check the agent's own work (`double-check`, a final re-check step, a subagent dispatched to verify it). Distinct and passing: a writer–verifier split where one agent checks another's output as part of the skill's design, a separate pass that filters reported findings, and deterministic validators (scripts, tests).
- Subagent guidance is scoped: flag delegation of work a handful of tool calls finishes; delegation fits large, independent, parallel tracks and the writer–verifier split above.
- Review or finding skills ask for every finding with severity (and confidence) and filter downstream; flag `only report high-severity`, `be conservative`, `don't nitpick`.
- Narrow skills state their scope (`deliver what was asked, at the scope intended; if a better approach exists, say so in a sentence and continue as asked`).
- No written-out reasoning: flag `explain your reasoning step by step` in the output and `<thinking>` tags.
- Unattended skills (`context: fork`, background, loops) state a completion condition, name the early stops to avoid, and keep confirmation for destructive actions.
- `effort` frontmatter carries a stated reason, and `xhigh` or `max` a measured gain; flag `think hard` or `think deeply` used as a trigger – Claude Code passes them through as plain text (`ultrathink` is the recognized keyword).
- Skills that have the agent write documents to disk (reports, Markdown files, summaries) state a length target for them.
- Output-producing skills define the shape of the final report, and of progress updates on long runs, with a positive example (template or sample).
- Tool use is conditioned (`use X when…`), not forced; MCP tools are named fully qualified (`ServerName:tool_name`).
- Specificity matches the task's fragility: exact commands or scripts where a wrong step breaks things, heuristics where several approaches are valid.
- Examples sit in `<example>` tags, 3–5 of them, varied enough that the agent generalizes rather than copies one.
- Skills that act across files, apps, or sources read the relevant ones before acting; pasted or untrusted input is wrapped in tags and marked as data.
- Design or frontend skills name the specific patterns to avoid, not "avoid a generic look".

### Quality

Skill works but violates style or structure rules.

- `SKILL.md` is under 500 lines. Move detail into named sibling files if longer.
- `name` matches the parent directory exactly.
- Folder layout: only `scripts/`, `references/`, `assets/`, and `agents/` appear as subdirectories, each one level deep; no `README.md`, `CHANGELOG.md`, or human-facing documentation at the skill root.
- Sibling files link directly from `SKILL.md` – no reference-to-reference chains – and a reference file over 100 lines opens with a table of contents.
- Instructions are declarative: flag compliance hedging (`might want to`, `aim for`, `try to`), callout boxes (`> **Note:**`), closing summaries, preamble sections (`## Overview`, `## Introduction`, `## Background`), and self-confirmation prompts (`confirm you understand`). Calibrated facts (`logs are usually wrong`) and imperative `Consider X` pass.
- Terminology is consistent: one term per concept across the skill, with no drift between synonyms.
- Sequences are explicitly ordered (numbered list or phase headings) with decision branches (`if X → Y; else → Z`); rules are bulleted unless count or order is load-bearing (`all three must hold`).
- Version-pinned facts (model IDs, API parameters, CLI flags, effort levels) in SKILL.md and scripts match the tool's `--help` output or the vendor's live docs, checked now rather than recalled; flag superseded models and parameters that now return errors.
- Everything the skill needs after compaction sits in the first ~5,000 tokens of SKILL.md.
