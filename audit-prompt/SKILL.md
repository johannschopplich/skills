---
name: audit-prompt
description: Reviews and revises prompts written for modern thinking-capable LLMs (Claude 4.x, GPT-5.x), applying current best practices. Use when user wants to review, critique, improve, or optimize an LLM prompt. Don't use for classic prompt-tuning patterns (pre-reasoning-era) or general copy-editing.
disable-model-invocation: true
---

# Audit Prompt

Produce a severity-grouped report listing every issue found in a prompt written for a modern thinking-capable LLM, with a quoted excerpt and concrete fix for each finding. Deliver a revised version of the prompt alongside the report.

## Process

1. **Read** the prompt. Identify the target:
   - If the user stated a target (Claude 4.x, GPT-5.x, GPT-5.5), use it.
   - Else scan the prompt for unambiguous markers: `claude-opus`, `claude-sonnet`, `Anthropic`, `<thinking>` → Claude 4.x; `gpt-5`, `OpenAI`, `developer:`, `response_format`, `Formatting re-enabled` → GPT-5.x.
   - If exactly one family matches, apply that supplement. If zero or both match, run universal-only and note skipped supplements in the summary.
2. **Run the universal checklist** below, plus the matched supplement. Record each violation with a quoted excerpt from the prompt.
3. **Report** findings using the template below. Prefix supplement findings with the target tag (`[Claude]`, `[GPT-5.x]`, `[5.5]`). The revised prompt must resolve every Blocker and Anti-pattern finding; Clarity, Structure, and Agentic findings should be resolved unless the fix would compromise the prompt's intent (note any intentional skips).

<report-template>
## Blockers
- "<quoted excerpt, ≤80 chars, truncate with …>" → <concrete fix>
- [GPT-5.5] "<excerpt>" → <fix>

## Anti-patterns
- "<excerpt>" → <fix>
- [Claude] "<excerpt>" → <fix>

## Clarity
- "<excerpt>" → <fix>

## Structure
- "<excerpt>" → <fix>

## Agentic
- "<excerpt>" → <fix>

## Summary
N blockers, N anti-patterns, N clarity, N structure, N agentic.
Supplement applied: <GPT-5.x | Claude 4.x | none>. Skipped: <list>.

## Revised prompt
<the rewritten prompt, or `No revisions needed.`>
</report-template>

Omit any severity heading with zero findings. If nothing is flagged, report `Prompt passes audit.` followed by the summary line and the revised-prompt section (which states `No revisions needed.`).

## Universal checklist

### Blockers

Prompt won't produce useful output, or actively burns reasoning tokens.

- [ ] Verify the prompt contains an actual task or question, not just context without an ask.
- [ ] Flag contradictions – an instruction required in one place and forbidden in another, or hierarchy conflicts without precedence. Reasoning models burn tokens trying to reconcile. Resolve at the prompt level rather than relying on the model to pick.
- [ ] Verify every constraint has an escape hatch. "Never respond without full confidence" without a fallback causes reasoning spirals; pair every hard constraint with a fallback or stopping rule. Absolutes ("always," "never," "must," "every") need satisfaction criteria – what counts as the constraint being met, and when to stop checking.

### Anti-patterns

Reasoning-model-specific mistakes. Highest measured impact – flag first.

- [ ] Flag explicit chain-of-thought instructions ("think step by step", "explain your reasoning"). Reasoning models think internally; explicit CoT is redundant and can degrade performance.
- [ ] Flag aggressive directives ("CRITICAL: You MUST…", caps-locked ALWAYS/NEVER). Modern reasoning models overtrigger. Replace with normal language ("Use X when…"). Reserve absolutes for true invariants (safety rules, required output fields); use decision rules for judgment calls.
- [ ] Flag prescriptive step-by-step plans for tasks the model can plan itself. State the expected outcome, success criteria, allowed side effects, and evidence rules; let the model choose the path. Avoid step-by-step process guidance unless the exact path matters.
- [ ] Flag blanket defaults ("if in doubt, use [tool]", "default to [tool]"). Causes over-tool-use; replace with "use [tool] when it would enhance understanding."
- [ ] Flag thoroughness encouragement ("be thorough", "explore every option", "go above and beyond"). Modern models are already proactive; inflates tokens without quality gain. Replace with concrete success criteria and stopping rules.

### Clarity

- [ ] Verify success criteria are defined concretely (length, scope, budget, evidence rules, allowed side effects, output shape) and stated before any process guidance. Underspecified or buried completion produces overthinking and runaway tool use.
- [ ] Verify instructions are specific, not vague. "Change this function to improve performance" beats "Can you suggest some changes?".
- [ ] Verify output format is explicitly stated – structured output schema, tool schema, XML tags, or described sections with per-section length limits.
- [ ] Verify instructions tell what to do, not what to avoid. "Write flowing prose" beats "Don't use bullet points."
- [ ] Verify sequential steps use numbered lists when order matters. Before adding numbered steps, check that the order is product-required, not just convenient – otherwise this becomes the prescriptive-step-by-step anti-pattern.
- [ ] Verify action verbs are direct and imperative, not suggestive ("Change X" not "Can you suggest changes to X?").
- [ ] For quality-sensitive outputs (code, long-form writing, multi-criteria decisions), verify the prompt asks the model to define test criteria or a rubric, then verify its output against them before finishing. More effective than "check your answer".

### Structure

