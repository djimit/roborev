#!/usr/bin/env bash
# Ship roborev pending tasks -> Paperclip control plane (VPS).
#
# Flow: scp pending JSONL to the control VPS -> ssh-exec the idempotent flush-runner
# (pc-flush-pending.ts) -> real Paperclip issues are created (skipping _meta/
# _seed_example rows; deduped via a processed-keys ledger).
#
# Default is --dry-run (creates NOTHING). Pass --live to actually create issues.
#
# No Paperclip secret lives on the MacBook: the flush-runner uses the VPS's
# own stored board-credential (~/.paperclip/auth.json).
set -euo pipefail

SRC="$HOME/.djimit/roborev/paperclip-tasks.pending.jsonl"
MODE="--dry-run"

for arg in "$@"; do
  case "$arg" in
    --dry-run) MODE="--dry-run" ;;
    --live) MODE="--live" ;;
    *) SRC="$arg" ;;
  esac
done

WS_HOST="${ROBOREV_WS:-vps-agentical}"
WS_DIR="${ROBOREV_WS_DIR:-/srv/roborev-integration}"
WS_TSX="${ROBOREV_TSX:-/srv/paperclip/cli/node_modules/tsx/dist/cli.mjs}"
REMOTE="${WS_DIR}/incoming.pending.jsonl"

if [[ ! -f "$SRC" ]]; then echo "roborev: no pending file at $SRC"; exit 0; fi

# sync pending file to the control VPS (overwrite incoming copy)
scp -q "$SRC" "${WS_HOST}:${REMOTE}"

# run the flush runner on the control VPS
ssh "$WS_HOST" "node \"$WS_TSX\" \"$WS_DIR/pc-flush-pending.ts\" \"$REMOTE\" $MODE" \
  || { echo "roborev: flush-runner failed"; exit 1; }

# After successful live ship, archive pending file (append-only source-of-truth).
if [[ "$MODE" == "--live" ]]; then
  ARCHIVE="$(dirname "$SRC")/$(basename "$SRC" .jsonl).$(date +%Y%m%d-%H%M%S).jsonl"
  mv "$SRC" "$ARCHIVE"
  echo "roborev: archived shipped tasks to $ARCHIVE"
fi

echo "roborev: ship complete ($MODE) for $SRC"
