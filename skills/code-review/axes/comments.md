# Comments Axis

Judge every comment line the diff adds or changes against the Comments section of `~/.claude/rules/code-style.md`, and every README or doc page it touches as Prose Files says. Start from the list in the comments file, then the comment lines in the diff it missed. A comment or prose line that claims more than the code does – a failure the code recovers from, a limit it doesn't enforce – is never a **keep**: **delete** it, or **rewrite** it down to what the code does. Name a missing source in `note` and carry on.

Each line gets its verdict in two steps:

1. **Place.** Name what the line says that the code cannot. Nothing to name → **delete**, whatever its form.
2. **Form.** The form rules – the opening verb, the period, the noun phrase – apply only to a line that earned its place. A **rewrite** subtracts: it keeps what step 1 named and drops the rest, adding no claim, example, or boundary of its own.

Done when every added or changed comment line has a verdict: **keep**, **delete**, or **rewrite** (with the rewritten line), each keep and rewrite naming what earned the line its place. A declaration without a comment is no finding.

## Constraint Comments

A comment that guards the code – `keep in sync with …`, `do not remove`, a self-justifying workaround – is proposed for encoding where a type, a test, or a lint rule can hold the constraint; otherwise it stays. A workaround in our own code gets questioned before its comment.

## Prose Files

Judge a touched `README` or doc page against `~/.agents/skills/writing-docs/SKILL.md`, its Contract first.

Done when every touched paragraph has **keep**, **cut**, or **rewrite**, with every fact a cut would lose named.
