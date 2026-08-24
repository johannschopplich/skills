---
name: push-right
description: The shared doctrine for work staged behind one late human checkpoint. Use when a workflow skill loads its doctrine.
---

# Push Right

Do maximal non-destructive work first; every irreversible action waits behind one late checkpoint. Stop **once**, late, with a grill-ready brief, so the human resolves only the real judgment calls and picks what ships.

The invoking skill names its own irreversible set – whatever this run cannot take back – and its own success targets. Every rule below binds the run, whichever skill loaded it.

## Boundary Marker

No state file – the **artifact** is the state (the thread, the branch, the workspace; the invoking skill names which). One invocation is a **run**; a repeat invocation is a **re-fire**, and it works only the delta past the **boundary marker**: the point the artifact itself proves the last run reached.

Where the artifact has not moved since the last run, re-present the staged work rather than re-deriving it. Where it **has** moved, unpushed local commits count as **not-done** – they never reached the artifact – so re-derive their fixes against the new state. Before staging one, diff-check whether an identical change already exists locally and skip it if so. Settled is settled: a decision the artifact shows as answered stays answered.

## Apply vs Propose

The discriminator is **single correct form, not merely verified** – green verification is necessary, not sufficient. One correct change exists → apply. A *choice* exists → propose.

**Apply** – staged in a reviewable local commit, once its verification is green. One logical change per commit, `/writing-for-developers` subjects, comments only where the code is genuinely non-obvious. Commit locally; the push waits for the tray.

**Propose** – described in the brief, left off disk. Anything carrying more than one valid form: behavioral changes, API or interface shape, naming choices, centralization tradeoffs, anything that expands scope.

## Verification – Differential

- Capture a **baseline**: the repo's gates (lint, typecheck, build, tests – discovered from package scripts or CI config) *before* this run's commits.
- Keep an applied change as **Applied** only if its own target passes **and** it adds **no new failures vs baseline**. Otherwise it doesn't ship as applied – the invoking skill names where it goes instead (discarded, dropped into a Decision, reverted).
- **Disprove before asserting** – try to make the change fail (its original repro, the neighbouring path) before calling it green. A green comes from an observed run, never from reasoning about the diff.
- Pre-existing failures are **context for the brief**, never a blocker for an unrelated fix.
- A gate that genuinely can't run here (needs secrets, no local env) is **named in the brief** and left unattributed to the change.

## Outward Copy

Every outward artifact is pre-drafted via `/writing-for-developers` and staged for the tray. Language matches the audience: the thread's language per comment, falling back to the thread's dominant language, and to the repo's working language when nothing signals.

## The Brief

One artifact, at one checkpoint. **Decisions** holds judgment calls only; **Applied** is FYI, auditable and revertable; the **tray** closes it, rendered as a `Ready to ship` checklist. A tray item whose carry condition never fired is never offered in the first place. Drafts collapse behind `[show]`. Render every section even when empty – a clean run still reports its state line and a one-line verdict. `writing-for-developers` voice throughout (en dash, backticked identifiers, fact-only).

Degradation belongs in the brief as well: what couldn't be established, and the cheapest next step, in place of a cause the run didn't prove.

## After the Checkpoint

Once the human has picked items from the tray, read [`CHECKPOINT.md`](CHECKPOINT.md) – it carries the execution rules for the outward actions.
