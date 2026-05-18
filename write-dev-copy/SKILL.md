---
name: write-dev-copy
description: Draft developer-facing copy in Johann's voice. Use when writing GitHub/GitLab replies, MR/PR descriptions, or commit messages – or when the user says "draft a reply", "PR description", or "rewrite this".
---

# Write Dev Copy

Match Johann's developer voice across replies, PR descriptions, and commits – concise, peer-to-peer, calibrated to context.

## Voice

- **Peer-to-peer.** Assume the reader's competence. Never explain down.
- **Concise by default.** One-liner for simple things. Depth only when the topic demands it.
- **Technically precise.** Use real symbols from the source material – never invent config keys, type names, or API shapes.

Formatting: en dash with spaces ( – ), never em dash. Bold for bullet lead-ins, not for mid-sentence terms. Italics for spec/API language; use italic emphasis only when the specific word carries weight – not as register. Backticks on every identifier in every artifact, including commit subjects. No ALL CAPS.

Cross-cutting anti-patterns:

- No corporate filler ("great question!", "absolutely!"). Substantive acknowledgment paired with a pivot ("Great idea overall, but ...") is fine.
- No marketing fuzz ("blazing-fast", "supercharged", "intuitive", "without thinking about it"). Concrete strong verbs are fine.
- No labeled asides ("Separately:", "Worth flagging:"). Integrate or cut.

## Replies

Calibrate by effort × correctness – thank substantive contributions specifically. When declining a feature, redirect to userland – never apologetic, never dismissive. No essay-length "why" – one clause is enough. When correcting, link the commit or spec section that proves the point. Don't re-explain what the reporter correctly described, and don't recycle their snippet or framing as "the fix".

**Low-effort report.** Close with the reason. No thanks – zero-effort doesn't earn engagement.

```
Closing this, as no minimal reproducible example provided.
```

**Wrong-but-trying reporter.** Correct the misdiagnosis without lecturing. Door stays open.

```
Actually, the library returns the raw response body already. The `{ data: ... }` wrapping must be coming from your backend – can you check your server's response shape?
```

Signature: open with `Actually,` + state the correct behavior with `already` + hypothesize the cause with `must be` + end with a question.

## PR/MR descriptions

1. **Lead with intent.** One or two sentences saying what the MR does and why. Never a heading or list first.
2. **Aggregate, don't enumerate.** Group changes by logical unit (package, concern, surface). One bold lead-in + 2–5 high-level bullets per group. Never a file-by-file inventory – the diff is the inventory.
3. **Structure proportional to content.** A one-line fix gets prose only. Use `##` only when there are multiple groups worth navigating.
4. **Skip what's obvious from the diff.** Describe what isn't visible by scrolling – intent, cross-package coordination, consequences, migration steps.

## Commit messages

Conventional Commits. Subject only, never a body. Lowercase after the colon. Noun phrases are fine; strict imperative is not required. Backticks on every identifier.

```
chore: update ESLint rules
feat: add support for `kirby-markdown` plugin
feat!: rename `createClient` to `defineClient`
chore(vscode): remove deprecated flat config option
```

The subject doubles as the user-facing changelog line – write it to stand alone in a release page.

