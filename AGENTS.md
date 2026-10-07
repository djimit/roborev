# AGENTS.md — roborev

roborev is de **commit-native review daemon** van het Djimit ecosysteem. Het emit
review-events als **Paperclip-ready tasks** (JSONL spillover) die door de
work-control-plane (**Djimitflo** op de control VPS 100.86.47.122; Paperclip is verwijderd) worden opgepikt.

Reference governance-implementation voor agent-loops: ~/workspace/loop-engineering
(eigen repo + CI); deze file beschrijft alleen roborev zelf.

## Rol in het ecosysteem

- roborev: emit review events (per commit/branch). **Geen** eigen taakstaat.
- DjimitKBWiki: kennis-cockpit.
- **Djimitflo**: work control plane (work items, panel-review, goals, approvals, loops). Paperclip is op 2026-09-21 uitgezet en van de VPS verwijderd (archief: Synology `/mnt/nas/vps-backups/paperclip-retirement-20260921/`).
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
- `scripts/ship-to-djimitflo.sh` — publiceert pending → `roborev.finding` events op de Djimit event bus (`http://100.86.47.122:8083`, stream `djimit.events`); Djimitflo maakt er work items van (dedupe via `dedupe_key`). Default `--dry-run` (post/schrijft niets); `--live` post en schrijft per bus-ack de `dedupe_key` naar `<pending>.processed` (idempotent; de pending file blijft staan — Djimitflo PromptIntel/PR-review lezen hem) plus `ship-last.json`. Alleen `source=roborev` met `task_type` in `ROBOREV_SHIP_TYPES` (default `review_fix,triage`, plan D1) gaat mee; prompt-intel/dream-cycle en knowledge_drift/skill_candidate worden gefilterd. `ship-to-paperclip.sh` is legacy (Paperclip verwijderd 2026-09-21).
- `scripts/vps/` — referentie-versies van de control-VPS cron-scripts (`/srv/roborev-integration/`): `scan-and-flush.sh` en `djimit-domain-scan.sh` shippen via `ship-to-djimitflo.sh --live`; `scan-watchdog.sh` checkt echte voortgang (verse scan-log zonder ship-fout, 0 niet-geackte bevindingen in recente `scan/*.jsonl`, bus `/health`) en alarmeert anders (bus-finding + rc=1 → cron-mail).
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
4 routines staan live op de VPS-instance (gemigreerd vanaf Workstation 2026-08). **Routines hebben nog geen
schedule-triggers** (budget-gate) — zie integration.md §9/§14.

Toegevoegd: test suite (25 tests), `roborev status` subcommando, CI workflow,
voorbeelden per task type, `--no-assign` flag (ex `--triage`), pending file
archivering na live ship.
