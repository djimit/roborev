# Design

Use the reverted R33 candidate source and 90-anchor sidecar only in a detached
worktree and isolated container. Keep the R31 subject model, temperature 0,
seed 0, `num_predict` 1024, corpus, calibration artifact, and copied production
database unchanged. Override only `OPENMYTHOS_WORKER_CONCURRENCY=1`.

Run the same 12-case API request three consecutive times in the same healthy
container. Each run must complete 12/12 cases, use `scoringSource=oracle` for
12/12, and match the independent R32 oracle outcome for 12/12. Responses must
match pairwise by SHA-256 for all 12 cases across all three runs. Each API run
must finish within 240 seconds.

R32 response hashes are recorded but are not an acceptance criterion because
R34 deliberately changes the execution schedule. This does not relax R33:
R33 remains rejected under its concurrency-three contract.

If every gate passes, R34 may conclude only that the existing serialization
configuration is a viable candidate. Reapplying source changes, running a full
60-case baseline, and production promotion belong to a separately
pre-registered change. Any R34 mismatch rejects serialization as sufficient.

Always remove the candidate container, copied database, temporary environment,
detached worktree, and candidate image. Preserve raw evidence and leave R31
running throughout.
