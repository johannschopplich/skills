# Claude Supplement

Tag findings `[Claude]`. Snapshot 2026-09-27 – Opus 5.5, Fable 5.1, Fable 5, Sonnet 5; Mythos matches Fable. Source: platform.claude.com (models overview, `effort`, prompting and migration guides).

## Blockers

| Request | Opus 5.5, Fable 5.x | Sonnet 5 | Fix |
|---|---|---|---|
| `thinking: {type: "disabled"}` | 400 | allowed | omit; lower `effort` |
| `budget_tokens` | 400 | 400 | `effort` |
| `tool_choice` `any` / `tool` | 400 (Fable 5 allows) | allowed | `auto` plus when to call; `strict: true` or Structured Outputs for data |
| non-default `temperature` / `top_p` / `top_k` | 400 | 400 | remove |
| last-turn assistant prefill | 400 | 400 | Structured Outputs or format instructions |
| earlier turn edited or `system` / `tools` rebuilt, thinking replayed | 400 for accounts from 2026-08-31 (not Fable 5) | – | append-only history; per-turn reminders as turn-scoped system messages (`clear_at: "next_user_message"`, beta `mid-conversation-system-clear-at-2026-08-21`) |

Fable 5 also rejects per-message effort.

## All Models

- **Effort** – default `medium` on Opus 5.5, `high` elsewhere. Flag `xhigh`/`max` on Opus 5.5 without a measured gain. Lower effort before adding prose that asks for less thinking.
- **Reasoning in the response** – Opus 5.5 and Fable 5.x can refuse it as `reasoning_extraction`. Remove it and read `thinking.display: "summarized"` (default `"omitted"` returns empty text). Remove "don't think" rules too. Sonnet 5 with thinking disabled: `<thinking>`/`<answer>` tags are the fallback, not a finding.
- **Review filters** – "only report high-severity", "don't nitpick" are followed literally and cut findings. Report all with confidence and severity; filter downstream.
- **Frontend** – "avoid a generic AI look" → name the patterns.
- **`max_tokens`** – thinking counts toward it: at least 64k at `xhigh`/`max`, 128k for long Opus 5.5 agent turns. Sonnet 5 uses ~30% more tokens than Sonnet 4.6.

## Opus 5.5 and Fable

| | Opus 5.5 | Fable 5.x |
|---|---|---|
| Self-verification | remove "double-check", rubric self-checks, verify-subagents; tests and a separate reviewer pass | long runs: a fresh-context verifier subagent |
| Progress updates | state cadence and shape | 5.1 writes few: remove "hold findings for the end", "keep updates brief" |
| Subagents | damp: "Do not delegate work you can finish yourself in a handful of tool calls" | encourage: frequent, asynchronous |

**Both (Opus 5.5, Fable 5.1)**
- Scope: "Deliver what was asked; don't quietly narrow, widen, or swap it. If a better approach exists, say so in a sentence and continue as asked."
- Unattended agents: name the unwanted early stops (a summary announcing the next step instead of taking it, an offer to continue, a question no one will answer) and the wanted one (no progress possible without the user).
- Visible progress: `thinking.display: "updates"` (beta `thinking-display-updates-2026-08-18`).

**Opus 5.5 only**
- Pasted text in `<pasted_content id="…">`, one random id on both tags; say which text is the user's own.
- Multiagent fan-out: a time-budget line (`elapsed 340s / 1200s`).
- Multi-app agents: "read the relevant sources before acting".
- Chat: drop "think carefully"; add a line treating earlier answers as settled.

**Fable 5.1 only**
- Remove anti-formatting language.
- Batch tools: "First privately list what you need next; then request every item that doesn't depend on another's result in this one response."
- At `low` effort, nudge search.
- Targeted edits, not whole-file rewrites.
- Mid-conversation effort changes per message, not top-level.
- No context-budget countdowns.

**Sonnet 5**
- Literal: state the scope explicitly; it won't generalize an instruction from one item to the next.
- Remove forced interim-status scaffolding ("summarize every 3 tool calls").
