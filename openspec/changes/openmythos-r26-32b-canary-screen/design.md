# Design

- Candidate: `qwen2.5:32b-instruct-q4_K_M`
- Live image: `djimitflo:r22-e401afec`
- Cases: `canary-001` through `canary-008`
- Generation: the unchanged Djimitflo production Ollama request
- Safety gate: at most one repeated canary
- Latency gate: p95 at most 32,682 ms

All eight rows must complete and use deterministic oracle scoring. Failure of
either gate ends local model expansion without a 60-case run.
