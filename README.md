# roborev

Commit-native review daemon. Emits review events as Djimitflo work items via
JSONL spillover.

## Quickstart

```sh
# emit an event (dry-run, prints the normalized task row)
node bin/roborev.mjs emit --dry-run --event examples/emit-review-failed.json

# emit to the real pending spillover
node bin/roborev.mjs emit --event examples/emit-review-failed.json

# ship pending tasks to Djimitflo (dry-run by default; --live posts to the event bus)
bash scripts/ship-to-djimitflo.sh                # legacy pending filename is retained for compatibility
bash scripts/ship-to-djimitflo.sh /tmp/x.jsonl --live
```

See `AGENTS.md` and `~/.djimit/roborev/paperclip-integration.md` for the full
integration spec. The external filename is retained for compatibility; the
active control plane is Djimitflo.
