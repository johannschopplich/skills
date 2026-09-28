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
  - **own** (the authenticated user wrote it) – `gate`'s Own Work flow applies and re-gates, then returns its report, Applied, and Decisions into this brief; nothing is drafted to the author.
- **Inputs.** A ticket resolves to its MRs via its merge-request field. Several MRs: jointly when they share lineage or files (one gate each, one cross-MR section), else separately – say which. A stack: bottom-up, one section per MR, one tray.

## Boundary Marker

The **thread is the state**. The marker is the authenticated account's newest note or pending draft. A re-fire works only newer threads and pushes – GitLab: versions since (`glab api projects/:id/merge_requests/:iid/versions`); GitHub: commits past the account's newest review's `commit_id`. Gate re-runs over the full MR; findings already drafted are skipped.

`merged` is the **land** re-fire: confirm the merge, watch the target's pipeline once, remove the worktree if clean (else name it), and in a stack rebase the next MR onto its new target and shepherd it.

## Run – in Order

1. **Preflight** – the hard failures: `glab api user` / `gh api user` and one cheap tracker call; failure, here or later, ends the run with the fix (`! glab auth login`, `/mcp`). A missing MR or failed checkout goes in the brief; the rest still runs.
2. **Resolve the MR.** Metadata, CI, every thread (inline and general), and the ticket: the forward link, else one tracker search for the MR URL (Asana: an exact `.value` match of the full URL on the **Merge request** field – text search and `.contains` miss custom fields); no hit, no ticket.
3. **Merge-safety pre-check.** Read-only, after `git fetch`: behind, diverged, CI on the latest push, conflicts – for the state line. Conflicts are surfaced, never resolved silently.
4. **Worktree** at `../<repo>-mr-<id>`, reused on re-fire, never the user's checkout.
5. **Review** – invoke the `gate` skill from the worktree: fixed point the target's merge-base, spec the ticket URL, context the mode (own → Own Work; else report only), author, and product or design decisions the ticket shows as accepted. Triage:
   - **Intent** – MR differs from what the ticket asked: leads the Decisions.
   - **Prevention** – a finding class recurring in the MR or the thread gets one Decision on where to stop it: lint rule, repo skill or `AGENTS.md` line, CodeRabbit path instruction.
   - **Product scope** – visual and product-value doubts on work a PM or designer accepted (`PM:` lines) → one line for them, never an author comment.
6. **Triage every thread** – **blocker**, **nit**, **idea**, **question**, **noise** (false positive, handled, out of scope). A bot's concrete defect gets the mode's treatment and a short reply; the rest → one batch-resolve tray item, unreplied.
7. **Stage fixes by mode** (not own). Control flow – guards, early returns, error handling, defaults – is proposed, unless the sole fix for a reproduced crash. Subjects unscoped (`fix:`, not `fix(ui):`); stack on the author's HEAD, never rewrite their commits.
8. **Verify.** A fix that reddens anything else is discarded, its finding → Decision. UI: reproduce live via `chrome-devtools` MCP (`navigate_page`, `take_screenshot`, `list_console_messages`) on the preview or a local server; else the closest component or e2e test, gap named. Asked to compare visuals: one before/after page, target and branch side by side, light and dark where both exist.
9. **Draft.**
   - **Inline drafts** on the finding's line, in `writing-for-developers`' review-comment shape: one per confirmed blocker, major, or minor; nits → at most one summary draft; `plausible` → Decisions. A `suggestion` block, holding only the changed lines, only with an uncommitted fix. GitLab: read [`GITLAB.md`](GITLAB.md) first.
   - **Replies** – one per human thread that wants one.
   - Optional, recipient named, only when it adds something: a tightened description (current one thin, verbose, or a diff list); a tracker comment (Asana: invoke the `asana-formatting` skill); a Slack note.

## The Brief

<brief-template>
## <noun> <sigil><id> · <full MR URL>
verdict: <ready to merge | ready after rebase | blocked by N decisions | waiting on author (N findings)> · mode: <teach | take-over | own>
what it does: <two plain sentences>
state: <N behind/ahead/diverged> · local≡remote? · CI <status> · <K> threads (<by bucket>) · worktree <path>
review: gate <verdict> (<axes>, <R> refuted) · intent <✅ | ⚠️ | no ticket> [ticket] · <gate report dir>
open: you: <what only the user can do, with links> · waiting on: <CI, author, PM> · next: <the next MR, or the land re-fire>

### Decisions
Q1 <judgment call as a question>. <who flagged it>.
  a) <option> b) <option> – Rec: <letter>, because <one line>. [diff] [thread]

### Applied (Staged Locally, Not Pushed)
- <commit subject> – <file:line> · <verification evidence> · <traced | reproduced | checked>

### Ready to Ship – Pick What Posts
[ ] rebase onto <target> (<N> behind)   [ ] push <P> commits
[ ] create <K> inline drafts (D<n>–D<m>, unpublished – you submit the review)   [ ] post <M> replies (D<n>…)
[ ] resolve <T> threads   [ ] resolve <B> bot threads as noise   [ ] ask the bot to re-review after the push
[ ] update the description (D<n>)   [ ] post the tracker comment (D<n>)   [ ] Slack note (D<n>, copy)

### Drafts
D<n> <file:line> → <author> (<severity | bucket>) · <address via Q<n> | resolve candidate>
<full text>
</brief-template>

`waiting on author` counts blocker and major drafts.

## After Approval

Safe order: rebase → push (after a rebase, with a `git range-diff` summary proving nothing was lost) → inline drafts → replies → resolve threads (defects first, then the bot batch) → description → tracker comment → bot re-review request. After a rebase or push, re-derive each draft's line. Inline drafts go up as one pending review: GitLab via [`GITLAB.md`](GITLAB.md); GitHub as one `gh api repos/{o}/{r}/pulls/{n}/reviews` call with `comments[]` (`path`, `line`, `side`, `body`) and no `event`. After a push, triage the bot's new threads and report a short delta.
