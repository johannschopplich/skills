---
name: cross-review
description: "Two independent perspectives on one artifact: launch Claude CLI and Codex CLI in parallel → merge findings by agreement, divergence, contradictions. Use when user wants a triangulated review or to cross-check a plan across model families."
disable-model-invocation: true
argument-hint: "[optional focus]"
---

# Cross-Review

**Core principle**: divergence is the signal. Symmetric prompts and inline reduction make it interpretable.

## Workflow

1. **Compose the task spec.** Read the current conversation for the artifact under discussion. Build a self-contained brief – workers receive zero conversation history. If args were passed to `/cross-review`, fold them in as the `FOCUS` line of the worker prompt below.

2. **Spin up both workers in parallel.** Single host message, two `Bash` calls – one per worker invocation below.

3. **Collect both outputs.** Read `/tmp/cross-review-claude-$$.txt` and `/tmp/cross-review-codex-$$.txt`. If one is empty, errored, or does not fit the finding-list shape, treat that worker as failed and apply the Failure handling section.

4. **Reduce inline.** Merge both finding-lists using the output template below. Do not spawn a third worker for synthesis – the host has the conversation context that makes it the natural arbiter.

5. **Clean up.** `rm -f /tmp/cross-review-*-$$.txt`.

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

## Worker invocations

Claude:

```bash
claude -p "$WORKER_PROMPT" \
  --model opus --effort xhigh \
  --permission-mode auto \
  --add-dir /tmp \
  --no-session-persistence \
  --output-format text \
  > /tmp/cross-review-claude-$$.txt \
  < /dev/null
```

Codex:

```bash
codex exec \
  -m gpt-5.5 -c model_reasoning_effort="medium" \
  --sandbox workspace-write \
  -c 'sandbox_workspace_write.network_access=true' \
  -c tools.web_search=true \
  --cd "$PWD" --color never \
  --output-last-message /tmp/cross-review-codex-$$.txt \
  --skip-git-repo-check \
  "$WORKER_PROMPT" \
  < /dev/null
```

`--permission-mode auto` and `--sandbox workspace-write` are the equivalent classifier/sandbox layers: both allow local ops in project scope, both let prompt-level rules enforce no-cwd-edit. `network_access=true` enables outbound network inside the codex sandbox.

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

- **On worker auth error**: report the error verbatim, mark that side as failed, continue with the survivor. Do not attempt to log in.
- **Stdin redirect is non-negotiable.** Every worker invocation ends in `< /dev/null`. Without it, both CLIs hang on stdin reads.
- **Both workers get the same prompt.** No tailoring per engine.
- **Workers do not modify the working directory.** Enforcement is via the prompt's no-edit clause; neither auto mode nor `workspace-write` blocks cwd writes.

## Failure handling

If one worker errors, times out, or returns output that does not fit the finding-list shape:

- Continue with the surviving worker.
- Render the output template with the failed worker's section as `(N/A – <worker> failed: <one-line reason>)`.
- `Direct contradictions` becomes `(N/A – single-engine review, no cross-check)`.
- `Synthesis` opens with: _Treat findings as un-triangulated; only one engine ran._
- Quote the failed worker's verbatim error at the top of the output.
