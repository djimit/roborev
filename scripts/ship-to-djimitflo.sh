#!/usr/bin/env bash
# Ship roborev pending findings -> Djimitflo via the Djimit event bus (event_type roborev.finding).
# Djimitflo materializes each one as a work item (external-event-ingest-service, upsert on dedupe_key).
#
# Usage: ship-to-djimitflo.sh [pending.jsonl] [--live]
#   default --dry-run: posts nothing, writes nothing, prints what would ship (counts by task_type).
#   --live: posts each eligible row, appends its dedupe_key to <pending>.processed after the bus acks it
#           (response carries a stream id), writes <dir>/ship-last.json. Exit 1 on any failure.
#   A dry-run "would ship 0" therefore means: every eligible row has been acked by the bus (the watchdog uses this).
#
# Only real code findings ship (plan D1): source == "roborev" and task_type in ROBOREV_SHIP_TYPES
# (default "review_fix,triage"). prompt-intel / dream-cycle rows and knowledge_drift / skill_candidate /
# projection_update are filtered, never posted. The pending file is NOT moved: Djimitflo's PromptIntel and
# PR-review services read it in place; the .processed ledger is what makes re-runs idempotent.
set -euo pipefail
SRC="${1:-$HOME/.djimit/roborev/paperclip-tasks.pending.jsonl}"
MODE="--dry-run"; [[ "${2:-}" == "--live" ]] && MODE="--live"
BUS="${DJIMIT_EVENT_BUS_URL:-http://100.86.47.122:8083}"
STREAM="${DJIMIT_EVENT_STREAM:-djimit.events}"
TYPES="${ROBOREV_SHIP_TYPES:-review_fix,triage}"
[[ -f "$SRC" ]] || { echo "roborev: no pending file at $SRC"; exit 0; }

python3 - "$SRC" "$BUS" "$STREAM" "$MODE" "$TYPES" <<'PY'
import collections, datetime, json, os, sys, urllib.request
src, bus, stream, mode, types = sys.argv[1:6]
live = mode == "--live"
allowed = {t.strip() for t in types.split(",") if t.strip()}
ledger = src + ".processed"
done = set(open(ledger).read().split()) if os.path.exists(ledger) else set()
ship, filtered = collections.Counter(), collections.Counter()
already = invalid = failed = 0
last_id = None
for line in open(src):
    line = line.strip()
    if not line: continue
    try: row = json.loads(line)
    except ValueError: invalid += 1; continue
    key = row.get("dedupe_key")
    if not row.get("task_title") or not key or "_meta" in row or "_seed_example" in row:
        invalid += 1; continue
    ttype = row.get("task_type") or "?"
    if row.get("source") != "roborev" or ttype not in allowed:
        filtered[f"{row.get('source')}/{ttype}"] += 1; continue
    if key in done: already += 1; continue
    if not live: ship[ttype] += 1; continue
    ev = {**row, "event_type": "roborev.finding", "source": "roborev", "target": "djimitflo",
          "event_id": "roborev:" + key, "occurred_at": row.get("created_at") or None}
    ev["context"] = row.get("context") or row["task_title"]
    ev = {k: v for k, v in ev.items() if v is not None}
    headers = {"Content-Type": "application/json"}
    if os.environ.get("DJIMIT_EVENT_BUS_TOKEN"): headers["Authorization"] = "Bearer " + os.environ["DJIMIT_EVENT_BUS_TOKEN"]
    req = urllib.request.Request(f"{bus.rstrip('/')}/events/{stream}", json.dumps(ev).encode(), headers)
    try:
        with urllib.request.urlopen(req, timeout=10) as r: ack = json.load(r)
        if not ack.get("id"): raise ValueError(f"no stream id in bus ack: {ack}")
    except Exception as e:
        failed += 1; print(f"roborev: post failed for {key}: {e}", file=sys.stderr); continue
    ship[ttype] += 1; done.add(key); last_id = ack["id"]
    with open(ledger, "a") as f: f.write(key + "\n")

verb = "shipped" if live else "would ship"
by_type = ", ".join(f"{t}={n}" for t, n in sorted(ship.items())) or "-"
dropped = ", ".join(f"{t}={n}" for t, n in sorted(filtered.items())) or "-"
print(f"roborev: {verb} {sum(ship.values())} ({by_type}); already shipped {already}; "
      f"filtered {sum(filtered.values())} ({dropped}); invalid {invalid}; failed {failed}")
if live:
    open(ledger, "a").close()  # marker exists even when nothing was eligible
    state = {"ts": datetime.datetime.now(datetime.timezone.utc).isoformat(), "src": src, "shipped": sum(ship.values()),
             "already": already, "filtered": sum(filtered.values()), "failed": failed, "last_bus_id": last_id}
    with open(os.path.join(os.path.dirname(os.path.abspath(src)), "ship-last.json"), "w") as f: json.dump(state, f)
sys.exit(1 if failed else 0)
PY
