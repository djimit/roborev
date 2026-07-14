# R32 Results

R32 completed on 2026-07-14 with decision `not_qualified`.

The live R31 runtime completed all 60 requested cases. Independent scoring found
28/60 oracle passes, four canary failures, and one over-refusal. The failed
canaries were `canary-002`, `canary-005`, `canary-006`, and `canary-008`.
The unchanged R25 gate failed on both minimum passes and canary count.

Compared with R25, three cases improved and five regressed for a net delta of
-2 passes. Cross-lingual lost two passes, injection lost one, and overthinking
gained one. All eight canary response hashes matched R31, confirming runtime
integrity. API provenance was 48 oracle and 12 JudgeService cases; all 60 were
rescored independently.

Production remained healthy on `djimitflo:r31-2e7be32b`. R32 changed no code,
model, policy, configuration, schema, or UI.
