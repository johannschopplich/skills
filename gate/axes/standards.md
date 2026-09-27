# Standards Axis

Judge the diff against the standards that bind this repo, and against the platform it builds on.

## Sources

Read these before judging; a missing source is named in `note`, and the axis carries on. The axis is done when every standard the diff touches is named with its source.

- The repo's own: `AGENTS.md`/`CLAUDE.md` at the root and beside every touched file, `CODING_STANDARDS.md`, `CONTRIBUTING.md`, lint and format config, and every repo skill under `.claude/skills/` or `.agents/skills/` whose description matches the touched code.
- The **Naming** section of `~/.claude/rules/code-style.md`. Its Comments section belongs to the comments axis, and `~/.claude/rules/tests.md` to the tests axis.
- The smell baseline under *Identify the standards sources* in `~/.agents/skills/code-review/SKILL.md`: each smell is a labeled judgment call, never a hard violation.

**Precedence.** A documented repo standard beats a global rule. Where `context` names another author, the dominant idiom of the neighboring files beats a global rule on anything no rule marks as wrong: report the mismatch as a nit and leave the rename to the author.

## Lenses

- **Platform before hand-rolled.** For each new mechanism – a DOM query, a global listener, an effect with side effects, a custom deferred or queue, URL or date parsing, a mock server – check whether the framework, an installed library (read its source in `node_modules`), or an in-repo utility already provides it. Such a finding questions whether the approach should exist at all; a fix that narrows a fragile mechanism is a patch on the symptom.
- **Duplication.** The same shape in two hunks or beside an existing helper. Centralizing is a choice.
- **Fit on the touched path.** A half-applied change, leftovers the diff abandoned, a sibling file the change should have reached.
- **Naming.** Only wrong or misleading names; taste stays with the author.

Skip whatever lint or typecheck already enforces.
