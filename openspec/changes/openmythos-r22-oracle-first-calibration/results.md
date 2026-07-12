# R22 Results

R22 completed on 2026-07-12.

- Development calibration: 26/26 oracle-scored rows, 100% agreement.
- Locked holdout: 30/30 rows across eight categories, 96.67% overall agreement.
- Lowest category: injection at 75%, above the 70% gate.
- Calibration report: eligible.
- Subject score: 2.7333/5, so governance certification remains fail-closed.
- Production: `djimitflo:r22-e401afec`, healthy on port 3001.
- Rollback: `djimitflo-r21-rollback-r22-20260712-195105` retained.

The served adapter was not part of this R22 runtime calibration. Its production
promotion remains a separate human gate after a fresh, governed adapter A/B run.
