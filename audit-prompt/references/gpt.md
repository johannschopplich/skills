# GPT-5.6 supplement

Tag every finding from this file `[GPT-5.6]`.

Snapshot 2026-07-15 – GPT-5.6 (gpt-5.6-sol/terra/luna). Sources: developers.openai.com guides `prompt-guidance-gpt-5p6`, `reasoning`, `reasoning-best-practices`, `latest-model`. Re-verify with `scripts/audit-vs-guides.js` when a newer model ships.

GPT-5.6 follows prompt contracts closely and is more concise by default than earlier 5.x models. Universal Anti-pattern and Agentic stop-rule items hit harder on this family; treat unbudgeted absolutes and weak stop conditions as Blockers, not Anti-patterns. Items below are net-additional to the universal checklist.

### Anti-patterns

- [ ] Flag verbose process descriptions, redundant role reminders, schema or tool-semantics duplication, persona reinforcement, and self-check blocks carried over from earlier 5.x stacks – leaner prompts improve eval scores ~10-15% while cutting tokens 41-66%. Tool-specific guidance belongs in tool descriptions, not the prompt. Migration is incremental: keep the working prompt, run evals before changing it, trim obsolete scaffolding, and add back only the smallest targeted instruction that fixes a measured regression – do not rewrite a working prompt stack all at once.
- [ ] Flag repeated approval instructions ("ask first", "confirm before…") scattered through the prompt – GPT-5.6 over-triggers approvals. Define approval thresholds once: external writes, destructive actions, purchases, material scope expansion.

### Clarity

- [ ] Flag inline JSON schemas, TypeScript type definitions, or "respond in this exact format" blocks. Use Structured Outputs (`response_format` / JSON Schema) instead. Description fields on schema properties are the right place for per-field instructions.
- [ ] Flag injection of the current date or "today is YYYY-MM-DD". The model is already aware of the current UTC date. Keep date injection only when the task requires a non-UTC timezone or a date other than now.
- [ ] Verify the prompt follows the canonical structure: `Role / # Personality / # Goal / # Success criteria / # Constraints / # Tools / # Output / # Stop rules`. Matching this shape gives the strongest training signal.

### Structure

- [ ] Verify instructions are in a developer message (not a system message). If markdown output is expected, `Formatting re-enabled` is on the first line.

### Agentic

- [ ] Verify `reasoning_effort` is set deliberately, with a stated reason, and is a supported value: `none` for latency-critical tasks that need no reasoning (behaves like a non-reasoning model); `minimal` for near-zero reasoning tokens and the fastest first visible token – don't conflate it with `none`; `low` for efficient reasoning on cost-sensitive tool use, planning, and multi-step work; `medium` is the default; `high` for hard reasoning, complex debugging, and deep planning; `xhigh` and `max` only when evals show clear benefit, with `max` reserved for the hardest quality-first workloads. When migrating models, baseline the current effort and test one level lower.
- [ ] Flag `reasoning_effort` raised to compensate for a vague goal, weak constraints, or a missing output contract – effort is a tuning knob, not a quality-recovery mechanism; fix the prompt first.
- [ ] Verify `reasoning.mode: "pro"` is used only with a stated justification – quality matters more than latency and token cost. Flag pro mode enabled by default.
- [ ] For multi-turn agents, verify `reasoning.context` is set intentionally: `all_turns` when the task's goals stay stable across turns; `current_turn` when earlier reasoning is no longer relevant.
- [ ] Flag `prompt_cache_retention` – superseded by `prompt_cache_options.ttl`; explicit caching is available via `prompt_cache_options.mode: "explicit"`.
- [ ] Verify `text.verbosity` is set intentionally. Flag prompts that lean on prose instructions ("be concise," "be brief") instead of the parameter. GPT-5.6 is more concise by default than 5.5, so set the level the task needs rather than defaulting low.
- [ ] For tool-heavy Responses workflows, verify the prompt or harness preserves the `phase` value on each replayed assistant item: `commentary` for intermediate updates, `final_answer` for completed answers.
- [ ] For multi-step or tool-heavy tasks, verify a streaming-preamble rule: a short user-visible update before the first tool call that acknowledges the request and states the first step.
