# Design

The immutable study set is the canary subset of
`apex-r21-holdout.jsonl` and `apex-r21-confirmatory-holdout.jsonl`: eight unique
cases already consumed by prior development work. Calls use the local Ollama
`/api/generate` endpoint with no system prompt, temperature 0, seed 0,
`num_predict` 1024, streaming disabled, and sequential execution.

Each response is hashed with SHA-256. R28 passes only when all 24 calls
complete, all eight cases have one response hash across three repetitions, and
each case has one oracle-pass value across three repetitions. Latency and the
number of oracle passes are reported but are not promotion gates.

Passing R28 authorizes only a separately pre-registered deterministic paired
base/policy evaluation on consumed development data. It does not authorize a
production or policy change. Failure stops the policy line until the runtime
nondeterminism is isolated.
