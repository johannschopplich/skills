---
name: gate
description: Review a diff or branch in fresh contexts along five axes – standards, spec, comments, tests, correctness – refute every finding, and end on a verdict: ship, fix, or incomplete. Use when asked to review, debloat, or gate the user's own changes or a branch, or when another skill needs a review engine; it supersedes code-review, and a teammate's MR or PR goes through mr-shepherd.
argument-hint: "[fixed point: sha, branch, or HEAD for uncommitted] [spec: ticket URL or path]"
---

# Gate

One review wherever a diff needs one: the user's own slice before it lands, a teammate's MR (through `mr-shepherd`), a release. Five axes run in parallel, each in a fresh context; a skeptic per axis tries to refute every finding; the run ends on a verdict. Fixing belongs to the caller – the gate reports, except in the Own Work flow below.

## Run

Every command runs in the repo or worktree root.

1. **Pin the diff.** `head` is `git rev-parse HEAD`; the report dir is `$TMPDIR/gate-<short head sha>/`, created with `mkdir -p`. The fixed point is the argument. `HEAD` gates uncommitted changes, untracked files (`git ls-files --others --exclude-standard`) included; the index stays untouched. Without an argument, `git fetch` and take the merge-base with the default branch's remote – unless the branch has a record (below) whose merge-base still equals the current one: then the recorded head is the fixed point with `compare: 'trees'`, which survives a fold that rewrote the commits; unless a spec argument is passed, this run leaves `spec` out of `axes` and says in `context` that the diff is only the delta since the recorded gate. A bad ref or an empty diff ends the run here with one line.
2. **Find the spec.** The argument; else a ticket linked from the commits, the branch name, or the MR; else none, and the spec axis reports `no spec`. Fetch a tracker ticket and its comments into `<report dir>/ticket.md` and pass that path, since the axis agents may lack the tracker's MCP. Carry on either way.
3. **Run the deterministic checks.** The repo's own lint and typecheck over the changed files, from its package scripts: full output to `<report dir>/checks.txt`, and each check is `✓`, `✗`, or `–` (no script); the axes never see them. Then write the added comment lines: `node <this skill's dir>/scripts/added-comments.mjs <fixed point> [--trees] > <report dir>/added-comments.txt`.
4. **Run the axes.** Call the Workflow tool with `scriptPath: <this skill's dir>/gate.workflow.js` and `args`: `skillDir`, `repo` (the root's absolute path), `base` (the fixed point), `head`, `spec`, `commentsFile`, `reportDir`, `compare` (`'merge-base'` unless step 1 or Own Work set `'trees'`), `redChecks` (names of checks red on changed files), optionally `axes` (an array of axis names), and `context` – what the caller knows that the diff can't show (whose code it is, product decisions already accepted). Without the Workflow tool, launch one Agent per axis in a single message with the prompts the script builds, then one skeptic per axis that has findings, and compute the verdict as the Report section defines it.
   The axes are done when the workflow returns; wait for it, since a report assembled before every axis returned misses what they found. Write its return value to `<report dir>/verdicts.json`.
5. **Record** – only for a gate run without a fixed point argument, over all five axes (all but `spec` when step 1 left it out), with a verdict other than `incomplete`, on a branch (never a detached HEAD): overwrite the gate's one record for the branch, `$(git rev-parse --git-common-dir)/gate/<branch>.txt`, with the gated head SHA and the merge-base it was gated against, one per line; `mkdir -p` its parent first, since a branch name can hold `/`.
6. **Report.**

A full gate is ten agents and several minutes. Run it at the boundaries – a finished slice, an MR, a release – and pass `axes` to run a subset when the diff only touches some of them (a comment-only commit needs `comments`).

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

One section per axis in this order, each blocker, major, and minor finding on one line with its id and skeptic verdict; each axis's `note` follows its section; nits are listed by id per axis in the closing line, since a first gate over real work returns dozens of them. An axis whose skeptic failed is marked `(unrefuted)`: its findings stand as `plausible`. `PM:` lines from the notes are listed together at the end. The axes stay separate – a finding never moves to another axis or gets reranked against one, so a clean axis cannot hide a failing one. The per-axis files in the report dir carry the evidence.

The verdict is `incomplete` when an axis returned nothing or was unknown – name it; otherwise `fix` when a blocker or major survives or a check is red on a changed file, and `ship` when neither holds.

## Own Work

When the diff is the user's own branch – its commits authored by `git config user.email` – pushed or not, and nobody asked for the report alone, carry on after the verdict under the `push-right` doctrine (invoke it); its hard failures here are step 1's bad ref and empty diff.

- Every `plausible` finding, every finding of form `choice`, and every behavior-change finding whose `proof` is `said` becomes a Decision.
- Capture the baseline from step 3's checks, then apply every other `confirmed` finding: on an unpushed commit as a fixup (`git commit --fixup=<sha>`, then `GIT_SEQUENCE_EDITOR=: git rebase -i --autosquash <upstream>`, where `<upstream>` is the pushed branch head, or the merge-base when nothing is pushed); on a pushed commit as a new commit on HEAD; in uncommitted changes as an edit in place. Invoking gate on the branch names its unpushed commits, so the fold is an explicit exception to push-right's Apply and Boundary Marker rules, as the edit in place is to its commit rule, since the user hasn't committed yet.
- Each fix passes push-right's Verification before it counts as Applied; one that fails is dropped into a Decision. A folded fix's Applied line names the fixup subject, the commit it folded into, and its proof.
- Re-gate once over the fixes, with the report dir suffixed `-regate` and `axes` without `spec`: `compare: 'trees'` from the head the first gate saw, with `context` "this diff is only the fixes for the previous gate; judge only what it changes"; `HEAD` for edits in place. Then stop either way: blocker and major findings that remain become Decisions. Say `stop – further passes are past the marginal benefit` and name what another pass would still cover.
- End on the push-right brief with the gate report as its first block; when a caller skill assembles the brief (mr-shepherd own mode), return the report, Applied, and Decisions to it instead of stopping.
