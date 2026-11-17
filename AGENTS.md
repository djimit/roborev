# AGENTS.md — roborev

roborev is de **commit-native review daemon** van het Djimit ecosysteem. Het emit
review-events als **Djimitflo-ready findings** (JSONL spillover) die door de
work-control-plane (**Djimitflo** op de control VPS 100.86.47.122; Paperclip is verwijderd) worden opgepikt.

Reference governance-implementation voor agent-loops: ~/workspace/loop-engineering
(eigen repo + CI); deze file beschrijft alleen roborev zelf.

## Rol in het ecosysteem

- roborev: emit review events (per commit/branch). **Geen** eigen taakstaat.
- DjimitKBWiki: kennis-cockpit.
- **Djimitflo**: work control plane (work items, panel-review, goals, approvals, loops). Paperclip is op 2026-09-21 uitgezet en van de VPS verwijderd (archief: Synology `/mnt/nas/vps-backups/paperclip-retirement-20260921/`).
- Qdrant/GraphStore: memory & causality.
- Djimitflo: runtime/orchestration.

Volledige integratie-spec: `~/.djimit/roborev/paperclip-integration.md` (historische bestandsnaam; Djimitflo is actief).

## Componenten

- `src/events.mjs` — event-contract (mirror van integration.md §8). Zero-dependency Node ESM.
- `bin/roborev.mjs` — CLI.
  - `roborev emit` — leest een event (stdin / `--json` / `--event <file>`), normaliseert + valideert, append naar pending JSONL. `--dry-run` print alleen. `--no-assign` forceert backlog + needs-assignment (geen auto-assign). `--out <path>` override (default `~/.djimit/roborev/paperclip-tasks.pending.jsonl`; historische naam behouden voor bestaande spillover).
  - `roborev status` — samenvatting van pending JSONL (count by severity/status/type).
  - `roborev schema` — print task_types/severities.
  - `roborev version`
- `scripts/ship-to-djimitflo.sh` — publiceert pending → `roborev.finding` events op de Djimit event bus (`http://100.86.47.122:8083`, stream `djimit.events`); **let op:** Djimitflo's external-event-ingest neemt `roborev.finding` (nog) niet op; de events blijven in de stream, er ontstaan geen work items (geverifieerd 2026-11-17). De bus eist een fleet-token (`DJIMIT_EVENT_BUS_TOKEN`); de MacBook heeft er geen. Default `--dry-run`; `--live` post en archiveert de pending file. `ship-to-paperclip.sh` is legacy (Paperclip wordt uitgefaseerd, zie Djimitflo ADR 0001).
- `test/events.test.mjs` — test suite (`npm test`).
- `.github/workflows/ci.yml` — CI: tests (Node 20+22) + smoke (alle examples).
- `examples/` — voorbeelden per task type: `emit-review-failed.json`, `emit-triage.json`, `emit-skill-candidate.json`, `emit-knowledge-drift.json`, `emit-projection-update.json`.

## Event → task mapping (samengevat)

| roborev event | task_type | assignee_role (Djimitflo role) |
|---------------|-----------|---------------------------------|
| review.failed | review_fix | patch-agent (CodexEngineer) |
| review.completed + high severity | triage | architecture/security-reviewer (CTO) |
| repeated findings | skill_candidate | skill-factory-agent (FleetMaintainer) |

DjimitKBWiki/OpenSpec/Qdrant/GraphStore-events hebben eigen mappings — zie integration.md §4.

## Regels

- Geen automatische content-fix op main/master zonder Djimitflo approval-gate.
- Severity → priority: critical/high/medium/low.
- `dedupe_key` voorkomt dubbele taken bij her-run van de flush-runner.
- Pending JSONL is append-only source-of-truth op de cockpit; shippen is expliciet (default dry-run).

## Status

Emitter + shipper zijn lokaal gevalideerd met dry-run en unit/integratietests.
Live Djimitflo-publicatie en schedule-triggers zijn niet door deze repository
bewezen; daarvoor zijn een expliciete `--live`-actie en onafhankelijke runtime-
en provenance-checks nodig.

Toegevoegd: test suite (25 tests), `roborev status` subcommando, CI workflow,
voorbeelden per task type, `--no-assign` flag (ex `--triage`), pending file
archivering na live ship.
