# OpenMythos R23 Adapter A/B Gate

## Why

R22 calibrated deterministic scoring but did not evaluate the trained
`Qwen2.5-0.5B-Instruct` PEFT adapter. Promotion requires direct paired evidence
against its own base model.

## What Changes

- Reuse the locked R22 30-case, eight-category holdout, which postdates training
  and has never been used for this adapter.
- Generate base and adapter responses with identical deterministic decoding.
- Persist responses, oracle outcomes, artifact hashes, and paired changes.
- Promote only with at least two improved cases, zero regressed cases, and no
  increase in over-refusal.

## Impact

The adapter receives one reproducible promotion decision without introducing a
permanent serving component or another evaluation framework.
