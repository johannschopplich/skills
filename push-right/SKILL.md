---
name: push-right
description: The shared doctrine for work staged behind one late human checkpoint. Use when a workflow skill loads its doctrine.
user-invocable: false
---

# Push Right

Maximal non-destructive work first; every irreversible action waits behind one late checkpoint: a grill-ready brief where the user resolves only the judgment calls and picks what ships.

The checkpoint is the only stop, besides a hard failure the invoking skill names (auth, a bad ref). No turn ends on a progress report, a which-to-fix question, or a confirm request. Where a step or loaded skill would ask the user (missing ref or spec, ambiguous choice), take the conservative default, note it, and carry the question into Decisions.

The invoking skill names its irreversible set and success targets; its explicit exceptions win over the rules below.

## Boundary Marker

No state file – the **artifact** is the state (thread, branch, workspace – the invoking skill names it); the one exception is `code-review`'s per-branch record. A **re-fire** works only the delta past the **boundary marker**: the point the artifact proves the last run reached.

- Artifact unmoved → re-present the staged work rather than re-deriving it.
- Artifact moved → rebase the unpushed commits the last brief listed onto the new remote head – local and reflog-recoverable, so before the checkpoint: clean → kept once re-verified; conflicted or emptied → dropped, fix re-derived.
- Unpushed commits the last brief didn't list – or any, in a new session with no brief – are the user's unless they name them: untouched, named in the brief.
- A decision the artifact shows answered stays answered.

## Apply vs. Propose

**Single correct form, not merely verified** – one correct change → apply; a *choice* → propose.

- **Apply** – a local commit once its verification is green. One logical change per commit, comments only where the code is non-obvious.
- **Propose** – in the brief, off disk: behavior, API or interface shape, naming, centralization tradeoffs, scope expansion.

## Verification – Differential

- **Baseline** – the repo's checks (lint, typecheck, build, tests; from package scripts or CI config) before this run's commits. Pre-existing failures are brief context, never a blocker.
- **Done** only if its own target passes **and** it adds **no new failures vs. baseline**; otherwise it goes where the invoking skill says (discarded, a Decision, reverted).
- **Disprove before asserting** a behavior change: run its original repro and one neighboring path it touches – observed, never reasoned from the diff.
- Each Done line names its proof: `traced` (followed through the code at file:line) or `reproduced` (failing before, passing after) for a behavior change; `checked` (repo checks green) only for a mechanical one – typo, formatting, import; `mutated` for a removed test – the path it covered broken and another test red, or, for a tautological or hollow one, itself still green. Short of its proof → proposed.
- A check that can't run here (secrets, no local env) is named in the brief, unattributed to the change.

## Outward Copy

Invoke the `writing-for-developers` skill before the first commit subject, draft, or brief. Language: the thread's language per comment, else its dominant one, else the repo's working language.

## The Brief

One artifact, in this order:

- **Title** – the verdict, at most one state line under it.
- **Needs you**
  - a reply line taking every recommendation: `Q1 a, Q2 a, ship 1–6`
  - the Decisions as `Q<n>` with lettered options and a recommendation, for judgment calls only – a fact the run can observe gets observed
  - the tray as a numbered ship list, offering only items whose carry condition fired
- **Done** – each applied fix once, with its proof.
- **Waiting on**, **Next**.
- **Drafts** – every outward draft in full, `D1`…`Dn`, referenced from the ship item that posts it.
- **Detail** – the path to a file in the run's report dir (default `$TMPDIR/<skill>-<unit>/`) holding full paths, evidence, nits, and refutations.

Each fact shows once. Green checks, zero counts, and empty sections are silent; a clean run is its title and state line. Glyphs `✓` done · `✗` failed · `?` unproven · `–` not run, `·` between fields, no emoji. Degradation: what couldn't be established and the cheapest next step, in place of an unproven cause.

## After the Checkpoint

Once the user has picked from the tray, read [`CHECKPOINT.md`](CHECKPOINT.md).
