---
name: write-dev-copy
description: Draft, rewrite, or review developer-facing written copy in Johann's voice. Use when writing GitHub or GitLab replies, PR/MR descriptions, release notes, commit messages, or technical docs.
---

# Write Dev Copy

See [REFERENCE.md](REFERENCE.md) for voice patterns and per-scope rules.

## Process

1. **Read** the full context – the issue, PR/MR, prior comments, branch diff, or existing doc – before drafting.
2. **When responding to a reporter:** if you don't have their specific evidence (config, error message, repro steps, exact symptom), ask for it instead of drafting.
3. **When drafting an MR/PR description:** decide on the intent first (what the MR does and why), then group changes by logical unit. Do not mirror the diff structure. See REFERENCE.md's "Writing MR/PR Descriptions" section.
4. **Draft** following the voice patterns in [REFERENCE.md](REFERENCE.md).
5. **Review** against the checklist below before posting.

## Review Checklist

- [ ] Voice matches: concise by default, reasoning only when the topic demands it
- [ ] For replies: thanks-first for contributions, never apologetic when declining
- [ ] For MR/PR descriptions: leads with intent; aggregates by logical unit; no file-by-file enumeration
- [ ] En dashes with spaces ( – ), zero em dashes (—), zero italic single-word emphasis
- [ ] Zero fabricated symbols: every config key, type name, env var, API shape comes from the source material (the reporter's message, the branch, the existing doc)
- [ ] Would a competent peer write this? If the opening line could begin a Stack Overflow answer, rewrite it.
