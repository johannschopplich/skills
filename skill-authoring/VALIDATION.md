# Skill Validation Guide

Validate skills by testing them with LLMs. Since agents execute skills, LLMs are the best reviewers.

## 1. Discovery Validation

Test whether the frontmatter triggers correctly. Paste into a fresh LLM chat:

> I am building an Agent Skill. Agents decide whether to load this skill based entirely on the YAML metadata below.
>
> ```
> name: [your-skill-name]
> description: [your description]
> ```
>
> Based strictly on this description:
> 1. Generate 3 realistic user prompts that should trigger this skill.
> 2. Generate 3 similar-sounding prompts that should NOT trigger it.
> 3. Critique the description: is it too broad or too narrow? Suggest an optimized rewrite.

Also test live: prompt agents with assignments you expect to trigger the skill, then inspect the agent's reasoning for why it picked (or skipped) the skill.

## 2. Logic Validation

Ensure instructions are deterministic and don't force hallucination. Feed the LLM the full SKILL.md and directory tree:

> Here is my SKILL.md and directory tree:
>
> ```
> [paste your directory tree]
> ```
>
> [Paste SKILL.md contents]
>
> Act as an autonomous agent that has just triggered this skill. Simulate execution step-by-step for this request: [paste a realistic user request].
>
> For each step, write out:
> 1. What exactly are you doing?
> 2. Which file/script are you reading or running?
> 3. Flag any Execution Blockers: the exact line where you are forced to guess because instructions are ambiguous.

## 3. Edge Case Testing

Force the LLM to find vulnerabilities:

> Switch roles. Act as a ruthless QA tester. Your goal is to break this skill.
> Ask 3–5 highly specific questions about edge cases, failure states, or missing fallbacks. Focus on:
>
> - What if a script fails due to unexpected input?
> - What if the user's project has non-standard configuration?
> - Are there implicit assumptions about the environment?
>
> Do not fix these issues. Just ask the numbered questions and wait for answers.

## 4. Architecture Refinement

After answering edge-case questions, have the LLM restructure the skill:

> Based on my answers, rewrite the SKILL.md enforcing progressive disclosure:
>
> 1. Keep SKILL.md as high-level steps using third-person imperative commands.
> 2. Move dense rules, large templates, or complex schemas into `references/` or `assets/`. Replace with JiT loading commands.
> 3. Add an Error Handling section incorporating the edge-case answers.
