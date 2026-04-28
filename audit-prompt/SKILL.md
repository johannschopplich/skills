---
name: audit-prompt
description: Reviews and revises prompts written for modern thinking-capable LLMs (Claude 4.x, GPT-5.x, o-series), applying current best practices. Use when user wants to review, critique, improve, or optimize an LLM prompt. Don't use for classic prompt-tuning patterns (pre-reasoning-era) or general copy-editing.
---

# Audit Prompt

Produce a severity-grouped report listing every issue found in a prompt written for a modern thinking-capable LLM, with a quoted excerpt and concrete fix for each finding. Deliver a revised version of the prompt alongside the report.

## Process

1. **Read** the prompt. Note the target model if stated (affects the OpenAI developer-message item). If unstated, default to modern thinking-capable LLM and skip model-gated items silently.
2. **Run the checklist** below. Record each violation with a quoted excerpt from the prompt.
3. **Report** findings using the template below. The revised prompt must resolve every Blocker and Anti-pattern finding; Clarity, Structure, and Agentic findings should be resolved unless the fix would compromise the prompt's intent (note any intentional skips).

<report-template>
## Blockers
- "<quoted excerpt, ≤80 chars, truncate with …>" → <concrete fix>

## Anti-patterns
- "<excerpt>" → <fix>

## Clarity
- "<excerpt>" → <fix>

## Structure
- "<excerpt>" → <fix>

## Agentic
- "<excerpt>" → <fix>

## Summary
N blockers, N anti-patterns, N clarity, N structure, N agentic.

## Revised prompt
<the rewritten prompt, or `No revisions needed.`>
</report-template>

Omit any severity heading with zero findings. If nothing is flagged, report `Prompt passes audit.` followed by the summary line and the revised-prompt section (which states `No revisions needed.`).

## Checklist

### Blockers

Prompt won't produce useful output, or actively burns reasoning tokens.

- [ ] Verify the prompt contains an actual task or question, not just context without an ask.
- [ ] Flag contradictions – an instruction required in one place and forbidden in another, or hierarchy conflicts without precedence. Reasoning models burn tokens trying to reconcile.
- [ ] Verify every constraint has an escape hatch. "Never respond without full confidence" without a fallback causes reasoning spirals; pair with "if you cannot reach full confidence, state your best assessment and flag the uncertainty."

### Anti-patterns

Reasoning-model-specific mistakes. Highest measured impact – flag first.

- [ ] Flag explicit chain-of-thought instructions ("think step by step", "explain your reasoning"). Reasoning models think internally; explicit CoT is redundant and can degrade performance.
- [ ] Flag aggressive directives ("CRITICAL: You MUST…", caps-locked ALWAYS/NEVER). Claude 4.5+ and GPT-5.x overtrigger; replace with normal language ("Use X when…").
- [ ] Flag prescriptive step-by-step plans for tasks the model can plan itself. State goal and constraints; model reasoning often exceeds hand-written plans.
- [ ] Flag blanket defaults ("if in doubt, use [tool]", "default to [tool]"). Causes over-tool-use; replace with "use [tool] when it would enhance understanding."
- [ ] Flag thoroughness encouragement ("be thorough", "explore every option", "go above and beyond"). Modern models are already proactive; inflates tokens without quality gain.
- [ ] Flag prefilled assistant responses used for output steering. Deprecated on Claude 4.6; use structured outputs, tool schemas, or explicit format instructions.

### Clarity

- [ ] Verify instructions are specific, not vague. "Change this function to improve performance" beats "Can you suggest some changes?".
- [ ] Verify output format is explicitly stated – structured output schema, tool schema, XML tags, or described sections with per-section length limits.
- [ ] Verify success criteria are defined – what "done" looks like, with concrete parameters (length, scope, budget).
- [ ] Verify instructions tell what to do, not what to avoid. "Write flowing prose" beats "Don't use bullet points."
- [ ] Verify sequential steps use numbered lists when order matters.
- [ ] Verify action verbs are direct and imperative, not suggestive ("Change X" not "Can you suggest changes to X?").
- [ ] For quality-sensitive outputs (code, long-form writing, multi-criteria decisions), verify the prompt asks the model to build a rubric before producing output, then self-evaluate against it. More effective than "check your answer".

### Structure

- [ ] Verify XML tags or markdown headings separate instructions, context, input, and examples. Examples wrapped in `<example>` or `<examples>`; zero-shot tried before few-shot (3-5 diverse examples when added).
- [ ] For long-context inputs (20k+ tokens), verify documents are placed before the query (up to 30% quality uplift), and the prompt asks the model to quote relevant passages before answering.
- [ ] Verify a role is set via system or developer prompt when it focuses behavior.
- [ ] Verify constraints explain *why* they exist. Models generalize better from explanations than bare rules.
- [ ] If the target is an OpenAI reasoning model, verify instructions are in a developer message (not a system message); if markdown output is expected, `Formatting re-enabled` is on the first line.

### Agentic

Apply only if the prompt drives an autonomous or tool-using agent.

- [ ] Verify stop conditions are defined – when to finish, when to hand back to the user, when to ask for clarification.
- [ ] Verify safe vs unsafe actions are distinguished. Destructive or shared-state actions require confirmation; local reversible actions proceed.
- [ ] Verify eagerness is calibrated – persistence for autonomous tasks, guardrails for high-risk actions.
- [ ] Verify tool-use rules are explicit: when to call, parallelize independent calls, sequence dependent ones.
- [ ] Verify completion criteria are measurable – internal checklist of deliverables, explicit follow-through policy for irreversible actions.
- [ ] For prompts driving code changes, verify scope guidance is present: no extra files, no unsolicited features or refactors, no error handling for impossible cases, no abstractions for one-time operations. Claude 4.5/4.6 default to overengineering without this.
