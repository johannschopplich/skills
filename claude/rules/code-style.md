---
paths:
  - "**/*.{ts,mts,cts,tsx,js,mjs,cjs,jsx}"
  - "**/*.vue"
  - "**/*.php"
  - "**/*.{css,scss}"
  - "**/*.{yml,yaml}"
  - "**/*.{sh,py}"
---

# Code Style

## Naming

Names say what a thing is, in full: the whole word (`chunk` not `c`), the noun a participle or adjective describes (`parsedValue` not `parsed`, `existingIndex` not `existing`), and a precise noun over a generic one (`abortReasons` not `problems`). The exception is a method or property whose class or type already names that noun: it takes the bare participle or adjective, since the full name would say the noun twice (`VariableTranslation::pending()` not `pendingVariables()`). Booleans take an `is`/`has`/`should` prefix in internal code, and the exception does not lift it. A published option name or a CLI flag key is a contract and keeps the spelling it shipped with (`strict`, `dryRun`). Name length scales with scope: within a few lines, short established nouns are fine – `i`, `index`, `next`, `entry`, and module aliases like `fsp`.

## Order

A module reads top-down: constants and state, then exports, then its private function declarations in one block, in order of first use. A class puts public methods before private ones.

## Comments

A comment earns its place by saying what the code cannot: intent, non-obvious constraints, gotchas, the reason a framework default is overridden, and a plain reading of an expression that only decodes on a second pass – `// Replace each cluster of four spaces with two.` above a regex pays for itself, `// Write entry file.` above `writeFile(entryFilePath, entryContent)` does not. Position never creates the obligation: being exported, published, or public does not earn a declaration a comment it hasn't otherwise earned, and `/** Options for extractFields. */` above `export interface ExtractOptions extends FilterOptions` is bloat. The test doesn't soften either way – an editor shows a published declaration's doc comment on hover, which is a reason to write one worth reading, not a reason to keep one that repeats the name and the type. A bare label like `// Runtime state` either marks a block, and then it is a `#region`, or it names the line below it, and then it is deleted.

A comment, or a clause of one, also goes when something else already says it – a type, a lint rule, a test, the adjacent code, the project glossary, the doc beside the file, or a dependency's docs. Derivations, counts, ticket, PM, or internal-spec references, values another file owns, and pointers to a sibling call site stay out too. A sync note stays only where no type, test, or lint rule can hold the coupling.

Every comment that survives is one of three things, and the rules below turn on which:

- **Prose** is a description in sentences, and is the default.
- **Verbatim** content is not prose and stays exactly as written: a lint or compiler directive; a comment carrying a value or a URL, with at most a label (`// License: Apache-2.0`, `// i-carbon-edit`); a section heading where no `#region` is available, which means configuration and data files, and template markup labeling a group rather than a single element (`<!-- Action buttons -->`); a sample inside an `@example`; and a comment inside a template literal that emits code, which belongs to the emitted file. A directive is verbatim, but a reason appended to one is prose: `// eslint-disable-next-line ts/no-explicit-any -- The SDK types the handler as any.`
- A **block tag** splits by its content, never by its name: a description that continues the signature ends at its last word and takes no period, even when the tag is the whole comment (`@param bytes The raw file contents`, `/** @default 'Root' */`), and once it runs to a sentence it is prose and is punctuated as prose (`@deprecated Removed in Kirby 6; the extensions manager reads the view from its editor reference instead.`).

Prose that describes what a callable does opens with a third-person verb ("Parses…", "Collects…"); a comment stating a domain fact instead is exempt. Callability decides that, not syntax, so a function type and a getter take the verb too. Everything else – values, fields, types, return values – takes a noun phrase, spending the words on the reason the code reads the way it does or on naming what comes back: `/** Longest run of characters that both ends the first string and starts the second. */` is worth the line above `const overlapLength`, where "Returns the overlap length" would say nothing.

Prose ends with a period, in every comment syntax, one line or twenty, and wherever it sits – a trailing comment on a line of code follows the same rules as one above it: `// citty writes each option under both its camel and its kebab spelling.`, `/** Absolute path, already resolved against the config root. */`. The one exception is a comment ending in a URL, where the period would be read as part of the link.

Code identifiers in backticks. Reference symbols, and a path only where the target has no symbol to name (`// Keep in sync with the job matrix in .github/workflows/ci.yml.`); never a line number, since symbols are greppable and survive renames. No journal comments: decision numbers, review echoes, "was previously X", and commented-out code in source files belong in git history. Attribution is the exception to both the symbol-reference rule and the journal rule: name the source of a borrowed formula, spec rule, or implementation – by name or URL, never a section number – since that is where a reader goes to check it. A `TODO` names the condition that retires it – `// TODO: Drop the K4 branch once Kirby 5 is the floor.`; one that can't name a condition names the missing work instead, because unfinished work is not a record of a past decision and deleting it destroys its only trace.

Structure comes from sentences; where a file needs visible sections, `// #region Name` … `// #endregion` takes the place of a banner comment – the one decoration an editor folds.

Comments are American English.

Length is what the substance needs; one line when it fits. When trimming, cut redundancy, not substance – a shorter comment that needs rereading got worse.
