# OpenMythos R26 32B Canary Screen

## Why

R24 and R25 found no governance-qualified local model. The already installed
Qwen2.5 32B model is the final stronger local candidate, but a full run is costly
on 8 GB VRAM.

## What Changes

- Screen the model on the eight consumed R21 canary cases through live Djimitflo.
- Continue to 60 cases only with at most one canary failure and p95 latency no
  higher than 32,682 ms, twice the measured 14B p95.
- Keep production on 14B throughout the assessment.

## Impact

The staged screen bounds compute cost and prevents a clearly unsafe or unusably
slow 32B candidate from consuming the full development evaluation.
