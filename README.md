# Skills

Agent skills I use across my consulting and writing work. Each one is small, opinionated, and earned its place by being reached for more than once.

## Integrations

- **asana-formatting**: Stops Asana MCP writes from coming out as plain text or 400ing. Forces the HTML field, the `<body>` wrapper, and the schema's tag whitelist.

  ```
  npx skills add johannschopplich/skills/asana-formatting
  ```

## Review & Audit

- **review-mr**: Deep review of a GitLab MR or GitHub PR against the local codebase. Produces a prioritized must/should/nit punch list.

  ```
  npx skills add johannschopplich/skills/review-mr
  ```

- **audit-prompt**: Review and revise prompts written for modern thinking-capable LLMs, applying current best practices.

  ```
  npx skills add johannschopplich/skills/audit-prompt
  ```

- **audit-skill**: Audit a `SKILL.md` against loading, discoverability, and style rules, then produce a severity-grouped report.

  ```
  npx skills add johannschopplich/skills/audit-skill
  ```

- **cross-review**: Spin up a Claude subagent and the codex CLI in parallel on the same artifact, then merge their findings into one report grouped by agreement, divergence, and direct contradictions.

  ```
  npx skills add johannschopplich/skills/cross-review
  ```

## Writing

- **write-dev-copy**: Draft, rewrite, or review developer-facing copy in my voice: GitHub/GitLab replies, PR descriptions, release notes, commit messages, technical docs.

  ```
  npx skills add johannschopplich/skills/write-dev-copy
  ```

- **edit-an-article**: Edit, rewrite, or draft articles, project descriptions, and personal essays in my voice for [johannschopplich.com](https://johannschopplich.com).

  ```
  npx skills add johannschopplich/skills/edit-an-article
  ```
