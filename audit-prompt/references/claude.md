# Claude supplement

Tag every finding from this file `[Claude]`.

Snapshot 2026-07-15 – Opus 4.8 and the Claude 5 family (Sonnet 5, Fable 5, Mythos 5); Opus 4.7 guidance carries to 4.8 per Anthropic. Sources: platform.claude.com docs `claude-prompting-best-practices`, `prompting-claude-opus-4-8`, `effort`. Re-verify with `scripts/audit-vs-guides.js` when a newer model ships.

Current Claude models interpret instructions literally and respect effort levels strictly. Items below are net-additional to the universal checklist.

### Anti-patterns

- [ ] Flag prefilled assistant responses on the last turn – requests return a 400 error on Claude 4.6+ and Mythos Preview, so treat this as a Blocker on those targets, not a soft anti-pattern. Use Structured Outputs, tool schemas, XML tags, or explicit format instructions instead. Prefills earlier in the conversation are unaffected.
- [ ] Flag filtering instructions in code-review or finding-style prompts ("only report high-severity," "be conservative," "don't nitpick"). Current models follow these faithfully and convert fewer findings into reports. For coverage, instruct the model to report all findings with confidence and severity, and filter downstream.

### Agentic

- [ ] Verify `effort` is set explicitly. `xhigh` for coding and agentic workloads on Opus 4.7/4.8; `high` minimum for intelligence-sensitive tasks; `medium` only when cost-sensitive; `low` for short, scoped, latency-sensitive work. `max` is test-only for intelligence-demanding tasks – diminishing returns and overthinking risk.
- [ ] For agents running at `xhigh` or `max` effort, verify a large `max_tokens` budget (start ~64k) so the model has room to think and act across subagents and tool calls.
- [ ] Verify the thinking configuration is `thinking: {type: "adaptive"}` with depth controlled via the `effort` parameter. `budget_tokens` returns a 400 error on Opus 4.7+ and the Claude 5 family – a Blocker on those targets. On the Claude 5 family thinking is always on: don't flag a missing thinking config, and flag `thinking: {type: "disabled"}` as a hard 400.
- [ ] For cost- or latency-sensitive prompts on adaptive-thinking models, verify a steer exists to respond directly when thinking won't materially help – large or complex system prompts can over-trigger thinking.
- [ ] Verify prompts with parallelizable work give explicit guidance on when subagents are desirable (parallel fan-out, isolated context, independent workstreams) – current Opus spawns fewer subagents by default and is steerable. Flag only blanket always-spawn directives that push subagents onto single-file edits, sequential operations, or shared-context work.
- [ ] For long-horizon agents in harnesses with context compaction or external memory, verify the prompt states the compaction policy and tells the model not to wrap up early on context-budget concerns. Pair with the memory tool where available.
