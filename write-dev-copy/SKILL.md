---
name: write-dev-copy
description: Draft developer-facing copy in Johann's voice. Use when writing GitHub/GitLab replies, MR/PR descriptions, commit messages, or Slack/Notion status updates and tickets – or when the user says "draft a reply", "PR description", "status update", or "rewrite this".
---

# Write Dev Copy

Voice is cross-cutting – it holds inside every section below.

## Voice

- **Peer-to-peer.** The reader is a domain peer – often whoever filed the issue or wrote the code. State the fact; trust them to draw the inference. A clause explains down when it defines or justifies something the reader already used correctly, spells out a step they'd infer, or wasn't asked about (`as you know`, `note that`, a "what X does is…" gloss). Keep the claim, cut the gloss.
- **Concise by default.** Key facts, not the path that produced them – never a wall of text. But not shallow: cut the recap, keep the one consequence a peer can't read off the diff.
- **Precise, not embellished.** Real symbols from the source – never invent config keys, type names, or API shapes. No manufactured aphorisms either: if a phrase sounds quotable, he didn't write it.

Formatting: en dash with spaces ( – ), never em dash. Backticks on every identifier in every artifact, including commit subjects. Bold for bullet lead-ins.

Avoid: corporate filler ("great question!", "absolutely!"), marketing fuzz ("blazing-fast", "supercharged", "intuitive"), labeled asides ("Separately:", "Worth flagging:"). Substantive acknowledgment with a pivot ("Great idea overall, but …") is fine.

## Replies

Calibrate by effort × correctness. Thank substantive contributions specifically. When declining a feature, redirect to userland – never apologetic, never dismissive. When correcting, link the commit or spec that proves it, and don't recycle the reporter's snippet or framing as "the fix".

**Low-effort report.** Close with the reason; no thanks.

```
Closing this, as no minimal reproducible example provided.
```

**Wrong-but-trying reporter.** Correct the misdiagnosis, door open.

```
Actually, the library returns the raw response body already. The `{ data: ... }` wrapping must be coming from your backend – can you check your server's response shape?
```

## PR/MR descriptions

1. **Lead with intent.** One or two sentences on what the MR does and why – never a heading or list first.
2. **Aggregate, don't enumerate.** Group by logical unit (package, concern, surface), never one bullet per file. The diff is the inventory.
3. **Structure proportional to content.** Default to prose; a bold lead-in + a few bullets only when several groups need separating, `##` only when they need navigating.
4. **Only the why.** Describe what scrolling the diff won't show – intent, consequences, migration steps – never a rehash of the changes themselves.

## Commit messages

Conventional Commits, subject only – never a body. Lowercase after the colon; noun phrases are fine. The subject doubles as the changelog line – write it to stand alone.

```
feat(api): add `/scalar` and `/swagger` docs routes
fix(comparisons): safely access `parsedData` value to prevent runtime errors
refactor: harmonize `useState` keys
feat!: rename `OpenAPI` to `OpenAPIBuilder`
```
