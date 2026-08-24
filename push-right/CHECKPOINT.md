# Checkpoint Execution

Reached from [`push-right`](SKILL.md) once the human has picked items from the tray.

Nothing on the tray happens until the human checks that specific item.

Execute **only** the checked items, in the safe order the invoking skill names – code before commentary, so nothing gets announced that isn't in place.

Before any **irreversible** action, re-run that action's safety check **at execution time** rather than trusting the brief's read: the remote hasn't moved (the push would be non-fast-forward), and the target is still the one the brief described (not superseded, retried, or already green). A stale read aborts that item and reports it; the rest of the tray still runs.

Close with a terse confirmation: what happened, with links; the refreshed state line; and any item that **failed** – reported, never swallowed.
