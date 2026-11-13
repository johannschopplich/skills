---
name: writing-docs
description: Write, edit, or debloat documentation. Use when working on a doc page, a README, a changelog entry, or a migration guide.
---

# Writing Docs

The reader opened the docs to do something with the software. Call the Skill tool with "writing-for-developers" for its voice and typography before the first draft.

The rules below are defaults with a direction, not a template: weigh each against the page in front of you, let one that worsens a sentence yield, and accept some variance across a site. Two parts are firm: the Contract, and the opening paragraph of Headings. A project's own skill or AGENTS.md overrides everything else.

## The Contract

Docs state the contract: what the reader can set, call, feed in, see, catch, pay for, or must work around. Mechanism stays in the source: internal classes and enums, private fields, internal file and script names, the path a value takes, wire formats, internal batch sizes, the arithmetic behind a number, the extra spellings an option accepts (`false` or `0`), the config files and keys the software does not read. A mechanism the reader feels becomes its consequence, not silence: "Registers a single tool and forces it via `toolChoice`" becomes "Structured output is a forced tool call, so the response always matches your schema." A section whose job is to explain the mechanism, such as How It Works, keeps the mechanism it explains, in the reader's terms.

Docs invite a developer in and show how to work with the software; the types, `--help`, and the source hold the rest. An edit adds a fact only where a reader following the page is stuck without it. A claim that needs a qualifier to stay true, such as "In an English Panel", says less until it is true without one.

The reason behind a design belongs in an ADR or the commit, and stays in the docs only where it helps the reader diagnose or decide. Whether a fact costs money or data depends on the project: under per-character billing a batch size is mechanism, under per-request billing it is a cost. A project's own skill or AGENTS.md names its cost model and audience.

A cut or a rewrite keeps:

- The smallest example that shows a feature's shape on its own page, even where a fuller one follows.
- The workaround snippet behind a "not supported".
- The exact error message the reader sees, and its likely cause.
- Precedence and matching rules: which one wins when two match.
- Defaults and the exact default output.
- How often reader code runs: "at most once per 250 ms".
- Who can access what.
- What tells two options apart where the reader picks one: cost, speed, what each stores.
- What a limit guarantees and where it gives way: "a chunk closes once it reaches the target, so a long segment can push it past".
- The consequence of an allow-list, a list that replaces the defaults instead of adding to them.
- A number, exactly: "for up to 10 minutes", not "for a few minutes". When the number goes, the whole claim goes with it.
- Every list member and tie-breaker of a sentence being merged into another.
- Credit to a person.

## Pages

- **One Diátaxis mode per page,** or per section in a README that is the project's docs.
- **Status quo.** What is true now: no history, no superseded facts. A count that grows, a path list, or a tree only when the reader needs it, with the command that regenerates it. An upgrade step of the current major stays: with its exact error where no migration guide holds it, else as a link to the guide.
- **One owner per fact.** The owner is the page whose job the fact belongs to. Elsewhere it shrinks to the clause the reader needs right there, with the link on that clause: "APIful requires Node 24 or later and TypeScript 5.9 or later – see [Install APIful](…)". An upstream's docs are linked, not mirrored: its option table, its count of supported languages.
- **A shared frame,** a sentence repeated word for word across sibling pages, changes everywhere or nowhere.
- **Open on the subject.** The first sentence says what the thing does, with an example value: "`apiful/http-status-codes` exports every registered HTTP status code as a constant typed with its literal number, such as `NOT_FOUND` for `404`."
- **A section that only points elsewhere** becomes a sentence at the end of the paragraph before it.
- **A lead-in before code, a table, or output** stays when it carries a fact the block does not show: "This displays the following output:" goes.
- **A callout earns its box** with a warning or a link out. A plain fact in a note reads as a sentence.
- **A variant example that changes one property** becomes one sentence: "`label` and `instructions` can each be translated per Panel language."
- **Name the hard part.** A step readers get wrong says where it fails and why.

## READMEs

A README keeps its repo's frame: the header block with its tagline, the nav and docs links, the emoji, and the H2 sections readers scan for across repos – the conventional ones and those the repo shares with its siblings – with their names and order. An edit improves everything inside that frame, the other headings included, and leaves the frame standing. A block between generator markers, such as `<!-- automd:file -->` and `<!-- /automd -->`, is edited at its source. What a README holds inside its frame follows who reads it:

- **In front of a docs site,** it holds only what the reader needs before the docs: what the project does, its features, the version floor and the install, the one example that runs as pasted or the task table the reader starts from, and the link to the docs. Options, API, and guides live on the site; a section for one of them shrinks to its link.
- **As the project's docs,** it reads as one page in reader order: what it does, the install, a quick start that runs as pasted, then the tasks – a Use Cases section of imperative headings reads well – then the reference.
- **For those who develop the project itself** – a site, an app, a starter they fork – the files, scripts, and deploy path they touch are its contract. The setup steps stay; a command reference an AGENTS.md owns is linked, not repeated. The reason behind the project and the voice the repo keeps stand, and the Wording rules apply within that voice.

