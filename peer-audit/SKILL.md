---
name: peer-audit
description: Runs evidence-bearing audits with Claude Opus 4.8 and GPT-5.6 Sol, then synthesizes agreement, divergence, and contradictions.
disable-model-invocation: true
argument-hint: "[optional focus]"
---

# Peer Audit

**Core principle**: divergence is the signal.

**Prompt parity** means both model slots receive the same worker prompt and output contract. A Copilot fallback uses the same base model through a different agent harness, which must be disclosed.

## Completion criteria

- Both model slots contain a valid result envelope or a terminal failure.
- Every valid finding appears once under agreement, model-only divergence, or direct contradiction.
- Every Copilot fallback is disclosed by model.
- The temporary run directory is deleted.

## Steps

1. **Compose one self-contained worker prompt.** Include the goal, complete artifact or absolute artifact paths, and optional `/peer-audit` focus. Create a temporary run directory and write the prompt to `prompt.txt`. This step is complete when either worker can evaluate the artifact without conversation history.

2. **Launch both model slots in parallel.** In one host message, run:

   ```bash
   "<skill-dir>/scripts/run-worker.sh" claude \
     "<run-dir>/prompt.txt" "<run-dir>/claude.result" "<project-dir>"
   ```

   ```bash
   "<skill-dir>/scripts/run-worker.sh" gpt \
     "<run-dir>/prompt.txt" "<run-dir>/gpt.result" "<project-dir>"
   ```

   Each command has one 15-minute budget covering its native attempt and any fallback. This step is complete when both commands exit.

3. **Collect both envelopes.** Read `claude.result` and `gpt.result`. A successful body follows the `---` separator; a failed envelope records its reason. This step is complete when each model slot has findings or one terminal failure reason.

4. **Reduce inline.** Apply the output template and merge rules below. This step is complete when every valid finding is classified once and every failure or fallback is disclosed.

5. **Clean the run.** Delete only the recorded temporary run directory.

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

- Native Claude CLI runs Claude Opus 4.8 at `xhigh`; native Codex CLI runs GPT-5.6 Sol at `high`.
- A missing native executable, nonzero native exit, or malformed native result retries the same model slot through Copilot CLI when installed.
- The 15-minute slot timeout is terminal. Missing credentials are reported; no login is attempted.
- Workers have shell, network, and project access. Filesystem non-editing is prompt-enforced, not sandbox-enforced. Use this skill only with trusted artifacts and projects.

## Output

```markdown
Transport: <include only model slots that used Copilot fallback>

## Both flagged
- [severity] <finding> - <evidence>

## Only Claude Opus 4.8
- [severity] <finding> - <evidence>

## Only GPT-5.6 Sol
- [severity] <finding> - <evidence>

## Direct contradictions
- <topic>: Claude Opus 4.8 says X; GPT-5.6 Sol says Y.

## Synthesis
<what to act on first, what needs investigation, and what to ignore>
```

## Merge rules

- Keep empty sections blank; emptiness is signal. A `NO_FINDINGS` result contributes no bullet.
- When both models flag the same finding at different severities, render both tags pipe-separated with Claude first. Collapse matching severities.
- If one slot fails, mark its model-only section `(N/A - <model> failed: <reason>)`, mark contradictions `(N/A - single-model audit, no peer verification)`, and open synthesis with: _Treat findings as untriangulated; only one model ran._
- If both slots fail, mark both model-only sections with their reasons, mark contradictions `(N/A - both models failed)`, and open synthesis with: _Audit unavailable; neither model produced a valid result._
- Report fallback once as `Transport: <model> via Copilot fallback (<native failure reason>)`; keep section labels model-based.
