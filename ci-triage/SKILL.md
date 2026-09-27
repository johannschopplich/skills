---
name: ci-triage
description: Triage one red GitLab or GitHub pipeline to a proven verdict – real regression, flaky, infra, or config – staging a minimal fix where one applies. Use when handed a failing pipeline or job URL, or asked why CI is red.
argument-hint: "pipeline or job URL, or branch name"
---

# CI Triage

**Load the doctrine first: invoke the `push-right` skill.** Irreversible here: **push a commit** (fix, revert, or quarantine), **retry CI**, **open an issue**, **post a comment**. Hard failures: an unauthenticated `glab` or `gh`; a pipeline, run, or job ID that doesn't resolve.

## Host Detection

Detect the host from the URL or the local remote and bind:

| bound verb | GitLab | GitHub |
| --- | --- | --- |
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

1. **Resolve the failures** (`get`, then `trace`). **Collapse cascades**: a job red only because an upstream job failed folds into that root. Triage each root.
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
   - **Regression / Config** → a repro that fails on the bug (Config: `lint`, no test file), then the **minimal fix** per Apply vs. Propose. Target: the repro goes **red→green** – never whole-pipeline green. A fix adding new failures vs baseline is discarded for the revert. Keep the repro if it's a durable guard, else brief-only evidence; borderline → a Decision.
   - **Flaky** → no code fix; retry on the tray; name the test. **Repeatedly flapping** in the branch history → offer a staged quarantine commit and/or a drafted tracking issue; a single sighting gets named only.
   - **Infra / Deploy** → no code fix; recommend retry or escalate.

## Fix vs. Revert

Default: **minimal fix**. **Revert** when the breaking commit is someone else's recent one and no clean fix is small, a shared branch is blocking others, it reverts cleanly without collateral, or the proper fix needs more judgment than a red pipeline can wait for. Stage the recommended one (an exception to Apply vs. Propose – a red branch needs a ready answer) and offer the other as Q1 b; picking Q1 b means leaving the push unchecked and re-firing with the alternative named.

## The Brief

FLAKY / INFRA / INCONCLUSIVE **collapse** to verdict + evidence + "recommend retry".

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

### Drafts
D<n> <tracking issue, in full>
D<n> <comment, in full>
```

## After Approval

Order: push commits → retry jobs → open the tracking issue → post the comment.
