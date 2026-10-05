# Comments Axis

Judge every comment line the diff adds or changes, and every prose file it touches, against the Comments section of `~/.claude/rules/code-style.md`. Start from the list in the comments file, then the comment lines in the diff it missed. Deleting beats rewording. A comment or prose line that claims more than the code does – a failure the code recovers from, a limit it doesn't enforce – is never a **keep**: **delete** it, or **rewrite** it to what the code does.

Done when every added or changed comment line has a verdict: **keep**, **delete**, or **rewrite** (with the rewritten line). A keep names what the line says that the code cannot; accurate alone is not enough. A line that doesn't earn its place is deleted, never rewritten.

## Calibration

Deleted in review:

- `// Switched from SMTP to Resend after the March outage.` – history; the commit message carries it.
- `/** Header action that opens the \`PricingPanel\`. */` – restates the name and the code.
- `// Called from \`createChild\` in the sidebar store.` – points at another call site and goes stale.
- `/* Tailwind's docs voice: small mono caps for section labels. */` – narrates design taste.
- `// The doubled request budget is parse plus start.` – a value another place owns.
- `/** Returns undefined when the product has no summary risk indicator. */` above a three-line function – the code already says it.
- `// Hetzner silently drops outbound 465/587, so mail goes over Resend's HTTPS.` – hosting history and our reasoning; the class works wherever it is hosted.

## Constraint Comments

A comment that guards the code – `keep in sync with …`, `do not remove`, a self-justifying workaround – is proposed for encoding where a type, a test, or a lint rule can hold the constraint; otherwise it stays. A workaround in our own code gets questioned before its comment.

## Prose Files

A touched `README`, doc page, `AGENTS.md`, `CONTEXT.md`, or `SKILL.md`: every sentence earns its place for that page's reader. Machinery-only file, script, and loader names, history, superseded facts, and counts that go stale are deletions. A rewrite that drops a fact the reader needs got worse.

Done when every touched paragraph has **keep**, **cut**, or **rewrite**, with every fact a cut would lose named.