## Headings

A heading names what its section holds. One that could title a section on any page – "Usage", "Advanced Configuration", "Notes" – names nothing: "Advanced Configuration" becomes "Pass Props to the Button". An "Overview" that opens a getting-started page still does its job, and a README's frame sections are the exception the READMEs section names. Sections of one kind on a page share one form: "Setting Up the View Button" above "Cancel Generation" reads as two authors.

The form follows the section's job:

- **A task the reader performs** takes an imperative: "Handle Errors", "Install APIful". A gerund ("Writing Tests") is a sound house style where the site keeps it.
- **A concept or group** takes a noun phrase naming its content: "Retry Behavior", "Writer and Textarea Fields Alike".
- **A behavior or a change** takes a claim with subject and verb: "Pages Win Over Files", "`OpenAPIBuilder` Is Now `openAPIBuilder`".
- **An option or API entry** takes its identifier in backticks.
- **A choice the reader makes** takes the question they ask, as a question or a When to Use heading: "Nitro's Built-In Testing or Nitro Test Utils?", "When to Use Locked Pages".

A feature list is one kind, so its headings stay noun phrases even where one names a task.

## Wording

- **Present tense** for what the software does: "an exception will be thrown" becomes "throws when the section loads".
- **The software as subject, or an imperative for the reader:** "This allows you to set default options" becomes "This sets default options"; "Kirby Copilot can be configured globally" becomes "Configure Kirby Copilot globally". "You can" stays where it grants permission: "you can download and test it before purchasing".
- **The verb that happens:** "Both methods provide the same functionality" becomes "Both run the same translation". Provide, support, and handle usually stand in for a sharper verb. A sharper claim is checked against the source before it replaces a vague one.
- **Define a thing by what it is:** "A handler extension returns a function" becomes "A handler extension is a function".
- **Behavior over adjectives and analogies:** "a jQuery-like, Axios-style API" becomes "each property adds a path segment".
- **The visible name:** the label the UI prints ("Bad" becomes "Needs improvement") and the thing the reader sees ("the badge" becomes "the dot on the view button").
- **The glossary term,** where the project has one, its _Avoid_ list applied down to placeholders: "OpenAPI schema" becomes "OpenAPI document", `<id>` becomes `<service>`.
- **The sentence's own colon points at the code:** "The following example shows how to configure the blueprint:" becomes "In the blueprint:".
- **Link text that names its target uses the target's heading:** a link to "File Attachments" reads "File Attachments", not "Files as Context". A link on a clause of a sentence keeps the sentence's words.
- **Contractions** are spelled out in a library's docs ("is not").

## Changelogs and Migration Guides

- Writing or trimming a changelog: [`references/changelog.md`](references/changelog.md).
- Writing a migration guide or an upgrade section: [`references/migration.md`](references/migration.md).

## Debloat Pass

1. **Verdict.** Give every paragraph of the page **keep**, **cut**, or **rewrite** against the sections above, for this page's reader and its mode. Done when no paragraph is left without one.
2. **Vanished facts.** After the cuts, run `node <this skill's dir>/scripts/vanished-facts.mjs <base> [<docs-dir>]` from the repo: `<docs-dir>` defaults to `docs`, `.` checks a README, and `--per-dir` makes each top-level directory of `<docs-dir>` its own corpus for docs that are one product per directory. It lists the numbers, a bare 0, 1, or 2 aside, and the backticked identifiers the change removed that no page still contains; a changelog, `GLOSSARY.md`, an ADR under `adr/`, `AGENTS.md`, `CLAUDE.md`, and a dot-named file or directory count as no page. A default or an error message in plain words, and a bare 0, 1, or 2, is the verdict's to catch. Done when every listed fact is back on the page or one the Contract leaves to the source.
3. **Loose ends, added facts, and fresh read**, as below.

## Loose Ends

After an edit that cuts, renames, or moves, every link, anchor, section number, and name that the page or another file points at still resolves, and every remaining example runs as pasted, with the sentences around it still fitting. Done when nothing dangles.

## Added Facts

After an edit that adds or rewrites, run the Debloat Pass's command with `--added`. Before keeping a fact an earlier commit removed, read that commit. Done when every listed fact is one the Contract lets an edit add – for a debloat, when each listed fact rewords one the change removed.

## Fresh Read

Every doc edit beyond a sentence or two, written or debloated, closes on a fresh subagent that gets the old text if there is one, the new text, the page's purpose, the Contract's keep list, and Loose Ends. A hunk it judges worse, or longer without gain, goes back.
