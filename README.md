# roborev

Commit-native review daemon. Emits review events as Paperclip-ready tasks (JSONL)
for the Djimit work-control-plane.

## Quickstart

```sh
# emit an event (dry-run, prints the normalized task row)
node bin/roborev.mjs emit --dry-run --event examples/emit-review-failed.json

# emit to the real pending spillover
node bin/roborev.mjs emit --event examples/emit-review-failed.json

# ship pending findings to Djimitflo via the event bus (dry-run by default; --live posts roborev.finding)
bash scripts/ship-to-djimitflo.sh                # ~/.djimit/roborev/paperclip-tasks.pending.jsonl
bash scripts/ship-to-djimitflo.sh /tmp/x.jsonl --live
```

See `AGENTS.md` and `~/.djimit/roborev/paperclip-integration.md` for the full
integration spec (status, API, task mapping, labels, agent-assignment, routines,
DjimitKBWiki/GraphStore coupling).
