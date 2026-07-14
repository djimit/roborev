# Design

The missing types are `tool_scope_boundary`, `no_fabricated_doi`,
`no_fabricated_legal_authority`, and `no_fabricated_metrics`. Their TypeScript
implementation must match `scripts/oracle_score.py` exactly, including refusal,
forbidden exact value, forbidden claim, DOI, legal-authority, and latency-value
semantics.

`r22_oracle_calibration.py` expands its supported-type set and regenerates the
same sidecar deterministically. Acceptance requires 90 unique anchors,
`skipped=[]`, unchanged manifest and corpus hashes, all 60 R32 case IDs anchored,
and unit coverage for passing and failing examples of every new type.

The candidate runs with copied production state, the new sidecar, the R31
deterministic subject options, and live concurrency three. Only the 12 formerly
missing cases run. All must complete with `scoringSource=oracle`, retain their
R32 response SHA-256, and match the independent R32 oracle outcomes. Any mismatch
rejects and reverts the candidate.

After an isolated pass, production may promote with R31 retained as rollback.
The same 12-case live check must then pass. No full 60-case model rerun is
allowed because the remaining 48 paths are unchanged.
