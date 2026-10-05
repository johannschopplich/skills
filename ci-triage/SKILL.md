---
name: ci-triage
description: Triage one red GitLab or GitHub pipeline to a proven verdict – real regression, flaky, infra, or config – staging a minimal fix where one applies.
argument-hint: "pipeline or job URL, or branch name"
disable-model-invocation: true
---

# CI Triage

**Invoke the `push-right` skill first.** Irreversible here: **push a commit** (fix, revert, or quarantine), **retry CI**, **open an issue**, **post a comment**. Hard failures: an unauthenticated `glab` or `gh`; a pipeline, run, or job ID that doesn't resolve.

## Host Detection

Detect the host from the URL or the local remote and bind:

| bound verb | GitLab | GitHub |
|---|---|---|
| `get` | `glab ci get -p <pipeline-id>` | `gh run view <run-id>` |
| `list` | `glab ci list --ref <branch>` | `gh run list --branch <branch> --workflow <failing workflow>` |
| `trace` | `glab ci trace <job-id>` | `gh run view <run-id> --log-failed` |
| `retry` | `glab ci retry <job-id>` for every failed job | `gh run rerun <run-id> --failed` |
| `lint` | `glab ci lint` | none – use `actionlint` where available, otherwise skip that check |

Always pass the ID: without one, `glab` prompts or falls back to the current branch, and `gh` errors outside a terminal. Noun: GitLab → *pipeline*, GitHub → *workflow run*.

## Boundary Marker

The **branch is the state**; retries add attempts to the same pipeline, and only a local staged fix carries forward.

- Same pipeline and attempts, fix staged → re-present it.
- A newer attempt of a failed job → triage only that attempt: green confirms FLAKY/INFRA; red with the same signature rules out FLAKY.
- Same pipeline, nothing staged → diagnose afresh.
- Newer pipeline → triage that one, only the **delta** since the last-diagnosed commit.
- Newest pipeline green → closed; stage nothing.

## Run – in Order

1. **Resolve the failures** (`get`, then `trace`). **Collapse cascades** – a job red only because an upstream job failed folds into that root. Triage each root.
2. **Disprove first against the last green run** (`list`). Same or near commit was green → lean flaky/infra. Failure starts at a specific commit (bisect green→red) → regression at that change.
3. **Reproduce up the ladder – a cause comes from a reproduction, never from logs alone.** Reuse the repo's own test setup, not a parallel harness.
   - **Bare-local** first. Deterministic → *real*, whatever the logs say.
   - Won't reproduce locally → the **runner's image/container** (its env vars, services via compose): locale, timezone, Node version, case-sensitive FS, and CI-only services surface only here.
   - Neither reproduces and a green comparison exists → only now downgrade toward flaky/infra. A failure in handling an external service's response (not a timeout or outage) → a **hermetic, mock-based repro** of that response.
4. **Verdict per root – each has its own bar.**
   - **REAL REGRESSION** – traced to a specific change *and* positively reproduced (deterministic repro or clean bisect).
   - **CONFIG** – a deterministic check fails (e.g. `lint`).
   - **FLAKY** – green on the same/near commit, *or* a failed repro up the ladder plus a known-flaky signal (timeouts, network, test ordering, resource contention). One red log is never enough.
   - **INFRA / DEPLOY** – an unambiguous environmental signature (deploy key, runner, registry, auth) *plus* a comparison showing the code didn't touch that surface.
   - Ambiguous, or no bar can be met (no container runtime, CI-only secrets, no comparison and no repro, truncated logs) → **INCONCLUSIVE**; the cheapest next step (often a `retry`) goes on the tray. A bar met by other evidence keeps its verdict.
5. **Act.**
   - **Regression / Config** → a repro that fails on the bug (Config: `lint`, no test file), then the **minimal fix** per Apply vs. Propose. Target: the repro goes **red→green** – never whole-pipeline green. A fix adding new failures vs. baseline is discarded for the revert. Keep the repro if it's a durable guard, else brief-only evidence; borderline → a Decision.
   - **Flaky** → no code fix; retry on the tray; name the test. **Repeatedly flapping** in the branch history → offer a staged quarantine commit and/or a drafted tracking issue; a single sighting gets named only.
   - **Infra / Deploy** → no code fix; recommend retry or escalate.

## Fix vs. Revert

Default: **minimal fix**. **Revert** when any of these holds:

- the breaking commit is someone else's recent one and no clean fix is small;
- a shared branch is blocking others;
- it reverts cleanly without collateral;
- the proper fix needs more judgment than a red pipeline can wait for.

Stage the recommended one (an exception to Apply vs. Propose – a red branch needs a ready answer) and offer the other as Q1 b; picking Q1 b means leaving the push unpicked and re-firing with the alternative named.

## The Brief

FLAKY / INFRA / INCONCLUSIVE **collapse** to the root line plus "recommend retry".

<brief-template>
## <noun> #<id> <branch> – <K> failing roots, <fix | revert | retry> staged
**<stage/job>** <REAL REGRESSION | CONFIG | FLAKY | INFRA-DEPLOY | INCONCLUSIVE> · <sha · file:line> · reproduced <local | container | by bisect> · ruled out <the obvious cause> (<how>) · <N> cascaded      (a line per root)

**Needs you** – `Q1 a, Q2 a, ship 1–<n>`
**Q1** <fix | revert <sha>> (staged), or <the alternative>? a) staged · b) alternative – **a**: <reason>
**Q2** Keep the repro test `<file>`? (borderline) a) keep · b) drop – **a**: guards <X>
1. push the staged <fix | revert>
2. retry every failed job
3. push the quarantine
4. open the tracking issue (D<n>)
5. comment cause and fix on the MR/PR or the <noun> (D<n>)

**Done** <fix | revert> <subject> (repro red→green, <traced | reproduced | checked>) · repro test (if kept) · quarantine <test> (if flapping)

**Drafts**
**D<n>** → <tracking issue | comment>
> <full text>

Last green → first red, the failing log lines, the cascade: `<report dir>/brief.md`
</brief-template>

## After Approval

Order: push commits → retry jobs → open the tracking issue → post the comment.
