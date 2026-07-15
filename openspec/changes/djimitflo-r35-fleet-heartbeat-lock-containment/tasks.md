## 1. Evidence

- [x] Capture exit code, stack, DB integrity, and restart-policy state
- [x] Confirm WAL and the existing 5000 ms busy timeout
- [x] Fix scope to the failing best-effort timer boundary

## 2. Implementation

- [ ] Contain and log heartbeat tick errors
- [ ] Add a focused locked-database regression test
- [ ] Pass focused and full repository gates

## 3. Promotion

- [ ] Publish the scoped fix
- [ ] Pass an isolated runtime canary
- [ ] Promote with `unless-stopped` and retained R31 rollback
- [ ] Verify live health, mounts, image, and restart policy
