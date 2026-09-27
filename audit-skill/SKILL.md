---
name: audit-skill
description: Audit a SKILL.md against loading, discoverability, effectiveness, and style rules, then produce a severity-grouped report.
disable-model-invocation: true
---

# Audit Skill

## Process

1. **Read** the skill's SKILL.md, every file it links, and every script it runs; list its folder tree. Load `writing-for-agents` with its SKILL-MECHANICS.md.
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

Won't load, won't trigger, or malfunctions.

- `name`: 1–64 characters of `a-z`, digits, and single inner hyphens; no `claude` or `anthropic` (reserved).
- Frontmatter sits between matching `---` delimiters and contains no `<` or `>`.
- `description` under 1024 characters.
- `SKILL.md` at the skill root, exact case.

### Discoverability

Loads, but triggers unreliably or on the wrong requests.

- `description` names the capability in the first 80 characters; with `when_to_use` it stays within 1,536 characters, key use case first.
- Model-invoked: `description` carries `Use when...` with the user's trigger verbs, one per branch. User-invoked: a one-line human-facing summary.
- `Don't use for...` only when a sibling skill is plausibly confused with this one; flag a contrived one.
- `description` in third person (`the user`); flag first person anywhere.
- Trigger guidance lives only in `description` or `when_to_use`; flag `When to use...` in the body.
- Name is specific; flag `helper`, `utils`, `tool`, `agent`, `skill`.
- Invocation fits the use: side-effecting workflows (commits, deploys, external writes) set `disable-model-invocation: true` unless a subagent or another skill must reach it; background knowledge `user-invocable: false`, glob-bound relevance `paths`.

### Effectiveness

Triggers, but steers weakly.

- Every writing-for-agents lever holds: flag no-ops, bare prohibitions, duplication, vague completion criteria, scattered concepts, sprawl, and restatements a leading word would retire.
- Alternatives are one default plus an escape hatch; flag a menu with no default.
- Emphasis: flag ALL-CAPS, `CRITICAL`, `IMPORTANT`, `MUST` used for volume; the fix is a plain conditional (`Use X when…`) plus a one-clause reason. Absolutes only for real invariants, with a satisfaction criterion or fallback.
- Self-verification: flag re-checks of the agent's own work (`double-check`, a final re-check step, a subagent dispatched to verify it). Passing: a designed writer–verifier split, a pass filtering reported findings, scripts and tests.
- Subagents: flag delegating what a handful of tool calls finishes; large, independent, parallel tracks pass.
- Finding skills ask for every finding with severity (and confidence) and filter downstream; flag `only report high-severity`, `be conservative`, `don't nitpick`.
- Narrow skills state their scope (`deliver what was asked; name a better approach in a sentence and continue as asked`).
- Flag `explain your reasoning step by step` in the output and `<thinking>` tags.
- Unattended skills (`context: fork`, background, loops) state a completion condition, name the early stops to avoid, and keep confirmation for destructive actions.
- `effort` carries a stated reason, `xhigh` or `max` a measured gain; flag `think hard` or `think deeply` as triggers – Claude Code passes them as plain text (`ultrathink` is the keyword).
- Skills that write documents to disk state a length target for them.
- Output-producing skills show the final report shape (and progress updates on long runs) as a template or sample.
- Tool use is conditioned (`use X when…`), not forced; MCP tools are fully qualified (`ServerName:tool_name`).
- Specificity matches fragility: exact commands or scripts where a wrong step breaks things, heuristics where several approaches work.
- Examples sit in `<example>` tags, 3–5 of them, varied enough to generalize rather than copy.
- Cross-source skills read the relevant sources before acting; pasted or untrusted input is wrapped in tags and marked as data.
- Design or frontend skills name the patterns to avoid, not "avoid a generic look".

### Quality

Works, but breaks style or structure rules.

- `SKILL.md` is under 500 lines; `name` matches the parent directory.
- Subdirectories only `scripts/`, `references/`, `assets/`, `agents/`, one level deep; no `README.md`, `CHANGELOG.md`, or human-facing docs at the root.
- Sibling files link directly from `SKILL.md`, no reference chains; a reference file over 100 lines opens with a table of contents.
- Declarative: flag hedging (`might want to`, `aim for`, `try to`), callout boxes (`> **Note:**`), closing summaries, preamble sections (`## Overview`, `## Introduction`, `## Background`), and self-confirmation prompts (`confirm you understand`). Calibrated facts (`logs are usually wrong`) and `Consider X` pass.
- One term per concept; flag synonym drift.
- Sequences are numbered or phased with explicit branches (`if X → Y; else → Z`); rules are bulleted unless count or order is load-bearing.
- Version-pinned facts (model IDs, API parameters, CLI flags, effort levels) match `--help` or live vendor docs, checked now rather than recalled; flag superseded models and parameters that now error.
- Everything needed after compaction sits in the first ~5,000 tokens of SKILL.md.
