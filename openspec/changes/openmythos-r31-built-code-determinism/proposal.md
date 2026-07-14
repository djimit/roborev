# OpenMythos R31 Built-Code Determinism

## Why

R28 proved exact repeatability with temperature 0 and seed 0 through direct
Ollama calls. The real Djimitflo evaluation service still uses temperature 0.7
without a seed, so production evaluation remains stochastic.

## What Changes

- Change only the subject options to temperature 0 and seed 0; retain
  `num_predict` 1024 and add no policy.
- Build an isolated candidate and run the same eight canaries three times
  through the authenticated Djimitflo API at the live concurrency of three.
- Require exact response and oracle stability plus per-case parity with R28.
- Promote only after all code and canary gates pass, preserving an immediate
  rollback container and the existing production database.

## Impact

The change affects OpenMythos subject sampling only. It does not change normal
agent serving, prompts, policies, cases, oracles, persisted data, or UI behavior.
