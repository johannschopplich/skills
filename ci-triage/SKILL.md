---
name: ci-triage
description: Triage one red GitLab or GitHub pipeline to a proven verdict – real regression, flaky, infra, or config – staging a minimal fix where one applies. Use when handed a failing pipeline or job URL, or asked why CI is red.
argument-hint: "pipeline or job URL, or branch name"
---

# CI Triage

Take one red pipeline to a proven verdict by disproving the obvious hypothesis empirically before asserting any cause, then stage the minimal fix (with a reproduction) where one applies.

**Load the doctrine first: invoke the `push-right` skill.** This file adds what is specific to a red pipeline. The irreversible actions here are **push a commit** (fix, revert, or quarantine), **retry CI**, **open an issue**, and **post a comment**. Hard failures: an unauthenticated `glab` or `gh`, and a pipeline, run, or job ID that doesn't resolve.

## Host Detection

Detect the host from the URL or the local remote, and bind the verbs and the noun for the run:

| bound verb | GitLab | GitHub |
| --- | --- | --- |
| `get` | `glab ci get -p <pipeline-id>` | `gh run view <run-id>` |
| `list` | `glab ci list --ref <branch>` | `gh run list --branch <branch> --workflow <failing workflow>` |
| `trace` | `glab ci trace <job-id>` | `gh run view <run-id> --log-failed` |
| `retry` | `glab ci retry <job-id>` for every failed job | `gh run rerun <run-id> --failed` |
| `lint` | `glab ci lint` | none – use `actionlint` where available, otherwise skip that check and say so in the brief |

Always pass the pipeline, run, or job ID: without one, `glab` prompts or falls back to the current branch, and `gh` errors outside a terminal.

Noun: GitLab → *pipeline* · GitHub → *workflow run*. The brief renders the bound noun; *pipeline* below means whichever the host bound. The pipeline config is `.gitlab-ci.yml` or `.github/workflows/*.yml` respectively.

## Boundary Marker

The **branch is the state**; the failing pipeline is just where this run enters. A job's log is fixed per attempt, but retries add attempts to the same pipeline; the only thing carried forward is a local staged fix.

- Same pipeline, same attempts, a fix staged but unpushed → re-present the existing verdict and staged fix rather than re-diagnosing.
- Same pipeline, a newer attempt of a failed job → triage only that attempt: green confirms FLAKY/INFRA; red with the same signature rules out FLAKY.
- Same pipeline, nothing staged → diagnose afresh; the prior verdict lived only in the last brief.
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
   - **Neither reproduces and a green comparison run exists → only now downgrade** toward flaky/infra. When the failure points at how the code handles an external service's response (not a timeout or outage), build a **hermetic, mock-based reproduction** of that response.
4. **Reach a verdict per root failure – each carries its own bar.**
   - **REAL REGRESSION** – traced to a specific change and *positively* reproduced (deterministic repro, or a clean green→red bisect).
   - **CONFIG** – a deterministic check actually fails (e.g. the bound `lint` on a malformed pipeline config).
   - **FLAKY** – a green run on the same/near commit, *or* an honest failed repro attempt (tried up the ladder, non-deterministic) plus a known-flaky signal (timeouts, network, test-ordering, resource contention). A single red log is never enough.
   - **INFRA / DEPLOY** – an unambiguous environmental signature (deploy-key, runner, registry, auth) *plus* a comparison showing the code didn't touch that surface.
   - Evidence **ambiguous** in any non-regression bucket → the verdict is **INCONCLUSIVE**, and the cheapest next step – often a `retry` – goes on the tray.
5. **Act on the verdict.**
   - **Real regression / Config** → write a reproduction that fails on the bug and passes with the fix (for Config, the reproduction is the bound `lint` going red→green; no test file), then apply the **minimal fix** on the Apply vs. Propose boundary (`push-right`). The verification target here: the repro goes **red→green**. The branch is red by definition, so a whole-pipeline green is never the bar. Pick fix or revert per **Fix vs. Revert**; a fix that adds new failures vs baseline is discarded in favor of the revert. *Keep the repro* if it's a durable guard the repo should carry; keep it as brief-only evidence if it was scaffolding; surface "keep this repro?" as a decision when borderline.
   - **Flaky** → *no code fix*. A retry unblocks, as a tray item. Name the flaky test in the brief; when the branch's history shows it **repeatedly flapping**, offer a staged quarantine/flag commit and/or a drafted tracking issue as tray items. A single sighting earns a name in the brief, not a quarantine.
   - **Infra / Deploy** → *no code fix*. Recommend the retry or escalate the infra issue. Stage nothing.
6. **Draft the outward copy** (`push-right`) – e.g. a comment on the MR/pipeline explaining cause + fix.
7. **Assemble the brief and present at the checkpoint.**

## Fix vs. Revert

Default to the **minimal fix** when the cause is understood and the fix is small and verified. Recommend **revert** when the breaking change is someone else's recent commit and a clean fix isn't small, a shared branch is red and blocking others, the change reverts cleanly without collateral, or a proper fix needs more judgment than a red pipeline can wait for. Stage whichever is recommended – an exception to push-right's Apply vs. Propose, since a red branch needs a ready answer – and offer the alternative as Q1 b in one line. Revert is a judgment call even when staged; the push stays behind the tray, and Q1 b means leaving it unchecked and re-firing with the alternative named.

## The Brief

Verdict + evidence first. A **FLAKY / INFRA / INCONCLUSIVE verdict collapses** its block to verdict + evidence + "recommend retry", no staged fix.

```
## <noun> #<id> · <branch> · <K> failing root(s) ❌

### <stage/job> – REAL REGRESSION        (FLAKY / INFRA-DEPLOY / CONFIG / INCONCLUSIVE)
evidence: last green <run@commit> → first red <commit> · reproduced <local|container> ✅ deterministic
log: <the failing line(s), verbatim>
ruled out: <the obvious hypothesis> – <how it was disproven>
root cause: <traced to <sha> · file:line, one line>
cascade: also failed <N> downstream jobs from this root        (omit if none)

### Decisions
Q1 a) <fix | revert <sha>> (staged) b) <the alternative, one line> – Rec: a, <reason>.
Q2 keep the repro test `<file>`? (borderline) a) keep b) drop – Rec: a, guards <X>.

### Applied (Staged Locally, Not Pushed)
- <fix | revert>: <subject> · <sha> – <file:line>   repro red→green ✅ · no new failures vs baseline ✅ · <traced | reproduced | checked>
- test: <repro> · <sha> · <traced | reproduced | checked>            (only if kept)
- test: quarantine <test> · <sha> · <traced | reproduced | checked>   (only if flapping)

### Ready to Ship – Pick What Posts
[ ] push the staged <fix | revert>   [ ] retry every failed job
[ ] push the quarantine   [ ] open tracking issue (D<n>)
[ ] comment cause+fix on the MR/PR or the <noun> (D<n>)

### Drafts                (numbered in order of the drafts present)
D<n> <tracking issue, in full>
D<n> <comment, in full>
```

## After Approval

Safe order for this tray: push the commits → retry jobs → open the tracking issue → post the comment. The execution-time re-check also covers the pipeline itself – abort that item if the target is no longer the latest red one (superseded, already retried, or now green).

## Degradation

No verdict's bar can be met – the ladder can't run (no container runtime, CI-only secrets), there's no comparison run and nothing reproduces, logs are truncated, a deploy stage needs credentials → the verdict is **INCONCLUSIVE** and the cheapest next step goes on the tray, in place of a cause this run didn't prove. A bar met by other evidence keeps its verdict.
