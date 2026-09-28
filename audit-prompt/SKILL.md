---
name: audit-prompt
description: Audit a prompt an app sends to a Claude or OpenAI model API – severity-grouped findings plus a revised prompt.
disable-model-invocation: true
---

# Audit Prompt

For prompts an app sends to a model API. Skills, `CLAUDE.md`, and `AGENTS.md` belong to `writing-for-agents`.

## Process

1. **Target.** Read the model ID and request parameters from the calling code. `claude-*` → [`references/claude.md`](references/claude.md); `gpt-*` → [`references/gpt.md`](references/gpt.md); several models → each supplement, and the revision holds on all. Configurable model: audit the shipped default, and flag parameters that break on other models the app supports. No supplement for the target → universal only.
2. **Trace** SDK parameters to the raw request before checking the tables; don't assume the SDK rejects invalid combinations.
3. **Check** every item of the universal checklist and the supplement against the whole prompt; each yields a pass or a finding. Quote the prompt for each finding, or cite request code as `file:line`.
4. **Report.** The revision resolves every Blocker and Anti-Pattern, the rest unless the fix breaks the prompt's intent (note the skip). Fixes outside the prompt text go under Request Changes.

<report-template>
## Blockers
- "<excerpt, ≤80 chars, truncate with …>" or `file:line` → <concrete fix>
- [Claude] "<excerpt>" → <fix>

## Anti-Patterns
## Clarity
## Agentic

## Summary
N blockers, N anti-patterns, N clarity, N agentic.
Supplement: <Claude | GPT | both | none>. Target: <model IDs, flag any newer than the snapshot | unknown>. Skipped: <list>.

## Revised Prompt

## Request Changes
- <parameter or host-code change the revision depends on>
</report-template>

Omit empty headings. Nothing flagged → `Prompt passes audit.`, the summary, and `No revisions needed.`

## Universal Checklist

### Blockers

- **No ask** – context without a task or question.
- **Contradictions** – required in one place, forbidden in another, or layers without precedence.
- **Absolutes without an exit** – "never answer without full confidence", "output only X" with no empty or refuse case. Every always/never/must needs a satisfaction criterion or stop rule.

### Anti-Patterns

- **Aggressive directives** – "CRITICAL: You MUST…", caps-locked ALWAYS/NEVER → normal language; absolutes only for true invariants.
- **Reasoning in the response** – "think step by step", "explain your reasoning" on reasoning targets → remove it; the model reasons in its thinking.

### Clarity

- **Success criteria** – concrete, before any process guidance.
- **Output format** – schema, XML tags, or sections with length limits, matching what the calling code parses, trims, or prepends.
- **Dynamic input delimited** – per-request text in tags, stated as data to process, not instructions.
- **Examples** – in `<example>` tags. One example gets copied in form; cover each input branch with 3–5 or drop them.
- **Static before dynamic** – caching item: flag, don't block.
- **Long context** (20k+ tokens) – documents before the query.

### Agentic

Only for tool-using or autonomous prompts.

- **Stop rules and budgets** – when to stop, hand back, or ask; tool budgets with stop-when-sufficient.
- **Safe vs. unsafe actions** – destructive or shared-state actions confirm; local reversible ones proceed.
- **Scope guardrails for code changes** – no unrequested files, features, or abstractions; no test gaming or claims about unread files.
- **Prescriptive step plans** – for tasks the model can plan → outcome, success criteria, allowed side effects.
- **Blanket tool defaults** – "if in doubt, use [tool]" → "use [tool] when it would enhance understanding".
- **Thoroughness prose** ("be thorough") → success criteria and stop rules; raise effort for depth.
