## Git

- Commit each verified change yourself on the current branch; a **Needs you** choice, implemented as its recommendation, gets a commit of its own.
- A push waits for my go, except to your own feature branch already on the remote.
- After your push, or a merge I mention, watch its pipeline in the background. Push the fix for a red job your push caused unasked, unless it changes behavior; report any other red job with its cause.
- Commit with `git commit -- <paths>`, naming each file.
- A fix to an unpushed commit is a `--fixup`, folded with `git rebase --autosquash --keep-base` before you report.
- Take back a push of yours by dropping it and force-pushing with lease.
- Name commits by hash.
- Fetch before branching or comparing against a remote branch.
- Work in the checkout; a worktree only when I or a skill asks.
- Commit messages: subject only, Conventional Commits, English; one theme per commit, `fix` only for code.

## Verification

- Verify your work yourself – a CLI, the tests, the app in a browser. This standing ask covers browser and preview tools.
- A subagent's report is a claim: check its load-bearing facts at the cited file:line before building on them.

## Output

- Use a spaced en dash (–), never an em dash (—), everywhere but code string literals.
- In the main session, a turn that did work ends on **Needs you** (`Q1 a/b`: the problem in plain words, then a recommendation), **Done**, **Waiting on**, **Next** (every open step toward the session's goal), one line per item in plain words, without paths. Empty sections are left out; all empty → `Nothing open.` The newest list supersedes earlier ones, across compaction too.
- A recommendation takes the clean end state now – rename or delete outright – whatever the token cost or churn.
