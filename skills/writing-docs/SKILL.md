---
name: writing-docs
description: Write, edit, or debloat documentation. Use when working on a doc page, a README, a changelog entry, or a migration guide.
---

# Writing Docs

The reader opened the docs to do something with the software. Invoke `writing-for-developers` before the first draft: voice and typography, APA title case and the en dash among them, come from it.

The rules below are defaults with a direction, not a template. Weigh each against the page in front of you: use cases differ, a rule that worsens a sentence yields, and some variance across a site is fine. Two parts are firm: the Contract, and the opening paragraph of Headings. A project's own skill or AGENTS.md overrides everything else.

## The Contract

Docs state the contract: what the reader can set, call, see, catch, pay for, or must work around. Mechanism stays in the source: internal classes and enums, private fields, internal file and script names, the path a value takes, wire formats, internal batch sizes, the arithmetic behind a number, the spellings an input also tolerates. A mechanism the reader feels becomes its consequence, not silence: "Registers a single tool and forces it via `toolChoice`" becomes "Structured output is a forced tool call, so the response always matches your schema."

The reason behind a design belongs in an ADR or the commit, and stays in the docs only where it helps the reader diagnose or decide. Whether a fact costs money or data depends on the project: under per-character billing a batch size is mechanism, under per-request billing it is a cost. A project's own skill or AGENTS.md names its cost model and audience.

Always keep:

- The one example that shows a feature's data shape on its own page.
- The workaround snippet behind a "not supported".
- The exact error message the reader sees, and its likely cause.
- Precedence and matching rules: which one wins when two match.
- Defaults and the exact default output.
- How often reader code runs: "at most once per 250 ms".
- Who can access what.
- The consequence of an allow-list, a list that replaces the defaults instead of adding to them.
- A number, exactly: "for up to 10 minutes", not "for a few minutes". When the number goes, the whole claim goes with it.
- Every list member and tie-breaker of a sentence being merged into another.

## Pages

- **One Diátaxis mode per page,** or per section in a README that is the project's docs.
- **Status quo.** What is true now: no history, no superseded facts. A count that grows, a path list, or a tree only when the reader needs it, with the command that regenerates it. An upgrade step of the current major stays: with its exact error where no migration guide holds it, else as a link to the guide.
- **One owner per fact.** The owner is the page whose job the fact belongs to. Elsewhere it shrinks to the clause the reader needs right there, with the link on that clause: "APIful requires Node 24 or later and TypeScript 5.9 or later – see [Install APIful](…)". An upstream's docs are linked, not mirrored: its option table, its count of supported languages.
- **Open on the subject.** The first sentence says what the thing does, with an example value: "`apiful/http-status-codes` exports every registered HTTP status code as a constant typed with its literal number, such as `NOT_FOUND` for `404`."
- **A section that only points elsewhere** becomes a sentence at the end of the paragraph before it.
- **A lead-in before code, a table, or output** stays when it carries a fact the block does not show: "This displays the following output:" goes.
- **A callout earns its box** with a warning or a link out. A plain fact in a note reads as a sentence.
- **A variant example that changes one property** becomes one sentence: "`label` and `instructions` can each be translated per Panel language."
- **Name the hard part.** A step readers get wrong says where it fails and why.

## READMEs

A README keeps its repo's frame: the header block with its tagline, the nav and docs links, the emoji, the landmark sections and their order. Landmarks keep their names, variants and emoji included: the conventional ones – Features, Requirements, Installation or Setup, Quick Start, Usage, Use Cases, API, Options, Development, Documentation, Credits, License – and the ones the repo shares with its siblings, such as When to Use across a set of plugins or Why across a set of sites. Readers scan for them across repos. A landmark that only links stays.

An edit improves the text inside that frame, headings beneath the landmarks included, and leaves the frame standing. A fact the reader needs and the page lacks, such as an exact error, a default, or which option wins, is added where the page owns it, checked against the source. A block between generator markers, such as `<!-- automd:file -->` and `<!-- /automd -->`, is edited at its source. What a README holds inside its frame follows who reads it:

