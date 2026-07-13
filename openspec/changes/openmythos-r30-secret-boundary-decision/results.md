# R30 Results

R30 completed on 2026-07-13 with decision
`no_code_do_not_minimize_benchmark`.

The authenticated route selects server-owned cases and does not accept an
arbitrary prompt. The case schema has no structured sensitive-value contract,
the synthetic prompt is intentionally sent unchanged to the subject, and the
full response is retained as evaluation evidence. Existing swarm secret
detection is a scoped credential-pattern reject-list, not a generic classifier.

Prompt minimization and response redaction would invalidate the benchmark. No
holdout was created because no frozen candidate exists. The next valid candidate
is deterministic subject sampling in the built Djimitflo evaluation path under
a separate gate. Production remained on `djimitflo:r22-e401afec`.
