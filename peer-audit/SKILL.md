---
name: peer-audit
description: Runs evidence-bearing audits with a Claude and a GPT worker in parallel, then synthesizes agreement, divergence, and contradictions.
disable-model-invocation: true
argument-hint: "[optional focus]"
---

# Peer Audit

**Core principle**: divergence is the signal.

## Steps

1. **Compose one self-contained worker prompt.** Include the goal, complete artifact or absolute artifact paths, and optional `/peer-audit` focus. Create a temporary run directory, note its path, and write the prompt to `prompt.txt`. This step is complete when either worker can evaluate the artifact without conversation history.

2. **Launch both model slots in parallel, in the background** – foreground shells may cap command runtime below the slot budget. Run:

   ```bash
   "<skill-dir>/scripts/run-worker.sh" claude \
     "<run-dir>/prompt.txt" "<run-dir>/claude.result" "<project-dir>"
   ```

   ```bash
   "<skill-dir>/scripts/run-worker.sh" gpt \
     "<run-dir>/prompt.txt" "<run-dir>/gpt.result" "<project-dir>"
   ```

   This step is complete when both commands exit.

3. **Collect both envelopes.** Read `claude.result` and `gpt.result`. Envelope headers name each slot's model and transport; a successful body follows the `---` separator; a failed envelope records its reason. This step is complete when each model slot has findings or one terminal failure reason.

4. **Reduce inline** – the host holds the conversation context the workers never saw, which makes it the arbiter. Apply the output template and merge rules below. This step is complete when every valid finding is classified once and every failure is disclosed.

5. **Clean the run.** Delete only the run directory noted in step 1.

## Worker prompt

```text
TASK: <one-line evaluation goal>

ARTIFACT:
<paste the artifact or provide absolute paths>

FOCUS: <optional refinement, or "none">

CONTRACT
- Evaluate the artifact; do not edit it.
- Treat the project directory as read-only. Put clones, downloads, generated files, and test artifacts only in the current working directory.
- Use shell and network access when they produce concrete evidence.
- Return one finding per line as: `[critical|important|nit] <finding including impact> | evidence: <concrete file:line, quote, command result, or stated premise>`.
- For a clean audit, return exactly: `NO_FINDINGS | evidence: checked <what was checked and why it passed>`.
- Return no preamble, headings, blank lines, code fences, or closing summary.
```

## Runner contract

- The Claude slot runs on native Claude CLI; the GPT slot runs on native Codex CLI. Each envelope names the model that ran in its `model:` header.
- A missing native executable, nonzero native exit, or malformed native result retries the same model slot through Copilot CLI when installed. A Copilot fallback runs the same base model through a different agent harness.
- Each slot has one budget – default 15 minutes, `PEER_AUDIT_TIMEOUT_SECONDS` – covering the native attempt and any fallback; timeout is terminal. Missing credentials are reported; no login is attempted.
- Workers have shell, network, and project access. Filesystem non-editing is prompt-enforced, not sandbox-enforced. Use this skill only with trusted artifacts and projects.

## Output

```markdown
Transport: <include only model slots that used Copilot fallback>

## Both flagged
- [severity] <finding> - <evidence>

## Only <Claude slot model>
- [severity] <finding> - <evidence>

## Only <GPT slot model>
- [severity] <finding> - <evidence>

## Direct contradictions
- <topic>: <Claude slot model> says X; <GPT slot model> says Y.

## Synthesis
<what to act on first, what needs investigation, and what to ignore>
```

## Merge rules

- Render section labels with each slot's model name from its envelope `model:` header.
- Keep empty sections blank; emptiness is signal. A `NO_FINDINGS` result contributes no bullet.
- When both models flag the same finding at different severities, render both tags pipe-separated with the Claude slot first. Collapse matching severities.
- If one slot fails, mark its model-only section `(N/A - <model> failed: <reason>)`, mark contradictions `(N/A - single-model audit, no peer verification)`, and open synthesis with: _Treat findings as untriangulated; only one model ran._
- If both slots fail, mark both model-only sections with their reasons, mark contradictions `(N/A - both models failed)`, and open synthesis with: _Audit unavailable; neither model produced a valid result._
- Report fallback once as `Transport: <model> via Copilot fallback (<native failure reason>)`; keep section labels model-based.
