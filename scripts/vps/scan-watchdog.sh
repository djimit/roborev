#!/usr/bin/env bash
# Watchdog for the roborev scan -> Djimitflo chain (control VPS, cron 06:45 UTC).
# Checks real progress, not just "a log file was touched":
#   1. scan/flush-last.log fresher than MAX_AGE_H (the 06:30 scan ran);
#   2. flush-last.log contains no SHIP-FAILED / post failure;
#   3. every non-empty scan/*.jsonl younger than WINDOW_DAYS has 0 unshipped eligible findings
#      (ship-to-djimitflo.sh dry-run says "would ship 0" = every dedupe_key is in the bus-acked ledger);
#   4. the event bus answers /health.
# Any FAIL -> one alert per day as a roborev triage finding on the bus (best effort) and rc=1, so cron mails
# even when the bus itself is the thing that is down.
set -uo pipefail
DIR=${ROBOREV_DIR:-/srv/roborev-integration}
SCAN=$DIR/scan
LOG=$SCAN/flush-last.log
MAX_AGE_H=${MAX_AGE_H:-26}
WINDOW_DAYS=${WINDOW_DAYS:-14}
BUS="${DJIMIT_EVENT_BUS_URL:-http://100.86.47.122:8083}"
SHIP="bash $DIR/ship-to-djimitflo.sh"
out=$SCAN/watchdog-last.log

(
  fails=()
  echo "=== watchdog $(date -Is) ==="
  if [[ ! -f "$LOG" ]]; then
    fails+=("$LOG ontbreekt")
  else
    hrs=$(( ($(date +%s) - $(date -r "$LOG" +%s)) / 3600 ))
    echo "leeftijd flush-last.log: ${hrs}u (max ${MAX_AGE_H}u)"
    (( hrs > MAX_AGE_H )) && fails+=("scan-keten stil: ${hrs}u geen run")
    grep -qE 'SHIP-FAILED|post failed|No such file|Cannot find module' "$LOG" \
      && fails+=("flush-last.log meldt ship-fout: $(grep -m1 -E 'SHIP-FAILED|post failed|No such file|Cannot find module' "$LOG")")
  fi

  while IFS= read -r f; do
    res=$($SHIP "$f" 2>&1 | tail -1)
    n=$(sed -nE 's/^roborev: would ship ([0-9]+).*/\1/p' <<<"$res")
    echo "$(basename "$f"): ${res#roborev: }"
    [[ -z "$n" ]] && fails+=("$(basename "$f"): shipper-check faalde ($res)") && continue
    (( n > 0 )) && fails+=("$(basename "$f"): $n bevindingen niet op de bus")
  done < <(find "$SCAN" -maxdepth 1 -name '*.jsonl' -size +0 -mtime "-$WINDOW_DAYS" | sort)

  curl -fsS -m 10 "$BUS/health" >/dev/null 2>&1 || fails+=("event bus $BUS/health onbereikbaar")

  if (( ${#fails[@]} == 0 )); then
    echo "OK: scan gedraaid en alle bevindingen bus-acked"
    exit 0
  fi
  printf 'FAIL: %s\n' "${fails[@]}"
  ev="$SCAN/watchdog-alert-$(date -u +%Y%m%d).jsonl"
  if [[ ! -s "$ev" ]]; then
    node "$DIR/emit-event.mjs" event=review.completed repo=djimit/roborev severity=high \
      finding_class=scan-chain-stalled title="[watchdog] roborev -> Djimitflo keten faalt (${#fails[@]} checks)" \
      context="$(printf '%s; ' "${fails[@]}") Actie: $out en $LOG inspecteren; bash $DIR/ship-to-djimitflo.sh <file> (dry-run) per bestand." \
      > "$ev" 2>&1
  fi
  $SHIP "$ev" --live || echo "alert niet op de bus (zie cron-mail)"
  exit 1
) > "$out" 2>&1
rc=$?
(( rc )) && cat "$out" >&2
exit $rc
