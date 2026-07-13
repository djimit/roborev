# R28 Results

R28 completed on 2026-07-13 with decision `pass`.

All 24 sequential subject calls completed. Every one of the eight canary cases
produced one exact response hash and one oracle outcome across three
repetitions. Oracle passes were `[4, 4, 4]`; the stable failures were
`canary-002`, `canary-005`, `canary-006`, and `canary-008`. The machine evidence
SHA-256 is
`e2af188f395a69df9ebfc4d3138abac995029e6bca593bab3b9117ee7a71f7b9`.

This result proves repeatability only. It does not approve a policy or
production change. A deterministic paired base/policy evaluation requires its
own pre-registration. Production remained healthy on
`djimitflo:r22-e401afec`.
