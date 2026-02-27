---
name: prompt-review
description: Reviews and optimizes prompts for LLM reasoning models (Claude, GPT 5-series). Analyzes clarity, structure, specificity, and anti-patterns. Use when user wants to review, improve, critique, audit, or optimize a prompt.
---

# Prompt Review

A good prompt is one a colleague with no context could follow without confusion. If a human would be lost, the model will be too.

## Workflow

1. **Read** the prompt the user provides in full
2. **Identify** the target model and use case (ask if unclear)
3. **Assess** against the review checklist below
4. **Deliver** structured feedback (see Feedback Format)
5. **Revise** the prompt if changes are non-trivial

## Review Checklist

### Clarity & Directness

- [ ] Verify instructions are specific and unambiguous
- [ ] Confirm desired output format is explicitly stated
- [ ] Check success criteria are defined
- [ ] Confirm sequential steps use numbered lists when order matters
- [ ] Check instructions tell what to do, not what to avoid ("Write flowing prose" over "Don't use bullet points")
- [ ] Verify action verbs are direct ("Change X" not "Can you suggest changes to X?")
- [ ] Scan for contradictory instructions (reasoning models burn tokens trying to reconcile conflicts rather than picking one at random)

### Structure

- [ ] Confirm delimiters (XML tags, markdown headings) separate instructions, context, input, and examples
- [ ] Check long documents are placed before the query (queries at the end improve quality by up to 30%)
- [ ] Verify tag names are consistent and descriptive
- [ ] Check nested content uses hierarchical tags when appropriate

### Context & Motivation

- [ ] Verify constraints explain *why* they exist (models generalize from explanations)
- [ ] Check for role or persona via system prompt if appropriate
- [ ] Confirm domain-specific context the model needs is present
- [ ] Verify end goal is clearly defined with success parameters

### Examples

- [ ] Confirm examples are included only if output format, tone, or style matter
- [ ] Check zero-shot was tried first; few-shot (3-5) added only if needed
- [ ] Verify examples are relevant, diverse, and cover edge cases
- [ ] Confirm examples are wrapped in `<example>` tags to distinguish from instructions
- [ ] Check for contradictions between examples and instructions

### Reasoning Model Anti-Patterns

These are the highest-impact issues. Flag them first.

- [ ] Flag "think step by step" or chain-of-thought instructions (reasoning models think internally; explicit CoT can hurt performance)
- [ ] Flag over-prompting ("CRITICAL: You MUST..." is unnecessary; modern models follow normal instructions)
- [ ] Flag redundant encouragement to be thorough (causes overtriggering and inflated token usage)
- [ ] Check prompt prefers general goals over prescriptive step-by-step plans (model reasoning often exceeds hand-written plans)
- [ ] Flag prefilled responses used for output steering (deprecated on Claude 4.6; use structured outputs or explicit format instructions instead)

### Specificity & Constraints

- [ ] Verify concrete constraints are stated (length, format, budget, scope)
- [ ] Check modifiers encourage quality when needed ("Go beyond the basics", "Include as many relevant features as possible")
- [ ] For long-context tasks: check prompt asks model to quote relevant passages before answering
- [ ] Check for self-verification instruction ("Before you finish, verify your answer against [criteria]")

### Agentic Prompts

- [ ] Check stop conditions are defined (when to finish, when to hand back to the user)
- [ ] Verify safe vs. unsafe actions are distinguished (which actions need confirmation, which can proceed)
- [ ] Check eagerness calibration matches the use case (persistence for autonomous tasks, guardrails for high-risk actions)
- [ ] When limiting behavior, confirm an escape hatch exists ("even if it might not be fully correct")
- [ ] For long-running tasks: check for progress-reporting instructions

## Feedback Format

For every review, deliver:

1. **Summary** – one-line assessment
2. **Strengths** – what works well (keep brief)
3. **Issues** – specific problems, each with: what's wrong, why it matters, concrete fix
4. **Revised prompt** – the improved version (only if changes are non-trivial)

See [PRINCIPLES.md](PRINCIPLES.md) for the full prompt engineering reference.
