#!/usr/bin/env bash

set -u
set -o pipefail

usage() {
  echo "Usage: run-worker.sh <claude|gpt> <prompt-file> <result-file> <project-dir>" >&2
  exit 2
}

[[ $# -eq 4 ]] || usage

MODEL_KIND=$1
PROMPT_FILE=$2
RESULT_FILE=$3
PROJECT_DIR=$4

[[ -f "$PROMPT_FILE" ]] || {
  echo "Prompt file not found: $PROMPT_FILE" >&2
  exit 2
}
[[ -d "$PROJECT_DIR" ]] || {
  echo "Project directory not found: $PROJECT_DIR" >&2
  exit 2
}
[[ -d "$(dirname "$RESULT_FILE")" ]] || {
  echo "Result directory not found: $(dirname "$RESULT_FILE")" >&2
  exit 2
}

PROJECT_DIR=$(cd "$PROJECT_DIR" && pwd -P)
PROMPT_FILE=$(cd "$(dirname "$PROMPT_FILE")" && printf '%s/%s\n' "$PWD" "$(basename "$PROMPT_FILE")")
RESULT_FILE=$(cd "$(dirname "$RESULT_FILE")" && printf '%s/%s\n' "$PWD" "$(basename "$RESULT_FILE")")
TIMEOUT_SECONDS=${PEER_AUDIT_TIMEOUT_SECONDS:-900}
CLAUDE_BIN=${PEER_AUDIT_CLAUDE_BIN:-claude}
CODEX_BIN=${PEER_AUDIT_CODEX_BIN:-codex}
COPILOT_BIN=${PEER_AUDIT_COPILOT_BIN:-copilot}

case "$TIMEOUT_SECONDS" in
  ''|*[!0-9]*|0)
    echo "PEER_AUDIT_TIMEOUT_SECONDS must be a positive integer" >&2
    exit 2
    ;;
esac

case "$MODEL_KIND" in
  claude)
    NATIVE_TRANSPORT="claude"
    NATIVE_BIN=$CLAUDE_BIN
    COPILOT_MODEL="claude-opus-4.8"
    COPILOT_EFFORT="xhigh"
    ;;
  gpt)
    NATIVE_TRANSPORT="codex"
    NATIVE_BIN=$CODEX_BIN
    COPILOT_MODEL="gpt-5.6-sol"
    COPILOT_EFFORT="high"
    ;;
  *)
    usage
    ;;
esac

rm -f "$RESULT_FILE"
RUN_ROOT=$(mktemp -d "${TMPDIR:-/tmp}/peer-audit-worker.XXXXXX")
TIMED_OUT="$RUN_ROOT/timed-out"
CURRENT_TRANSPORT="$RUN_ROOT/current-transport"
PROMPT=$(<"$PROMPT_FILE")
SLOT_PID=

cleanup() {
  rm -rf "$RUN_ROOT"
}
trap cleanup EXIT

write_result() {
  local status=$1
  local transport=$2
  local reason=$3
  local body=${4:-}
  local temporary="${RESULT_FILE}.tmp.$$"

  {
    printf 'status: %s\n' "$status"
    printf 'transport: %s\n' "$transport"
    printf 'reason: %s\n' "$reason"
    printf '%s\n' "---"
    [[ -z "$body" || ! -f "$body" ]] || cat "$body"
  } > "$temporary"
  mv "$temporary" "$RESULT_FILE"
}

normalize_and_validate() {
  local candidate=$1
  local normalized="${candidate}.normalized"

  awk '
    BEGIN { valid = 1 }
    {
      sub(/\r$/, "")
      if ($0 ~ /^[[:space:]]*$/) {
        if (seen) pending_blank = 1
        next
      }
      if (pending_blank) valid = 0
      seen = 1
      print
      if ($0 ~ /^NO_FINDINGS \| evidence: checked .+$/) {
        count++
        no_findings++
      } else if ($0 ~ /^\[(critical|important|nit)\] .+ \| evidence: .+$/) {
        count++
      } else {
        valid = 0
      }
    }
    END {
      if (count == 0 || no_findings > 1 || (no_findings == 1 && count != 1)) valid = 0
      exit(valid ? 0 : 1)
    }
  ' "$candidate" > "$normalized"
  local status=$?
  mv "$normalized" "$candidate"
  return "$status"
}

summarize_failure() {
  local log_file=$1
  local candidate=$2

  awk 'NF { summary = $0 } END { gsub(/[[:space:]]+/, " ", summary); print substr(summary, 1, 300) }' \
    "$log_file" "$candidate"
}

invoke_claude() {
  cd "$ATTEMPT_SCRATCH" || return
  "$CLAUDE_BIN" -p "$PROMPT" \
    --model claude-opus-4-8 \
    --effort xhigh \
    --permission-mode auto \
    --tools "Bash,Read,Glob,Grep,WebSearch" \
    --add-dir "$PROJECT_DIR" \
    --safe-mode \
    --no-session-persistence
}

