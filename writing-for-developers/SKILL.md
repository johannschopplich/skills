---
name: writing-for-developers
description: Draft and rewrite developer-facing copy in the user's voice. Use when the user asks to draft an issue reply, an MR review comment, a Slack or tracker note, a PR/MR description, or a commit subject, or to write or review a README or doc page.
---

# Writing for Developers

The reader is usually a domain peer – whoever filed the issue, wrote the code, or will maintain it – and sometimes a PM who never opens the code. Voice, clarity, and typography hold everywhere; an artifact section adds to them and never replaces them. Write in the recipient's language; the German examples below are German because their recipients were.

When a rule makes a sentence worse, fix the sentence another way or leave it alone. A sentence that satisfies every rule and reads like a machine wrote it has failed. The tells: the rhetorical reveal that knocks down a framing nobody held ("not as a product, but as an experiment", "not because the world needed one, there are plenty"), and the sentence that carries no fact ("version 4 came from the issue tracker, not from my head").

## Voice

- **Peer-to-peer.** State the fact; trust the reader to draw the inference. A clause explains down when it defines something they already used correctly, spells out a step they'd infer, or answers what nobody asked. Keep the claim, cut the gloss. In a reply or an MR description, address a peer with statements – an imperative aimed at a peer reads as a pitch. A doc instructs; the rest doesn't.
- **Pitched at the reader's altitude.** What counts as a fact depends on who reads. Someone with the diff open wants intent and consequence; someone who will never open it wants the outcome they'd notice. The same change is a different sentence in each.
- **Concise by default.** Key facts, not the path that produced them. Not shallow either: cut the recap and the repetition, keep the consequence – a shorter version that needs rereading got worse.
- **Open on the fact.** The first sentence carries the finding, and each paragraph after it starts on its own subject. Make the rhetorical move rather than announcing it. Substantive acknowledgment with a pivot ("Great idea overall, but …") is fine.
- **Every technical claim carries a number, a symbol, or a link** for a reader who opens the code. Real symbols from the source, and check the history before calling something new. Specific over sterile: "a column rename fails the build", not "schema changes can cause issues". A phrase that sounds quotable is a phrase to cut.
- **Mix sentence lengths on purpose.** Short sentences land a point; longer ones carry a fact with its condition or consequence. One thought per sentence does not mean one length per sentence.

## Clarity

- **One referent per pronoun.** Every "it", "they", and "this" points at one obvious thing – a noun, never a whole clause. Repeat the noun when in doubt.
- **Put "only" and "not" beside the word they change.** "Only fails on growth" and "fails only on growth" say different things.
- **Break up noun strings.** "The proto import budget check script" becomes "the script that checks the proto-import budget".
- **One name per thing, everywhere.** Three names for one thing teaches three things. The same holds across edits: leave an unchanged sentence unchanged rather than rewording it.
- **No calques.** A sentence that translates back into German word for word was written in German. Rewrite it from the meaning: a verb where German reaches for a noun ("activating the license", not "the license activation"), the thing named again instead of "the latter", "whenever" for a *sobald* condition, "follow the thread" for *mitlesen*, "comes with it" for *mitkommen*, "report a bug or request a feature" for *melden*, "drop me a line" for *schreib mir*, and "too" at the end of the clause it belongs to.

## Typography

- En dash with spaces ( – ) for the parenthetical break. Never an em dash.
- Backticks on every identifier wherever they render as code, including commit subjects.
- Bold for bullet lead-ins.
- Headings in APA title case, carrying the point rather than the topic – "Pick the Mode First", not "Modes".

## Replies and Notes

Calibrate by effort × correctness. Thank substantive contributions specifically. When declining a feature, redirect to userland and give the reason. When correcting a reporter, link the commit or spec that proves it, and write the fix in your own terms rather than recycling the reporter's snippet or framing.

**Low-effort report.** Close with the reason; no thanks.

```
Closing this, as no minimal reproducible example provided.
```

**Wrong-but-trying reporter.** Correct the misdiagnosis, door open.

```
Actually, the library returns the raw response body already. The `{ data: ... }` wrapping must be coming from your backend – can you check your server's response shape?
```

**Review comment or reply to a teammate.** One plain sentence on what is better and where, in the recipient's vocabulary; the line the comment sits on is its link. The mechanism and how you found the problem stay out – the dev knows the code. Whether to imply the fix or hand it over is the caller's call; on a teammate's code in review, the default is to imply it and share code only when it adds value.

A review comment:

```
Root override liefert das schon für jeden Button mit.
```

A reply to a teammate's comment:

```
Ja, genau – gilt gleichermaßen. Hab ich gelöscht. ✅
```

**Chat note for Slack or a tracker.** At most three lines, at the recipient's altitude and in their vocabulary.

## PR/MR Descriptions

1. **Lead with intent.** One or two sentences of prose on what the MR does and why, ahead of any list.
2. **Only what the diff can't show.** Consequences and migration steps. Verification notes, follow-up lists, and links to other commits stay out.
3. **Prose by default; bullets aggregate.** Bullets only once several units need separating – one per package, concern, or surface, never one per file – and about five at most.

## Commit Messages

Conventional Commits, subject only: short and high-level, lowercase after the colon; noun phrases are fine. The subject doubles as the changelog line – write it to stand alone, and put anything longer in the MR description instead of a body. `fix` is for code; data and prose changes are `chore` or `docs`. Write one subject; offer variants only when asked.

```
feat(api): add `/scalar` and `/swagger` docs routes
fix(comparisons): safely access `parsedData` value to prevent runtime errors
refactor: harmonize `useState` keys
feat!: rename `OpenAPI` to `OpenAPIBuilder`
```

## Docs and READMEs

- **One document, one mode.** Two axes pick it: does the content serve doing or understanding, learning or work? Action + learning is a **tutorial**, action + work a **how-to**, understanding + work **reference**, understanding + learning **explanation**. Where two modes meet, split and link. Opinion belongs in explanation and nowhere else.
- **Put the condition before the instruction.** "To delete the document, click Delete." The reader skips what doesn't apply. Common case first, exceptions after.
- **Write the status quo.** Every doc but a changelog or migration guide says what is true now, without the history that led there. A file count, path list, or directory tree goes in only when the reader needs it; then it is true at the commit that lands it, and the doc carries the command that regenerates it.
- **Name the gotcha.** Document what reading the code won't tell – the trap, the reason behind a choice – and a step that takes three tries says so. If it were simple, the reader wouldn't be here.
