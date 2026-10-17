# OpenAI Supplement

Tag findings `[GPT]`. Snapshot 2026-10-17 – GPT-6 Astra, GPT-6.1 Sol, GPT-6 Luna. Source: developers.openai.com (`guides/latest-model`, `reasoning`, `responses-multi-agent`, `decisions`, Astra blog post).

## Blockers

| Request | Astra, 6.1 Sol | Luna |
|---|---|---|
| `reasoning.effort` `none` / `minimal` | unsupported – use `low` | `minimal` → `low`; `none` allowed |
| Chat Completions + function calling | unsupported – Responses | only at explicit effort `none` |
| `temperature` / `top_p` / logprobs | remove | remove unless effort `none` |
| `multi_agent.enabled` (beta) | Astra: unsupported; 6.1 Sol: remove `reasoning.summary`, `max_tool_calls`, `/responses/compact` | unsupported |

## Parameters

- **Effort** – default `medium` (Astra: undocumented – set it); `low` for extraction, routing, classification. Flag effort raised to cover a vague goal or missing output contract, and `xhigh`/`max` without eval evidence. Mid-conversation change: a `configuration_update` input item keeps the cache with top-level effort unchanged – single-agent, no automatic compaction or truncation, never two adjacent.
- **`text.verbosity`** – set it instead of "be concise" prose.
- **`reasoning.mode: "pro"`** – only with a stated reason.
- **`reasoning.context`** – 6.1 Sol only: `all_turns` for stable goals, `current_turn` when earlier reasoning is stale.
- **Classifiers** – yes/no, fixed-label, or rubric output parsed from text → Decisions API (beta, Luna only): one concern per question, observable criteria, distinct choices and score levels.

## Prompt

- **Lean** – cut verbose process, repeated role lines, and tool semantics duplicated from tool descriptions or the injected multi-agent instructions.
- **One approval policy, stated once** – repeated "ask first" → one threshold list: external writes, destructive actions, purchases, scope expansion.
- **Preamble** – tool-heavy tasks: a short visible update before the first tool call.
- **o1-era markers** – remove `Formatting re-enabled` and developer-message rules.

## GPT-6 (Observed on Astra)

- **Initiative** – ask-first language carried over from GPT-5.x → authorize action and define completion up front: "ask for approval only after preparing a concrete, reviewable result."; "Do not introduce unsolicited warnings, disclaimers, approval flows, or safety/compliance checklists due to hypothetical risk."
- **Testing** – it tests on its own; remove "test/check your work", scope tests on small tasks.
- **Formatting** – state the prose form the app needs; name the stock phrases to avoid.
- **Delegation** – delegates less; say when and how much.
- **Embedded skills or instruction files** – add "The user's instructions take precedence over guidelines provided in a skill."