invoke_codex() {
  "$CODEX_BIN" --search exec \
    --model gpt-5.6-sol \
    --config 'model_reasoning_effort="high"' \
    --sandbox workspace-write \
    --config 'sandbox_workspace_write.network_access=true' \
    --cd "$ATTEMPT_SCRATCH" \
    --add-dir "$PROJECT_DIR" \
    --output-last-message "$ATTEMPT_CANDIDATE" \
    --skip-git-repo-check \
    --ephemeral \
    --ignore-user-config \
    --ignore-rules \
    --strict-config \
    "$PROMPT"
}

invoke_copilot() {
  "$COPILOT_BIN" \
    --prompt "$PROMPT" \
    --model "$COPILOT_MODEL" \
    --effort "$COPILOT_EFFORT" \
    -C "$ATTEMPT_SCRATCH" \
    --add-dir "$PROJECT_DIR" \
    --allow-all-tools \
    --allow-all-urls \
    --no-ask-user \
    --no-custom-instructions \
    --disable-builtin-mcps \
    --no-auto-update \
    --silent
}

ATTEMPT_REASON=
ATTEMPT_LOG=
ATTEMPT_CANDIDATE=

run_attempt() {
  local transport=$1
  local attempt_dir="$RUN_ROOT/$transport"
  local status
  local summary

  mkdir -p "$attempt_dir/scratch"
  ATTEMPT_SCRATCH="$attempt_dir/scratch"
  ATTEMPT_CANDIDATE="$attempt_dir/candidate.txt"
  ATTEMPT_LOG="$attempt_dir/command.log"
  : > "$ATTEMPT_CANDIDATE"
  : > "$ATTEMPT_LOG"
  printf '%s\n' "$transport" > "$CURRENT_TRANSPORT"

  case "$transport" in
    claude)
      invoke_claude >"$ATTEMPT_CANDIDATE" 2>"$ATTEMPT_LOG" < /dev/null
      status=$?
      ;;
    codex)
      invoke_codex >"$ATTEMPT_LOG" 2>&1 < /dev/null
      status=$?
      ;;
    copilot)
      invoke_copilot >"$ATTEMPT_CANDIDATE" 2>"$ATTEMPT_LOG" < /dev/null
      status=$?
      ;;
    *)
      return 2
      ;;
  esac

  if [[ $status -ne 0 ]]; then
    summary=$(summarize_failure "$ATTEMPT_LOG" "$ATTEMPT_CANDIDATE")
    ATTEMPT_REASON="$transport exited with status $status"
    [[ -z "$summary" ]] || ATTEMPT_REASON="$ATTEMPT_REASON: $summary"
    return 1
  fi

  if [[ ! -f "$ATTEMPT_CANDIDATE" ]] || ! normalize_and_validate "$ATTEMPT_CANDIDATE"; then
    ATTEMPT_REASON="$transport returned malformed output"
    return 1
  fi

  ATTEMPT_REASON=
  return 0
}

run_slot() {
  trap - EXIT
  local native_reason
  local attempted_transport="none"

  if command -v "$NATIVE_BIN" >/dev/null 2>&1; then
    attempted_transport=$NATIVE_TRANSPORT
    if run_attempt "$NATIVE_TRANSPORT"; then
      write_result "success" "$NATIVE_TRANSPORT" "" "$ATTEMPT_CANDIDATE"
      return 0
    fi
    native_reason=$ATTEMPT_REASON
  else
    native_reason="native executable not found: $NATIVE_BIN"
  fi

  if ! command -v "$COPILOT_BIN" >/dev/null 2>&1; then
    write_result "failed" "$attempted_transport" \
      "$native_reason; Copilot fallback unavailable"
    return 1
  fi

  if run_attempt "copilot"; then
    write_result "success" "copilot" "$native_reason" "$ATTEMPT_CANDIDATE"
    return 0
  fi

  write_result "failed" "copilot" "$native_reason; $ATTEMPT_REASON"
  return 1
}

set -m
run_slot &
SLOT_PID=$!
(
  sleep "$TIMEOUT_SECONDS"
  if kill -0 "$SLOT_PID" 2>/dev/null; then
    : > "$TIMED_OUT"
    kill -TERM -- "-$SLOT_PID" 2>/dev/null || true
    sleep 2
    kill -KILL -- "-$SLOT_PID" 2>/dev/null || true
  fi
) &
TIMER_PID=$!
set +m

wait "$SLOT_PID" 2>/dev/null
SLOT_STATUS=$?

if [[ -f "$TIMED_OUT" ]]; then
  wait "$TIMER_PID" 2>/dev/null || true
  TRANSPORT=none
  [[ ! -f "$CURRENT_TRANSPORT" ]] || TRANSPORT=$(<"$CURRENT_TRANSPORT")
  write_result "failed" "$TRANSPORT" "timed out after ${TIMEOUT_SECONDS}s"
  exit 1
fi

kill -TERM -- "-$TIMER_PID" 2>/dev/null || true
wait "$TIMER_PID" 2>/dev/null || true
exit "$SLOT_STATUS"
