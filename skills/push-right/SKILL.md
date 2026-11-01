---
name: push-right
description: The shared doctrine for work staged behind one late human checkpoint.
user-invocable: false
---

# Push Right

Maximal non-destructive work first; every irreversible action waits behind one late checkpoint: the brief.

The checkpoint is the only stop, besides a hard failure the invoking skill names. Where a step or loaded skill would ask the user (missing ref or spec, ambiguous choice), take the recommended option under Apply; only what the run can't settle goes into Decisions.

## Boundary Marker

The **artifact** is the state the invoking skill names. No state file. A **re-fire** works only the delta past the **boundary marker**: the point the artifact proves the last run reached.

- Artifact unmoved → re-present the staged work rather than re-deriving it.
- Artifact moved → before the checkpoint, rebase the unpushed commits the last brief listed onto the new remote head. A clean commit is kept once re-verified; a conflicted or emptied one is dropped and its fix re-derived. With unlisted unpushed commits beneath them, the rebase is a tray item.
- Unpushed commits the last brief didn't list are the user's unless they name them; in a new session with no brief, so are any. Leave them untouched and name them in the brief.
- A decision the artifact shows answered stays answered.

## Apply vs. Propose

- **Apply** – everything within the task, a choice as its recommended option: a local commit once its verification is green, one theme per commit, a choice in its own so a veto drops it. Its Done line opens with `decided:` and names the alternative.
- **Propose** – in the brief, off disk: work beyond the task, and calls a person or a ticket owns.

## Verification – Differential

- **Baseline** – the checks the repo's CI runs, from its CI config, before this run's commits. Pre-existing failures are brief context, never a blocker.
- **Done** only if its own target passes **and** it adds **no new failures vs. baseline**; otherwise it goes where the invoking skill says.
- **Disprove before asserting** a behavior change: run its original repro and one neighboring path it touches.
- Each Done line names its proof; short of it, the item is proposed.
  - `traced` (followed through the code at file:line) or `reproduced` (failing before, passing after) – a behavior change.
  - `checked` (repo checks green) – only a mechanical change: typo, formatting, import.
  - `mutated` – a removed test: the path it covered broken and another test red; for a tautological, hollow, or vacuous one, itself still green.
- A check that can't run here is named in the brief, unattributed to the change.

## Outward Copy

Invoke the `writing-for-developers` skill before the first commit subject, draft, or brief.

## The Brief

One artifact, in this order:

- **Title** – the verdict, at most one state line under it.
- **Needs you**
  - a reply line taking every recommendation: `Q1 a, Q2 a, ship 1–6`
  - the Decisions, judgment calls only, as one table – `Q<n> <letter>`, the recommended option readable without its question, the alternative, the reason; a fact the run can observe gets observed
  - the tray as a numbered ship list; a push item names its branch (`push 3 commits to feat/x`) and whether `code-review` covered every commit it pushes
- **Done** – each applied fix once, with its proof.
- **Waiting on**, **Next**.
- **Drafts** – every outward draft in full, each in a quote, `D1`…`Dn`, referenced from the ship item that posts it.
- **Detail** – the path to a file in the run's report dir (default `$TMPDIR/<skill>-<unit>/`) holding full paths, evidence, nits, and refutations.

Each fact shows once. Green checks, zero counts, and empty sections are silent; a clean run is its title and state line. Glyphs `✓` done · `✗` failed · `?` unproven · `–` not run, `·` between fields. Inline code marks only a state or a command the user types; paths, branches, packages, and symbols stay plain. No `<placeholder>` reaches the user. Degradation: what couldn't be established and the cheapest next step, in place of an unproven cause.

## After the Checkpoint

Once the user has picked from the tray, read [`CHECKPOINT.md`](CHECKPOINT.md).
