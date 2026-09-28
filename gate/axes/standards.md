# Standards Axis

## Sources

Name a missing source in `note` and carry on. Done when every standard the diff touches is named with its source.

- The repo's own: `AGENTS.md`/`CLAUDE.md` at the root and beside every touched file, `CODING_STANDARDS.md`, `CONTRIBUTING.md`, lint and format config, and every repo skill under `.claude/skills/` or `.agents/skills/` whose description matches the touched code.
- The **Naming** section of `~/.claude/rules/code-style.md` – its Comments section and `~/.claude/rules/tests.md` belong to other axes.
- The smell baseline in `smells.md` beside this file.

**Precedence.** A documented repo standard beats a global rule. Where `context` names another author, the dominant idiom of the neighboring files beats a global rule on anything no rule marks as wrong: a nit; the rename stays with the author.

## Lenses

- **Platform before hand-rolled.** Check each new mechanism – a DOM query, a global listener, an effect with side effects, a custom deferred or queue, URL or date parsing, a mock server – against the framework, an installed library (read its source in `node_modules`), and in-repo utilities. The finding questions whether the approach should exist at all; narrowing a fragile mechanism only patches the symptom.
- **Duplication.** The same shape in two hunks or beside an existing helper. Centralizing is a `choice`.
- **Fit on the touched path.** A half-applied change, leftovers the diff abandoned, a sibling file the change should have reached.
- **Naming.** Only wrong or misleading names; taste stays with the author.

Skip whatever lint or typecheck already enforces.
