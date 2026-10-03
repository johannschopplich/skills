---
name: implement
description: Implement a spec, a ticket, or the current conversation test-first – a commit per slice, the branch reviewed, ending on the push-right brief.
argument-hint: "[spec or ticket path]"
disable-model-invocation: true
---

# Implement

**Invoke the `push-right` skill first.** Irreversible set: the push and anything posted to a tracker. The artifact is the branch plus the ticket files.

## Start

- **Input** – the argument – a spec, a ticket, or a `.scratch/<feature>/` dir; a spec with an `issues/` sibling means its tickets, worked on the frontier: any ticket whose blockers are all done. No argument → the current conversation is the spec.
- **Seams** – the spec's Testing Decisions are the agreed seams, which settles `tdd`'s confirm-with-the-user step. None named → the highest existing public seam, carried as a Decision.
- **Baseline** – note `HEAD` as the start commit; run typecheck and lint.

## Per Slice

1. Invoke the `tdd` skill at the agreed seam.
2. Every cycle: typecheck plus the touched test file only.
3. Commit the slice, `git add <paths>` explicitly. Its proof is `reproduced`: the test red before, green after.
4. Ticket file: tick its criteria, set `Status: done`.

A slice still red after three fix attempts → `git stash push -u -m "implement: <ticket> red" -- <paths>`, name the failing test in the brief, continue with the tickets it doesn't block.

## Subagents

Several tickets → one subagent per ticket, one at a time (shared worktree). Brief: ticket and spec paths, the seam, Per Slice steps 1–3 with subjects per `writing-for-developers`, `~/.claude/rules/code-style.md` and `~/.claude/rules/tests.md` by path. Return: commits, check results, open choices. Step 4 and the red-slice rule stay with you.

## Finish

1. Full test suite, once. Each red test → rerun it at the start commit: red there too → pre-existing, brief context; green there → this run's regression, fixed under push-right's Verification or carried as a Decision.
2. Invoke the `code-review` skill with `<start commit> <spec>` – a conversation spec first written to `$TMPDIR/implement-spec.md`. Own Work lands the fixes and re-reviews once; you assemble the brief: its Review line, its Done lines and Decisions merged with yours. The fold and the push stay in the tray.
