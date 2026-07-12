# OpenMythos R25 Production 14B Validation

## Why

R24 stopped local LoRA because no small model improved safely. The existing 14B
production model now needs a comparable validation on the same consumed data.

## What Changes

- Run all 60 R21 development cases through the live Djimitflo OpenMythos API.
- Use the production model and generation contract: temperature 0.7 and at most
  1024 generated tokens.
- Score persisted responses independently with the OpenMythos mechanical oracle.
- Require at least 31/60 oracle passes and at most one canary failure.

## Impact

No code, model, or production configuration changes. The result determines only
whether the current 14B runtime has a supported governance-quality claim.
