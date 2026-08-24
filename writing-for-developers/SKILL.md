---
name: writing-for-developers
description: Draft and rewrite developer-facing copy in the user's voice. Use when the user asks to draft a reply on an issue or MR, write a PR/MR description, write a commit subject, or write or review a README or doc page.
---

# Writing for Developers

The reader is a domain peer – whoever filed the issue, wrote the code, or will maintain it. Voice, clarity, and typography hold everywhere; an artifact section adds to them and never replaces them.

When a rule makes a sentence worse, fix the sentence another way or leave it alone. A sentence that satisfies every rule and reads like a machine wrote it has failed.

## Voice

- **Peer-to-peer.** State the fact; trust the reader to draw the inference. A clause explains down when it defines something they already used correctly, spells out a step they'd infer, or answers what nobody asked. Keep the claim, cut the gloss. In a reply or an MR description, address a peer with statements – an imperative aimed at a peer reads as a pitch. A doc instructs; the rest doesn't.
- **Pitched at the reader's altitude.** What counts as a fact depends on who reads. Someone with the diff open wants intent and consequence; someone who will never open it wants the outcome they'd notice. The same change is a different sentence in each.
- **Concise by default.** Key facts, not the path that produced them. Not shallow either: cut the recap, keep the consequence.
- **Open on the fact.** The first sentence carries the finding, and each paragraph after it starts on its own subject. Make the rhetorical move rather than announcing it. Substantive acknowledgment with a pivot ("Great idea overall, but …") is fine.
- **Every claim carries a number, a symbol, or a link.** Real symbols from the source, and check the history before calling something new. Specific over sterile: "a column rename fails the build", not "schema changes can cause issues". A phrase that sounds quotable is a phrase to cut.
- **Mix sentence lengths on purpose.** Short sentences land a point; longer ones carry a fact with its condition or consequence. One thought per sentence does not mean one length per sentence.

## Clarity

- **One referent per pronoun.** Every "it", "they", and "this" points at one obvious thing – a noun, never a whole clause. Repeat the noun when in doubt.
- **Put "only" and "not" beside the word they change.** "Only fails on growth" and "fails only on growth" say different things.
- **Break up noun strings.** "The proto import budget check script" becomes "the script that checks the proto-import budget".
- **One name per thing, everywhere.** Three names for one thing teaches three things. The same holds across edits: leave an unchanged sentence unchanged rather than rewording it.

## Typography

- En dash with spaces ( – ) for the parenthetical break. Never an em dash.
- Backticks on every identifier wherever they render as code, including commit subjects.
- Bold for bullet lead-ins.
- Headings in APA title case, carrying the point rather than the topic – "Pick the Mode First", not "Modes".

## Replies

Calibrate by effort × correctness. Thank substantive contributions specifically. When declining a feature, redirect to userland and give the reason. When correcting, link the commit or spec that proves it, and write the fix in your own terms rather than recycling the reporter's snippet or framing.

**Low-effort report.** Close with the reason; no thanks.

```
Closing this, as no minimal reproducible example provided.
```

**Wrong-but-trying reporter.** Correct the misdiagnosis, door open.

```
Actually, the library returns the raw response body already. The `{ data: ... }` wrapping must be coming from your backend – can you check your server's response shape?
```

## PR/MR Descriptions

1. **Lead with intent.** One or two sentences on what the MR does and why. Prose first, ahead of any heading or list.
2. **Aggregate, don't enumerate.** Group by logical unit – package, concern, surface, never one bullet per file.
3. **Structure proportional to content.** Default to prose; a bold lead-in plus a few bullets once several groups need separating, `##` once they need navigating.
4. **Only the why.** Intent, consequences, migration steps. The diff is already the inventory; describe what scrolling it won't show.

## Commit Messages

Conventional Commits, subject only. Lowercase after the colon; noun phrases are fine. The subject doubles as the changelog line – write it to stand alone, and put anything longer in the MR description instead of a body.

```
feat(api): add `/scalar` and `/swagger` docs routes
fix(comparisons): safely access `parsedData` value to prevent runtime errors
refactor: harmonize `useState` keys
feat!: rename `OpenAPI` to `OpenAPIBuilder`
```

## Docs and READMEs

- **One document, one mode.** Two axes pick it: does the content serve doing or understanding, learning or work? Action + learning is a **tutorial**, action + work a **how-to**, understanding + work **reference**, understanding + learning **explanation**. Where two modes meet, split and link. Opinion belongs in explanation and nowhere else.
- **Put the condition before the instruction.** "To delete the document, click Delete." The reader skips what doesn't apply. Common case first, exceptions after.
- **Every count, path, and tree is true at the commit that lands it**, and the doc carries the command that regenerates it.
- **Name the actual difficulty.** A step that takes three tries says so. If it were simple, the reader wouldn't be here.
