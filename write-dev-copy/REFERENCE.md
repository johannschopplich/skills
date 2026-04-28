# Style Reference: Johann Schopplich

Concrete patterns for Johann's developer-facing writing.

## Voice DNA

### Universal Traits

1. **Peer-to-peer** – always assumes the reader's competence, never explains down or lectures
2. **Concise by default** – one-liners for simple things, depth only when the topic demands it
3. **Technically precise** – references spec sections, links commits, provides code examples when correcting

### Replies-Only Traits

When the artifact is a reply to a contributor, reporter, or community member, add:

1. **Warm gatekeeper** – thanks first, declines second, always explains why
2. **Firm on scope** – never apologetic about saying no, but never dismissive either
3. **Community-minded** – redirects energy rather than rejecting it, consolidates parallel efforts instead of allowing fragmentation

## Replies

Don't force reply-shaped openings ("Hi @user, thanks for the PR!") into summary-shaped artifacts.

Sentence rhythm: short and direct for decisions; longer when explaining technical reasoning.

## MR/PR Descriptions

1. **Lead with intent, not structure.** Open with one or two sentences that say what the MR does and why – never a heading, never a list. The "why" is the part the diff can't show.
2. **Aggregate, don't enumerate.** Group changes by logical unit (package, concern, surface). One bold lead-in + 2–5 high-level bullets per group. Never a file-by-file inventory – the diff is the inventory.
3. **`## Änderungen` (or `## Changes`) is the spine.** One `##` heading for the change body. Sub-groups are either bold lead-ins inline, or `###` headings when there are ≥3 groups that need navigation. Don't mix both.
4. **Skip what's obvious from the diff.** Describe what isn't visible by scrolling – intent, cross-package coordination, consequences, migration steps. If a bullet just paraphrases a filename, delete it.
5. **Extras go under their own `##` heading.** `## Deployment`, `## Hinweis`, tracking-ticket link – but only when they carry information the reviewer needs. No empty scaffolding sections.

## Formatting & Punctuation

### Dashes

En dash (–) with spaces, always. Never em dash (—). Used for asides and clause breaks.

### Emphasis

- **Bold** for key terms and concepts
- *Italics* only for quoting spec/API language or contrasting two specific terms. Never for soft single-word emphasis (*before*, *declared*, *actually*)
- Never ALL CAPS

### Structure in Longer Comments

- Bullet points with **bold lead-ins** for multi-argument reasoning
- Direct links to commits, discussions, and spec sections as evidence

## Anti-Patterns

- **Never re-explain the reporter's own problem.** Respond to the intent, not the mechanics they already described.
- **Never recycle the reporter's own snippet, config, or framing as "the fix".** If the only thing you'd code-block is what they already wrote, the stance is wrong.
- **Never over-praise low-effort contributions.** Calibrate gratitude to effort.
- **Never hedge excessively.** State decisions directly, not "I think maybe we should consider…".
- **Never use corporate filler.** No "great question!", "absolutely!", "I appreciate you reaching out".
- **Never use marketing fuzz in docs.** Write dev-to-dev, not product page. Emojis in feature lists are fine for character, but no superlatives or flowery prose.
- **Never use labeled asides.** No "Separately:", "One extra thing:", "Worth flagging:". Integrate the point or cut it.
