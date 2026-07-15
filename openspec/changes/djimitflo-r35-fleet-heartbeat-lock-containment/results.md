# R35 Results

## Decision

Accepted and promoted on 2026-07-15. The fleet heartbeat is still a 30-second
best-effort update, but a failed tick is logged and no longer escapes the timer
callback to terminate Node.

## Repository Evidence

- Djimitflo revision: `29ff7eec`
- Heartbeat containment commit: `66e572b5`
- Express route-type compatibility pin: `29ff7eec`
- Focused fleet suite: 12 passed
- Full suite: 1,300 passed and 15 skipped
- Lint, type-check, and full production build: passed
- Workstation checkout and build: clean at `29ff7eec`

The Express type pin was required after merging the upstream Express 5 type
update. It keeps route parameters compatible with this repository's
non-wildcard routes without adding casts across the route layer.

## Runtime Evidence

The isolated canary used a transactionally backed-up production database and
the production mounts on port 3011. A separate SQLite connection held a write
lock across a heartbeat tick and beyond the configured 5000 ms busy timeout.

- Expected log: `[FleetMesh] Heartbeat update skipped: database is locked`
- Canary during lock: healthy
- Canary after lock release: healthy
- Canary database integrity after lock: `ok`
- Concurrent R31 production health: healthy

## Promotion Evidence

- Live container: `djimitflo-live`
- Live image: `djimitflo:r35-29ff7eec`
- Image ID: `sha256:ab1ca6d0bbc4abe23a69b48d60250490551708c0df265cea0e6b97d4773b73e3`
- Restart policy: `unless-stopped`
- Live database integrity: `ok`
- Health from workstation and LAN: healthy
- Production logs after promotion: no fatal, uncaught, `SQLITE_BUSY`, or
  database-lock errors
- Corpus, calibration, oracle-anchor, knowledge, and data mounts: retained
- Rollback: `djimitflo-r31-rollback-r35-20260715-073330`, stopped with restart
  policy `no`

The temporary canary database and runtime environment file were removed after
promotion. The R31 and earlier R22 rollback boundaries remain available.
