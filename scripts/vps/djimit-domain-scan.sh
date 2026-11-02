#!/usr/bin/env bash
# Djimit-domein-scan (control VPS, cron ma 07:00 UTC): semgrep custom rules op djimitflo -> Djimitflo
# work items via the event bus (ship-to-djimitflo.sh --live). Idempotent via dedupe_key ledger.
# Log: scan/domain-scan-last.log (was stdout-only, so the log stayed frozen on 2026-09-07).
# Python-event-generatie zit in ds-events-gen.py (geen heredocs in dit script).
set -uo pipefail
DIR=/srv/roborev-integration
WORK=/srv/build/djimitflo-main-nightly
LOG=$DIR/scan/domain-scan-last.log
day=$(date -u +%Y%m%d)
ev="$DIR/scan/domain-scan-$day.jsonl"

{
  git -C "$WORK" fetch origin main --quiet 2>/dev/null || true
  git -C "$WORK" reset --hard origin/main --quiet 2>/dev/null || true
  sha=$(git -C "$WORK" rev-parse HEAD)

  echo "=== djimit-domain-scan $(date -Is) sha=${sha:0:8} ==="

  rm -f /tmp/domain-sg.json /tmp/ds-events.jsonl
  docker run --rm -v "$DIR":/rules -v "$WORK":/work -v /tmp:/tmp \
    semgrep/semgrep:latest \
    semgrep --config /rules/djimit-semgrep-rules.yml --metrics=off --json /work/packages \
    > /tmp/domain-sg.json 2>/dev/null || true

  n=$(python3 -c "import json; print(len(json.load(open('/tmp/domain-sg.json')).get('results', [])) if __import__('os').path.exists('/tmp/domain-sg.json') else 0)" 2>/dev/null)
  echo "bevindingen: ${n:-0}"

  if [[ "${n:-0}" -gt 0 ]]; then
    SCAN_SHA=$sha SCAN_TS=$(date -Is) python3 "$DIR/ds-events-gen.py" "$ev" \
      && echo "events gegenereerd: $(grep -c . "$ev" | head -1)"
    if [[ -s "$ev" ]]; then
      bash "$DIR/ship-to-djimitflo.sh" "$ev" --live || echo "SHIP-FAILED rc=$?"
    else
      echo "geen events, niets te shippen"
    fi
  fi
} > "$LOG" 2>&1
exit 0
