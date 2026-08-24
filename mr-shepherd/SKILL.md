---
name: mr-shepherd
description: Take one GitLab MR or GitHub PR to ready-to-ship – review, comment triage, staged fixes, drafted replies – behind one approval tray.
argument-hint: "MR or PR URL or number"
disable-model-invocation: true
---

# MR Shepherd

Take one merge request from needs-attention to ready-to-ship. Merging itself stays the human's or CI's call.

**Load the doctrine first: invoke the `push-right` skill.** It carries the shared rules – push-right, the boundary marker, apply-vs-propose, differential verification, outward copy, the brief, and the checkpoint. This file carries what is specific to a merge request. The irreversible actions here are **push to remote** and **post to the thread**.

## Host Detection

Detect the host from the URL or the local remote, and bind all three for the run:

- GitLab → `glab` · sigil `!` · noun *MR*.
- GitHub → `gh` · sigil `#` · noun *PR*.

The brief renders `<sigil><id>` and the bound noun. *MR* below means whichever noun the host bound.

## Boundary Marker

The **thread is the state**. A first run does the full review; a re-fire works only the delta past the boundary marker – the latest of {the last comment this skill replied to, the remote branch HEAD}.

## Run – in Order

1. **Resolve the MR.** Fetch metadata (title, author, source/target branch, description, any linked tracker ticket) and every comment thread – inline diff comments and general discussion. With no ticket link on the MR, reverse-discover it from the tracker (e.g. in Asana, the task whose **Merge request** field points back at this MR) before concluding there is none.
2. **Merge-safety pre-check** – read-only, every run. Behind its target? Local/remote diverged, so a push would be non-fast-forward and clobber a teammate's force-push? Unpushed local commits, or remote ahead? CI status on the latest pushed commit? Conflicts with target? Record it for the state line and leave it there – acting on it belongs to the tray.
3. **Discover the repo's conventions from the repo itself, not from a remembered list.** Read its `CLAUDE.md`/`AGENTS.md`, its lint/format/dependency config, and above all the surrounding code's idiom (naming, structure, comment density). Done once every convention the diff touches is named.
4. **Check out the branch; diff against the MR target.** A merge conflict is surfaced for the human, never resolved silently.
5. **Review.** Run the `/code-review` skill at **high** effort over the diff – it is the bug and quality engine (correctness + reuse/simplification/efficiency). Layer only the repo-independent lenses on top:
   - **duplication / centralization** – flag, then propose; centralization is a judgment call.
   - **naming restraint** – touch only *wrong or misleading* names, and leave taste alone.
   - **fit on the touched path** – a half-applied change, cleanup the diff left behind, or tests that don't cover what it actually changed.

   With a ticket resolved (forward link or reverse-discovered), fetch it read-only and judge **intent**: does the MR actually do what the ticket asked? An intent mismatch is the **highest-stakes finding** – it leads the brief's Decisions (what diverges, ticket-requirement vs diff-behavior evidence, recommendation) rather than sitting in the state line as a flag.
6. **Triage every thread.** Tell **bot** from **human** by author metadata, not a name list. Bucket each:
   - **blocker** – a real defect.
   - **nit** – minor or style.
   - **idea** – a design suggestion; a judgment call.
   - **question** – wants an answer, not code.
   - **noise** – false-positive, already handled, or out of scope.

   Review bots (e.g. CodeRabbit) are **downweighted by default** – a concrete, reproducible defect earns an individual reply + resolve; everything else (noise, already-handled, out-of-scope) rolls into one silent batch-resolve, offered as a single tray item rather than per-comment chatter.
7. **Decide each finding and comment on the apply-vs-propose boundary** (`push-right`). The changes that carry a single correct form here: typos, dead code, formatting/convention/import fixes, and comments pointing at an unambiguous real defect. **Propose** anything that adds or alters control flow – null/undefined guards, early returns, error handling, defaults – *even when verified*, unless the guard is the sole correct fix for a reproduced crash.
8. **Verify differentially** (`push-right`). A fix that passes its own target but reddens anything else is **discarded**, and the finding it came from moves to Decisions. This skill's targets:
   - Scope gates to the change – changed-file lint/typecheck, the relevant test path – and fall back to the full suite when scoping isn't reliable.
   - A UI or user-facing change in a browser repo → reproduce the *specific* change live via **Chrome DevTools MCP** (the exact bug it fixes, or the new behavior) and capture screenshot/console as evidence. MCP unavailable → fall back to the closest automated check (component or e2e test) and name the gap in the brief.
   - Backend, library, or CLI → exercise the real code path (the relevant test, or a scoped repro), not just types.
9. **Draft the outward artifacts** (`push-right`). One reply per thread, plus two optional pieces: a **tightened MR description**, only when the current one is thin, verbose, or merely enumerates the diff; and a **tracker update comment**, e.g. "<noun> reviewed, X and Y addressed, ready for merge". Omit either when it adds nothing.
10. **Assemble the brief and present it at the checkpoint.**

## The Brief

```
## <noun> <sigil><id> · <source-branch> → <target>
state: <N behind/ahead/diverged> · local≡remote? · CI <status> · <K> comments (<by-bucket>)
intent: <✅/⚠️ vs linked ticket, or "no ticket"> – [ticket]

### Decisions            ← the only things to grill
1. <judgment call, phrased as a question>. <who flagged it>. Rec: <recommendation>
   + <one-line evidence/why>. [diff] [comment]
2. …

### Applied (staged locally, not pushed)   ← FYI, auditable, revertable
- <commit subject> – <file:line>  <verification evidence> [diff]

### Comment replies (drafted, not posted)
- <author> @<loc> (<bucket>) → reply drafted [show] · <address via decision N / resolve candidate>

### Ready to ship – pick what posts
[ ] post <K> replies   [ ] resolve <M> threads   [ ] resolve <B> bot threads as noise
[ ] push <P> fix commits   [ ] rebase onto <target> (<N> behind)
[ ] update <noun> description [show]   [ ] post tracker update [show]
```

Two carry conditions gate the tray: rebase or force-push is offered only where the merge-safety check flagged it; the description and tracker updates only where step 9 drafted them.

## After Approval

Safe order for this tray: stage/push commits → post replies → resolve threads (defects first, then the bot-noise batch) → update the description → post the tracker update.

## Degradation

MR not found, the host CLI unauthenticated, the branch won't check out → the brief **states it plainly** and still presents whatever work completed.
