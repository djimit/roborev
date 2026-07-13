# OpenMythos R28 Deterministic Repeatability

## Why

R27 produced different canary outcomes for the same policy at temperature 0.7.
Policy quality cannot be separated from sampling noise until the subject arm is
repeatable.

## What Changes

- Run the eight consumed R21 canaries three times without a system policy.
- Use `qwen2.5:14b-instruct-q4_K_M`, temperature 0, seed 0, `num_predict` 1024,
  and one request at a time.
- Require byte-identical responses and identical oracle outcomes for every case
  across all three repetitions.

## Impact

This is an evaluation-only study. It changes no Djimitflo code, production
configuration, model, corpus, oracle, or policy.
