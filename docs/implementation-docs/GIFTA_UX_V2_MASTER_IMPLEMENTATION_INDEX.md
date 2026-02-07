# Gifta UX v2 Master Implementation Index

## Purpose

Authoritative entry point for UX v2 implementation. Defines the document set, required execution order, gating, and evidence chain so an AI coding agent can execute without ambiguity.

## Scope Boundary

- In scope: UX v2 backend enablement (Phase B), UX/UI rollout (Phase C), production rollouts, validation, rollback, closeout.
- Already covered by Phase A docs: schema-first migration release only.
- Out of scope in this index: feature ideation and roadmap beyond UX v2 delivery.

## Source of Truth Hierarchy

1. `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`
2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
3. Phase plans (`PHASE_B_EXECUTION_PLAN`, `PHASE_C_EXECUTION_PLAN`)
4. Rollout docs (runbooks/templates/checklists)
5. Supporting specs (API, payout, charity, reminders/comms, telemetry, copy, a11y, UAT)

If conflicts exist, higher level wins.

## Required Read Order

1. `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`
2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
3. `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_EXECUTION_PLAN.md`
4. `docs/implementation-docs/GIFTA_UX_V2_API_CONTRACT_PARITY_SPEC.md`
5. `docs/implementation-docs/GIFTA_UX_V2_PAYOUT_ENGINE_SPEC.md`
6. `docs/implementation-docs/GIFTA_UX_V2_CHARITY_DOMAIN_SPEC.md`
7. `docs/implementation-docs/GIFTA_UX_V2_REMINDERS_AND_COMMS_SPEC.md`
8. `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_TEST_MATRIX.md`
9. `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_ROLLOUT_RUNBOOK.md`
10. `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_GO_NO_GO_TEMPLATE.md`
11. `docs/implementation-docs/GIFTA_UX_V2_PHASE_B_PROD_ROLLOUT_CHECKLIST.md`
12. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_EXECUTION_PLAN.md`
13. `docs/implementation-docs/GIFTA_UX_V2_SCREEN_COMPONENT_DELTA_SPEC.md`
14. `docs/implementation-docs/GIFTA_UX_V2_COPY_CONTENT_MATRIX.md`
15. `docs/implementation-docs/GIFTA_UX_V2_ACCESSIBILITY_AND_EDGE_CASE_TEST_PLAN.md`
16. `docs/implementation-docs/GIFTA_UX_V2_ANALYTICS_TELEMETRY_SPEC.md`
17. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_E2E_UAT_PLAN.md`
18. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_ROLLOUT_RUNBOOK.md`
19. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_GO_NO_GO_TEMPLATE.md`
20. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_PROD_ROLLOUT_CHECKLIST.md`

## Existing Phase A Documents (Must Remain in Chain)

- `docs/implementation-docs/GIFTA_UX_V2_DB_ROLLOUT_RUNBOOK.md`
- `docs/implementation-docs/GIFTA_UX_V2_GO_NO_GO_TEMPLATE.md`
- `docs/implementation-docs/GIFTA_UX_V2_PROD_ROLLOUT_CHECKLIST.md`

These govern schema-first rollout and must be executed before Phase B in production.

## Document Register

| ID | Document | Primary Outcome | Phase | Mandatory For |
|---|---|---|---|---|
| IDX | `GIFTA_UX_V2_MASTER_IMPLEMENTATION_INDEX.md` | Global navigation + precedence | Control | All work |
| CTR | `GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md` | Deterministic execution contract | Control | All work |
| DEC | `GIFTA_UX_V2_DECISION_REGISTER.md` | Locked decisions | Control | All work |
| B-PLAN | `GIFTA_UX_V2_PHASE_B_EXECUTION_PLAN.md` | Backend enablement sequence | B | Implementation |
| B-API | `GIFTA_UX_V2_API_CONTRACT_PARITY_SPEC.md` | API/runtime/OpenAPI parity | B | API changes |
| B-PAYOUT | `GIFTA_UX_V2_PAYOUT_ENGINE_SPEC.md` | Multi-type payout behavior | B | Payouts |
| B-CHAR | `GIFTA_UX_V2_CHARITY_DOMAIN_SPEC.md` | Charity domain lifecycle | B | Charity |
| B-COMMS | `GIFTA_UX_V2_REMINDERS_AND_COMMS_SPEC.md` | Reminder + comms behavior | B | Reminders/comms |
| B-TEST | `GIFTA_UX_V2_PHASE_B_TEST_MATRIX.md` | Test coverage and gates | B | Verification |
| B-RUN | `GIFTA_UX_V2_PHASE_B_ROLLOUT_RUNBOOK.md` | Prod execution runbook | B | Deployment |
| B-GNG | `GIFTA_UX_V2_PHASE_B_GO_NO_GO_TEMPLATE.md` | Decision evidence | B | Deployment |
| B-CHK | `GIFTA_UX_V2_PHASE_B_PROD_ROLLOUT_CHECKLIST.md` | Operator task checklist | B | Deployment |
| C-PLAN | `GIFTA_UX_V2_PHASE_C_EXECUTION_PLAN.md` | UI/UX rollout sequence | C | Implementation |
| C-DELTA | `GIFTA_UX_V2_SCREEN_COMPONENT_DELTA_SPEC.md` | Route/component delta map | C | UI implementation |
| C-COPY | `GIFTA_UX_V2_COPY_CONTENT_MATRIX.md` | Canonical UX copy | C | UI + comms |
| C-A11Y | `GIFTA_UX_V2_ACCESSIBILITY_AND_EDGE_CASE_TEST_PLAN.md` | A11y + edge-case acceptance | C | QA |
| C-TELE | `GIFTA_UX_V2_ANALYTICS_TELEMETRY_SPEC.md` | Event/metrics/alerts | C | Observability |
| C-UAT | `GIFTA_UX_V2_PHASE_C_E2E_UAT_PLAN.md` | E2E/UAT execution | C | Release readiness |
| C-RUN | `GIFTA_UX_V2_PHASE_C_ROLLOUT_RUNBOOK.md` | Prod UX rollout runbook | C | Deployment |
| C-GNG | `GIFTA_UX_V2_PHASE_C_GO_NO_GO_TEMPLATE.md` | Decision evidence | C | Deployment |
| C-CHK | `GIFTA_UX_V2_PHASE_C_PROD_ROLLOUT_CHECKLIST.md` | Operator task checklist | C | Deployment |

## Phase Entry and Exit Criteria

### Phase A -> Phase B Entry

- Phase A GO decision archived with evidence.
- No unresolved migration anomalies.
- Schema objects and enum drift checks pass.

### Phase B Exit

- P0 + P1 gates from Phase B plan pass.
- API contract parity is green.
- Payout engine supports required payout types without regression.
- Phase B rollout completed with signed GO record.

### Phase C Exit

- UX v2 parity achieved against architecture document.
- Accessibility and edge-case test plan passes at required thresholds.
- UAT signoff complete.
- Phase C rollout completed with signed GO record.

## Evidence Requirements

Store release evidence under one folder per phase execution:

- `docs/implementation-docs/evidence/ux-v2/phase-b/<YYYYMMDD-HHMM>/...`
- `docs/implementation-docs/evidence/ux-v2/phase-c/<YYYYMMDD-HHMM>/...`

Minimum artifacts:

- command outputs for all gate commands
- screenshots for UI parity checks
- test reports
- rollout timelines
- incident notes (if any)

## Change Control

Any change to a locked decision or acceptance gate requires:

1. Update `GIFTA_UX_V2_DECISION_REGISTER.md` with rationale.
2. Update affected plan/runbook/checklist docs in same change set.
3. Re-run impacted gates.
