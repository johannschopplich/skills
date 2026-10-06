---
name: mr-shepherd
description: Take a GitLab MR or GitHub PR – or a tracker ticket, several related MRs, or a stack – to ready-to-ship behind one approval tray. Use when asked to review, shepherd, rebase, or land an MR or PR.
argument-hint: "MR/PR URL(s), a tracker ticket URL, or 'merged' to land the next in a stack"
---

# MR Shepherd

Merging stays the user's or CI's call. **Invoke the `push-right` skill first.** Irreversible: **push to remote**, **post to the thread or tracker** (a bot re-review request included), **create inline drafts**, **resolve a thread**, **edit the description**.

## Bind the Run

- **Host** from the URL or the local remote: GitLab → `glab` · `!` · *MR*; GitHub → `gh` · `#` · *PR*.
- **Mode.**
  - **teach** (default, someone else's MR) – findings become inline drafts that imply the fix; commit only a single-form fix the author wouldn't learn from – a typo, a missing import.
  - **take-over** (the invocation says the author is away, sick, or handing over) – commit fixes on top of the author's commits, each with a short draft saying what changed and why.
  - **own** (the authenticated user wrote it) – `code-review`'s Own Work; nothing is drafted to the author.
- **Inputs.** A ticket resolves to its MRs via its merge-request field. Several MRs: jointly when they share lineage or files (one review each, one cross-MR section), else separately – say which. A stack: bottom-up, one section per MR, one tray.

## Boundary Marker

The **thread is the state**. The marker is the authenticated account's newest note or pending draft. A re-fire works only newer threads and pushes – GitLab: versions since (`glab api projects/:id/merge_requests/:iid/versions`); GitHub: commits past the account's newest review's `commit_id`. Code review re-runs over the full MR; findings already drafted are skipped.

`merged` is the **land** re-fire: confirm the merge, watch the target's pipeline once, remove the worktree if clean (else name it), and in a stack rebase the next MR onto its new target and shepherd it.

## Run – in Order

1. **Check auth.** `glab api user` / `gh api user` and one cheap tracker call; a failure, here or later, ends the run with the fix (`! glab auth login`, `/mcp`). A missing MR or failed checkout goes in the brief; the rest still runs.
2. **Resolve the MR.** Metadata, CI, every thread (inline and general), and the ticket. Find the ticket by the forward link, else by one tracker search for the MR URL; no hit, no ticket. In Asana, search for an exact `.value` match of the full URL on the **Merge request** field; text search and `.contains` miss custom fields. A field holding several URLs defeats `.value`: scan `display_value` across the board's tasks via `get_tasks`.
3. **Pre-check merge safety.** Read-only, after `git fetch`: behind, diverged, CI on the latest push, conflicts – for the state line.
4. **Add a worktree** at `../<repo>-mr-<id>`, reused on re-fire, never the user's checkout.
5. **Review.** Invoke the `code-review` skill from the worktree. Fixed point: the target's merge-base. Spec: the ticket URL. Context: the mode (own → Own Work; else report only), the author, and product or design decisions the ticket shows as accepted. Triage:
   - **Intent** – MR differs from what the ticket asked: leads the Decisions.
   - **Prevention** – a finding class recurring in the MR or the thread gets one Decision on where to stop it: lint rule, repo skill or `AGENTS.md` line, CodeRabbit path instruction.
   - **Product scope** – visual and product-value doubts on work a PM or designer accepted (`PM:` lines) → one line for them, never an author comment.
6. **Triage every thread.** Buckets: **blocker**, **nit**, **idea**, **question**, **noise** (false positive, handled, out of scope). A bot's concrete defect gets the mode's treatment and a short reply; the rest → one batch-resolve tray item, unreplied.
7. **Stage fixes by mode** (not own). Control flow – guards, early returns, error handling, defaults – is proposed, unless the sole fix for a reproduced crash. Stack on the author's HEAD, never rewrite their commits.
8. **Verify.** A fix that reddens anything else is discarded, its finding → Decision. UI: reproduce live via `chrome-devtools` MCP on the preview or a local server; else the closest component or e2e test, gap named. Asked to compare visuals: one before/after page, target and branch side by side, light and dark where both exist.
9. **Draft.**
   - **Inline drafts** on the finding's line, in `writing-for-developers`' review-comment shape: one per confirmed blocker, major, or minor; nits → at most one summary draft; `plausible` → Decisions. A `suggestion` block, holding only the changed lines, only with an uncommitted fix. GitLab: read [`GITLAB.md`](GITLAB.md) first.
   - **Replies** – one per human thread that wants one.
   - Optional, recipient named, only when it adds something: a tightened description (current one thin, verbose, or a diff list); a tracker comment (Asana: invoke the `asana-formatting` skill); a Slack note.

## The Brief

<brief-template>
## <noun> [<sigil><id>](<url>) <short title> – <ready to merge | ready after rebase | blocked by N decisions | waiting on author (N findings)>
<N behind | diverged> · <P> unpushed · CI <✓ | ✗> · <K> threads (<by bucket>) · <no ticket> · <teach | take-over | own>

**Needs you** – `Q1 a, Q2 a, ship 1–<n>`
**Q1** <judgment call as a question> *<who flagged it>*
a) <option> · b) <option> – **<letter>**: <one line> · [diff] [thread]
1. fold <F> fixups (`git rebase --autosquash <upstream sha>`)
2. rebase onto <target> (<N> behind)
3. push <P> commits to <branch>
4. create <K> inline drafts (D<n>–D<m>, unpublished – you submit the review)
5. post <M> replies (D<n>…)
6. resolve <T> threads
7. resolve <B> bot threads as noise
8. ask the bot to re-review after the push
9. update the description (D<n>)
10. post the tracker comment (D<n>)
11. Slack note (D<n>, copy)

**Done** <fix> (<traced | reproduced | checked | mutated>) · …
**Waiting on** <CI, author, PM>
**Next** <the next MR, or the land re-fire>

**Drafts**
**D<n>** → <author> on `<file:line>` (<severity | bucket>), <via Q<n> | resolve candidate>
> <full text>

**Review** <code-review's line, with its report path>
</brief-template>

`waiting on author` counts blocker and major drafts.

## After Approval

Safe order: fold → rebase → push (after a rebase, with a `git range-diff` summary proving nothing was lost) → inline drafts → replies → resolve threads (defects first, then the bot batch) → description → tracker comment → bot re-review request. After a rebase or push, re-derive each draft's line. Inline drafts go up as one pending review: GitLab via [`GITLAB.md`](GITLAB.md); GitHub as one `gh api repos/{o}/{r}/pulls/{n}/reviews` call with `comments[]` (`path`, `line`, `side`, `body`) and no `event`. After a push, triage the bot's new threads and report a short delta.
