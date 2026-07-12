# Design

Target:

- Runtime: live `djimitflo:r22-e401afec`
- Model: `qwen2.5:14b-instruct-q4_K_M`
- API: `POST /api/openmythos/eval/r25-production-14b-development`
- Cases: exact union of the two R21 development manifests, 60 unique cases

The live service produces and persists responses. A separate OpenMythos pass
merges the two manifest annotations with the corpus and recomputes all 60
mechanical oracle outcomes. Qualification requires complete coverage, at least
31 passes, and no more than one canary failure. Failure does not remove the model
from production; it prevents a governance-promotion claim.
