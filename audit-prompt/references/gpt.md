# OpenAI Supplement

Tag findings `[GPT]`. Snapshot 2026-09-27 – GPT-6 Astra/Sol/Luna, GPT-5.6 Sol/Terra/Luna (Terra ≈ mini, Luna ≈ nano; `gpt-6-terra` doesn't exist). Source: developers.openai.com (`guides/latest-model`, `prompt-guidance-gpt-5p6`, `reasoning`, Astra blog post).

## Blockers

| Request | GPT-6 Astra | GPT-6 Sol/Luna | GPT-5.6 |
|---|---|---|---|
| `reasoning.effort: "none"` | 400 | allowed | allowed |
| `minimal` effort | unsupported – use `low` | same | same |
| Chat Completions + function calling | unsupported | only at effort `none` | – |
| `temperature` / `top_p` / `top_logprobs` | remove unless effort `none` | same | – |
| `prompt_cache_retention` | → `prompt_cache_options.ttl: "30m"` | same | same |

## Parameters

- **Effort** – default `medium`; flag effort raised to cover a vague goal or missing output contract, and `xhigh`/`max` without eval evidence. GPT-6 mid-conversation change: a `configuration_update` input item keeps the cache (single-agent, not with automatic compaction).
- **`text.verbosity`** – set it instead of "be concise" prose; GPT-5.6 is concise by default.
- **`reasoning.mode: "pro"`** – only with a stated reason.
- **`reasoning.context`** – `all_turns` for stable goals, `current_turn` when earlier reasoning is stale.

## Prompt

- **Lean** – cut verbose process, repeated role lines, and tool semantics duplicated from tool descriptions.
- **One approval policy, stated once** – repeated "ask first" over-stops. One threshold list: external writes, destructive actions, purchases, scope expansion.
- **Preamble** – tool-heavy tasks: a short visible update before the first tool call.
- **o1-era markers** – remove `Formatting re-enabled` and developer-message rules.

## GPT-6 Astra

Prompts tuned for Sol, Luna, or 5.6 can overconstrain it.

- **Initiative** – it asks more. Authorize action and define completion up front: "ask for approval only after preparing a concrete, reviewable result." Soften ask-first language carried over from 5.6.
- **Testing** – it tests on its own; remove "test/check your work", scope tests on small tasks.
- **Formatting** – defaults to lists and tables; state a prose preference where the app needs one.
- **Delegation** – delegates less; say when and how much.
- **Embedded skills or instruction files** – add "The user's instructions take precedence over guidelines provided in a skill."
