# Paperclip was retired. Keep this guard so stale automation fails closed.
set -euo pipefail
echo "roborev: Paperclip is retired; use scripts/ship-to-djimitflo.sh" >&2
exit 2
