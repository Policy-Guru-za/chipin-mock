# Gifta UX v2 Phase B Production Rollout Checklist

## 1) Pre-Flight

| ID | Task | Evidence | Done |
|---|---|---|---|
| B0-01 | Phase A GO evidence verified | link | [ ] |
| B0-02 | Phase B test matrix complete (`P0/P1`) | link | [ ] |
| B0-03 | OpenAPI parity verified | command output | [ ] |
| B0-04 | Health baseline green | `/health/live`, `/health/ready` | [ ] |
| B0-05 | Rollback route validated | release notes | [ ] |

## 2) Deploy + Canary

| ID | Task | Evidence | Done |
|---|---|---|---|
| B1-01 | Deploy artifact released | deploy log | [ ] |
| B1-02 | Toggle state confirmed default-safe | config snapshot | [ ] |
| B1-03 | Canary scope enabled | runbook note | [ ] |
| B1-04 | Canary smoke: karri create | smoke link | [ ] |
| B1-05 | Canary smoke: bank create | smoke link | [ ] |
| B1-06 | Canary smoke: charity config create | smoke link | [ ] |
| B1-07 | Canary smoke: payout generation | smoke link | [ ] |

## 3) Hold Point

| ID | Task | Evidence | Done |
|---|---|---|---|
| B2-01 | 30-min hold started | timestamp | [ ] |
| B2-02 | Health polls all 200 | logs | [ ] |
| B2-03 | 5xx delta <= threshold | dashboard | [ ] |
| B2-04 | No sustained payout failure spike | dashboard | [ ] |
| B2-05 | Reminder pipeline healthy | dashboard | [ ] |

## 4) Full Enablement

| ID | Task | Evidence | Done |
|---|---|---|---|
| B3-01 | Global enablement executed | config log | [ ] |
| B3-02 | Full smoke suite pass | test log | [ ] |
| B3-03 | GO/NO-GO template complete | doc link | [ ] |

## 5) Closeout

| ID | Task | Evidence | Done |
|---|---|---|---|
| B4-01 | Evidence archived | folder link | [ ] |
| B4-02 | Docs synced (API/CANONICAL/DATA) | commit link | [ ] |
| B4-03 | Follow-ups logged | tickets | [ ] |

## Final Status

- [ ] Phase B accepted
- [ ] Phase B rolled back
