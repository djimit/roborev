## 1. Pre-registration

- [x] Fix the single existing configuration under test
- [x] Fix the three-run hash, outcome, provenance, and duration gates
- [x] Exclude source, model, policy, sidecar, and production changes

## 2. Isolated Candidate

- [x] Build the reverted R33 candidate from detached source
- [x] Start with copied production state and worker concurrency one
- [x] Run the exact 12-case request three consecutive times

## 3. Decision

- [x] Compare all pairwise response hashes (gate failed)
- [x] Verify all oracle outcomes and provenance against R32
- [x] Reject or qualify serialization without promoting it (rejected)
- [x] Clean up and publish evidence plus final runtime state
