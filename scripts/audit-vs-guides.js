// Re-audit ritual for the audit-prompt skill: fans one Opus agent per primary
// source and adjudicates every version-pinned claim against the live guides.
// Run on each major model release (Claude Code Workflow tool, {scriptPath: ...}).
// Update SOURCES when vendors move or add pages; refresh the snapshot stamps in
// audit-prompt/references/*.md with whatever this run confirms.
export const meta = {
  name: 'audit-prompt-vs-guides',
  description: 'Compare the audit-prompt skill against latest Anthropic and OpenAI prompt guides',
  phases: [
    { title: 'Fetch & compare', detail: 'one Opus agent per primary source', model: 'opus' },
  ],
}

const SKILL_DIR = '/Users/johannschopplich/Projects/skills/audit-prompt'

const FINDINGS = {
  type: 'object',
  additionalProperties: false,
  required: ['source_urls_fetched', 'contradicted', 'missing', 'confirmed', 'notes'],
  properties: {
    source_urls_fetched: { type: 'array', items: { type: 'string' } },
    contradicted: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['skill_excerpt', 'evidence', 'severity', 'fix'],
        properties: {
          skill_excerpt: { type: 'string' },
          evidence: { type: 'string' },
          severity: { type: 'string', enum: ['blocker', 'major', 'minor'] },
          fix: { type: 'string' },
        },
      },
    },
    missing: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['guidance', 'evidence', 'suggested_checklist_item'],
        properties: {
          guidance: { type: 'string' },
          evidence: { type: 'string' },
          suggested_checklist_item: { type: 'string' },
        },
      },
    },
    confirmed: { type: 'array', items: { type: 'string' } },
    notes: { type: 'string' },
  },
}

const SOURCES = [
  {
    key: 'openai-prompt-guidance',
    urls: ['https://developers.openai.com/api/docs/guides/prompt-guidance-gpt-5p6'],
    focus: 'The newest OpenAI prompting guide. If a newer guide slug exists (search for it), fetch that instead and note the change. Audit the universal checklist and references/gpt.md against it: migration method, canonical prompt structure, absolutes, stop rules, verbosity posture.',
  },
  {
    key: 'openai-reasoning',
    urls: [
      'https://developers.openai.com/api/docs/guides/reasoning',
      'https://developers.openai.com/api/docs/guides/reasoning-best-practices',
    ],
    focus: 'Reasoning-model guidance: reasoning_effort supported values and their descriptors, chain-of-thought advice, developer vs system message, few-shot advice. Audit the CoT anti-pattern and every effort claim in references/gpt.md.',
  },
  {
    key: 'openai-latest-model',
    urls: ['https://developers.openai.com/api/docs/guides/latest-model'],
    focus: 'The current-model reference page. List every parameter surface it documents (reasoning modes/context, caching, verbosity, approvals) and judge which items in references/gpt.md are pinned to a model this page no longer describes. Compare against the previous model via the ?model= query param if offered.',
  },
  {
    key: 'anthropic-best-practices',
    urls: [
      'https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices',
      'https://platform.claude.com/docs/en/build-with-claude/effort',
    ],
    focus: 'Current Claude prompting best practices and the effort reference. Also search for a model-specific prompting page for the newest Opus/flagship (e.g. prompting-claude-opus-*). Verify EVERY version-pinned claim in references/claude.md: effort ladder, thinking config and budget_tokens/prefill 400s, always-on-thinking models, subagent spawning posture, max_tokens guidance, filtering-instruction suppression, compaction.',
  },
  {
    key: 'anthropic-core',
    urls: ['https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/overview'],
    focus: 'Core prompt-engineering guidance (follow the overview into the consolidated best-practices page). Audit the universal checklist: long-context ordering and the 30% figure, quote extraction, example counts and tags, role/persona, why-behind-constraints, thoroughness and CoT scoping, overengineering guardrails.',
  },
]

phase('Fetch & compare')
const results = await parallel(SOURCES.map(s => () =>
  agent(`You are auditing a prompt-auditing skill against primary-source documentation. Work ONLY from documents you actually fetch during this task - never from memory or training data.

1. Read the skill under audit: ${SKILL_DIR}/SKILL.md plus every file in ${SKILL_DIR}/references/.
2. Load WebFetch (and WebSearch if needed) via ToolSearch, then fetch and fully read: ${s.urls.join(' , ')}
   If a fetch fails or returns an empty JS shell, retry variants (append ?format=markdown, or WebSearch for the live location) until you have the real content. Do not substitute remembered content for a failed fetch.
3. Focus: ${s.focus}
4. Adjudicate every skill claim this source can speak to:
   - contradicted: the skill asserts something this source contradicts or shows to be outdated. Quote the exact skill line in skill_excerpt and the doc passage in evidence.
   - missing: guidance in this source that a prompt auditor should check for but the skill lacks. Only material items - things that would change an audit verdict. Write suggested_checklist_item in the skill's own style (imperative Verify/Flag bullet).
   - confirmed: skill claims this source directly supports (short list, one line each).
Severity: blocker = the skill would give actively wrong advice today; major = meaningfully outdated or incomplete; minor = nuance.
Be strict: if the source does not address a claim, do not list it as confirmed. Record in notes anything you could not verify because content would not load.`,
    { label: s.key, phase: 'Fetch & compare', model: 'opus', schema: FINDINGS })
))
return results