- **In front of a docs site,** it holds at most what the reader needs before the docs: what the project does, its features, the version floor and the install, the one example that runs as pasted or the task table the reader starts from, and the link to the docs. Options, API, and guides live on the site; a landmark for one of them shrinks to its link.
- **As the project's docs,** it reads as one page in reader order: what it does, the install, a quick start that runs as pasted, then the tasks – a Use Cases section of imperative headings reads well – then the reference.
- **For those who develop the project itself** – a site, an app, a starter they fork – the files, scripts, and deploy path they touch are its contract. The setup steps stay; a command reference an AGENTS.md owns is linked, not repeated. The reason behind the project and the voice the repo keeps stand, and the Wording rules apply within that voice.

## Headings

A heading names what its section holds. One that could title a section on any page – "Usage", "Advanced Configuration", "Notes" – names nothing: "Advanced Configuration" becomes "Pass Props to the Button". An "Overview" that opens a getting-started page still does its job, and a README's landmarks are the exception the READMEs section names. Sections of one kind on a page share one form: "Setting Up the View Button" above "Cancel Generation" reads as two authors.

The form follows the section's job:

- **A task the reader performs** takes an imperative: "Handle Errors", "Install APIful". A gerund ("Writing Tests") is a sound house style where the site keeps it.
- **A concept or group** takes a noun phrase naming its content: "Retry Behavior", "Writer and Textarea Fields Alike".
- **A behavior or a change** takes a claim with subject and verb: "Pages Win Over Files", "`OpenAPIBuilder` Is Now `openAPIBuilder`".
- **An option or API entry** takes its identifier in backticks.
- **A choice the reader makes** takes the question they ask: "Nitro's Built-In Testing or Nitro Test Utils?"

A feature list is one kind, so its headings stay noun phrases even where one names a task.

A renamed heading moves its anchor: update every link that points at it.

## Wording

- **Present tense** for what the software does: "an exception will be thrown" becomes "throws when the section loads".
- **The software as subject, or an imperative for the reader:** "This allows you to set default options" becomes "This sets default options"; "Kirby Copilot can be configured globally" becomes "Configure Kirby Copilot globally". "You can" stays where it grants permission: "you can download and test it before purchasing".
- **The verb that happens:** "Both methods provide the same functionality" becomes "Both run the same translation". Provide, support, and handle usually stand in for a sharper verb.
- **Define a thing by what it is:** "A handler extension returns a function" becomes "A handler extension is a function".
- **Behavior over adjectives and analogies:** "a jQuery-like, Axios-style API" becomes "each property adds a path segment".
- **The visible name:** the label the UI prints ("Bad" becomes "Needs improvement") and the thing the reader sees ("the badge" becomes "the dot on the view button").
- **The glossary term,** where the project has one, its _Avoid_ list applied down to placeholders: "OpenAPI schema" becomes "OpenAPI document", `<id>` becomes `<service>`.
- **The sentence's own colon points at the code:** "The following example shows how to configure the blueprint:" becomes "In the blueprint:".
- **Link text that names its target uses the target's heading:** a link to "File Attachments" reads "File Attachments", not "Files as Context". A link on a clause of a sentence keeps the sentence's words.
- **Contractions** are spelled out in a library's docs ("is not"). A product with a personal voice sets its own in its project skill or AGENTS.md.

## Changelogs and Migration Guides

- Writing or trimming a changelog: [`references/changelog.md`](references/changelog.md).
- Writing a migration guide or an upgrade section: [`references/migration.md`](references/migration.md).

## Debloat Pass

1. **Verdict.** Give every paragraph of the page **keep**, **cut**, or **rewrite** against the sections above, for this page's reader and its mode, per section in a README that is the project's docs. Done when no paragraph is left without one.
2. **Vanished facts.** After the cuts, run `node <this skill's dir>/scripts/vanished-facts.mjs <base> [<docs-dir>]` from the repo, `<docs-dir>` defaulting to `docs`. It lists the numbers, a bare 0, 1, or 2 aside, and the backticked identifiers the change removed that no Markdown page under `<docs-dir>` still contains; a default or an error message in plain words is the verdict's to catch. Pass `.` when the change touches a README, and add `--per-dir` when each top-level directory is a product read on its own. Done when every listed fact is either mechanism or back on the page.
3. **Fresh read**, as below.

## Fresh Read

Every doc edit, written or debloated, closes on a fresh subagent that gets the old text if there is one, the new text, and the page's purpose. A hunk it judges worse, or longer without gain, goes back.
