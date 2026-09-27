---
name: push-right
description: The shared doctrine for work staged behind one late human checkpoint. Use when a workflow skill loads its doctrine.
user-invocable: false
---

# Push Right

Do maximal non-destructive work first; every irreversible action waits behind one late checkpoint. Stop **once**, late, with a grill-ready brief, so the human resolves only the real judgment calls and picks what ships.

The checkpoint is the run's only stop, except a hard failure the invoking skill names (auth, a bad ref), where nothing can move without the human. Work through every step until the brief is ready: a turn never ends on a progress report, a question about which finding to fix, or a request to confirm a step. Where a step or a loaded skill would ask the human something – a missing ref, a missing spec, an ambiguous choice – take the conservative default, note it, and carry the question into Decisions.

The invoking skill names its own irreversible set – whatever this run cannot take back – and its own success targets. Where it states an explicit exception to a rule below, its exception wins; every other rule binds the run.

## Boundary Marker

No state file – the **artifact** is the state (the thread, the branch, the workspace; the invoking skill names which). The one exception an invoking skill may keep is `gate`'s per-branch record of what it last gated. One invocation is a **run**; a repeat invocation is a **re-fire**, and it works only the delta past the **boundary marker**: the point the artifact itself proves the last run reached.

Where the artifact has not moved since the last run, re-present the staged work rather than re-deriving it. Where it **has** moved, unpushed local commits count as **not-done** – they never reached the artifact. Rebase the commits the last brief listed onto the new remote head (local and reflog-recoverable, so it stays before the checkpoint): one that rebases cleanly keeps its place once re-verified; one that conflicts or empties is dropped and its fix re-derived. Unpushed commits the last brief didn't list are the human's – leave them untouched and name them in the brief; in a new session with no brief, every unpushed commit is the human's unless the user names it. Settled is settled: a decision the artifact shows as answered stays answered.

## Apply vs. Propose

The discriminator is **single correct form, not merely verified** – green verification is necessary, not sufficient. One correct change exists → apply. A *choice* exists → propose.

**Apply** – staged in a reviewable local commit, once its verification is green. One logical change per commit, `writing-for-developers` subjects, comments only where the code is genuinely non-obvious. Commit locally; the push waits for the tray.

**Propose** – described in the brief, left off disk. Anything carrying more than one valid form: behavioral changes, API or interface shape, naming choices, centralization tradeoffs, anything that expands scope.

## Verification – Differential

- Capture a **baseline**: the repo's checks (lint, typecheck, build, tests – discovered from package scripts or CI config) *before* this run's commits.
- Keep an applied change as **Applied** only if its own target passes **and** it adds **no new failures vs baseline**. Otherwise it doesn't ship as applied – the invoking skill names where it goes instead (discarded, dropped into a Decision, reverted).
- **Disprove before asserting** a behavior change: run its original repro and one neighboring path it touches. Its green comes from that observed run, never from reasoning about the diff.
- Each Applied line names the proof it reached: `traced` (followed through the code at file:line) or `reproduced` (observed failing before and passing after) for a behavior change; `checked` (the repo's checks green) suffices only for a mechanical one – a typo, formatting, an import. A change short of its proof is proposed instead.
- Pre-existing failures are **context for the brief**, never a blocker for an unrelated fix.
- A check that genuinely can't run here (needs secrets, no local env) is **named in the brief** and left unattributed to the change.

## Outward Copy

Invoke the `writing-for-developers` skill before the first commit subject, draft, or brief; all three follow its voice, and every outward artifact is staged for the tray. Language matches the audience: the thread's language per comment, falling back to the thread's dominant language, and to the repo's working language when nothing signals.

## The Brief

One artifact, at one checkpoint, in this order:

- **Decisions** – judgment calls only. A question whose answer is a fact the run could observe by running something is not a decision: run it and report the result. Number them `Q1`, `Q2`, … with lettered options and a recommendation each, so the human can answer `Q1 a, Q2 b`.
- **Applied** – FYI, auditable and revertable.
- **Tray** – rendered as a `Ready to Ship` checklist; a tray item whose carry condition never fired is never offered.
- **Drafts** – every outward draft printed in full after the tray, numbered `D1`…`Dn` and referenced from the tray item that posts it (one item may post several), so each can be read before its item is checked.

Render every section even when empty – a clean run still reports its state line and a one-line verdict. Degradation belongs in the brief as well: what couldn't be established, and the cheapest next step, in place of a cause the run didn't prove.

## After the Checkpoint

Once the human has picked items from the tray, read [`CHECKPOINT.md`](CHECKPOINT.md) – it carries the execution rules for the outward actions.
