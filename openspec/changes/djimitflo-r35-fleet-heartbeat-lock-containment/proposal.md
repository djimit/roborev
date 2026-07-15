# Djimitflo R35 Fleet Heartbeat Lock Containment

## Why

Production R31 exited when the periodic fleet heartbeat update raised
`SQLITE_BUSY`. The synchronous timer error escaped to Node, and restart policy
`no` left production unavailable until manual recovery.

## What Changes

- Treat a failed fleet heartbeat tick as best-effort housekeeping: log and retry
  on the next interval instead of terminating the process.
- Add one regression test for a locked heartbeat update.
- Run production with restart policy `unless-stopped`.

## Impact

No schema, API, model, policy, heartbeat cadence, or fleet state semantics
change. A failed tick is skipped and retried 30 seconds later.
