# Integration pointer

Authoritative integration spec lives outside this repo (it is workspace state, not source):

- `~/.djimit/roborev/paperclip-integration.md` — full spec + live IDs.
- `~/.djimit/roborev/paperclip-tasks.pending.jsonl` — spillover buffer (append-only).

Runner scripts (Workstation-side, use the stored board-credential):
- `/home/djimit/roborev-integration/pc-discover.ts`
- `/home/djimit/roborev-integration/pc-provision.ts`
- `/home/djimit/roborev-integration/pc-state.ts`
- `/home/djimit/roborev-integration/pc-flush-pending.ts`
