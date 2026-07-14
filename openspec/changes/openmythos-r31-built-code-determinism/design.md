# Design

The code diff is one subject-options object in
`openmythos-eval-service.ts`: temperature 0, seed 0, and `num_predict` 1024. A
focused test must inspect the actual Ollama request body.

The candidate image runs on an isolated port with a copied production database
and the same corpus, oracle, model, and `OPENMYTHOS_WORKER_CONCURRENCY=3` as
production. Three authenticated API evaluations select `canary-001` through
`canary-008` in identical order.

Promotion requires 24/24 completed oracle-scored cases, one response SHA-256 per
case across all three runs, one oracle outcome per case, all eight response
hashes equal to the R28 direct-Ollama hashes, and the R28 pass vector
`[true,false,true,true,false,false,true,false]`. Any mismatch rejects and reverts
the candidate.

After a pass, production is replaced with the candidate while retaining the old
container as rollback. Health, authentication, image identity, database mount,
and a focused API smoke must pass. No secret policy, prompt filter, response
redaction, schema change, or data migration is allowed.
