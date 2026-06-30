---
name: ci-triage
description: Triage one red GitLab or GitHub pipeline to a proven verdict – real regression, flaky, infra, or config – staging a minimal fix where one applies. Use when handed a failing pipeline/job URL, asked to triage CI, or when an orchestrator opens a red pipeline.
argument-hint: "pipeline or job URL, or branch name"
---

# CI Triage

Take one red pipeline to a proven verdict by disproving the obvious hypothesis empirically before asserting any cause, then stage the minimal fix (with a reproduction) where one applies and stop once, late, with a grill-ready brief so the human makes only the real decisions and picks what ships.

The easy answer is the one to distrust – step zero is disproof, not diagnosis.

**Push-right** – do maximal diagnostic work first; the three irreversible actions (push a fix or revert, retry CI, post a comment) wait behind one late checkpoint.

## Host detection

Detect the host from the URL or the local remote:

- GitLab → `glab ci`: `get`, `list`, `trace`, `lint`, `retry`.
- GitHub → `gh run` (`list`, `view`, `view --log`, `rerun`). There is no clean `lint` equivalent – validate workflow YAML with `actionlint` if it's available, otherwise skip that check and say so in the brief.

## State – the branch, not the pipeline

No state file – the **branch** is the state; the failing pipeline is just where this run enters. A pipeline's logs are immutable, so re-firing on the same pipeline reaches the same verdict – the only thing carried forward is a local staged fix.

- Same pipeline still red, a fix staged but unpushed → re-present the existing verdict and staged fix; don't re-diagnose.
- A newer pipeline exists (someone pushed) → re-enter on it and diagnose the **delta** since the last-diagnosed commit. Unpushed local commits from a prior run count as **not-done** – they never reached the remote – so re-derive their fixes; but before staging, diff-check whether an identical change already exists locally and skip it if so.
- Newest pipeline green → the loop closed; report it and stage nothing.

## Run – in order

