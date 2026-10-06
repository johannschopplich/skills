---
name: code-review
description: Review a diff or branch in fresh contexts along five axes – standards, spec, comments, tests, correctness – refute every finding, and end on a ship, fix, or incomplete verdict. Use when asked to review or debloat the user's own changes or a branch; a teammate's MR or PR goes through mr-shepherd.
argument-hint: "[fixed point: sha, branch, or HEAD for uncommitted] [spec: ticket URL or path]"
---

# Code Review

The review reports; fixing belongs to the caller, except in Own Work.

## Run

Every command runs in the repo or worktree root.

1. **Pin the diff.** `head` is `git rev-parse HEAD`; report dir: `$TMPDIR/code-review-<short head sha>/`. The fixed point is the argument; `HEAD` reviews uncommitted changes, untracked files included, index untouched. Without an argument, `git fetch` and take the merge-base with the default branch's remote. When the branch's record (step 5) holds the current merge-base, the recorded head is the fixed point instead, with `compare: 'trees'`. If there is also no spec argument, drop `spec` from `axes` and say in `context` that the diff is only the delta since the recorded review. A bad ref or an empty diff ends the run with one line.
2. **Find the spec.** The argument; else a ticket linked from the commits, the branch name, or the MR; else a spec file under `.scratch/`, `docs/`, or `specs/` matching the branch or feature; else none. Fetch a tracker ticket with its comments into `<report dir>/ticket.md` and pass that path. A failed fetch is no spec; carry on.
3. **Run the deterministic checks.** Run the repo's format check, lint, typecheck, and test scripts, with full output to `<report dir>/checks.txt`. Mark each check `✓`, `✗`, or `–` (no script); the axes never see them. Then `node <this skill's dir>/scripts/added-comments.mjs <fixed point> [--trees] > <report dir>/added-comments.txt`.
4. **Run the axes.** Workflow tool with `script` set to the text of `<this skill's dir>/code-review.workflow.js`; it refuses the file as `scriptPath`. Its `args`: `skillDir`, `repo` (absolute root), `base` (the fixed point), `head`, `spec`, `commentsFile`, `reportDir`, and:
   - `compare` – `'merge-base'` unless step 1 or Own Work set `'trees'`
   - `redChecks` – checks red on changed files, tests red anywhere
   - `axes` – optional, an array
   - `context` – what the diff can't show (whose code it is, product decisions already accepted)

   Without the Workflow tool: one Agent per axis in a single message with the script's prompts, then one skeptic per axis with findings, and the verdict per Report.
   Wait for the workflow, or every fallback Agent, to return – an axis still running is pending, not empty – then write the result to `<report dir>/verdicts.json`.
5. **Record.** Only for a run that had no fixed point argument, covered every axis (`spec` optional), ended on a verdict other than `incomplete`, and ran on a branch, never a detached HEAD. Then overwrite `$(git rev-parse --git-common-dir)/code-review/<branch>.txt` with the reviewed head SHA and its merge-base, one per line; `mkdir -p` the parent.
6. **Report.**

Review at boundaries – a finished slice, an MR, a release – and pass `axes` for a subset (a comment-only commit: `['comments']`).

## Report

Write `<report dir>/report.md`:

```
code-review <verdict> · <base>..<head> · <N> findings (<H> blocker/major) · <R> refuted
checks: lint ✗ · … · axes: spec – (no spec) · comments ✓ (unrefuted) · …
### [Standards](standards.md)
- ST3 [major · high · confirmed] `path/file.ts:42` – one-sentence finding. Fix: the change. (single)
note: <axis note>
…
nits: comments 14 (CM8, CM11, …) · refuted: SP2, TS4 – reasons in verdicts.json
PM: <each axis's PM: line>
```

Axes in the workflow's order. An axis whose skeptic failed is `(unrefuted)`, its findings `plausible`. Axes stay separate: a finding never moves to another axis or gets reranked against one.

Chat, shaped like `push-right`'s brief:

- **In a brief** – one line: `**Review** <verdict> → re-review <verdict> · <N> findings, <R> refuted · <report dir>/report.md`, the re-review only after Own Work.
- **Report only** – verdict, range, red checks; per axis, a line per blocker, major, and minor finding; nit and refuted counts; the path.

Verdict: `incomplete` when an axis returned nothing or was unknown – name it; else `fix` when a blocker or major survives or `redChecks` holds a check; else `ship`.

## Own Work

When the diff is the user's own branch (commits by `git config user.email`, pushed or not) and nobody asked for the report alone, invoke the `push-right` skill and carry on after the verdict under it; its hard failures here are step 1's bad ref and empty diff.

- Decisions: every `plausible` finding, every `choice` finding, and every behavior change with `proof: said`.
- Capture the baseline from step 3's checks, then apply every other `confirmed` finding:
  - **Unpushed commit** – a fixup on top: `git commit --fixup=<sha>`. The fold is a tray item: `git rebase --autosquash <upstream>`, `<upstream>` being the pushed branch head, else the fixed point. A commit the user called settled gets a new commit on HEAD instead.
  - **Pushed commit** – a new commit on HEAD.
  - **Uncommitted** – an edit in place.
- The edit in place is an explicit exception to push-right's commit rule.
- Each fix passes push-right's Verification before it counts as Done; a failing one becomes a Decision. Copy taken from a finding's fix is Done once its claim is `traced` to the code and, when not English, read back for grammar. A fixup's Done line names the commit it targets.
- Re-review once over the fixes: report dir suffixed `-re-review`, `axes` without `spec`, `compare: 'trees'` from the first review's head with `context` "this diff is only the fixes for the previous review; judge only what it changes, and report a hunk that leaves the code worse than its old side even when it is right on its own"; `HEAD` for edits in place, without that `context`.
- Then stop:
  - A fix the re-review finds worse than the reviewed side is undone the way it landed: another fixup of the same commit, a new commit, or the edit reverted in place. Its finding becomes a Decision, whatever the severity.
  - Surviving blocker and major findings become Decisions.
  - Name what another pass would still cover.
- End on the push-right brief; when a caller assembles it (mr-shepherd own mode, implement), return the Review line, Done lines, Decisions, and the fold item instead.
