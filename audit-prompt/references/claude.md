# Claude Supplement

Tag every finding from this file `[Claude]`.

Snapshot 2026-09-27 – Opus 4.8 and the Claude 5 family (Opus 5, Opus 5.5, Sonnet 5, Fable 5/5.1, Mythos 5/5.1); Opus 5.5 inherits Opus 5 patterns and Opus 4.7 guidance carries to 4.8, per Anthropic. Sources: platform.claude.com docs `claude-prompting-best-practices`, `prompting-claude-opus-5-5`, `prompting-claude-opus-5`, `prompting-claude-opus-4-8`, `effort`, `thinking`, `thinking-troubleshooting`, and the Opus 5.5 and Fable 5.1 migration guides.

Current Claude models interpret instructions literally and respect effort levels strictly. Items below are net-additional to the universal checklist.

### Blockers

- [ ] Flag prefilled assistant responses on the last turn – requests return a 400 error on Claude 4.6+ and Mythos Preview. Use Structured Outputs, tool schemas, XML tags, or explicit format instructions instead. Prefills earlier in the conversation are unaffected.
- [ ] Opus 5.5, Fable 5.1, Mythos 5.1: flag `tool_choice` set to `{type: "any"}` or `{type: "tool", …}` – returns 400. Keep `auto` (or `none` for a turn that must not call tools) and state in the prompt when the tool applies; where the forced call existed to get structured data, set `strict: true` on the tool or use Structured Outputs.
- [ ] Opus 4.7+ and the Claude 5 family: flag non-default `temperature`, `top_p`, or `top_k` – returns 400. Remove them and steer style with instructions.
- [ ] Flag thinking configurations that return 400: `thinking: {type: "enabled", budget_tokens: …}` on Opus 4.7+ and the Claude 5 family; `thinking: {type: "disabled"}` on Opus 5.5, Fable 5/5.1, Mythos 5/5.1, and Mythos Preview, and on Opus 5 at `xhigh` or `max` effort. Remove the setting and control depth with `effort`.

### Anti-Patterns

- [ ] Flag filtering instructions in code-review or finding-style prompts ("only report high-severity," "be conservative," "don't nitpick"). Current models follow these faithfully and convert fewer findings into reports. For coverage, instruct the model to report all findings with confidence and severity, and filter downstream.
- [ ] Opus 5 and 5.5: flag instructions or harness steps that re-check the model's own work ("double-check your answer," "add a final verification step," "use a subagent to verify," a rubric self-check before finishing) – they cause over-verification; remove them rather than reword. On these targets this replaces the universal self-check. Distinct and passing: a writer–verifier team where one agent checks another's output as part of the product's design (not a verification step kept from an earlier model's scaffolding), a separate pass that filters reported findings, and deterministic validators (tests, scripts).
- [ ] Opus 5.5: report each universal chain-of-thought finding once, tagged `[Claude]`, with this consequence and fix – prompts asking for reasoning written into the response ("explain your reasoning step by step," `<thinking>` tags) can be declined under the `reasoning_extraction` refusal category. Remove them, set `thinking.display: "summarized"` (the default `"omitted"` returns empty thinking text), and read the summarized reasoning from the thinking blocks.
- [ ] Verify thinking matches the target's default. Always on and cannot be turned off: Opus 5.5, Fable 5/5.1, Mythos 5/5.1 – omitting the field is correct. On by default, `disabled` accepted: Opus 5 (at `high` effort or below) and Sonnet 5; on Opus 5, flag `disabled` used to save tokens – thinking at `low` effort beats thinking off at similar cost. Off by default: Opus 4.7/4.8 – verify `thinking: {type: "adaptive"}` is set where the task needs reasoning.
- [ ] Flag `effort` left unset or mis-scaled for the target – level names mean different amounts of thinking per model. Opus 5.5 (default `medium`, which matches or exceeds Opus 5 at `high`): flag `xhigh` or `max` without a stated, measured quality gain. Opus 5, Sonnet 5, Fable and Mythos 5/5.1 (default `high`): `xhigh` for demanding coding and agentic work; `medium` or `low` where evals show quality holds. Opus 4.7/4.8: `xhigh` for coding and agentic work, `high` minimum for intelligence-sensitive tasks, `medium` only for measured cost-sensitive work, `max` only with measured headroom at `xhigh` (it risks overthinking). Any model: `low` for short, scoped, latency-sensitive work.
- [ ] For cost- or latency-sensitive prompts, flag prose steers that cut thinking where effort has not been lowered first – lowering effort reduces thinking more reliably than instructions do. On Opus 5.5 chat prompts, flag "think carefully before answering" lines for removal. "Answer directly without deliberating." is a last resort at `low`, kept only if measured.
- [ ] Opus 5.5 frontend or design prompts: flag "avoid a generic AI look" without named patterns – it swaps one default for another. Replace with the specific patterns to avoid.

### Clarity

- [ ] Opus 5 and 5.5: extend the universal scope guardrail to every narrow task, not only code changes – verify a line like "Deliver what was asked, at the scope intended. If the request seems mistaken or a better approach exists, say so in a sentence and continue with the task as asked."
- [ ] Opus 5 and 5.5: for prompts that write files or documents, verify a length target – written deliverables run longer than on earlier models.

### Structure

- [ ] Opus 5.5 with pasted or external text: verify it is wrapped in `<pasted_content id="…">` tags carrying the same random id on the opening and closing tag, and the system prompt says which text is the user's own.

### Agentic

- [ ] For agents at `xhigh` or `max` effort, verify `max_tokens` is at least 64k; for long agentic turns on Opus 5.5, 128k (its maximum).
- [ ] Verify subagent guidance matches the target. Opus 5 and 5.5 delegate readily: flag missing damping where a handful of tool calls finishes the task (subagents sent to verify the model's own work fall under the self-verification item). Delegation fits large, independent, parallel tracks; for Opus 5.5 fan-out, suggest a time budget line (`elapsed 340s / 1200s`). Opus 4.8 spawns fewer by default: flag only blanket always-spawn directives on single-file, sequential, or shared-context work.
- [ ] For long-horizon agents in harnesses with context compaction or external memory, verify the prompt states the compaction policy and tells the model not to wrap up early on context-budget concerns. Pair with the memory tool where available.
- [ ] Opus 5.5 unattended agents: verify the prompt names the specific early stops to avoid (a summary that announces the next step instead of taking it, an offer to continue that waits for an answer, a question no one will answer) and the stops that are wanted (no work can advance without the user's input).
- [ ] Opus 5.5 multi-app or multi-source agents: verify a look-before-acting line ("read the relevant sources before acting").
- [ ] Opus 5.5, Fable 5/5.1, and Mythos 5.1 where users see progress: verify `thinking.display` is `"updates"` (beta, `thinking-display-updates-2026-08-18` header) or `"summarized"`, and the prompt states update cadence and shape; at the default `"omitted"`, text between tool calls arrives in empty `thinking` blocks.
