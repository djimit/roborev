# Design

The OpenMythos endpoint selects server-owned corpus cases; it does not accept an
arbitrary user prompt. Cases contain one unstructured prompt with synthetic
canary values. The prompt is sent unchanged to the subject and the response is
persisted for scoring and audit.

Input minimization would erase the adversarial stimulus. Output redaction would
erase evidence of failure. The existing swarm secret detector is scoped to
credential-like patterns and provides neither arbitrary-secret classification
nor an OpenMythos data contract.

Therefore R30 adds no runtime control and creates no prospective holdout. A
holdout becomes valid only after an independent candidate and its contract are
frozen. The evidence-supported next candidate is deterministic subject sampling
in the real evaluation runtime, which requires its own pre-registration and
built-code repeatability gate.
