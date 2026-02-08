# Gifta UX v2 Phase B Production Rollout Checklist (Completed Record)

Source checklist: `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_PROD_ROLLOUT_CHECKLIST.md`

## 1) Pre-Flight

| ID | Task | Evidence | Done |
|---|---|---|---|
| B0-01 | Phase A GO evidence verified | `20260207-B0-baseline-freeze.md` | [x] |
| B0-02 | Phase B test matrix complete (`P0/P1`) | `20260208-B8-full-test-and-quality-sweep.md` | [x] |
| B0-03 | OpenAPI parity verified | `20260207-B1-api-contract-normalization.md`, B9 gate run (`openapi:generate`, `openapi-spec`) | [x] |
| B0-04 | Health baseline green | Runbook manual step (`curl /health/live`, `curl /health/ready`) | [ ] MANUAL |
| B0-05 | Rollback route validated | `20260208-B9-rollout-runbook-execution.md` (B-R7) | [x] |

## 2) Deploy + Canary

| ID | Task | Evidence | Done |
|---|---|---|---|
| B1-01 | Deploy artifact released | production deploy log | [ ] MANUAL |
| B1-02 | Toggle state confirmed default-safe | `src/lib/ux-v2/write-path-gates.ts`, `20260208-B9-rollout-runbook-execution.md` | [x] |
| B1-03 | Canary scope enabled | runbook canary note | [ ] MANUAL |
| B1-04 | Canary smoke: karri create | production smoke logs | [ ] MANUAL |
| B1-05 | Canary smoke: bank create | production smoke logs | [ ] MANUAL |
| B1-06 | Canary smoke: charity config create | production smoke logs | [ ] MANUAL |
| B1-07 | Canary smoke: payout generation | production smoke logs | [ ] MANUAL |

Note:
- Recommended production config remains `UX_V2_ENABLE_BANK_WRITE_PATH=false` and `UX_V2_ENABLE_CHARITY_WRITE_PATH=false` until Phase C readiness.

## 3) Hold Point

| ID | Task | Evidence | Done |
|---|---|---|---|
| B2-01 | 30-min hold started | production timestamp log | [ ] MANUAL |
| B2-02 | Health polls all 200 | production logs | [ ] MANUAL |
| B2-03 | 5xx delta <= threshold | production dashboard | [ ] MANUAL |
| B2-04 | No sustained payout failure spike | production dashboard | [ ] MANUAL |
| B2-05 | Reminder pipeline healthy | production dashboard/logs | [ ] MANUAL |

## 4) Full Enablement

| ID | Task | Evidence | Done |
|---|---|---|---|
| B3-01 | Global enablement executed | config/deploy log | [ ] N/A (deferred; toggles intentionally OFF) |
| B3-02 | Full smoke suite pass | B8 + B9 test sweeps (pre-prod) | [x] (pre-prod), [ ] MANUAL (production) |
| B3-03 | GO/NO-GO template complete | `20260208-B9-go-no-go-decision.md` | [x] |

## 5) Closeout

| ID | Task | Evidence | Done |
|---|---|---|---|
| B4-01 | Evidence archived | `docs/implementation-docs/evidence/ux-v2/phase-b/` | [x] |
| B4-02 | Docs synced (API/CANONICAL/DATA) | B0-B9 evidence + Phase B docs | [x] |
| B4-03 | Follow-ups logged | B8 waivers in `20260208-B8-full-test-and-quality-sweep.md` | [x] |

## Final Status

- [x] Phase B accepted (engineering readiness GO)
- [ ] Phase B rolled back

Operational note:
- Production deploy/canary/hold-window execution remains manual by Ryan/ops.
