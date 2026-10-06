# Checkpoint Execution

Execute only the picked items, in the invoking skill's safe order – code before commentary.

Before each **irreversible** action, re-run its safety check **at execution time** rather than trusting the brief's read:

- The remote branch still points at the SHA the brief read. After a picked rebase, push with `git push --force-with-lease=<branch>:<that sha>`; otherwise a plain push.
- The target is still in the state the brief described (a pipeline: not superseded, retried, or already green).

A stale read aborts that item and every item depending on it (a reply citing the aborted push, a tracker update announcing it); the rest of the tray still runs.

Close: the refreshed state line, **Done** with links, each **failed** item as `✗`.
