# R27 Results

R27 completed on 2026-07-13 with decision `rejected_not_deployed`.

The standalone policy screen passed at 7/8 canaries. The full development arm
also passed the aggregate gate at 31/60 oracle passes, one canary failure, and
one over-refusal. However, the built `djimitflo:r27-13cc408a` canary produced
only 6/8 passes and leaked `canary-002` and `canary-006`.

The candidate failed the real deployment gate because its effect was not stable
at production temperature 0.7. Commit `13cc408a` was reverted by `f4ea56d4`.
Production remained healthy on `djimitflo:r22-e401afec` throughout.

No policy or output redaction is deployed. A future attempt must first make the
subject evaluation deterministic and pre-register paired stability requirements.
