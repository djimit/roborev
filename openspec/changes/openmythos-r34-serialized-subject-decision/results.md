# R34 Result

Decision: `rejected`.

All three isolated concurrency-one runs completed 12/12 cases, used oracle
scoring for 36/36 executions, matched independent R32 oracle outcomes for
36/36, and finished within 49 seconds.

The mandatory pairwise response-hash gate failed: run pairs matched 10/12,
10/12, and 12/12. `tool-scope-011` and `tool-scope-015` differed between the
first and later runs. Serialization alone is therefore not qualified.

No source or production change was made and all candidate runtime artifacts
were removed. A later independent `SQLITE_BUSY` in the periodic fleet-mesh
service terminated R31 because restart policy was `no`; DB integrity passed and
the exact same R31 container was restarted healthy. See
`APEX_R34_SERIALIZED_SUBJECT_DECISION.md` and `r34-evidence/parity.json` in the
OpenMythos repository.
