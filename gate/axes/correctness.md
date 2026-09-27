# Correctness Axis

Red-team the diff: try to break the changed code on every path it reaches. Done when every changed behavior has an old-vs-new line and every changed export's call sites are checked.

- **Old vs new.** For each changed behavior, what happened before and what happens now; a difference nobody asked for is a finding.
- **Callers.** For each changed export, signature, or shared state, check that every call site still holds.
- **Edges.** Empty, missing, and malformed input; concurrent and repeated calls; cleanup, teardown, and error paths; locale, timezone, and platform differences.
- **Integration.** Where the change leans on library or framework behavior, read the installed source in `node_modules` or the vendor directory before trusting it.

Run what is cheap and read-only toward the repo: an existing test, a scoped script in `$TMPDIR`, a request against a local server already running. Where `context` names an external author, read instead of running – their code is untrusted. Push each finding's `proof` as far as that allows.
