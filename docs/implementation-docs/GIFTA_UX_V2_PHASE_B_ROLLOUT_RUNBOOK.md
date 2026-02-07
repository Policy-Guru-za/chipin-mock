# Gifta UX v2 Phase B Rollout Runbook

## Purpose

Safely roll out Phase B backend behavior enablement after schema-first migration.

## Release Contract

- Scope: backend behavior enablement for UX v2 (API/payout/charity/reminders/comms).
- Non-scope: UI rollout (Phase C).
- Rollback model: application rollback first; schema stays forward unless pre-approved rollback script exists.

## References

- `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_EXECUTION_PLAN.md`
- `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_TEST_MATRIX.md`
- `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_GO_NO_GO_TEMPLATE.md`
- `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_PROD_ROLLOUT_CHECKLIST.md`

## B-R0 Preconditions

1. Phase A completed with GO evidence.
2. Phase B `P0/P1` tests pass in pre-prod.
3. OpenAPI parity checks green.
4. On-call staffing and rollback path confirmed.

Health baseline:

```bash
curl -fsS "$APP_BASE_URL/health/live"
curl -fsS "$APP_BASE_URL/health/ready"
```

Expected: both HTTP `200`.

## B-R1 Deploy Preparation

1. confirm release artifact hash
2. confirm environment toggles default-safe
3. confirm monitoring dashboards open and alert channels armed

Required default-safe values:

- `UX_V2_ENABLE_BANK_WRITE_PATH=false`
- `UX_V2_ENABLE_CHARITY_WRITE_PATH=false`

These gates are config/env driven and can be flipped at deploy time without a code change.

## B-R2 Canary Enablement

1. deploy Phase B code with behavior toggles still restricted
2. run API smoke checks
3. enable behavior toggles for canary partner/traffic slice

Flip sequence (recommended):

1. enable bank writes first: `UX_V2_ENABLE_BANK_WRITE_PATH=true`
2. validate bank create/update + payout downstream observability
3. enable charity writes: `UX_V2_ENABLE_CHARITY_WRITE_PATH=true`
4. validate charity payload validation and active-charity enforcement

Hard stop if critical path fails.

## B-R3 Canary Validation

Validate:

- dream board create with `karri_card`
- dream board create with `bank`
- charity-enabled board creation
- payout generation for closed board
- reminder scheduling API

Expected:

- all success paths behave correctly
- no unexpected 5xx spike

## B-R4 Hold Point (30 minutes)

Monitor every 5 minutes:

- health endpoints
- API 5xx/4xx rate deltas
- payout failure counts
- reminder job error counts

Thresholds:

- health success: 100%
- 5xx increase vs baseline: <= 0.5 percentage points
- no sustained payout-failure spike

## B-R5 Progressive Ramp

1. increase traffic scope in controlled increments
2. run smoke checks per increment
3. validate telemetry and finance counters

## B-R6 Full Enablement

1. enable Phase B behavior globally
2. perform full smoke suite
3. complete GO/NO-GO template

## B-R7 Rollback Play

Trigger rollback if:

- payout correctness defect detected
- contract mismatch causing partner/API breakage
- sustained high error rates

Rollback steps:

1. disable behavior toggles
   - set `UX_V2_ENABLE_BANK_WRITE_PATH=false`
   - set `UX_V2_ENABLE_CHARITY_WRITE_PATH=false`
2. roll back app deployment
3. preserve evidence and incident log
4. communicate NO-GO decision

## B-R8 Closeout

1. archive evidence bundle
2. sync docs (API/CANONICAL/DATA)
3. open follow-up tasks for non-blocking items
