# Checkpoint Execution

Reached from [`push-right`](SKILL.md) once the human has picked items from the tray.

Execute only the items the human checked, in the safe order the invoking skill names – code before commentary, so nothing gets announced that isn't in place.

Before any **irreversible** action, re-run that action's safety check **at execution time** rather than trusting the brief's read: the remote branch still points at the SHA the brief read (after a checked rebase, push with `git push --force-with-lease=<branch>:<that sha>`; otherwise a push that would be non-fast-forward aborts), and the target is still in the state the brief described (for a pipeline: not superseded, retried, or already green). A stale read aborts that item and reports it. Items that depend on it abort with it – a reply citing an aborted push, a tracker update announcing it. The rest of the tray still runs.

Close with a terse confirmation: what happened, with links; the refreshed state line; and any item that **failed** – reported, never swallowed.
