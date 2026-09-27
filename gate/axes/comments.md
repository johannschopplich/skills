# Comments Axis

Debloat. Judge every comment line the diff adds or changes, and every prose file it touches, against the Comments section of `~/.claude/rules/code-style.md`. Start from the list in the comments file, then judge the comment lines in the diff it missed. A comment stays only when it says what the code cannot; every other one goes, and deleting beats rewording.

The axis is done when every added or changed comment line has a verdict: **keep**, **delete**, or **rewrite** (with the rewritten line).

## Calibration

Deleted in review, each for the reason given:

- `// Switched from SMTP to Resend after the March outage.` – history; the commit message carries it.
- `/** Header action that opens the \`PricingPanel\`. */` – restates the name and the code.
- `// Called from \`createChild\` in the sidebar store.` – points at another call site and goes stale.
- `/* Tailwind's docs voice: small mono caps for section labels. */` – narrates design taste.
- `// The doubled request budget is parse plus start.` – a value another place owns.
- `/** Returns undefined when the product has no summary risk indicator. */` above a three-line function – the code already says it.

Kept:

- `// Hetzner silently drops outbound 465/587, so mail goes over Resend's HTTPS.` – a non-obvious constraint; without it the next reader moves mail back to SMTP.
- `// Replace each cluster of four spaces with two.` above a regex – a plain reading of an expression that only decodes on a second pass.

## Constraint Comments

A comment that guards the code – `keep in sync with …`, `do not remove`, a workaround that justifies itself – is proposed for encoding where a type, a test, or a lint rule can hold the constraint; otherwise it stays. A comment explaining a workaround in our own code questions the workaround first.

## Prose Files

For a touched `README`, doc page, `AGENTS.md`, `CONTEXT.md`, or `SKILL.md`: every sentence earns its place for that page's reader. File, script, and loader names that only describe the machinery, history, superseded facts, and counts that go stale are deletions.

Cut redundancy, not substance: a rewrite that drops a fact the reader needs got worse. Done when every touched paragraph has **keep**, **cut**, or **rewrite**, with every fact a cut would lose named.
