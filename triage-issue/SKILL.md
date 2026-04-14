---
name: triage-issue
description: Triage a bug or issue by exploring the codebase to find its root cause and print a diagnosis. Use when user reports a bug, mentions "triage", or wants to investigate a problem before deciding how to fix it.
---

# Triage Issue

Investigate a reported problem, find its root cause, and print a clear diagnosis. This is a mostly hands-off workflow – minimize questions to the user.

## Process

### 1. Capture the problem

Get a brief description of the issue from the user. If they haven't provided one, ask ONE question: "What's the problem you're seeing?"

Do not ask follow-up questions yet. Start investigating immediately.

### 2. Explore and diagnose

Use the Agent tool with subagent_type=Explore to deeply investigate the codebase. Your goal is to find:

- **Where** the bug manifests (entry points, UI, API responses)
- **What** code path is involved (trace the flow)
- **Why** it fails (the root cause, not just the symptom)
- **What** related code exists (similar patterns, tests, adjacent modules)

Look at:
- Related source files and their dependencies
- Existing tests (what's tested, what's missing)
- Recent changes to affected files (`git log` on relevant files)
- Error handling in the code path
- Similar patterns elsewhere in the codebase that work correctly

### 3. Classify

Based on your investigation, determine:

- Whether this is a regression, missing feature, or design flaw
- The severity and scope of impact
- Which modules/contracts are affected

### 4. Print diagnosis

Print the findings using this template.

<diagnosis-template>

## Problem

- **Actual behavior**: What happens now
- **Expected behavior**: What should happen
- **Reproduction**: Steps or conditions to trigger the bug (if applicable)

## Root Cause

What you found during investigation:
- The module/contract involved
- Why the current behavior is wrong
- Any contributing factors

Do not include specific file paths, line numbers, or implementation details that couple to current code layout. Describe modules, behaviors, and contracts instead. The diagnosis should remain useful even after major refactors.

## Scope & Severity

- What's affected (which user flows, APIs, edge cases)
- How severe (data loss, incorrect output, cosmetic, etc.)
- Whether existing tests cover this area

## Fix Direction

One or two sentences on the minimal change needed to fix the root cause. Not a plan – just the direction. If this warrants a TDD approach, say so and the user can invoke the TDD skill separately.

</diagnosis-template>
