---
name: mr-shepherd
description: Shepherd one GitLab MR or GitHub PR to ready-to-ship. Use when handed an MR/PR URL or number, asked to 'shepherd' one, or when `mr-queue-sweep` opens an item for deep work.
argument-hint: "MR or PR URL or number"
---

# MR Shepherd

Take one merge request from needs-attention to ready-to-ship – then stop once, late, with a grill-ready brief so the human makes only the real decisions and picks what posts.

**Push-right** – do maximal non-destructive work first; the two irreversible actions (push to remote, post to the thread) wait behind one late checkpoint.

## Host detection

Detect the host from the URL or the local remote:

- GitLab → `glab` (the `finanzfluss-group` case).
- GitHub → `gh`.

**No state file – the thread is the state.** A first run does the full review. A return run works only the delta past the **boundary marker** – the latest of {the last comment the loop replied to, the remote branch HEAD}. Local unpushed commits from a prior run count as **not-done** – they never reached the thread – so re-derive their fixes; but before staging any fix, diff-check whether an identical change already exists locally and skip it if so. Never re-surface a Decision whose thread is already replied-to or resolved: settled is settled.

## Run – in order

1. **Resolve the MR.** Fetch metadata (title, author, source/target branch, description, any linked Asana URL) and every comment thread – inline diff comments and general discussion. If the MR carries no Asana link, reverse-discover the ticket: search Asana for the task whose **Merge request** field equals this MR before concluding there is no ticket.
2. **Merge-safety pre-check** – read-only, every run. Behind its target? Local/remote diverged, so a push would be non-fast-forward and clobber a teammate's force-push? Unpushed local commits, or remote ahead? CI status on the latest pushed commit? Conflicts with target? Record it for the state line. **Never act on it.**
3. **Discover the repo's conventions; never enumerate them.** Read its `CLAUDE.md`/`AGENTS.md`, its lint/format/dependency config, and above all the surrounding code's idiom (naming, structure, comment density).
4. **Check out the branch; diff against the MR target.**
5. **Review.** Run the `/code-review` skill at **high** effort over the diff – it is the bug and quality engine (correctness + reuse/simplification/efficiency). Layer only the repo-independent lenses on top:
   - **duplication / centralization** – flag, then propose; centralization is a judgment call.
   - **naming restraint** – touch only *wrong or misleading* names, never for taste.
   - **fit on the touched path** – a half-applied change, cleanup the diff left behind, or tests that don't cover what it actually changed.

   With a ticket resolved (forward link or reverse-discovered), fetch it read-only and judge **intent**: does the MR actually do what the ticket asked? An intent mismatch is the **highest-stakes finding** – it leads the brief's Decisions (what diverges, ticket-requirement vs diff-behavior evidence, recommendation), never just the state-line flag.
6. **Triage every thread.** Tell **bot (CodeRabbit)** from **human** by author metadata, not a name list. Bucket each:
   - **blocker** – a real defect.
   - **nit** – minor or style.
   - **idea** – a design suggestion; a judgment call.
   - **question** – wants an answer, not code.
   - **noise** – false-positive, already handled, or out of scope.

   CodeRabbit is **downweighted by default** – a concrete, reproducible defect earns an individual reply + resolve; everything else (noise, already-handled, out-of-scope) is rolled into one silent batch-resolve offered as a single tray item, never per-comment chatter.
7. **Decide each finding and comment on the apply-vs-propose boundary.**

   The discriminator is **single correct form, not merely verified** – green verification is necessary but not sufficient. One correct change exists → apply; a *choice* exists → propose.

   **Apply** – staged in a reviewable local commit, only once its verification is green. Changes with one correct form: typos, dead code, formatting/convention/import fixes, and comments pointing at an unambiguous real defect. One logical change per commit · `write-dev-copy` commit subjects · **no explanatory comments** unless the code is genuinely non-obvious. Commit locally; **never push**.

   **Propose** – described in the brief, never written to disk. Anything that adds or alters control flow – null/undefined guards, early returns, error handling, defaults – **even when verified**, unless the guard is the sole correct fix for a reproduced crash. Also duplication/centralization tradeoffs, naming choices, API or interface shape, behavioral changes, anything that expands scope.
