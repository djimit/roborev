#!/usr/bin/env bash
# Scan-and-flush wrapper (control VPS, cron 06:30 UTC): runs the repo scan and ships findings
# to Djimitflo via the Djimit event bus (ship-to-djimitflo.sh --live). Paperclip is retired (2026-09-21).
# Idempotent via the <file>.processed dedupe_key ledger. rc=0 always (state lives in the log;
# scan-watchdog.sh turns failures into an alert).
set -uo pipefail
DIR=/srv/roborev-integration
LOG=$DIR/scan/flush-last.log

{
  echo "=== scan $(date -Is) ==="
  bash "$DIR/scan-repos.sh" --deep
  n=$(grep -c . "$DIR/scan/batch.jsonl" 2>/dev/null | head -1)
  n=${n:-0}
  if [[ "$n" -gt 0 ]]; then
    echo "--- $n events -> ship --live ---"
    bash "$DIR/ship-to-djimitflo.sh" "$DIR/scan/batch.jsonl" --live || echo "SHIP-FAILED rc=$?"
  else
    echo "geen bevindingen, niets te shippen"
  fi
} > "$LOG" 2>&1
exit 0
