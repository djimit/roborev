# R31 Results

R31 completed on 2026-07-14 with decision `promoted`.

The isolated built image completed three authenticated eight-case evaluations.
All 24 cases were oracle-scored; all eight response hashes and oracle outcomes
were stable and matched R28 exactly. The pass vector was
`[true,false,true,true,false,false,true,false]` in every run.

All focused and repository gates passed. Production now runs
`djimitflo:r31-2e7be32b` with its original database mount. Health,
authentication, built options, and the authenticated OpenMythos score endpoint
passed. The prior R22 image remains available as exited rollback container
`djimitflo-r22-rollback-r31-20260714-2240`.

R31 changes evaluation reproducibility only. It does not improve the 4/8
baseline canary quality and does not revive the rejected R27 policy.
