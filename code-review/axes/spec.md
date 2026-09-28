# Spec Axis

Judge whether the diff does what its spec asked. The spec is the file or ticket on the `Spec:` line of your prompt; read it in full, comments included. Done when every requirement has a verdict: met, missing, or wrong.

Report:

- **Missing** – a requirement the diff leaves out or only half does.
- **Unasked** – behavior nobody asked for, including refactors outside the ticket's path.
- **Wrong** – a requirement that looks implemented but behaves differently from the spec.

Product and design choices the ticket shows as accepted by a PM or designer are settled: a doubt about one goes in `note` as one line prefixed `PM:`, never as a finding.

With `Spec: none`, return no findings and the note `no spec`.
