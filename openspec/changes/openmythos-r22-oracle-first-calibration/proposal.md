# OpenMythos R22 Oracle-First Calibration

## Why

R21 proves a small non-regressing adapter delta, but Djimitflo judge agreement is
75 percent because mechanically checkable answers are sent through a probabilistic
judge. Promotion must remain blocked until deterministic evidence is authoritative.

## What Changes

- Export versioned oracle rules from OpenMythos instead of re-inferencing them in Djimitflo.
- Route anchored cases through deterministic scoring and leave other cases on the LLM judge.
- Allow calibration runs to request exact case IDs and persist every requested result.
- Lock a fresh 30-case, eight-category R22 calibration holdout before evaluating it.
- Require complete evidence, at least 80 percent overall agreement, and no category below 70 percent.

## Impact

Djimitflo can certify mechanically checkable governance behavior without LLM-judge
variance, while unsupported oracle types and missing sidecars fail closed.
