# Gifta UX v2 Phase B Execution Plan

## Phase Objective

Enable UX v2 backend/domain behavior safely after schema-first rollout (Phase A), while preserving production stability and API contract integrity.

## Scope

- API/runtime parity with UX v2 data model.
- Multi-method payout behavior (`karri_card`, `bank`, `charity`).
- Charity domain operationalization.
- Reminder/comms pipeline enablement.
- Backend admin/reporting capabilities required for Phase C UI.

## Out of Scope

- Final UI/UX implementation and visual parity (Phase C).
- Non-UX-v2 feature ideation.

## Dependencies

- Phase A rollout completed with GO evidence.
- Decision register approved and locked.
- Production observability baselines available.

## Milestone Sequence

### B0 - Baseline and Freeze

Tasks:

- confirm Phase A evidence chain
- lock decision register values in code constants/config
- create phase evidence folder

Acceptance:

- `P0`: Phase A GO artifacts verified
- `P1`: decision register cross-check complete
- `P2`: implementation backlog triaged by step IDs

### B1 - API Contract Normalization

Tasks:

- align OpenAPI enums and schemas with runtime and DB
- update request/response shapes for bank + charity fields
- align error taxonomy for validation/unsupported state

Acceptance:

- `P0`: runtime and OpenAPI enum values identical
- `P0`: contract test suite green
- `P1`: deprecation notes documented for changed fields

### B2 - Runtime Gating and Feature Controls

Tasks:

- implement explicit runtime toggles for bank/charity write-path enablement
- enforce no-partial charity payload acceptance
- enforce payout method-specific validation paths

Acceptance:

- `P0`: toggles deterministically block/allow paths
- `P0`: negative tests for forbidden writes pass
- `P1`: operational toggle docs updated

### B3 - Payout Engine Generalization

Tasks:

- replace Karri-only assumptions in payout queries/service/automation
- support expected payout plans by board config
- preserve idempotency by `(dream_board_id, type)` uniqueness

Acceptance:

- `P0`: payout creation handles `karri_card` and `bank` gift payouts
- `P0`: charity payout item generation works for enabled boards
- `P0`: no regression in existing Karri automation

### B4 - Charity Domain Services

Tasks:

- implement charity registry data access/services
- validate active/inactive charity usage rules
- support charity payout aggregation and reporting datasets

Acceptance:

- `P0`: inactive/unknown charity cannot be attached to active board
- `P1`: charity monthly summary query correctness verified
- `P2`: admin-facing service DTOs documented

### B5 - Reminder and Comms Pipeline

Tasks:

- complete due reminder dispatch job (read unsent reminders, send, mark sent)
- add idempotent send protections and retry policy
- integrate required email/WhatsApp template variables

Acceptance:

- `P0`: reminders dispatch exactly once per reminder row
- `P1`: retry behavior bounded and observable
- `P1`: template variable validation tests pass

### B6 - Financial Correctness Pass

Tasks:

- align fee/raised/funded semantics to decision register
- verify contribution totals and payout totals consistency
- ensure webhooks/reconciliation use consistent amount logic

Acceptance:

- `P0`: raised/funded transitions reflect locked semantics
- `P0`: payout calculations reconcile from contribution ledger
- `P1`: regression tests for provider amount checks pass

### B7 - Backend Admin Capability Completion

Tasks:

- expose backend query/services required for Phase C admin sections
- include payouts by method, charity summaries, filterable datasets
- include CSV/report payload definitions

Acceptance:

- `P1`: required datasets available for all Phase C admin screens
- `P1`: pagination/filtering contract tests pass
- `P2`: export schema docs complete

### B8 - Full Test and Quality Sweep

Tasks:

- run full command gate
- execute Phase B test matrix
- run targeted load/smoke checks for critical endpoints

Acceptance:

- `P0`: all command gates pass
- `P0`: critical integration tests pass
- `P1`: no unresolved `P1` regression

### B9 - Production Rollout and Decision

Tasks:

- execute Phase B rollout runbook
- complete GO/NO-GO template with evidence
- finalize closeout and doc sync

Acceptance:

- `P0`: rollout runbook all hard gates pass
- `P0`: signed GO decision
- `P1`: post-release watch window clean

## Global Acceptance Gates

### P0 (Blocking)

- money movement correctness
- payout engine correctness across enabled methods
- API contract parity runtime vs OpenAPI
- no create/contribute/payout critical-path regressions

### P1 (Release Required)

- reminders/comms operational correctness
- admin backend dataset readiness
- observability and alerts in place

### P2 (Polish)

- non-critical optimizations
- report formatting improvements
- non-blocking refactors

## Required Verification Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm openapi:generate
pnpm test tests/unit/openapi-spec.test.ts
```

Recommended targeted runs:

```bash
pnpm test tests/integration
pnpm test tests/unit/payouts
pnpm test tests/unit/openapi-spec.test.ts
```

## Deliverables

- backend code complete for Phase B scope
- updated OpenAPI and platform docs
- Phase B runbook/template/checklist evidence completed
- explicit Phase B exit memo in evidence folder
