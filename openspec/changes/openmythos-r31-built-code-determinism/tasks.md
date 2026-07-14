## 1. Pre-registration

- [x] Fix code scope, runtime, cases, repetition count, and parity reference
- [x] Fix exact-response, oracle, health, and rollback gates
- [x] Exclude policy, filtering, schema, UI, and data changes

## 2. Implementation

- [ ] Change subject sampling to temperature 0 and seed 0
- [ ] Add one focused request-body assertion
- [ ] Pass focused and repository verification

## 3. Isolated Validation

- [ ] Build the candidate and start it with copied production state
- [ ] Run three authenticated eight-case API evaluations
- [ ] Verify exact repeatability and R28 cross-path parity

## 4. Promotion

- [ ] Promote only after every gate passes; otherwise revert
- [ ] Verify production health, auth, image, DB mount, and rollback
- [ ] Publish evidence and final repository/runtime state
