---
name: implement
description: Implement a spec, a ticket, or the current conversation test-first – a commit per theme, the branch reviewed, ending on the push-right brief.
argument-hint: "[spec path or ticket reference]"
disable-model-invocation: true
---

# Implement

**Call the Skill tool with "push-right" first.** Irreversible set: the push and anything posted to a tracker. The artifact is the branch.

## Start

- **Input** – the argument: a spec file or a ticket reference. Fetch a ticket reference from the issue tracker and state its title before starting; one that is ambiguous or can't be fetched ends the run with one line. No argument → the current conversation is the spec, written to `$TMPDIR/implement-<topic>.md`.
- **Seams** – the seams the spec names are the pre-agreed seams, which settles `tdd`'s confirm-with-the-user step. None named → the highest existing public seam.
- **Baseline** – note `HEAD` as the start commit; run push-right's Baseline.

## Per Slice

1. Call the Skill tool with "tdd" at the pre-agreed seam.
2. Every cycle: typecheck plus the touched test file only.
3. Commit the slice with `git commit -- <paths>`, a new file added first: a new theme as its own commit, else as a `--fixup` of its theme's commit. Its proof is `reproduced`.

A slice still red after three fix attempts → `git stash push -u -m "implement: <failing test> red" -- <paths>`, name the failing test in the brief, continue with the slices it doesn't block.

## Finish

1. Full test suite, once. Rerun each red test at the start commit. Red there too → pre-existing, brief context. Green there → this run's regression, fixed under push-right's Verification or carried as a Decision.
2. Call the Skill tool with "code-review" and `<start commit> <spec>`. You assemble the brief: its Review line and any fold item, plus its Done lines and Decisions merged with yours.
