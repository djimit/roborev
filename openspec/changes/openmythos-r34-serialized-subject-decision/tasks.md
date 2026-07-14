## 1. Pre-registration

- [x] Fix the single existing configuration under test
- [x] Fix the three-run hash, outcome, provenance, and duration gates
- [x] Exclude source, model, policy, sidecar, and production changes

## 2. Isolated Candidate

- [ ] Build the reverted R33 candidate from detached source
- [ ] Start with copied production state and worker concurrency one
- [ ] Run the exact 12-case request three consecutive times

## 3. Decision

- [ ] Compare all pairwise response hashes
- [ ] Verify all oracle outcomes and provenance against R32
- [ ] Reject or qualify serialization without promoting it
- [ ] Clean up and publish evidence plus final runtime state
