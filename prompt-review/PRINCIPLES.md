# Prompt Engineering Principles

Condensed from Anthropic and OpenAI prompt engineering guidance. Focused on reasoning models (Claude Opus/Sonnet, GPT 5-series).

## 1. Clarity Wins

The golden rule: show your prompt to a colleague with no context. If they'd be confused, the model will be too.

- Be specific about what you want, not vague about what you don't want.
- "Write a professional report in flowing prose paragraphs" beats "Don't use bullet points or markdown."
- Replace ambiguous requests with concrete ones: "Change this function to improve its performance" instead of "Can you suggest some changes?"

Contradictions are worse than vagueness for reasoning models. They burn reasoning tokens trying to reconcile conflicting rules instead of picking one at random. This is common in prompts maintained by multiple authors. Scan for: an action required in one place but forbidden in another; hierarchy conflicts ("always do A before B" combined with "skip A in case C" without resolving precedence).

## 2. Structure Reduces Misinterpretation

XML tags are the most reliable way to separate prompt components:

```xml
<instructions>What to do</instructions>
<context>Background information</context>
<input>The data to process</input>
<examples>Few-shot demonstrations</examples>
```

For multiple documents, use indexed wrappers:

```xml
<documents>
  <document index="1">
    <source>filename.pdf</source>
    <document_content>{{CONTENT}}</document_content>
  </document>
</documents>
```

Place long documents **above** your query. Queries at the end can improve response quality by up to 30% on complex multi-document inputs.

## 3. Context Over Commands

Explain *why* a constraint exists. The model generalizes from explanations better than from bare rules.

- Weak: "NEVER use ellipses"
- Strong: "Your response will be read aloud by a text-to-speech engine, so never use ellipses since the TTS engine cannot pronounce them."

Set a role when it focuses behavior: "You are a senior security engineer reviewing code for OWASP top-10 vulnerabilities."

## 4. Examples Are Powerful But Optional

Reasoning models often perform well zero-shot. Add examples only when:

- Output format or style is non-obvious
- The task has subtle edge cases
- Consistency across runs matters

When using examples:

- 3-5 examples for best results
- Wrap in `<example>` tags (multiple in `<examples>`)
- Make them diverse enough to avoid overfitting to patterns
- Ensure they don't contradict your instructions
- Include `<thinking>` tags in examples to demonstrate reasoning patterns when thinking is enabled

## 5. Reasoning Model Anti-Patterns

These models reason internally. Prompting techniques designed for older models can backfire:

| Anti-Pattern | Why It Hurts | Instead |
|---|---|---|
| "Think step by step" | Redundant; can degrade performance | State the goal; let the model reason |
| "CRITICAL: You MUST..." | Causes overtriggering on newer models | Use normal language: "Use X when..." |
| Prescriptive step-by-step plans | Model's reasoning often exceeds hand-written plans | Give the goal and constraints; let it plan |
| "If in doubt, use [tool]" | Causes excessive tool/feature use | "Use [tool] when it would enhance understanding" |
| Encouraging thoroughness | Modern models are already proactive; extra nudging inflates tokens | Remove blanket defaults; use `effort` parameter if available |

## 6. Specificity & Success Criteria

Be explicit about what "done" looks like:

- "Propose a solution with a budget under $500"
- "Return a JSON object with fields: name (string), score (0-100), reasoning (string)"
- "The response should be under 200 words"

For quality, use modifiers: "Go beyond the basics to create a fully-featured implementation" or "Include as many relevant features and interactions as possible."

Add self-verification when accuracy matters: "Before you finish, verify your answer against [criteria]."

## 7. Output Control

Effective format steering techniques ranked by reliability:

1. **Structured outputs / tool schemas** – strongest constraint
2. **XML format indicators** – "Write your analysis in `<analysis>` tags"
3. **Positive instructions** – describe the desired format rather than forbidding another
4. **Style matching** – match your prompt's formatting style to the desired output style
5. **Direct instruction** – "Respond directly without preamble"

To eliminate preambles: "Do not start with phrases like 'Here is...', 'Based on...', etc."

## 8. Long-Context Best Practices

For 20K+ token inputs:

1. Place documents at the top, query at the bottom
2. Structure with XML tags and metadata (source, index)
3. Ask the model to **quote relevant passages** before answering – this grounds the response and cuts through noise
4. For large documents, ask the model to extract specific sections rather than summarizing everything

## 9. Agentic Prompt Patterns

Modern reasoning models default to being *too eager* – they over-act, over-tool, and persist past the point of usefulness. Old "be thorough" or "explore every option" instructions should be softened or removed.

**Eagerness spectrum.** Define where on the autonomy scale the model should operate. High-autonomy tasks (background agents, batch processing) need persistence instructions. High-risk tasks (financial actions, sending messages, deleting data) need confirmation gates. Most prompts fail by not specifying this at all.

**Stop conditions and action boundaries.** Tell the model when to stop, when to ask for clarification, and which actions are safe to take without confirmation. Without explicit boundaries, reasoning models will keep searching for a way to complete the task – even when the right move is to pause and ask.

**Escape hatches.** When constraining behavior ("never respond without full confidence"), pair the constraint with an escape hatch ("if you cannot reach full confidence, state your best assessment and flag the uncertainty"). Without this, the model spends excessive reasoning tokens trying to satisfy an impossible standard.

**Self-constructed rubrics.** For quality-sensitive tasks, ask the model to build its own rubric before generating the final output, then self-evaluate against it. This is more effective than simple self-verification ("check your answer") because it forces the model to articulate quality criteria specific to the task.