- [ ] Verify XML tags or markdown headings separate instructions, context, input, and examples. Examples wrapped in `<example>` or `<examples>`; zero-shot tried before few-shot (3-5 diverse examples when added).
- [ ] Verify the prompt's formatting matches the desired output formatting. Markdown in the prompt encourages markdown in the output; prose encourages prose; XML encourages XML.
- [ ] Verify static prompt content (role, instructions, schemas, examples, long context) precedes dynamic content (per-request input, user query, recent state). Inverted ordering is a cost/latency item, not a quality one – flag but don't block.
- [ ] For long-context inputs (20k+ tokens), verify documents are placed before the query (up to 30% quality uplift), and the prompt asks the model to quote relevant passages before answering.
- [ ] Verify a role or persona is set when behavior or tone needs to deviate from default. Personality controls how the assistant sounds; collaboration style controls how it works – set both when the product is conversational.
- [ ] Verify constraints explain *why* they exist. Models generalize better from explanations than bare rules.

### Agentic

Apply only if the prompt drives an autonomous or tool-using agent.

- [ ] Verify stop conditions are defined – when to bail mid-loop, hand back to the user, or ask for clarification, plus per-tool budgets.
- [ ] Verify safe vs unsafe actions are distinguished. Destructive or shared-state actions require confirmation; local reversible actions proceed.
- [ ] Verify eagerness is calibrated – persistence for autonomous tasks, guardrails for high-risk actions.
- [ ] For retrieval, research, or evidence-gathering prompts, verify a budget is stated: maximum sources, maximum tool calls, citation density requirements, and a stop-when-sufficient rule.
- [ ] Verify tool-use rules are explicit: when to call, parallelize independent calls, sequence dependent ones.
- [ ] Verify completion criteria are measurable – an internal checklist of deliverables before declaring done, and an explicit follow-through policy for irreversible actions.
- [ ] For prompts driving code changes, verify scope and integrity guardrails are present: no extra files, no unsolicited features or refactors, no error handling for impossible cases, no abstractions for one-time operations, no test gaming or hard-coding to test cases, no claims about unread files. Reasoning models satisfy the prompt's letter without these and default to overengineering.

## GPT-5.x supplement

GPT-5.5 interprets prompts literally and follows absolutes verbatim. Universal Anti-patterns and Agentic stop-rule items hit harder on this family; treat unbudgeted absolutes and weak stop conditions as Blockers, not Anti-patterns. Items below are net-additional to the universal checklist.

### Anti-patterns

- [ ] Flag verbose process descriptions, redundant role reminders, schema or tool-semantics duplication, persona reinforcement, and self-check blocks carried over from earlier 5.x stacks. The 5.5 migration guide instructs: "Begin migration with a fresh baseline... Start with the smallest prompt that preserves the product contract." Tool-specific guidance belongs in tool descriptions, not the prompt.

### Clarity

- [ ] Flag inline JSON schemas, TypeScript type definitions, or "respond in this exact format" blocks. Use Structured Outputs (`response_format` / JSON Schema) instead. Description fields on schema properties are the right place for per-field instructions.
- [ ] Flag injection of the current date or "today is YYYY-MM-DD". The model is already aware of the current UTC date. Keep date injection only when the task requires a non-UTC timezone or a date other than now.
- [ ] Verify the prompt follows the canonical 5.5 structure: `Role / # Personality / # Goal / # Success criteria / # Constraints / # Output / # Stop rules`. Matching this shape gives the strongest training signal.

### Structure

- [ ] Verify instructions are in a developer message (not a system message). If markdown output is expected, `Formatting re-enabled` is on the first line.

### Agentic

- [ ] Verify `reasoning_effort` is set deliberately, with a stated reason. `none` for fast cost-sensitive tasks; `low` for latency-critical; `medium` is the default; `high`/`xhigh` only when evals show measurable gain. Hard-coding `high` "to be safe" is an anti-pattern absent eval evidence.
- [ ] Verify `text.verbosity` is set intentionally. `low` is often a better starting point than `medium`. Flag prompts that lean on prose instructions ("be concise," "be brief") instead of the parameter.
- [ ] For tool-heavy Responses workflows, verify the prompt or harness preserves the `phase` value on each replayed assistant item: `commentary` for intermediate updates, `final_answer` for completed answers.
- [ ] For multi-step or tool-heavy tasks, verify a streaming-preamble rule: a short user-visible update before the first tool call that acknowledges the request and states the first step.

## Claude 4.x supplement

Claude 4.7 interprets instructions literally at lower effort and respects effort levels strictly. Items below are net-additional to the universal checklist.

### Anti-patterns

- [ ] Flag prefilled assistant responses on the last turn. Deprecated on Claude 4.6+; Mythos Preview rejects them with 400. Use Structured Outputs, tool schemas, XML tags, or explicit format instructions instead.
- [ ] Flag filtering instructions in code-review or finding-style prompts ("only report high-severity," "be conservative," "don't nitpick"). Claude 4.7 follows these faithfully and converts fewer findings into reports. For coverage, instruct the model to report all findings with confidence and severity, and filter downstream.

### Agentic

- [ ] Verify `effort` is set explicitly. `xhigh` for coding and agentic workloads on Opus 4.7; `high` minimum for intelligence-sensitive tasks; `medium` only when cost-sensitive; `low` for short, scoped, latency-sensitive work. `max` is test-only for intelligence-demanding tasks – diminishing returns and overthinking risk.
- [ ] For agents using extended thinking, verify the configuration is `thinking: {type: "adaptive"}` and effort is controlled via the `effort` parameter. `budget_tokens` is deprecated.
- [ ] Flag explicit subagent-spawning encouragement on Opus 4.7 prompts. The model spawns fewer subagents by default; encouragement risks overshoot. Verify the prompt distinguishes when subagents help (parallel fan-out, isolated context, independent workstreams) from when they don't (single-file edits, sequential operations, shared-context work).
- [ ] For long-horizon agents in harnesses with context compaction or external memory, verify the prompt states the compaction policy and tells the model not to wrap up early on context-budget concerns. Pair with the memory tool where available.
