# Spec Axis

Judge whether the diff does what its spec asked. The spec is the file or ticket on the `Spec:` line of your prompt; read it in full, including its comments. Done when every requirement in the spec has a verdict: met, missing, or wrong.

Report, quoting the spec line for each finding:

- **Missing** – a requirement the diff leaves out or only half does.
- **Unasked** – behavior nobody asked for (scope creep), including refactors outside the ticket's path.
- **Wrong** – a requirement that looks implemented but behaves differently from what the spec says.

Product and design choices the ticket shows as accepted by a PM or designer are settled: name a doubt about them in one line in `note`, prefixed `PM:`, never as a code finding.

With `none` on the `Spec:` line of your prompt, return no findings and the note `no spec`.
