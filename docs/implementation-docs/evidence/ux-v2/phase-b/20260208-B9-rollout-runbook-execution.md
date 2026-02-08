# Phase B - B9 Rollout Runbook Execution Record

Timestamp (UTC): 2026-02-08T06:54:36Z

Source runbook: `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_ROLLOUT_RUNBOOK.md`

## Execution Summary

This B9 pass is a release-readiness and decision exercise (no production deploy executed in this workspace).  
Each runbook step is marked as:
- `PASS`: verified from Phase B evidence and current gate runs
- `MANUAL`: requires Ryan/ops action in production environment
- `N/A`: not applicable in pre-production decision pass

## B-R0 Preconditions

| Step | Outcome | Evidence | Notes |
|---|---|---|---|
| Phase A completed with GO evidence | PASS | `docs/implementation-docs/evidence/ux-v2/phase-b/20260207-B0-baseline-freeze.md` | Phase A artifact chain verified in B0 |
| Phase B P0/P1 tests pass in pre-prod | PASS | `docs/implementation-docs/evidence/ux-v2/phase-b/20260208-B8-full-test-and-quality-sweep.md` | B8 matrix + full gates green |
| OpenAPI parity checks green | PASS | `docs/implementation-docs/evidence/ux-v2/phase-b/20260207-B1-api-contract-normalization.md`, `docs/implementation-docs/evidence/ux-v2/phase-b/20260208-B8-full-test-and-quality-sweep.md` | Runtime/OpenAPI parity verified |
| On-call staffing + rollback path confirmed | MANUAL | `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md` | Requires production release staffing confirmation |
| Health baseline (`/health/live`, `/health/ready`) | MANUAL | runbook command refs | Execute against production APP_BASE_URL during rollout window |

## B-R1 Deploy Preparation

| Step | Outcome | Evidence | Notes |
|---|---|---|---|
| Confirm release artifact hash | MANUAL | deploy pipeline artifact | Requires CI/CD release execution |
| Confirm environment toggles default-safe | PASS | `src/lib/ux-v2/write-path-gates.ts`, `.env.example` | Unset env resolves to disabled; defaults safe |
| Confirm monitoring dashboards + alert channels armed | MANUAL | Sentry/monitoring dashboards | Ops action required before deploy |

## Toggle State + Recommendation

Current workspace env:
- `UX_V2_ENABLE_BANK_WRITE_PATH`: unset
- `UX_V2_ENABLE_CHARITY_WRITE_PATH`: unset

Runtime interpretation (`src/lib/ux-v2/write-path-gates.ts`): unset != `"true"` -> disabled.

Recommended production configuration for Phase B exit (per request):
- `UX_V2_ENABLE_BANK_WRITE_PATH=false`
- `UX_V2_ENABLE_CHARITY_WRITE_PATH=false`

Rationale:
- B2/B3/B4 parity is complete, but UI exposure is Phase C scope.
- Keep write paths closed in production until Phase C rollout plan explicitly opens them.

## B-R2 Canary Enablement

| Step | Outcome | Evidence | Notes |
|---|---|---|---|
| Deploy Phase B code with restricted toggles | MANUAL | deploy log | Requires production deploy |
| Run API smoke checks | MANUAL | smoke execution logs | Execute after deploy |
| Enable canary partner/traffic slice | N/A | policy note | Deferred by recommended toggle-off policy |
| Flip bank then charity toggles for canary | N/A | policy note | Not executed; intentionally held OFF until Phase C |

## B-R3 Canary Validation

| Validation | Outcome | Evidence | Notes |
|---|---|---|---|
| Karri create flow | PASS (pre-prod) / MANUAL (prod) | `20260208-B8-full-test-and-quality-sweep.md` | Production canary run pending |
| Bank create flow | PASS (pre-prod) / MANUAL (prod) | `20260208-B8-full-test-and-quality-sweep.md` | Production run intentionally deferred with toggles OFF |
| Charity-enabled creation | PASS (pre-prod) / MANUAL (prod) | `20260208-B8-full-test-and-quality-sweep.md` | Production run intentionally deferred with toggles OFF |
| Payout generation for closed board | PASS (pre-prod) / MANUAL (prod) | `20260208-B8-full-test-and-quality-sweep.md` | Production smoke pending |
| Reminder scheduling API | PASS (pre-prod) / MANUAL (prod) | `20260208-B8-full-test-and-quality-sweep.md` | Production smoke pending |

## B-R4 Hold Point (30 minutes)

| Monitor Check | Outcome | Evidence | Notes |
|---|---|---|---|
| Health endpoints 100% | MANUAL | prod logs | Run during live hold window |
| 5xx increase <= 0.5pp | MANUAL | prod dashboard | Live traffic required |
| No sustained payout failure spike | MANUAL | payout dashboard | Live traffic required |
| Reminder job errors stable | MANUAL | reminder logs | Live traffic required |

## B-R5 Progressive Ramp

| Step | Outcome | Evidence | Notes |
|---|---|---|---|
| Controlled ramp increments | N/A | policy note | Not executed in pre-prod decision pass |
| Smoke per increment | N/A | policy note | Not executed |
| Telemetry + finance counters validate | N/A | policy note | Not executed |

## B-R6 Full Enablement

| Step | Outcome | Evidence | Notes |
|---|---|---|---|
| Global enablement executed | N/A | policy note | Not executed; toggles intentionally remain OFF |
| Full smoke suite pass | PASS (pre-prod) / MANUAL (prod) | `20260208-B8-full-test-and-quality-sweep.md`, B9 final gate record | Production smoke pending |
| GO/NO-GO template complete | PASS | `20260208-B9-go-no-go-decision.md` | Completed in B9 |

## B-R7 Rollback Play

| Step | Outcome | Evidence | Notes |
|---|---|---|---|
| Rollback trigger criteria documented | PASS | runbook + `GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md` | Criteria present and reviewed |
| Toggle rollback path documented | PASS | runbook B-R7 | `false/false` rollback sequence documented |
| App rollback procedure documented | PASS | runbook B-R7 | Application rollback before schema rollback |
| Incident/evidence preservation documented | PASS | runbook B-R7 | Explicitly required |

## B-R8 Closeout

| Step | Outcome | Evidence | Notes |
|---|---|---|---|
| Evidence archive complete | PASS | `docs/implementation-docs/evidence/ux-v2/phase-b/` | B0-B9 evidence present |
| Docs sync completed | PASS (Phase B docs/evidence) / MANUAL (prod release notes) | B0-B9 evidence docs | Runtime docs aligned for Phase B; release-note comms manual |
| Follow-ups opened for non-blocking items | PASS | `20260208-B8-full-test-and-quality-sweep.md` waivers | D-009 -> C6, D-010 -> C8 logged |

## Manual Action List (Ryan / Ops)

1. Execute production deploy and record artifact hash.
2. Run production health baseline:
   - `curl -fsS "$APP_BASE_URL/health/live"`
   - `curl -fsS "$APP_BASE_URL/health/ready"`
3. Confirm on-call + dashboards active for rollout window.
4. Keep `UX_V2_ENABLE_BANK_WRITE_PATH=false` and `UX_V2_ENABLE_CHARITY_WRITE_PATH=false` until Phase C UI rollout decision.
5. If toggles are ever enabled in a future phase, execute canary + hold-point sequence from B-R2..B-R5.

## Runbook Hard-Gate Assessment (B9 Context)

- Pre-production hard gates: PASS
- Live production rollout steps: PENDING MANUAL EXECUTION

This runbook execution record supports a Phase B readiness GO recommendation with production execution controlled by Ryan/ops.
