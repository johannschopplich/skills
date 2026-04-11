---
name: write-dev-copy
description: Draft, rewrite, or review developer-facing written copy in Johann's maintainer voice – firm gatekeeper, concise, scope-protecting, technical, peer-to-peer. Use when writing GitHub or GitLab replies, PR descriptions, release notes, commit messages, or technical docs.
---

# Write Dev Copy

Draft, rewrite, or review developer-facing written copy in Johann's maintainer voice – **warm gatekeeper, concise, scope-protecting, technically precise, peer-to-peer**. Thanks first, declines second, always with a reason and usually with an alternative. Short for decisions, longer only when explaining technical reasoning. For voice patterns and examples, see **[STYLE-REFERENCE.md](STYLE-REFERENCE.md)**.

## Workflow

1. **Read** the full context – the issue, PR/MR, prior comments, branch diff, or existing doc – before drafting.
2. **When responding to a reporter:** if you don't have their specific evidence (config, error message, repro steps, exact symptom), ask for it instead of drafting. Generic replies built on textbook knowledge read as AI-shaped and land badly. This rule only applies to replies – PR descriptions, release notes, and commit messages don't need it because the source material is already in front of you.
3. **Draft** following the voice patterns in [STYLE-REFERENCE.md](STYLE-REFERENCE.md).
4. **Review** against the checklist below before posting.

## Review Checklist

- [ ] Voice matches: thanks-first for contributions, short for decisions, reasoning only when the topic demands it
- [ ] En dashes with spaces ( – ), zero em dashes (—), zero italic single-word emphasis
- [ ] Zero fabricated symbols: every config key, type name, env var, API shape comes from the source material (the reporter's message, the branch, the existing doc)
- [ ] Would a competent peer write this? If the opening line could begin a Stack Overflow answer, rewrite it.
