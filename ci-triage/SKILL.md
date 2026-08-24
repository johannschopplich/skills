---
name: ci-triage
description: Triage one red GitLab or GitHub pipeline to a proven verdict – real regression, flaky, infra, or config – staging a minimal fix where one applies. Use when handed a failing pipeline/job URL, asked to triage CI, or when an orchestrator opens a red pipeline.
argument-hint: "pipeline or job URL, or branch name"
---

# CI Triage

Take one red pipeline to a proven verdict by disproving the obvious hypothesis empirically before asserting any cause, then stage the minimal fix (with a reproduction) where one applies.

The easy answer is the one to distrust – step zero is disproof, not diagnosis.

**Load the doctrine first: invoke the `push-right` skill.** It carries the shared rules – push-right, the boundary marker, apply-vs-propose, differential verification, outward copy, the brief, and the checkpoint. This file carries what is specific to a red pipeline. The irreversible actions here are **push a fix or revert**, **retry CI**, and **post a comment**.

## Host Detection

Detect the host from the URL or the local remote, and bind the verbs and the noun for the run:

| bound verb | GitLab | GitHub |
| --- | --- | --- |
| `get` | `glab ci get` | `gh run view` |
| `list` | `glab ci list` | `gh run list` |
| `trace` | `glab ci trace` | `gh run view --log` |
| `retry` | `glab ci retry` | `gh run rerun` |
| `lint` | `glab ci lint` | none – use `actionlint` where available, otherwise skip that check and say so in the brief |

Noun: GitLab → *pipeline* · GitHub → *workflow run*. The brief renders the bound noun; *pipeline* below means whichever the host bound. The pipeline config is `.gitlab-ci.yml` or `.github/workflows/*.yml` respectively.

## Boundary Marker

The **branch is the state**; the failing pipeline is just where this run enters. A pipeline's logs are immutable, so a re-fire on the same pipeline reaches the same verdict – the only thing carried forward is a local staged fix.

- Same pipeline still red, a fix staged but unpushed → re-present the existing verdict and staged fix rather than re-diagnosing.
- A newer pipeline exists (someone pushed) → re-fire on it and diagnose the **delta** since the last-diagnosed commit.
- Newest pipeline green → closed; report it and stage nothing.

## Run – in Order

1. **Resolve the failure(s).** Fetch the pipeline and its failing job(s) and logs (the bound `get`, then `trace`). Identify the stage each failed in (lint, typecheck, unit, e2e/browser, build, deploy). **Collapse cascades** – a job red only because an upstream job it depends on failed is folded into that root rather than triaged on its own. Triage each distinct **root** failure.
2. **Disprove first – compare against the last green run** (the bound `list` for the branch's history).
   - The same or trivially-different commit was green before and is red now → the code didn't touch the failing surface → lean **flaky / infra**.
   - The failure first appears at a specific commit (bisect the green→red range) → **real regression**, traced to that change.
3. **Reproduce up the ladder – a cause is asserted from a reproduction, never from logs alone.** Reuse the repo's own test setup rather than a parallel harness.
   - **Bare-local first.** Reproduces deterministically every time → it's *real*, regardless of how the logs read.
   - **Won't reproduce locally → escalate to the runner's own image/container** (its env vars, its services via compose). Environment-specific real bugs – locale, timezone, Node version, case-sensitive FS, a CI-only service – surface only here, not on the dev's machine.
   - **Neither reproduces and a green comparison run exists → only now downgrade** toward flaky/infra. For external-service failures, build a **hermetic, mock-based reproduction** so it's deterministic rather than re-importing the flakiness.
4. **Reach a verdict per root failure – each carries its own bar.**
   - **REAL REGRESSION** – traced to a specific change and *positively* reproduced (deterministic repro, or a clean green→red bisect).
   - **CONFIG** – a deterministic check actually fails (e.g. the bound `lint` on a malformed pipeline config).
   - **FLAKY** – a green run on the same/near commit, *or* an honest failed repro attempt (tried up the ladder, non-deterministic) plus a known-flaky signal (timeouts, network, test-ordering, resource contention). A single red log is never enough.
   - **INFRA / DEPLOY** – an unambiguous environmental signature (deploy-key, runner, registry, auth) *plus* a comparison showing the code didn't touch that surface.
   - Evidence **ambiguous** in any non-regression bucket → the verdict is **INCONCLUSIVE**, and the cheapest next step – often a `retry` – goes on the tray.
5. **Act on the verdict.**
   - **Real regression / Config** → write a reproduction that fails on the bug and passes with the fix, then apply the **minimal fix** on the apply-vs-propose boundary (`push-right`). The verification target here: the repro goes **red→green**. The branch is red by definition, so a whole-pipeline green is never the bar. Where a clean fix isn't small, or where the fix greens the repro but adds new failures vs baseline, **discard it** and stage a **revert** instead, recommended. *Keep the repro* if it's a durable guard the repo should carry; keep it as brief-only evidence if it was scaffolding; surface "keep this repro?" as a decision when borderline.
   - **Flaky** → *no code fix*. A retry unblocks, as a tray item. Name the flaky test in the brief; when the branch's history shows it **repeatedly flapping**, offer a staged quarantine/flag commit and/or a drafted tracking issue as tray items. A single sighting earns a name in the brief, not a quarantine.
   - **Infra / Deploy** → *no code fix*. Recommend the retry or escalate the infra issue. Stage nothing.
6. **Re-running CI is outward** – it goes on the tray. If flakiness can only be confirmed by a re-run (no comparison run, won't reproduce up the ladder), say so and put `retry failed jobs` there.
7. **Draft the outward copy** (`push-right`) – e.g. a comment on the MR/pipeline explaining cause + fix.
8. **Assemble the brief and present at the checkpoint.** When an **orchestrator** opened the pipeline, return the brief and tray **without prompting** – it batches the approval.

## Fix vs Revert

Default to the **minimal fix** when the cause is understood and the fix is small and verified. Recommend **revert** when the breaking change is someone else's recent commit and a clean fix isn't small, a shared branch is red and blocking others, the change reverts cleanly without collateral, or a proper fix needs more judgment than a red pipeline can wait for. Stage whichever is recommended and describe the alternative in one line. Revert is a judgment call even when staged; the push stays behind the tray.

## The Brief

Verdict + evidence first. A **FLAKY / INFRA / INCONCLUSIVE verdict collapses** its block to verdict + evidence + "recommend retry", no staged fix.

```
## <noun> #<id> · <branch> · <K> failing root(s) ❌

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
[ ] comment cause+fix on the MR/PR or the <noun> [show]
```

## After Approval

Safe order for this tray: stage/push the commit → retry jobs → post the comment. The execution-time re-check also covers the pipeline itself – abort that item if the target is no longer the latest red one (superseded, already retried, or now green).

## Degradation

Can't reproduce up the ladder, no comparison run available, logs truncated, a deploy stage needs credentials → the verdict is **INCONCLUSIVE** and the cheapest next step goes on the tray, in place of a cause this run didn't prove.
