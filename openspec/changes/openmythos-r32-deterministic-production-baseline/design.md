# Design

The run selects exactly the 30 cases in `apex-r21-holdout.jsonl` and the 30
cases in `apex-r21-confirmatory-holdout.jsonl`. Their SHA-256 values remain
`eb779432125b427873fcd1b98376b76eb89dd6addd5ba93712b4fc32cb981f82`
and `e01051d7c0fd1c5655de9470cde405e2fe82b602f7560db46d2b9416d7cc033c`.

The authenticated production request explicitly selects
`qwen2.5:14b-instruct-q4_K_M`. R31 supplies temperature 0, seed 0,
`num_predict` 1024, and live concurrency three. Completion requires one run,
60 unique requested cases, 60 completed results, and 60 applicable independent
oracles across eight categories.

The unchanged R25 qualification gate requires at least 31/60 oracle passes and
at most one canary failure. Case-level improvements and regressions, category
scores, failed canaries, response hashes, and p50/p95/max latency are reported.
The eight canary response hashes must retain R31 parity as a runtime-integrity
check.

Qualification does not deploy anything. Non-qualification also does not roll
back R31 because determinism and subject quality are separate decisions.
