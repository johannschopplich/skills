# Comments Axis

Judge every comment line the diff adds or changes against the Comments section of `~/.claude/rules/code-style.md`, and every README or doc page it touches as Prose Files says. Start from the list in the comments file, then the comment lines in the diff it missed. A comment or prose line that claims more than the code does – a failure the code recovers from, a limit it doesn't enforce – is never a **keep**: **delete** or **rewrite** it. Name a missing source in `note` and carry on.

Each line gets its verdict in two steps:

1. **Place.** Name the claim the line adds, then look for it in the code around the line: the body, a guard, the declaration's name, a test's name and setup. Found there on a first read, the line is a **read-back**. A read-back, or a line with nothing to name, is a **delete**, whatever its form.
2. **Form.** The form rules – the opening verb, the period, the noun phrase – apply only to a line that earned its place. Beyond its form fixes, a **rewrite** subtracts: it keeps what Place named and drops the rest, adding no claim, example, or boundary of its own, and comes out shorter than the line it replaces.

Done when every added or changed comment line has a verdict: **keep**, **delete**, or **rewrite** (with the rewritten line), each keep and rewrite naming what earned the line its place and the code it was looked for in. A declaration without a comment is no finding.

## Calibration

Deleted in review:

- `// Switched from SMTP to Resend after the March outage.` – history; the commit message carries it.
- `/** Header action that opens the \`PricingPanel\`. */` – a read-back of the declaration's name and body.
- `// Called from \`createChild\` in the sidebar store.` – points at another call site and goes stale.
- `/* Tailwind's docs voice: small mono caps for section labels. */` – narrates design taste.
- `// The doubled request budget is parse plus start.` – a value another place owns.
- `/** Returns today's midnight as a timestamp, which is what \`strtotime()\` makes of a stored \`Y-m-d\`, so the two compare by day. */` above `return strtotime(date('Y-m-d'))` – a read-back of a one-line body, with a reason every call site shows.
- `// Hetzner silently drops outbound 465/587, so mail goes over Resend's HTTPS.` – hosting history and our reasoning; the class works wherever it is hosted.
- `/** Alice seeds the cache first, so a key that did not carry the user would answer Bob with her email. */` above a test named `keeps_one_users_cached_kql_answer_from_another_user` – a read-back of the test's name and setup.
- `// Trimming both sides keeps one slash between the base and the path, also for a root-relative base URL \`/\`.` above two `rtrim()` calls – a read-back of the arithmetic; the root-relative case is the same arithmetic.

## Constraint Comments

A comment that guards the code – `keep in sync with …`, `do not remove`, a self-justifying workaround – is proposed for encoding where a type, a test, or a lint rule can hold the constraint; otherwise it stays. A workaround in our own code gets questioned before its comment.

## Prose Files

Judge a touched `README` or doc page against `~/.agents/skills/writing-docs/SKILL.md`, its Contract first.

Done when every touched paragraph has **keep**, **cut**, or **rewrite**, with every fact a cut would lose named.
