# Design

Candidates:

- `Qwen/Qwen2.5-0.5B-Instruct`
- `Qwen/Qwen2.5-1.5B-Instruct`
- `Qwen/Qwen2.5-3B-Instruct`

Development manifests:

- `apex-r21-holdout.jsonl`: `eb779432125b427873fcd1b98376b76eb89dd6addd5ba93712b4fc32cb981f82`
- `apex-r21-confirmatory-holdout.jsonl`: `e01051d7c0fd1c5655de9470cde405e2fe82b602f7560db46d2b9416d7cc033c`

All 60 cases must be unique and oracle-applicable. A candidate is valid when it
beats 0.5B by at least 6/60 cases and has no more canary failures. Among valid
candidates, choose the smallest whose pass count is within two cases of the best.
If none qualify, stop local LoRA work and retain the production 14B runtime.
