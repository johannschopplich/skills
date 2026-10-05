---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
argument-hint: "[docs]"
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

## Map

Before your first message to the user, write the whole tree to `$TMPDIR/grill-<topic>.md`, down to its leaves. Beneath a decision still open, follow the branch your recommendation picks and mark it provisional. Tag every leaf:

- `fact` – the environment holds the answer or a run shows it: files, docs, a command, a probe, a throwaway prototype.
- `assume` – one answer is right whatever the user's taste: implementation inside an agreed design, test design, cleanup, keeping or cutting a comment, commit splitting, verification setup, your own orchestration.
- `ask` – scope and any new artifact; behavior a user of the product sees; taste and voice; people and ticket-owned calls; the timing of a push, merge, release, or anything posted; facts only the user holds.

Mapped when every leaf carries a tag. The file is the session's record: write each answer into it as it lands, and reread it after a compaction.

## Settle

Finding _facts_ is your job, never the user's. Dispatch sub-agents for the `fact` leaves, one per topic; probes stay local and reversible – scratch files under `$TMPDIR`, nothing committed or posted. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. An answer that contradicts the user's premise becomes an `ask` leaf, its evidence in the question.

## Rounds

The _decisions_ are the user's: put each to them and wait. Work the `ask` leaves in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask up to six of them per round; the rest wait for the next. Number each question and give your recommended answer, leaning to less: the smallest option and no new artifact. Each question stands on its own: one line of context and the evidence that tips it, then the options; the rest stays in the tree file.

Under the questions, list the `assume` leaves the round settles, one line each – only those whose branch is settled, never one below a question still open. They stand unless the user vetoes one by number; a vetoed line becomes an `ask` leaf.

Format a round like so:

```
❓ **Q1** – **<question title>**: <context and the evidence that tips it, then the options>

➡️ <your recommended answer>

---

❓ **Q2** – **<question title>**: <context and the evidence that tips it, then the options>

➡️ <your recommended answer>

---

**Assumed** – veto by number:
- A1 <assumption> – <why it has one right answer>
```

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one. A tree with no `ask` leaf left gets one closing round: the assumed lines and the plan they add up to.

The session is done when the frontier is empty: every branch of the design tree visited, nothing assumed that the user hasn't seen as a line. Do not act on it until the user confirms you have reached a shared understanding.

## Docs

Under `docs`, call the Skill tool with "domain-modeling" and write the glossary and ADRs as you go. Without it, name the terms and decisions worth recording in the closing round.
