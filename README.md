# Skills

My agent skills and the Claude Code config they run under. Opinionated: each one encodes how I work.

```sh
npx skills add johannschopplich/skills --skill <name>   # --skill '*' for all
```

A `/name` skill runs only when you type it; the others also load on their own when a task matches.

## Workflows

They load **push-right** – install it alongside. **implement** and **code-review** also judge code against my rules in [`claude/rules/`](claude/rules/); without them, the review names each missing rule set and carries on.

- [**push-right**](skills/push-right/SKILL.md) – the shared doctrine: non-destructive work first, verify against a baseline, every irreversible step behind one checkpoint.
- [**/implement**](skills/implement/SKILL.md) – a spec, ticket, or conversation, built test-first, a commit per theme, reviewed by **code-review**. Needs Matt Pocock's `tdd`.
- [**code-review**](skills/code-review/SKILL.md) – five axes in fresh contexts, every finding refuted, a verdict: ship, fix, or incomplete. On your own branch it applies the fixes and re-reviews once. Replaces Matt Pocock's `code-review`, carries his 12 smells verbatim, needs his `tdd` and `writing-for-agents`, and **writing-docs** for doc pages.
- [**mr-shepherd**](skills/mr-shepherd/SKILL.md) – a teammate's MR or PR, ticket, or stack to ready-to-ship: review, thread triage, fixes or inline drafts.

## Standalone

- [**grilling**](skills/grilling/SKILL.md) – a relentless interview in rounds: the design tree kept in a file as it grows, facts looked up, settled assumptions listed for veto. Replaces Matt Pocock's `grilling`, `grill-me`, and `grill-with-docs`; `docs` adds his `domain-modeling`.
- [**writing-for-developers**](skills/writing-for-developers/SKILL.md) – issue replies, review comments, PR descriptions, and commit subjects in my voice.
- [**writing-docs**](skills/writing-docs/SKILL.md) – doc pages, READMEs, changelogs, and migration guides: the contract the docs state, headings by job, a debloat pass that lists the numbers and identifiers a cut lost. Needs **writing-for-developers**.
- [**writing-agents-md**](skills/writing-agents-md/SKILL.md) – `AGENTS.md` files: where each line belongs, from nowhere to the nearest `AGENTS.md`, the shape, and a pass that asks you which of two contradicting lines wins. Needs Matt Pocock's `writing-for-agents`.
- [**/audit-prompt**](skills/audit-prompt/SKILL.md) – audit a prompt an app sends to a Claude or OpenAI model.
- [**/generate-tailwind-shades**](skills/generate-tailwind-shades/SKILL.md) – Tailwind v4 OKLCH palettes anchored at shade 500.

## Personal

Tied to my machine and folders – a reference, not an install.

- [**kirby**](skills/kirby/SKILL.md) – my Kirby plugins, Kirby core, and the kirby.tools docs.
- [**/servers**](skills/servers/SKILL.md) – my Hetzner web and dev boxes: provisioning, sites, deploys over GitHub Actions.
- [**/footage-ingest**](skills/footage-ingest/SKILL.md) – camera cards into a multi-drive footage archive.

## Setup

[`claude/`](claude/) holds my global `CLAUDE.md`, rules, and a hook that runs a `/skill` typed mid-prompt. `install.sh` links them into `~/.claude` and every skill into `~/.agents/skills`; [`skills.txt`](skills.txt) lists the third-party skills my dev server adds.

```sh
git clone https://github.com/johannschopplich/skills.git ~/skills && ~/skills/install.sh
```
