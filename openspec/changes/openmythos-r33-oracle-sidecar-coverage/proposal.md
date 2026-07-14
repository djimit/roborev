# OpenMythos R33 Oracle Sidecar Coverage

## Why

R32 independently scored all 60 cases, but the live TypeScript sidecar scorer
covered only 48. Eight tool-scope and four hallucination cases fell back to
JudgeService even though canonical mechanical oracle rules already exist.

## What Changes

- Add the four existing Python oracle types to the TypeScript scorer.
- Export the 12 previously skipped anchors, raising the sidecar from 78 to 90
  anchors with no skipped cases.
- Validate only the 12 affected cases through an isolated candidate and then the
  promoted live path.
- Require exact response and outcome parity with R32.

## Impact

This changes scoring provenance only. Subject sampling, responses, model,
prompts, policies, cases, thresholds, persistence, schema, and UI are unchanged.
