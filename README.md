# Skills

Agent skills I use across my consulting and writing work. Each one is small, opinionated, and earned its place by being reached for more than once.

## Workflows

The three workflow skills below share one doctrine – work staged behind a single late checkpoint – and load it from **push-right**. Install it alongside any of them.

- **push-right**: Loaded by the three below rather than invoked directly. The shared doctrine they run on: do maximal non-destructive work first, apply only what has a single correct form, verify differentially against a baseline, and hold every irreversible action behind one approval tray.

  ```
  npx skills add johannschopplich/skills/push-right
  ```

- **mr-shepherd**: Take one GitLab MR or GitHub PR to ready-to-ship – review, triage comments, stage safe fixes, draft replies – then stop with a grill-ready brief and an approvable tray. Pushes and posts nothing without sign-off.

  ```
  npx skills add johannschopplich/skills/mr-shepherd
  ```

- **ci-triage**: Take one red GitLab or GitHub pipeline to a proven verdict – real regression, flaky, infra, or config – disproving the obvious cause empirically before asserting it, then stage the minimal fix where one applies and stop with a grill-ready brief.

  ```
  npx skills add johannschopplich/skills/ci-triage
  ```

- **dependency-hygiene**: Discover what's drifted, sweep the safe bumps, and land deliberate upgrades or migrations cleanly – breaking changes handled against the installed source, every gate green – then stop with a grill-ready brief and an approvable tray. Pushes and opens nothing without sign-off.

  ```
  npx skills add johannschopplich/skills/dependency-hygiene
  ```

## Review & Audit

- **audit-prompt**: Review and revise prompts written for modern thinking-capable LLMs, applying current best practices.

  ```
  npx skills add johannschopplich/skills/audit-prompt
  ```

- **audit-skill**: Audit a `SKILL.md` against loading, discoverability, and style rules, then produce a severity-grouped report.

  ```
  npx skills add johannschopplich/skills/audit-skill
  ```

- **peer-audit**: Run a Claude and a GPT worker in parallel on the same artifact, then merge evidence-bearing findings by agreement, divergence, and direct contradiction. Prefers native Claude/Codex CLIs and falls back per model to Copilot CLI.

  ```
  npx skills add johannschopplich/skills/peer-audit
  ```

## Writing

- **writing-for-developers**: Draft, rewrite, or review developer-facing copy in my voice: GitHub/GitLab replies, PR descriptions, commit subjects, READMEs, and doc pages.

  ```
  npx skills add johannschopplich/skills/writing-for-developers
  ```

## Design

- **generate-tailwind-shades**: Generate a full Tailwind v4 OKLCH palette (shades 50–950) from a single hex or OKLCH brand color, anchored at shade 500.

  ```
  npx skills add johannschopplich/skills/generate-tailwind-shades
  ```

## Integrations

- **asana-formatting**: Stops Asana MCP writes from coming out as plain text or 400ing. Forces the HTML field, the `<body>` wrapper, and the schema's tag whitelist.

  ```
  npx skills add johannschopplich/skills/asana-formatting
  ```

## Personal

Built for my own machine and archive layout. Published as a reference rather than something to install: it assumes specific hardware and my folder conventions, so it will misfire elsewhere.

- **footage-ingest**: Ingest a camera card into a multi-drive footage archive. Finds material that exists in only one place and copies that first, settles every routing decision with the human before writing, then gates each copy on file count and total bytes.
