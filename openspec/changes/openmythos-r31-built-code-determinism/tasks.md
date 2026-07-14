## 1. Pre-registration

- [x] Fix code scope, runtime, cases, repetition count, and parity reference
- [x] Fix exact-response, oracle, health, and rollback gates
- [x] Exclude policy, filtering, schema, UI, and data changes

## 2. Implementation

- [x] Change subject sampling to temperature 0 and seed 0
- [x] Add one focused request-body assertion
- [x] Pass focused and repository verification

## 3. Isolated Validation

- [x] Build the candidate and start it with copied production state
- [x] Run three authenticated eight-case API evaluations
- [x] Verify exact repeatability and R28 cross-path parity

## 4. Promotion

- [x] Promote only after every gate passes; otherwise revert
- [x] Verify production health, auth, image, DB mount, and rollback
- [x] Publish evidence and final repository/runtime state
