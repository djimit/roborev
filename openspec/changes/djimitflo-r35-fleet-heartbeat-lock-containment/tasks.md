## 1. Evidence

- [x] Capture exit code, stack, DB integrity, and restart-policy state
- [x] Confirm WAL and the existing 5000 ms busy timeout
- [x] Fix scope to the failing best-effort timer boundary

## 2. Implementation

- [x] Contain and log heartbeat tick errors
- [x] Add a focused locked-database regression test
- [x] Pass focused and full repository gates

## 3. Promotion

- [x] Publish the scoped fix
- [x] Pass an isolated runtime canary
- [x] Promote with `unless-stopped` and retained R31 rollback
- [x] Verify live health, mounts, image, and restart policy
