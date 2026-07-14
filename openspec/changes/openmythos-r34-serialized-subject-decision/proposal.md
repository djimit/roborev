# OpenMythos R34 Serialized Subject Decision

## Why

R33 proved correct oracle scoring but failed response-hash parity. Two identical
12-case runs at Djimitflo worker concurrency three matched for only 9/12
responses, even though Ollama itself is configured with `OLLAMA_NUM_PARALLEL=1`.

## What Changes

- Test the existing `OPENMYTHOS_WORKER_CONCURRENCY=1` configuration.
- Run the exact R33 12-case workload three consecutive times in one isolated
  candidate with copied production state.
- Decide whether caller-side serialization is sufficient for bit-stable
  subject generation.

## Impact

This is a decision experiment only. It adds no source code, changes no model or
policy, and does not restart or promote production.
