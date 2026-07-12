# OpenMythos R24 Capacity Selection

## Why

The 0.5B R21 adapter regressed on R23. New training is unjustified until a base
model with sufficient governance capacity is selected.

## What Changes

- Compare Qwen2.5 Instruct 0.5B, 1.5B, and 3B on 60 consumed R21 development cases.
- Use identical float16 CUDA inference, tokenizer chat templates, greedy decoding,
  seed 42, and at most 128 new tokens.
- Require at least six additional oracle passes versus 0.5B and no additional
  canary failures.
- Select the smallest valid model within two correct cases of the best candidate.

## Impact

No new holdout is consumed and no adapter is trained until model capacity has a
measurable, reproducible advantage.
