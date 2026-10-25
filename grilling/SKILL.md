---
name: grilling
description: Grill the user relentlessly about a plan, decision, or idea. Use when the user wants to stress-test their thinking, or uses any 'grill' trigger phrases.
argument-hint: "[docs]"
---

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

## Map

Keep the tree in `$TMPDIR/grill-<topic>.md`, the session's record: add each node as it appears, write each answer in as it lands, and reread the file after a compaction. Tag every node before it reaches a round:

- `fact` – the environment holds the answer or a probe shows it.
- `assume` – one answer is right whatever the user's taste: implementation inside an agreed design, test design, cleanup, keeping or cutting a comment, commit splitting, verification setup, your own orchestration.
- `ask` – scope and any new artifact; behavior a user of the product sees; taste and voice; people and ticket-owned calls; when anything ships or is posted; facts only the user holds.

## Settle

Finding _facts_ is your job, never the user's. Dispatch sub-agents for the `fact` nodes, one per topic; probes run as scratch under `$TMPDIR`. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The user's premises are `fact` nodes too; one the environment contradicts becomes an `ask` node, its evidence in the question.

## Rounds

The _decisions_ are the user's: put each to them and wait. Work the `ask` nodes in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question, make it stand on its own, and give your recommended answer, leaning to less: the smallest option and no new artifact. Word each question so "yes" accepts the recommendation.

Under the questions, list the `assume` nodes whose branch is settled, one line each. They stand unless vetoed; a vetoed line becomes an `ask` node.

Format a round like so:

```
❓ **Q1** – **<question title>**: <context and the evidence that tips it, then the options>

➡️ <your recommended answer>

---

❓ **Q2** – **<question title>**: <context and the evidence that tips it, then the options>

➡️ <your recommended answer>

---

**Assumed** – veto by number:
- A1 <assumption>
```

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round; an unanswered question stays on the frontier. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one. A tree with no `ask` node left gets one closing round: the remaining assumed lines and the plan they add up to.

The session is done when the frontier is empty: every branch of the design tree visited, every assumption shown as a line. Do not act on it; when the tree ends in a build, the closing round offers `/implement $TMPDIR/grill-<topic>.md` as the user's reply.

## Docs

Under `docs`, call the Skill tool with "domain-modeling".
