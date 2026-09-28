# Skills

Agent skills I use across my consulting and writing work. Each one is small, opinionated, and earned its place by being reached for more than once.

## Workflows

The four workflow skills below, plus **sevdesk** under Personal and **gate**'s Own Work flow, share one doctrine – work staged behind a single late checkpoint – and load it from **push-right**. Install it alongside any of them.

- **push-right**: Loaded by the workflow skills rather than invoked directly. The shared doctrine they run on: do maximal non-destructive work first, apply only what has a single correct form, verify differentially against a baseline, and hold every irreversible action behind one approval tray.

  ```
  npx skills add johannschopplich/skills/push-right
  ```

- **mr-shepherd**: Take a GitLab MR or GitHub PR – or a ticket, several related MRs, or a stack – to ready-to-ship: review through **gate**, triage comments, stage fixes or teach through inline review drafts, then stop with a grill-ready brief and an approvable tray. Pushes and posts nothing without sign-off.

  ```
  npx skills add johannschopplich/skills/mr-shepherd
  ```

- **ci-triage**: Take one red GitLab or GitHub pipeline to a proven verdict – real regression, flaky, infra, or config – disproving the obvious cause empirically before asserting it, then stage the minimal fix where one applies and stop with a grill-ready brief.

  ```
  npx skills add johannschopplich/skills/ci-triage
  ```

- **dependency-hygiene**: Discover what's drifted, sweep the safe bumps, and land deliberate upgrades or migrations cleanly – breaking changes handled against the installed source, every check green – then stop with a grill-ready brief and an approvable tray. Pushes and opens nothing without sign-off.

  ```
  npx skills add johannschopplich/skills/dependency-hygiene
  ```

- **implement**: Implement a spec, a ticket, or the current conversation test-first – a commit per slice, the branch reviewed through **gate** – then stop with a grill-ready brief. Pushes nothing without sign-off. Needs Matt Pocock's `tdd`.

  ```
  npx skills add johannschopplich/skills/implement
  ```

## Review & Audit

- **gate**: Review a diff or branch in fresh contexts along five axes – standards, spec, comments, tests, correctness – refute every finding, and end on a verdict: ship, fix, or incomplete. On your own branch it applies the fixes with a single correct form, re-gates once, and stops at the marginal benefit (loads **push-right**); a teammate's MR or PR goes through **mr-shepherd**, which runs it, as does **implement**. Builds on Matt Pocock's `code-review` and `tdd`.

  ```
  npx skills add johannschopplich/skills/gate
  ```

- **audit-prompt**: Audit a prompt an app sends to a Claude or OpenAI model API – severity-grouped findings plus a revised prompt. When a new model ships, re-check its version-pinned facts against the live vendor guides with [`scripts/audit-vs-guides.js`](scripts/audit-vs-guides.js), a Claude Code workflow script.

  ```
  npx skills add johannschopplich/skills/audit-prompt
  ```

- **audit-skill**: Audit a `SKILL.md` against loading, discoverability, and style rules, then produce a severity-grouped report.

  ```
  npx skills add johannschopplich/skills/audit-skill
  ```

## Writing

- **writing-for-developers**: Draft, rewrite, or review developer-facing copy in my voice: issue replies, review comments, Slack and tracker notes, PR descriptions, commit subjects, READMEs, and doc pages – German calques rewritten from the meaning.

  ```
  npx skills add johannschopplich/skills/writing-for-developers
  ```

## Design

- **generate-tailwind-shades**: Generate or re-tune Tailwind v4 OKLCH palettes (shades 50–950) anchored at shade 500, with a comparison page against the current palette and the nearest Tailwind palette.

  ```
  npx skills add johannschopplich/skills/generate-tailwind-shades
  ```

## Integrations

- **asana-formatting**: Stop Asana MCP writes from coming out as plain text or 400ing. Force the HTML field, the `<body>` wrapper, and the schema's tag whitelist.

  ```
  npx skills add johannschopplich/skills/asana-formatting
  ```

## Personal

Built for my own machine and archive layout. Published as a reference rather than something to install: it assumes specific hardware and my folder conventions, so it will misfire elsewhere.

- **footage-ingest**: Ingest a camera card into a multi-drive footage archive. Finds material that exists in only one place and copies that first, settles every routing decision with the user before writing, then gates each copy on file count and total bytes.

- **sevdesk**: Book, correct, and audit sevDesk vouchers through the API behind one approval tray (loads **push-right**). Carries the German VAT rules for selling via merchants of record and buying software abroad, plus what the sevDesk OpenAPI spec leaves out: the report endpoints, payment signs, and the refund booking that keeps the payables account balanced.
