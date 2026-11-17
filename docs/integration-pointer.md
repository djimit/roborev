# Integration pointer

Authoritative integration spec lives outside this repo (it is workspace state, not source):

- `~/.djimit/roborev/paperclip-integration.md` — full spec + live IDs; the
  filename is historical, but Djimitflo is the active control plane.
- `~/.djimit/roborev/paperclip-tasks.pending.jsonl` — spillover buffer (append-only).

Active runner:
- `scripts/ship-to-djimitflo.sh` — dry-run by default; `--live` posts to the
  Djimitflo event bus and archives only after a successful send.

The old `pc-*` runner paths are historical Paperclip migration artifacts and
must not be used for live publication.
