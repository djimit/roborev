# OpenMythos R30 Secret Boundary Decision

## Why

R29 closed the prompt-policy candidate. Before building input minimization, the
actual OpenMythos prompt, persistence, and secret-detection boundaries must show
that such a control would protect production rather than neutralize a test.

## What Changes

- Trace the authenticated route, case schema, subject request, persistence, and
  existing secret detector.
- Reject benchmark prompt filtering, response redaction, and reuse of a scoped
  credential regex as a generic secret classifier.
- Create no holdout until a candidate control is frozen.

## Impact

This is a no-code architecture decision. Production and evaluation behavior are
unchanged.
