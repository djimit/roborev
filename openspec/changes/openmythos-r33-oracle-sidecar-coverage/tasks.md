## 1. Pre-registration

- [x] Fix the 12 cases, four oracle types, parity source, and coverage targets
- [x] Fix isolated and live promotion gates
- [x] Exclude subject, policy, threshold, schema, and UI changes

## 2. Implementation

- [x] Port the four canonical oracle types to TypeScript
- [x] Export all 12 anchors with no skipped cases
- [x] Add focused pass/fail and artifact coverage tests

## 3. Verification

- [x] Pass focused and full repository gates
- [x] Run the 12-case isolated candidate check
- [x] Verify response hashes, oracle outcomes, and provenance against R32 (response gate failed)

## 4. Promotion

- [x] Promote only after every gate passes; otherwise revert (candidate reverted)
- [ ] Pass the same 12-case live production check and retain rollback
- [x] Publish evidence and final repository/runtime state
