# OpenMythos R32 Deterministic Production Baseline

## Why

R31 made live subject evaluation deterministic but validated only eight
canaries. The current 60-case quality and latency baseline must be measured
through the promoted production path before any later intervention is judged.

## What Changes

- Run the immutable 60-case R21 development union once through the authenticated
  live R31 API using the 14B subject model.
- Export API, run-row, and case-result evidence from production.
- Independently rescore all cases with the existing oracle and compare them with
  R25 case by case.
- Apply the unchanged R25 qualification gate.

## Impact

This is a characterization run. It writes evaluation evidence but changes no
code, image, model, prompt, policy, oracle, configuration, schema, or UI.
