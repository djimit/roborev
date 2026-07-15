# Design

The application connection already uses WAL and a 5000 ms SQLite busy timeout.
The remaining failure is the unhandled synchronous exception in
`FleetMeshService.startHeartbeat()`. Catch and warn inside that existing timer
callback. Do not add a retry framework: the interval itself is the retry.

Acceptance requires a focused fake-timer regression proving a thrown database
lock does not escape, full tests/lint/typecheck/build, an isolated healthy
candidate, and a live healthy container using restart policy `unless-stopped`.
Retain R31 as rollback.
