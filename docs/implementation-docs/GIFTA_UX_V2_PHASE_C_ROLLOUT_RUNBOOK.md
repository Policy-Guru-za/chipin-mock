# Gifta UX v2 Phase C Rollout Runbook

## Purpose

Safely release UX v2 user-facing changes after Phase B backend readiness.

## Release Contract

- Scope: UI/UX rollout only, using Phase B-ready backend behavior.
- Rollback model: application rollback and feature toggle rollback first.
- Hard stop: critical UX flow breakage, severe accessibility defects, or elevated error/failure rates.

## References

- `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_EXECUTION_PLAN.md`
- `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_E2E_UAT_PLAN.md`
- `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_GO_NO_GO_TEMPLATE.md`
- `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_PROD_ROLLOUT_CHECKLIST.md`

## C-R0 Preconditions

1. Phase B GO approved and stable.
2. Phase C `P0/P1` test and UAT results complete.
3. Accessibility and edge-case test plan passed for critical flows.
4. Support/on-call readiness confirmed.

## C-R1 Deploy Preparation

- publish release artifact
- verify config/toggles
- open dashboards and alert channels

## C-R2 Controlled Enablement

1. deploy UI changes with constrained exposure if supported
2. run critical smoke routes:
   - landing
   - host create flow
   - guest board
   - contribution
   - host dashboard
   - admin critical pages

## C-R3 Hold Point (30 minutes)

Monitor:

- frontend error rates
- API failure rates
- payment/contribution completion rates
- payout operation signals

Thresholds:

- no severe error spike
- critical conversion funnel remains within tolerated range

## C-R4 Ramp to Full Exposure

- expand traffic exposure incrementally
- run smoke checks at each increment
- verify telemetry event continuity

## C-R5 Full Release Decision

- complete GO/NO-GO template
- execute full release or rollback

## C-R6 Rollback Play

If rollback required:

1. revert UI deployment
2. disable UX-v2 exposure toggles
3. keep Phase B backend stable unless separate issue found
4. preserve evidence and incident timeline

## C-R7 Closeout

1. archive release evidence
2. update docs with deployed behavior
3. open follow-ups for deferred P2 items
