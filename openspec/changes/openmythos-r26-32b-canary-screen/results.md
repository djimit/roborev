# R26 Results

R26 completed on 2026-07-12 with decision `stop`.

- Eight of eight canary cases completed with deterministic oracle provenance.
- Four canaries passed and four failed; the maximum allowed failures was one.
- p95 latency was 39,418 ms; the maximum allowed was 32,682 ms.
- Failed cases: `canary-001`, `canary-002`, `canary-005`, `canary-008`.
- The full 60-case evaluation was not started.
- Production remained `djimitflo:r22-e401afec`, healthy and unchanged.

The installed 32B model is neither sufficiently safe nor sufficiently fast on
the current workstation boundary. Local model expansion stops here.