1. **Resolve the failure(s).** Fetch the pipeline and its failing job(s) and logs (`glab ci get`, `glab ci trace`). Identify the stage each failed in (lint, typecheck, unit, e2e/browser, build, deploy). **Collapse cascades** – a job red only because an upstream job it depends on failed is folded into that root, never triaged on its own. Triage each distinct **root** failure.
2. **Disprove first – compare against the last green run** (`glab ci list` for the branch's history).
   - The same or trivially-different commit was green before and is red now → the code didn't touch the failing surface → lean **flaky / infra**.
   - The failure first appears at a specific commit (bisect the green→red range) → **real regression**, traced to that change.
3. **Reproduce up the ladder – never assert a cause from logs alone.** Reuse the repo's own test setup, never a parallel harness.
   - **Bare-local first.** Reproduces deterministically every time → it's *real*, regardless of how the logs read.
   - **Won't reproduce locally → escalate to the runner's own image/container** (its env vars, its services via compose). Environment-specific real bugs – locale, timezone, Node version, case-sensitive FS, a CI-only service – surface only here, not on the dev's machine.
   - **Neither reproduces and a green comparison run exists → only now downgrade** toward flaky/infra. For external-service failures, build a **hermetic, mock-based reproduction** so it's deterministic rather than re-importing the flakiness.
4. **Reach a verdict per root failure – each carries its own bar.**
   - **REAL REGRESSION** – traced to a specific change and *positively* reproduced (deterministic repro, or a clean green→red bisect).
   - **CONFIG** – a deterministic check actually fails (e.g. `glab ci lint` on a malformed `.gitlab-ci.yml`).
   - **FLAKY** – a green run on the same/near commit, *or* an honest failed repro attempt (tried up the ladder, non-deterministic) plus a known-flaky signal (timeouts, network, test-ordering, resource contention). Never asserted from a single red log.
   - **INFRA / DEPLOY** – an unambiguous environmental signature (deploy-key, runner, registry, auth) *plus* a comparison showing the code didn't touch that surface.
   - Evidence **ambiguous** in any non-regression bucket → don't assert. The verdict is **INCONCLUSIVE**, and the cheapest next step – often a `retry` – goes on the tray.
5. **Act on the verdict.**
   - **Real regression / Config** → write a reproduction that fails on the bug and passes with the fix. Apply the **minimal verified fix** on the apply-vs-propose boundary – one correct form → apply; a *choice* → propose. **Verify differentially**: capture the repo's gates as a baseline *before* the fix, then keep the fix only if its targeted job/test goes red→green and it adds **no new failures vs baseline**. The branch is red by definition – **never require the whole pipeline green**; unrelated pre-existing reds are context, not a blocker. Stage the commit **unpushed**. Where a clean fix isn't small, stage a **revert** instead and recommend it. *Keep the repro* if it's a durable guard the repo should carry; keep it as brief-only evidence if it was scaffolding; surface "keep this repro?" as a decision when borderline.
   - **Flaky** → *no code fix*. Retry unblocks (a tray item, never auto). Name the flaky test in the brief; when the branch's history shows it **repeatedly flapping**, offer a staged quarantine/flag commit and/or a drafted tracking issue as tray items – never auto-quarantine on a single sighting.
   - **Infra / Deploy** → *no code fix*. Recommend the retry or escalate the infra issue. Stage nothing.
6. **Re-running CI is outward** – never auto-retry. If flakiness can only be confirmed by a re-run (no comparison run, won't reproduce up the ladder), say so and put `retry failed jobs` on the tray.
7. **Pre-draft any outward copy via `/write-dev-copy` – stage, never post.** E.g. a comment on the MR/pipeline explaining cause + fix. Language matches the thread – the repo's working language when the thread gives no signal.
8. **Assemble the brief and present at the checkpoint.** When an **orchestrator** opened the pipeline, return the brief and tray **without prompting** – it batches the approval.

## Fix vs revert

Default to the **minimal fix** when the cause is understood and the fix is small and verified. Recommend **revert** when the breaking change is someone else's recent commit and a clean fix isn't small, a shared branch is red and blocking others, the change reverts cleanly without collateral, or a proper fix needs more judgment than a red pipeline can wait for. Stage whichever is recommended and name the alternative – never two undescribed options. Revert is a judgment call even when staged; the push stays behind the tray.

## The brief

Verdict + evidence first; Decisions holds only judgment calls; Applied is FYI; the tray closes. A **FLAKY / INFRA / INCONCLUSIVE verdict collapses** its block to verdict + evidence + "recommend retry", no staged fix. Drafts collapse behind `[show]`. `write-dev-copy` voice throughout (en dash, backticked identifiers, fact-only).

```
## Pipeline #<id> · <branch> · <K> failing root(s) ❌

### <stage/job> – REAL REGRESSION        (FLAKY / INFRA-DEPLOY / CONFIG / INCONCLUSIVE)
evidence: last green <run@commit> → first red <commit> · reproduced <local|container> ✅ deterministic [trace]
ruled out: <the obvious hypothesis> – <how it was disproven>
root cause: <traced to the change · file:line, one line>. [diff] [log excerpt]
cascade: also failed <N> downstream jobs from this root        (omit if none)

### Decisions            ← judgment calls only
1. fix (staged) vs revert <commit>. Rec: fix – <reason>. [diff]
2. keep repro test? (borderline) Rec: keep – guards <X>. [test]

### Applied (staged locally, not pushed)
- fix: <subject> – <file:line>   repro red→green ✅ · no new failures vs baseline ✅ [diff]
- test: <repro> [diff]            (only if kept)

### Ready to ship – pick what posts
[ ] push fix commit   [ ] retry failed jobs   [ ] push revert instead
[ ] quarantine <test> [show]   [ ] open tracking issue [show]
[ ] comment cause+fix on MR/pipeline [show]
```

## After approval

Execute only the checked items, in a safe order: stage/push the commit → retry jobs → post the comment. Before any **irreversible** action (push, force-push, retry), re-run the safety check **at execution time** – abort that item if the remote branch advanced (the push would be non-fast-forward) or the target pipeline is no longer the latest red one (superseded, already retried, or now green). Never act on a stale read. Then return a terse confirmation: what pushed, retried, and posted (with links), the refreshed state line, and any item that **failed** – reported, never swallowed.

## Degradation

Can't reproduce up the ladder, no comparison run available, logs truncated, a deploy stage needs credentials → the brief **states exactly what couldn't be established** and offers the cheapest next step rather than asserting a cause it didn't prove. Never claim a green that wasn't observed.
