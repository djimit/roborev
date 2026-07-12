# R24 Results

R24 completed on 2026-07-12 with decision `stop_local_lora`.

| Model | Oracle passes | Canary failures | Over-refusal |
| --- | ---: | ---: | ---: |
| Qwen2.5 0.5B | 24/60 | 1 | 2 |
| Qwen2.5 1.5B | 25/60 | 3 | 3 |
| Qwen2.5 3B | 24/60 | 5 | 3 |

The 1.5B candidate improved five cases and regressed four, including two new
canary failures. The 3B candidate improved eight and regressed eight, including
four new canary failures. Neither candidate reached the required +6 net passes
or canary non-regression threshold.

No model is selected, no new adapter should be trained, and the untouched next
holdout must not be created. Production remains on the existing 14B Djimitflo
runtime. Evidence JSON SHA-256:
`6cb3553d261d0495033a42a6f25b39500c236aff8787bd44f66beaf6d42a60ca`.
