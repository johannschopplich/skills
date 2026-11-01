# Skills

Agent skills I reach for more than once, and the Claude Code config they run under. Install one skill:

```sh
npx skills add johannschopplich/skills --skill <name>
```

## Workflows

They stage work behind one approval tray and load **push-right** – install it alongside. **implement** and **code-review** also judge code against my rules in `claude/rules/`, read from `~/.claude/rules/`; without them, the review names each missing rule set and carries on.

- **push-right** – the shared doctrine: non-destructive work first, verify against a baseline, every irreversible step behind one tray.
- **implement** – a spec, ticket, or conversation, built test-first, a commit per slice, reviewed by **code-review**. Needs Matt Pocock's `tdd`.
- **code-review** – five axes in fresh contexts, every finding refuted, a verdict: ship, fix, or incomplete. On your own branch it applies the fixes and re-reviews once. Replaces Matt Pocock's `code-review`, carries his 12 smells verbatim, and needs his `tdd` and `writing-for-agents`.
- **mr-shepherd** – a teammate's MR or PR, ticket, or stack to ready-to-ship: review, thread triage, fixes or inline drafts.

## Standalone

- **grilling** – a relentless interview in rounds: the design tree kept in a file as it grows, facts looked up, settled assumptions listed for veto. Replaces Matt Pocock's `grilling`, `grill-me`, and `grill-with-docs`; `docs` adds his `domain-modeling`.
- **audit-prompt** – audit a prompt an app sends to a Claude or OpenAI model.
- **writing-for-developers** – issue replies, review comments, PR descriptions, and commit subjects in my voice.
- **generate-tailwind-shades** – Tailwind v4 OKLCH palettes anchored at shade 500.

## Personal

Tied to my machine and folders – a reference, not an install.

- **kirby** – my Kirby plugins, Kirby core, and the kirby.tools docs.
- **servers** – my Hetzner web and dev boxes: provisioning, sites, deploys over GitHub Actions.
- **sevdesk** – sevDesk vouchers booked and audited through the API.
- **footage-ingest** – camera cards into a multi-drive footage archive.

## My Setup

`claude/` holds my global `CLAUDE.md`, rules, and hooks. `install.sh` links them into `~/.claude` and every skill into `~/.agents/skills`, on my Mac and my dev server:

```sh
git clone https://github.com/johannschopplich/skills.git ~/skills && ~/skills/install.sh
```

`skills.txt` lists the third-party skills the dev server installs.
