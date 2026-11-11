---
name: writing-agents-md
description: Write, extend, or debloat an AGENTS.md or CLAUDE.md. Use when a lesson from an agent's mistake needs a home, or one file splits across a monorepo.
---

# Writing AGENTS.md

Call the Skill tool with "writing-for-agents" first.

## Placement

A line goes to the first place that matches:

1. **Nowhere**, when the agent finds it by looking: the stack, a directory tour, what a script does.
2. **The code or config**, when a tool can enforce it (a lint rule, a hook, `packageManager` in `package.json`) or it bears on one spot (a comment there).
3. **`GLOSSARY.md`, an ADR, or the MR**, when it defines a term or argues a decision.
4. **`~/.claude/CLAUDE.md`, `~/.codex/AGENTS.md`, or a `~/.claude/rules/` file**, when it is the user's own preference in every repo and no teammate needs it.
5. **A skill**, when it is a workflow of several steps that only some tasks run.
6. **A doc behind a pointer** (`For TypeScript conventions, see docs/TYPESCRIPT.md.`), or a `.claude/rules/` file with `paths` where the repo keeps `.claude/rules/`, when several lines bear on one domain or file type that spans directories.
7. **The `AGENTS.md` of the narrowest directory** holding every file it bears on; a line that picks where a new file goes bears on every directory it picks between.

## Shape

H1 product name → one sentence on what the project is and for whom → `GLOSSARY.md` and `docs/adr/` pointers if they exist → `## Commands` → `## Conventions` → repo-specific H2s. A section with no line is left out.

- **Commands**: the commands that verify a change, plus any the environment doesn't show or that carry a trap. A trailing comment says when to run it or what bites (`# lives in tools/phpcs/vendor/bin/`), or the line has none.
- **Conventions**: one present-tense fact per line, in a plain voice: capitals and ALWAYS over-trigger. A path appears only where it is the convention: `app/composables/` holds `use*` functions only.

Either every `AGENTS.md` has a `CLAUDE.md` beside it, a symlink to it or an `@AGENTS.md` import, or the repo holds no `CLAUDE.md`, `CLAUDE.local.md`, or `.claude/CLAUDE.md`: once one sits in the working directory or above, Claude Code reads only `CLAUDE.md` files and skips every `AGENTS.md` without one. A new nested `AGENTS.md` gets its `CLAUDE.md` with it; a mix is listed for the user. In a monorepo, the root says in one line to read a package's `AGENTS.md` before working there: an agent started at the root loads it late (Claude Code, on the first read there) or only once the agent opens it (Codex).

## Steps

1. **Contradictions.** Two lines that disagree – the new one included, across this file, its parent and nested files, `.claude/rules/`, `~/.claude/CLAUDE.md`, and `~/.claude/rules/` – or a line the code contradicts: the user picks which one wins. Done when none is left.
2. **Verdict.** Done when every line has its place; a move outside the repo's agent docs is listed for the user, and the line stays until the move lands.
   - **Debloating:** every line gets **keep**, **sharpen** (a vague line over a real trap, rewritten as the fact the code confirms), **move** (naming its rung), or **cut** (rung 1, a no-op, a hedge, history); a missing identity sentence or verify command is added.
   - **Adding:** place the new line and fold in what it overlaps.
   - **Creating:** the identity sentence, the verify commands, and a convention per trap met in the code or named by the user, written by hand.
3. **Fresh read.** A fresh subagent gets the old text, the new text, and the file's purpose; a hunk it judges worse, or longer without gain, goes back.
