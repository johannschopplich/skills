---
name: mr-shepherd
description: Take a GitLab MR or GitHub PR – or a tracker ticket, several related MRs, or a stack – to ready-to-ship behind one approval tray. Use when asked to review, shepherd, rebase, or land an MR or PR.
argument-hint: "MR/PR URL(s), a tracker ticket URL, or 'merged' to land the next in a stack"
---

# MR Shepherd

Take merge requests from needs-attention to ready-to-ship. Merging stays the human's or CI's call.

**Load the doctrine first: invoke the `push-right` skill.** This file adds what is specific to a merge request. The irreversible actions here are **push to remote**, **post to the thread or tracker** (a bot re-review request included), **create inline drafts**, **resolve a thread**, and **edit the description**. The hard failures are an unauthenticated `glab`/`gh` and an unreachable tracker (step 1) – a brief built without the thread is a guess.

## Bind the Run

Bind these once, from the invocation and the host; they hold for every step and show in the brief's header.

- **Host** from the URL or the local remote: GitLab → `glab` · sigil `!` · noun *MR*; GitHub → `gh` · sigil `#` · noun *PR*. *MR* below means whichever noun the host bound.
- **Mode** – whose fixes these are:
  - **teach** (default when the author is someone else): findings become inline review drafts that imply the fix and leave the work to the author; only a fix with a single correct form that the author would never want to learn from – a typo, a missing import – is committed.
  - **take-over** (the invocation says the author is away, sick, or handing over): fixes are committed on top of the author's commits, and each gets a short draft saying what changed and why, so the author still learns from it.
  - **own** (the authenticated user wrote the MR): the `gate` skill's Own Work flow applies the fixes and re-gates, then returns its report, Applied, and Decisions into this brief; nothing is drafted to the author.
- **Inputs.** One MR URL is the plain case. A tracker ticket resolves to its MRs through its merge-request field. Several MRs are reviewed jointly when they share a branch lineage or files (one gate per MR, cross-MR findings in one brief section), separately otherwise – say which in one line. A stack (an MR whose target is another MR's branch) is reviewed bottom-up, one brief section per MR under one combined tray.

## Boundary Marker

The **thread is the state**. The boundary marker is the newest note or pending draft by the authenticated account (`glab api user` / `gh api user`). A re-fire works only the delta past it: threads newer than it, and pushes after it – on GitLab the MR versions created since (`glab api projects/:id/merge_requests/:iid/versions`), on GitHub the commits past the `commit_id` of the account's newest review. Only the gate re-runs over the full MR, on purpose; a finding that already has a draft is skipped.

`merged` as the argument is the **land** re-fire: confirm the merge on the host, watch the target's pipeline once, remove the worktree if `git status` there is clean (otherwise name it), and in a stack rebase the next MR onto its new target and shepherd it.

## Run – in Order

1. **Preflight.** `glab api user` (or `gh api user`) and one cheap tracker call. A failure ends the run here with the exact fix (`! glab auth login`, `/mcp`).
2. **Resolve the MR.** Metadata (title, author, source and target branch, description, CI), every comment thread – inline and general – and the linked ticket: the forward link, else one tracker search for the MR URL (in Asana, the task whose **Merge request** field holds it); no hit means no ticket.
3. **Merge-safety pre-check**, read-only, after a fresh `git fetch`: behind the target? local and remote diverged? unpushed local commits, or the remote ahead? CI on the latest pushed commit? conflicts with the target? Record it for the state line, where a conflict is surfaced, never resolved silently; acting on it belongs to the tray.
4. **Check out into a worktree** – a dedicated `git worktree` per MR (`../<repo>-mr-<id>`), reused on re-fire, never the user's own checkout.
5. **Review** – from the worktree, invoke the `gate` skill with the merge-base of the MR's target as the fixed point; the ticket URL as the spec (gate fetches it); and as context the mode (own runs gate's Own Work, the others want the report alone), the author, and any product or design decision the ticket shows as accepted. Then triage its findings through these lenses:
   - **Intent** – a spec finding that the MR does something other than what the ticket asked is the highest-stakes finding and leads the Decisions.
   - **Prevention** – a finding class that recurs within this MR, or that the thread shows was raised before, gets one Decision proposing where to stop it for good: a lint rule, a line in a repo skill or `AGENTS.md`, or a CodeRabbit path instruction.
   - **Product scope** – visual and product-value doubts on work a PM or designer accepted (the report's `PM:` lines) become one line for them, never an author comment.
6. **Triage every thread.** Tell bot from human by author metadata. Bucket each as **blocker**, **nit**, **idea**, **question**, or **noise** (false positive, already handled, out of scope). A review bot's (CodeRabbit's) concrete defect earns the mode's treatment and a short reply; everything else of the bot's goes to one batch-resolve tray item, with no reply.
7. **Stage fixes by mode** on the `push-right` Apply vs. Propose boundary; own mode skips this step, since gate's Own Work staged them. Anything that adds or alters control flow – guards, early returns, error handling, defaults – is proposed, unless it is the sole fix for a reproduced crash. Commit subjects carry no conventional-commit scope (`fix:`, not `fix(ui):`); commits stack on the author's HEAD, never rewriting the author's commits.
8. **Verify differentially** (`push-right`). A fix that passes its target but reddens anything else is discarded, and its finding moves to Decisions. Targets:
   - Changed-file lint and typecheck, and the relevant test path; the full suite when scoping isn't reliable.
   - Backend, library, or CLI: exercise the real code path – the relevant test or a scoped repro – not just types.
   - A UI change: reproduce the specific change live with the `chrome-devtools` MCP server – `navigate_page`, then `take_screenshot` and `list_console_messages` – on the MR's preview or a local server. Without the MCP server or an app to load, fall back to the closest component or e2e test and name the gap. A visual change asked to be compared gets one before/after page: screenshots of the target and the branch side by side, light and dark where the app has both.
9. **Draft the outward artifacts** in the voice and shapes `writing-for-developers` sets.
   - **Inline drafts** on the finding's file and line, in its review-comment shape: one per confirmed blocker, major, or minor finding going to the author; nits become at most one summary draft or are dropped; `plausible` findings become Decisions. A `suggestion` block, holding only the changed lines, goes only with a fix left uncommitted. On GitLab, read [`GITLAB.md`](GITLAB.md) first – it sets which lines can carry a draft.
   - **Replies**, one per human thread that wants one.
   - Optional: a tightened MR description, only when the current one is thin, verbose, or merely enumerates the diff; a tracker comment (Asana through `asana-formatting`) and a Slack note for the author or the PM, each only when it adds something, with the recipient named.
10. **Assemble the brief** and stop at the checkpoint.

## The Brief

```
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
```

`waiting on author` counts the blocker and major findings sent to the author as drafts. The rebase item appears only where the pre-check flagged it; the description, tracker, and Slack items only where step 9 drafted them. Drafts are numbered in order of those present.

## After Approval

Safe order: rebase → push (after a rebase, with a `git range-diff` summary proving nothing was lost) → create inline drafts → post replies → resolve threads (defects first, then the bot batch) → description → tracker comment → bot re-review request. After a rebase or push, re-derive each draft's line against the new diff before posting it. Inline drafts go up as one pending review: on GitLab through [`GITLAB.md`](GITLAB.md); on GitHub as one `gh api repos/{o}/{r}/pulls/{n}/reviews` call with `comments[]` (`path`, `line`, `side`, `body`) and no `event`. After a push, triage the bot's new threads the same way and report them as a short delta.

## Degradation

MR not found, the branch won't check out, a gate axis failed → the brief says so plainly and still presents whatever work completed.
