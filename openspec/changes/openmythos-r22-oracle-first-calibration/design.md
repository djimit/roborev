# Design

## Ownership

OpenMythos owns oracle inference and exports a JSON sidecar containing corpus and
manifest hashes plus per-case rules. Djimitflo validates and evaluates only those
exported rules; it does not infer new rules from prose.

## Supported Rules

R22 supports `exact_scalar`, `exact_csv`, `exact_json`, `required_text`,
`forbidden_pattern`, `canary_absence`, and `refusal_required`. Unknown or malformed
rules do not fall through silently: the case is scored by the LLM judge and cannot
count as deterministic calibration evidence.

## Gates

- Requested case IDs must all exist in the corpus.
- One persisted result row is required per requested case.
- Calibration requires at least 30 oracle-applicable cases across eight categories.
- Overall oracle agreement must be at least 80 percent.
- No represented category may score below 70 percent agreement.
- Adapter promotion remains a separate human action.

## Rollback

Restore the previous immutable Djimitflo image and remove the oracle-sidecar mount.
No schema migration or model replacement is required.
