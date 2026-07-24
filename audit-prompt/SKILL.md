---
name: audit-prompt
description: Review and revise a prompt for modern reasoning LLMs – severity-grouped findings report plus a rewritten prompt.
disable-model-invocation: true
---

# Audit Prompt

Produce a severity-grouped report listing every issue found in a prompt written for a modern reasoning LLM, with a quoted excerpt and concrete fix for each finding. Deliver a revised version of the prompt alongside the report.

## Process

1. **Read** the prompt. Identify the target family:
   - If the user stated a target, use it.
   - Else scan the prompt for unambiguous markers: `claude-opus`, `claude-sonnet`, `claude-fable`, `Anthropic`, `<thinking>`, `budget_tokens` → Claude; `gpt-5`, `OpenAI`, `developer:`, `response_format`, `Formatting re-enabled` → GPT-5.6.
   - If exactly one family matches, read that supplement – [`references/claude.md`](references/claude.md) or [`references/gpt.md`](references/gpt.md) – before running the checklist. If zero or both match, run universal-only and note skipped supplements in the summary.
2. **Run the universal checklist** below, plus the loaded supplement. Record each violation with a quoted excerpt from the prompt.
3. **Report** findings using the template below. Prefix supplement findings with the supplement's tag (`[GPT-5.6]` or `[Claude]`); universal findings carry no tag. If the prompt targets a model newer than the supplement's snapshot stamp, note the gap in the summary. The revised prompt must resolve every Blocker and Anti-pattern finding; Clarity, Structure, and Agentic findings should be resolved unless the fix would compromise the prompt's intent (note any intentional skips).

<report-template>
## Blockers
- "<quoted excerpt, ≤80 chars, truncate with …>" → <concrete fix>
- [GPT-5.6] "<excerpt>" → <fix>

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
Supplement applied: <GPT-5.6 | Claude | none>. Skipped: <list>.
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

- [ ] Flag explicit chain-of-thought instructions ("think step by step", "explain your reasoning") when the target runs with thinking or reasoning enabled – the model already reasons internally. When thinking is off, manual CoT with `<thinking>`/`<answer>` tags is the documented fallback, not a violation.
- [ ] Flag aggressive directives ("CRITICAL: You MUST…", caps-locked ALWAYS/NEVER). Modern reasoning models overtrigger. Replace with normal language ("Use X when…"). Reserve absolutes for true invariants (safety rules, required output fields); use decision rules for judgment calls.
- [ ] Flag prescriptive step-by-step plans for tasks the model can plan itself. State the expected outcome, success criteria, allowed side effects, and evidence rules; let the model choose the path. Avoid step-by-step process guidance unless the exact path matters.
- [ ] Flag blanket defaults ("if in doubt, use [tool]", "default to [tool]"). Causes over-tool-use; replace with "use [tool] when it would enhance understanding."
- [ ] Flag thoroughness encouragement ("be thorough", "explore every option") in agentic, research, or tool-driving prompts – it inflates tokens without quality gain. Replace with concrete success criteria and stopping rules; when the intent is deeper reasoning, the documented lever is raising the effort parameter, not prose. One-shot generative output (dashboards, frontends, documents) is exempt: quality modifiers like "go beyond the basics to create a fully-featured implementation" are vendor-recommended there.

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

- [ ] Verify stop conditions and budgets are defined: when to bail mid-loop, hand back to the user, or ask for clarification; tool and retrieval budgets (maximum sources, maximum tool calls, citation density) with a stop-when-sufficient rule; and measurable completion criteria – an internal checklist of deliverables before declaring done, plus an explicit follow-through policy for irreversible actions.
- [ ] Verify safe vs unsafe actions are distinguished. Destructive or shared-state actions require confirmation; local reversible actions proceed.
- [ ] Verify eagerness is calibrated – persistence for autonomous tasks, guardrails for high-risk actions.
- [ ] Verify tool-use rules are explicit: when to call, parallelize independent calls, sequence dependent ones.
- [ ] For prompts driving code changes, verify scope and integrity guardrails are present: no extra deliverable files (temporary scratchpad files are fine when the prompt requires cleaning them up at the end), no unsolicited features or refactors, no error handling for impossible cases, no abstractions for one-time operations, no test gaming or hard-coding to test cases, no claims about unread files. Reasoning models satisfy the prompt's letter without these and default to overengineering.
