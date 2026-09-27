---
name: gate
description: Review a diff or branch in fresh contexts along five axes – standards, spec, comments, tests, correctness – refute every finding, and end on a verdict: ship, fix, or incomplete. Use when asked to review, debloat, or gate the user's own changes or a branch, or when another skill needs a review engine; it supersedes code-review, and a teammate's MR or PR goes through mr-shepherd.
argument-hint: "[fixed point: sha, branch, or HEAD for uncommitted] [spec: ticket URL or path]"
---

# Gate

The gate reports; fixing belongs to the caller, except in Own Work.

## Run

Every command runs in the repo or worktree root.

1. **Pin the diff.** `head` is `git rev-parse HEAD`; report dir: `$TMPDIR/gate-<short head sha>/`. The fixed point is the argument; `HEAD` gates uncommitted changes, untracked files included, index untouched. Without an argument, `git fetch` and take the merge-base with the default branch's remote – unless the branch's record (step 5) holds the current merge-base: then the recorded head is the fixed point with `compare: 'trees'`, and without a spec argument, drop `spec` from `axes` and say in `context` that the diff is only the delta since the recorded gate. A bad ref or an empty diff ends the run with one line.
2. **Find the spec.** The argument; else a ticket linked from the commits, the branch name, or the MR; else none. Fetch a tracker ticket with its comments into `<report dir>/ticket.md` and pass that path – axis agents may lack the tracker's MCP. A failed fetch is no spec; carry on.
3. **Run the deterministic checks.** The repo's lint and typecheck scripts over the changed files: full output to `<report dir>/checks.txt`, each check `✓`, `✗`, or `–` (no script); the axes never see them. Then `node <this skill's dir>/scripts/added-comments.mjs <fixed point> [--trees] > <report dir>/added-comments.txt`.
4. **Run the axes.** Workflow tool, `scriptPath: <this skill's dir>/gate.workflow.js`, `args`: `skillDir`, `repo` (absolute root), `base` (the fixed point), `head`, `spec`, `commentsFile`, `reportDir`, `compare` (`'merge-base'` unless step 1 or Own Work set `'trees'`), `redChecks` (checks red on changed files), optionally `axes` (an array), and `context` – what the diff can't show (whose code it is, product decisions already accepted). Without the Workflow tool: one Agent per axis in a single message with the script's prompts, then one skeptic per axis with findings, and the verdict per Report.
   Wait for the workflow, or every fallback Agent, to return – an axis still running is pending, not empty – then write the result to `<report dir>/verdicts.json`.
5. **Record** – only for a run without a fixed point argument, over all axes (minus `spec` when step 1 dropped it), with a verdict other than `incomplete`, on a branch (never a detached HEAD): overwrite `$(git rev-parse --git-common-dir)/gate/<branch>.txt` with the gated head SHA and its merge-base, one per line; `mkdir -p` the parent, since branch names can hold `/`.
6. **Report.**

Gate at boundaries – a finished slice, an MR, a release – and pass `axes` for a subset (a comment-only commit: `['comments']`).

## Report

```
gate <verdict> · <base>..<head> · <N> findings (<H> blocker/major) · <R> refuted
checks: lint <✓|✗|–> · typecheck <✓|✗|–> · axes: standards ✓ · spec – (no spec) · comments ✓ (unrefuted) · tests ✓ · correctness ✓

### Standards
- ST3 [major · high · confirmed] `path/file.ts:42` – one-sentence finding. Fix: the change. (single)
note: <the axis's note>
### Spec
clean
…
nits: comments 14 (CM8, CM11, …), tests 5 (TS2, …) · refuted: SP2, TS4 – reasons in <report dir>/verdicts.json
PM: <each axis's PM: line>
```

Axis sections in this order; blocker, major, and minor findings one line each; nits by id only. An axis whose skeptic failed is `(unrefuted)`, its findings `plausible`. Axes stay separate: a finding never moves to another axis or gets reranked against one.

Verdict: `incomplete` when an axis returned nothing or was unknown – name it; else `fix` when a blocker or major survives or a check is red on a changed file; else `ship`.

## Own Work

When the diff is the user's own branch (commits by `git config user.email`, pushed or not) and nobody asked for the report alone, carry on after the verdict under `push-right` (invoke it); its hard failures here are step 1's bad ref and empty diff.

- Decisions: every `plausible` finding, every `choice` finding, and every behavior change with `proof: said`.
- Capture the baseline from step 3's checks, then apply every other `confirmed` finding – unpushed commit: fixup (`git commit --fixup=<sha>`, then `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash <upstream>`, `<upstream>` being the pushed branch head, else the merge-base); pushed commit: new commit on HEAD; uncommitted: edit in place. Invoking gate names the unpushed commits, so the fold is an explicit exception to push-right's Apply and Boundary Marker rules, and the edit in place to its commit rule.
- Each fix passes push-right's Verification before it counts as Applied; a failing one becomes a Decision. A folded fix's Applied line names the fixup subject, the commit it folded into, and its proof.
- Re-gate once over the fixes: report dir suffixed `-regate`, `axes` without `spec`, `compare: 'trees'` from the first gate's head with `context` "this diff is only the fixes for the previous gate; judge only what it changes"; `HEAD` for edits in place, without that `context`. Then stop; surviving blocker and major findings become Decisions. Say `stop – further passes are past the marginal benefit` and name what another pass would still cover.
- End on the push-right brief, gate report first; when a caller skill assembles the brief (mr-shepherd own mode, implement), return the report, Applied, and Decisions to it instead.
