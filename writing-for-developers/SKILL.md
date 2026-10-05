---
name: writing-for-developers
description: Draft and rewrite developer-facing copy in the user's voice. Use when the user asks to draft an issue reply, an MR review comment, a Slack or tracker note, a PR/MR description, or a commit subject, or to write or review a README or doc page.
---

# Writing for Developers

Reader: a domain peer – issue filer, code author, maintainer – sometimes a PM who never opens the code. Write in the recipient's language; the German examples had German recipients.

## Voice

- **Peer level, no explaining down.** State the fact; the reader infers. Keep the claim; cut the gloss on a term they already used, a step they'd infer, a question nobody asked. Replies and MR descriptions: statements, not imperatives.
- **Reader's altitude.** Reader with the diff open: intent and consequence. Reader who never opens it: the outcome they'd notice.
- **Open on the fact.** Key facts and consequence, not the path or a recap. Not shallow: a shorter version that needs rereading got worse. Make the rhetorical move, don't announce it. Substantive acknowledge-and-pivot is fine: "Great idea overall, but …"
- **Number, symbol, or link** on every technical claim for a reader who opens the code; real symbols, history checked before calling anything new. "A column rename fails the build", not "schema changes can cause issues".
- **Machine tells.** The reveal against a framing nobody held ("not as a product, but as an experiment"); the fact-free sentence ("version 4 came from the issue tracker, not from my head"); the quotable phrase; a run of same-length short sentences. A rule that worsens a sentence yields.
- **One name per thing.** Across edits, unchanged sentences stay unchanged.

## Calques

A sentence that translates back into German word for word was written in German. Rewrite from the meaning:

- a verb where German takes a noun: "activating the license", not "the license activation"
- the thing named again instead of "the latter"
- noun stacks broken up: "the script that checks the proto-import budget", not "the proto import budget check script"
- _sobald_ → "whenever", _mitlesen_ → "follow the thread", _mitkommen_ → "comes with it", _melden_ → "report a bug or request a feature", _schreib mir_ → "drop me a line"
- "too" at the end of the clause it belongs to

## Typography

- Spaced en dash ( – ) for the parenthetical break; never an em dash.
- Backticks on every identifier where code renders, commit subjects included.
- Bold bullet lead-ins in docs and MR descriptions; none in chat notes.
- Headings in APA title case, carrying the point: "Pick the Mode First", not "Modes".

## Replies and Notes

Calibrate by effort × correctness; thank substantive work specifically. Declining a feature: redirect to userland, with the reason. Correcting a reporter: link the commit or spec that proves it; write the fix in your own terms, not their snippet or framing.

**Low-effort report.** Close with the reason; no thanks.

```
Closing this, as no minimal reproducible example provided.
```

**Wrong-but-trying reporter.** Correct the misdiagnosis, door open.

```
Actually, the library returns the raw response body already. The `{ data: ... }` wrapping must be coming from your backend – can you check your server's response shape?
```

**Review comment or reply to a teammate.** One plain sentence: what is better and where, in the recipient's vocabulary; the line it sits on is its link. Mechanism and how you found it stay out. Imply the fix and share code only when it adds value, unless the caller decides otherwise.

Review comment:

```
Root override liefert das schon für jeden Button mit.
```

Reply to a teammate's comment:

```
Ja, genau – gilt gleichermaßen. Hab ich gelöscht. ✅
```

**Chat note for Slack or a tracker.** Three lines at most, at the recipient's altitude and in their vocabulary.

## PR/MR Descriptions

1. **Intent first.** One or two prose sentences on what and why.
2. **Only what the diff can't show.** Consequences, migration steps. Check results ("lint passes"), follow-ups, and links to other commits stay out.
3. **Evidence for what users see.** Before and after, as screenshots or preview links.
4. **One-way door.** One line names what a revert can't undo: stored data, sent mail, a published API.
5. **Prose by default.** Bullets for several units – per package, concern, or surface, never per file – about five at most.

## Commit Messages

Conventional Commits, subject only: short, high-level, noun phrases fine. The subject is the changelog line and stands alone; longer context goes in the MR description, never a body. `fix` is for code; data and prose changes are `chore` or `docs`. One subject; variants only when asked.

```
feat(api): add `/scalar` and `/swagger` docs routes
fix(comparisons): safely access `parsedData` value to prevent runtime errors
refactor: harmonize `useState` keys
feat!: rename `OpenAPI` to `OpenAPIBuilder`
```

## Docs and READMEs

- **One Diátaxis mode per document.**
- **Status quo.** What is true now, no history – changelogs and migration guides excepted. A file count, path list, or tree only when the reader needs it, with the command that regenerates it.
- **Name the gotcha.** What the code won't tell: the trap, the reason behind a choice; a step that takes three tries says so.
