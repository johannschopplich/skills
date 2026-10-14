---
name: writing-for-developers
description: Draft and rewrite developer-facing copy in the user's voice. Use when the user asks to draft an issue reply, an MR review comment, a Slack or tracker note, a PR/MR description, or a commit subject, or to write or review a README or doc page.
---

# Writing for Developers

Reader: a domain peer, sometimes a PM who never opens the code. Write in the recipient's language, else the repo's.

## Voice

- **Peer level, no explaining down.** State the fact; the reader infers.
- **Reader's altitude.** Reader with the diff open: intent and consequence. Reader who never opens it: the outcome they'd notice.
- **Only what the reader can't see.** The trap, the reason behind a choice, the consequence. What the diff, the line, or the thread already shows stays out.
- **Their vocabulary, your framing.** Use the terms the recipient uses. State the fix in your own framing, not their snippet's.
- **Open on the fact.** Key facts and consequence, not the path or a recap. Not shallow: a shorter version that needs rereading got worse. Substantive acknowledge-and-pivot is fine: "Great idea overall, but …"
- **Number, symbol, or link** on every technical claim: "A column rename fails the build", not "schema changes can cause issues".
- **Machine tells.** The reveal against a framing nobody held ("not as a product, but as an experiment"); the fact-free sentence ("version 4 came from the issue tracker, not from my head"); the quotable phrase; a run of same-length short sentences. A rule that worsens a sentence yields.
- **One name per thing.** Across edits, unchanged sentences stay unchanged.
- **No calques.** An English sentence that translates back into German word for word was written in German. Rewrite it from the meaning.

## Typography

- Spaced en dash ( – ) for the parenthetical break; never an em dash.
- Backticks on every identifier where code renders, commit subjects included.
- Bold bullet lead-ins in docs and MR descriptions; none in chat notes.
- Headings in APA title case, carrying the point: "Pick the Mode First", not "Modes".

## Replies and Notes

Calibrate by effort × correctness; thank substantive work specifically. Declining a feature: redirect to userland, with the reason. A report on intended behavior gets that behavior in one line and the workaround as a ready snippet, without the version history behind it.

**Low-effort report.** Close with the reason; no thanks.

```
Closing this. Please provide a reproducible example for the next issue.
```

**Wrong-but-trying reporter.** Correct the misdiagnosis, door open.

```
Actually, the library returns the raw response body already. The `{ data: ... }` wrapper appears to be coming from your backend. Can you check your server's response shape?
```

**Review comment or reply to a teammate.** One or two sentences. The line they sit on is their link. Mechanism and how you found it stay out.

Review comment:

```
Der Root-Override liefert das schon für jeden Button mit.
```

Review comment on a likely bug:

```
Ich glaub, hier hat sich ein Fehler eingeschlichen. `0 && …` ist immer falsy, also greift das `v-if` nie, oder?
```

Reply to a teammate's comment:

```
Ja, genau – gilt gleichermaßen. Hab ich gelöscht. ✅
```

**Chat note for Slack or a tracker.** Three lines at most.

## PR/MR Descriptions

1. **Intent.** One or two prose sentences open it: what and why.
2. **Evidence.** Before and after for what users see; what was checked beyond CI, and what couldn't be.
3. **Cause.** A fix whose cause the diff doesn't show gets sections for cause and fix, with the proof: the warning, a diagram.
4. **One-way door.** One line names what a revert can't undo.

Migration steps when there are any. Follow-ups and links to other commits stay out.

## Commit Messages

Conventional Commits in English, subject only: short, high-level, noun phrases fine. The subject is the changelog line and stands alone; longer context goes in the MR description, never a body. `fix` is for code; data and prose changes are `chore` or `docs`. A scope only where the repo's history uses scopes. One subject; variants only when asked.

```
feat(api): add `/scalar` and `/swagger` docs routes
fix(comparisons): safely access `parsedData` value to prevent runtime errors
refactor: harmonize `useState` keys
feat!: rename `OpenAPI` to `OpenAPIBuilder`
```

## Docs and READMEs

- **One Diátaxis mode per document.**
- **Status quo.** What is true now, no history. A file count, path list, or tree only when the reader needs it, with the command that regenerates it.
- **A step that takes three tries says so.**