8. **Verify – differential, change-scoped; disprove before asserting.**
   - Capture a **baseline**: the repo's gates (lint, typecheck, tests, discovered from package scripts or CI config) on the branch before the loop's commits. Pre-existing failures are **context for the brief, never a blocker** for an unrelated fix.
   - Keep an applied fix only if (i) its own repro or target now passes and (ii) it introduces **no new failures vs baseline**. Otherwise discard it.
   - Scope gates to the change – changed-file lint/typecheck, the relevant test path – and fall back to the full suite only when scoping isn't reliable.
   - A UI or user-facing change in a browser repo → reproduce the *specific* change live via **Chrome DevTools MCP** (the exact bug it fixes, or the new behavior) and capture screenshot/console as evidence.
   - Backend, library, or CLI → exercise the real code path (the relevant test, or a scoped repro), not just types.
   - If verification genuinely can't run (needs secrets, no local env), the brief **says so explicitly** – never a silent "should work".
9. **Pre-draft every outward artifact via `/write-dev-copy` – stage, never post.**
   - One reply per thread. **Language matches the thread** – default German for `finanzfluss-group`, English for public/OSS, detected per comment; for a short or ambiguous comment, fall back to the thread's dominant language rather than guess.
   - Optional **tightened MR description** – only if the current one is thin, verbose, or merely enumerates the diff. Otherwise omit it; no noise.
   - Optional **Asana update comment** – e.g. "MR reviewed, X and Y addressed, ready for merge".
10. **Assemble the brief and present it at the checkpoint.**

## The brief

Drafts collapse behind `[show]`, never dumped inline. Render the brief even when a section is empty – a clean review still reports the state line and a one-line ready verdict. `write-dev-copy` voice throughout (en dash, backticked identifiers, fact-only).

```
## MR !<id> · <source-branch> → <target>
state: <N behind/ahead/diverged> · local≡remote? · CI <status> · <K> comments (<by-bucket>)
intent: <✅/⚠️ vs linked ticket, or "no ticket"> – [ticket]

### Decisions            ← the only things to grill
1. <judgment call, phrased as a question>. <who flagged it>. Rec: <recommendation>
   + <one-line evidence/why>. [diff] [comment]
2. …

### Applied (staged locally, not pushed)   ← FYI, auditable, revertable
- <commit subject> – <file:line>  <verification evidence> [diff]

### Comment replies (drafted, not posted)
- <author> @<loc> (<bucket>) → reply drafted [show] · <address via #N / resolve candidate>

### Ready to ship – pick what posts
[ ] post <K> replies   [ ] resolve <M> threads   [ ] resolve <B> bot threads as noise
[ ] push <P> fix commits   [ ] rebase onto <target> (<N> behind)
[ ] update MR description [show]   [ ] post Asana update [show]
```

## Outward-actions tray

Nothing in the brief's "Ready to ship" checklist happens until the human checks that specific item. Two carry conditions: rebase/force-push only if the merge-safety check flagged it; the MR description and Asana update only if drafted.

## After approval

Execute only the checked items, in a safe order: stage/push commits → post replies → resolve threads (defects, then the bot-noise batch) → update description → post Asana. Before any **irreversible** action (push, force-push, rebase), re-run the merge-safety check **at execution time** and abort that item if the remote moved since the brief – never act on a stale read. Then return a terse confirmation: what posted, pushed, and resolved (with links), the refreshed state line (CI re-triggered, new behind/ahead), and any item that **failed** – reported, never swallowed.

## Non-goals

- **DOES NOT MERGE.** Stops at ready-to-merge; merging is the human's or CI's call.
- Does not write to Asana except an approved, pre-drafted comment.
- Does not auto-resolve merge conflicts – conflicts are surfaced, never silently fixed.

## Degradation

MR not found, branch won't check out → the brief **states it plainly** and still presents whatever work completed. Never claim a green that wasn't observed.
