# R33 Result

Decision: `rejected_and_reverted`.

The implementation and local gates passed, and the generated sidecar reached
90 unique anchors with no skipped cases. The isolated candidate completed all
12 affected cases with 12 oracle scoring sources and 12/12 agreement with the
independent R32 oracle outcomes.

The mandatory response-parity gate failed. The first run matched 9/12 R32
response hashes; an identical diagnostic repeat matched 8/12 R32 hashes and
only 9/12 hashes from the first isolated run. This demonstrates concurrent
subject-response instability at worker concurrency three.

No live promotion or live 12-case check occurred. Candidate commits
`23824b01` and `1ad733f` were reverted by `0257bf3a` and `1012ecb`.
Production remained on healthy R31 throughout. See
`APEX_R33_ORACLE_SIDECAR_CANDIDATE_REJECTION.md` and
`r33-evidence/parity.json` in the OpenMythos repository for full evidence.
