# AGENTS.md — roborev

roborev is de **commit-native review daemon** van het Djimit ecosysteem. Het emit
review-events als **Paperclip-ready tasks** (JSONL spillover) die door de
work-control-plane (Paperclip op de Workstation) worden opgepikt.

## Rol in het ecosysteem

- roborev: emit review events (per commit/branch). **Geen** eigen taakstaat.
- DjimitKBWiki: kennis-cockpit.
- **Paperclip**: work control plane (taakcoördinatie, agents, routines, governance).
- Qdrant/GraphStore: memory & causality.
- Djimitflo: runtime/orchestration.

Volledige integratie-spec: `~/.djimit/roborev/paperclip-integration.md`.

## Componenten

- `src/events.mjs` — event-contract (mirror van integration.md §8). Zero-dependency Node ESM.
- `bin/roborev.mjs` — CLI.
  - `roborev emit` — leest een event (stdin / `--json` / `--event <file>`), normaliseert + valideert, append naar pending JSONL. `--dry-run` print alleen. `--no-assign` forceert backlog + needs-assignment (geen auto-assign). `--out <path>` override (default `~/.djimit/roborev/paperclip-tasks.pending.jsonl`).
  - `roborev status` — samenvatting van pending JSONL (count by severity/status/type).
  - `roborev schema` — print task_types/severities.
  - `roborev version`
- `scripts/ship-to-paperclip.sh` — scp pending → Workstation + ssh-exec `pc-flush-pending.ts`. Default `--dry-run`; `--live` creëert echte Paperclip-issues en archiveert de pending file. Geen secret op de MacBook.
- `test/events.test.mjs` — test suite (`npm test`).
- `.github/workflows/ci.yml` — CI: tests (Node 20+22) + smoke (alle examples).
- `examples/` — voorbeelden per task type: `emit-review-failed.json`, `emit-triage.json`, `emit-skill-candidate.json`, `emit-knowledge-drift.json`, `emit-projection-update.json`.

## Event → task mapping (samengevat)

| roborev event | task_type | assignee_role (Paperclip agent) |
|---------------|-----------|---------------------------------|
| review.failed | review_fix | patch-agent (CodexEngineer) |
| review.completed + high severity | triage | architecture/security-reviewer (CTO) |
| repeated findings | skill_candidate | skill-factory-agent (FleetMaintainer) |

DjimitKBWiki/OpenSpec/Qdrant/GraphStore-events hebben eigen mappings — zie integration.md §4.

## Regels

- Geen automatische content-fix op main/master zonder approval (Paperclip Approval-gate).
- Severity → priority: critical/high/medium/low.
- `dedupe_key` voorkomt dubbele taken bij her-run van de flush-runner.
- Pending JSONL is append-only source-of-truth op de cockpit; shippen is expliciet (default dry-run).

## Status (2026-07-12)

Emitter + shipper werken end-to-end (dry-run getest). Paperclip-labels, -agents en
4 routines staan live op de Workstation-instance. **Routines hebben nog geen
schedule-triggers** (budget-gate) — zie integration.md §9/§14.

Toegevoegd: test suite (25 tests), `roborev status` subcommando, CI workflow,
voorbeelden per task type, `--no-assign` flag (ex `--triage`), pending file
archivering na live ship.
