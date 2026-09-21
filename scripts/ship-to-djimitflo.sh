#!/usr/bin/env bash
# Ship roborev pending tasks -> Djimitflo via the Djimit event bus (event_type roborev.finding).
# Djimitflo ingests them into work items (external-event-ingest-service). Idempotent: dedupe_key.
# Default --dry-run (posts nothing). --live posts, then archives the pending file.
set -euo pipefail
SRC="${1:-$HOME/.djimit/roborev/paperclip-tasks.pending.jsonl}"
MODE="--dry-run"; [[ "${2:-}" == "--live" ]] && MODE="--live"
BUS="${DJIMIT_EVENT_BUS_URL:-http://100.86.47.122:8083}"
STREAM="${DJIMIT_EVENT_STREAM:-djimit.events}"
[[ -f "$SRC" ]] || { echo "roborev: no pending file at $SRC"; exit 0; }

python3 - "$SRC" "$BUS" "$STREAM" "$MODE" <<'PY'
import json, sys, urllib.request, os
src, bus, stream, mode = sys.argv[1:5]
sent = skipped = failed = 0
for line in open(src):
    line = line.strip()
    if not line: continue
    row = json.loads(line)
    if not row.get("task_title") or not row.get("dedupe_key") or "_meta" in row or "_seed_example" in row:
        skipped += 1; continue
    ev = {**row, "event_type": "roborev.finding", "source": "roborev", "event_id": "roborev:" + row["dedupe_key"]}
    ev["context"] = row.get("context") or row["task_title"]
    if mode != "--live": sent += 1; continue
    req = urllib.request.Request(f"{bus.rstrip('/')}/events/{stream}", json.dumps(ev).encode(),
        {"Content-Type": "application/json", **({"Authorization": "Bearer " + os.environ["DJIMIT_EVENT_BUS_TOKEN"]} if os.environ.get("DJIMIT_EVENT_BUS_TOKEN") else {})})
    try: urllib.request.urlopen(req, timeout=10); sent += 1
    except Exception as e: failed += 1; print("roborev: post failed:", e, file=sys.stderr)
print(f"roborev: {'would ship' if mode != '--live' else 'shipped'} {sent}, skipped {skipped}, failed {failed}")
sys.exit(1 if failed else 0)
PY

if [[ "$MODE" == "--live" ]]; then
  ARCHIVE="$(dirname "$SRC")/$(basename "$SRC" .jsonl).$(date +%Y%m%d-%H%M%S).jsonl"
  mv "$SRC" "$ARCHIVE"; echo "roborev: archived to $ARCHIVE"
fi
