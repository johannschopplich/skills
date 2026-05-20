---
name: cross-review
description: "Two independent perspectives on one artifact: spin up a Claude subagent and codex CLI in parallel → merge findings by agreement, divergence, contradictions. Use when user wants a triangulated review or to cross-check a plan across model families."
disable-model-invocation: true
argument-hint: "[optional focus]"
---

# Cross-Review

**Core principle**: divergence is the signal. Symmetric prompts and inline reduction make it interpretable.

## Workflow

1. **Compose the task spec.** Read the current conversation for the artifact under discussion. Build a self-contained brief – workers receive zero conversation history. If args were passed to `/cross-review`, fold them in as the `FOCUS` line of the worker prompt below.

2. **Spin up both workers in parallel.** Single assistant message, two tool calls:
   - `Agent` tool – `subagent_type: general-purpose`, prompt = filled worker template.
   - `Bash` tool – the codex command below, prompt = the same filled worker template.

3. **Collect both outputs.** Read the Agent tool result and the codex `--output-last-message` file. If one worker errored or returned output that does not fit the finding-list shape, treat that worker as failed and apply the Failure handling section.

4. **Reduce inline.** The main agent merges both finding-lists using the output template below. Do not spawn a third subagent for synthesis – the main agent has the conversation context that makes it the natural arbiter.

5. **Clean up.** `rm -f /tmp/cross-review-codex-$$.txt`.

## Worker prompt template

Both workers receive the same text. Asymmetric prompts corrupt the comparison.

```
TASK: <one-line evaluation goal>

ARTIFACT:
<paste code / list file paths / state the question>

FOCUS (optional, from /cross-review args): <refinement>

OUTPUT REQUIREMENTS
- Return a flat list of findings, one per line.
- Each line: `[critical|important|nit] <finding> – <1-line rationale>`.
- No preamble, no headers, no closing summary.
- You are evaluating, not editing. Do not modify files in the working directory. Use /tmp for scratch work (reference clones, downloads, test runs).
- Web search and shell-level network are available; clone reference repos, install deps, or curl upstream sources when useful.
```

## Codex invocation

```bash
codex exec \
  -m gpt-5.5 \
  -c model_reasoning_effort="medium" \
  --sandbox workspace-write \
  -c 'sandbox_workspace_write.network_access=true' \
  --cd "$PWD" \
  --color never \
  --output-last-message /tmp/cross-review-codex-$$.txt \
  --skip-git-repo-check \
  -c tools.web_search=true \
  "$WORKER_PROMPT" \
  < /dev/null
```

`network_access=true` enables outbound network (clones, deps, curl) inside the filesystem sandbox.

## Output template

```
## Both flagged
- [severity] <finding> – <rationale>

## Only Claude
- [severity] <finding> – <rationale>

## Only codex
- [severity] <finding> – <rationale>

## Direct contradictions
- <topic>: Claude says X; codex says Y.

## Synthesis
<what to act on first, what to investigate further, what to ignore>
```

Empty sections are kept and left blank. Their emptiness is signal.

When both workers flag the same finding at different severities, render both tags pipe-separated, Claude first (e.g., `[critical|important]`). Same severity collapses to a single tag.

## Hard rules

- **On codex auth error**: report the codex error verbatim, mark the codex side as failed, continue with the Claude survivor. Do not attempt to log in.
- **Stdin redirect is non-negotiable.** Every `codex exec` invocation ends in `< /dev/null`. Without it, codex hangs on stdin reads.
- **Both workers get the same prompt.** No tailoring per engine.
- **Workers do not modify the working directory.** Enforcement is via the prompt's no-edit clause; the sandbox does not block writes to cwd.

## Failure handling

If one worker errors, times out, or returns output that does not fit the finding-list shape:

- Continue with the surviving worker.
- Render the output template with the failed worker's section as `(N/A – <worker> failed: <one-line reason>)`.
- `Direct contradictions` becomes `(N/A – single-engine review, no cross-check)`.
- `Synthesis` opens with: _Treat findings as un-triangulated; only one engine ran._
- Quote the failed worker's verbatim error at the top of the output.
