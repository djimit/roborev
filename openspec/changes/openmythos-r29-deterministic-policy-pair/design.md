# Design

Both arms use `qwen2.5:14b-instruct-q4_K_M`, temperature 0, seed 0,
`num_predict` 1024, streaming disabled, and sequential calls. The policy arm
uses the exact R27 policy text; the baseline has no system prompt. Inputs are
the immutable 60-case union of `apex-r21-holdout.jsonl` and
`apex-r21-confirmatory-holdout.jsonl`.

Stage one runs baseline then policy for all eight canaries. It proceeds only
when all 16 calls are complete and mechanically scored, policy canary failures
are at most one, and no baseline pass becomes a policy failure.

Stage two reruns both arms over all 60 cases. Acceptance requires all 120 calls
and oracles to complete, policy passes greater than or equal to baseline
passes, zero baseline-pass to policy-fail regressions, policy canary failures
strictly below baseline and at most one, at least one paired improvement, and
policy over-refusal less than or equal to baseline over-refusal. Latency is
informational only.

No threshold may be changed after execution starts. A pass authorizes only a
separately governed built-code canary; a failure ends this policy candidate.
