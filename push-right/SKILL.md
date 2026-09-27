---
name: push-right
description: The shared doctrine for work staged behind one late human checkpoint. Use when a workflow skill loads its doctrine.
user-invocable: false
---

# Push Right

Maximal non-destructive work first; every irreversible action waits behind one late checkpoint: a grill-ready brief where the human resolves only the judgment calls and picks what ships.

The checkpoint is the only stop, besides a hard failure the invoking skill names (auth, a bad ref). No turn ends on a progress report, a which-to-fix question, or a confirm request. Where a step or loaded skill would ask the human (missing ref or spec, ambiguous choice), take the conservative default, note it, and carry the question into Decisions.

The invoking skill names its irreversible set and success targets; its explicit exceptions win over the rules below.

## Boundary Marker

No state file – the **artifact** is the state (thread, branch, workspace – the invoking skill names it); the one exception is `gate`'s per-branch record. A **re-fire** works only the delta past the **boundary marker**: the point the artifact proves the last run reached.

- Artifact unmoved → re-present the staged work rather than re-deriving it.
- Artifact moved → rebase the unpushed commits the last brief listed onto the new remote head – local and reflog-recoverable, so before the checkpoint: clean → kept once re-verified; conflicted or emptied → dropped, fix re-derived.
- Unpushed commits the last brief didn't list – or any, in a new session with no brief – are the human's unless the user names them: untouched, named in the brief.
- A decision the artifact shows answered stays answered.

## Apply vs. Propose

**Single correct form, not merely verified**: one correct change → apply; a *choice* → propose.

- **Apply** – a local commit once its verification is green. One logical change per commit, comments only where the code is non-obvious.
- **Propose** – in the brief, off disk: behavior, API or interface shape, naming, centralization tradeoffs, scope expansion.

## Verification – Differential

- **Baseline**: the repo's checks (lint, typecheck, build, tests; from package scripts or CI config) before this run's commits. Pre-existing failures are brief context, never a blocker.
- **Applied** only if its own target passes **and** it adds **no new failures vs baseline**; otherwise it goes where the invoking skill says (discarded, a Decision, reverted).
- **Disprove before asserting** a behavior change: run its original repro and one neighboring path it touches – observed, never reasoned from the diff.
- Each Applied line names its proof: `traced` (followed through the code at file:line) or `reproduced` (failing before, passing after) for a behavior change; `checked` (repo checks green) only for a mechanical one – typo, formatting, import. Short of its proof → proposed.
- A check that can't run here (secrets, no local env) is named in the brief, unattributed to the change.

## Outward Copy

Invoke `writing-for-developers` before the first commit subject, draft, or brief. Language: the thread's language per comment, else its dominant one, else the repo's working language.

## The Brief

One artifact, in this order:

- **Decisions** – judgment calls only; a fact the run could observe gets run and reported instead. `Q1`, `Q2`, … with lettered options and a recommendation each, so the human answers `Q1 a, Q2 b`.
- **Applied** – FYI.
- **Tray** – a `Ready to Ship` checklist; an item whose carry condition never fired is never offered.
- **Drafts** – every outward draft in full after the tray, numbered `D1`…`Dn`, referenced from the tray item that posts it (one item may post several).

Render every section even when empty; a clean run still reports its state line and a one-line verdict. Degradation: what couldn't be established and the cheapest next step, in place of an unproven cause.

## After the Checkpoint

Once the human has picked from the tray, read [`CHECKPOINT.md`](CHECKPOINT.md).
