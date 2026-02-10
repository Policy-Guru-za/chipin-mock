# Gifta UX v2 Phase C Execution Plan

## Phase Objective

Deliver full UX v2 UI/UX behavior parity after Phase B backend readiness, across guest, host, contributor, and admin experiences.

## Scope

- route-level UX parity with architecture v2
- host creation flow restructuring
- guest/public board enhancements
- contributor journey + reminder UX
- dashboard and admin UX expansion
- accessibility and responsiveness completion

## Dependencies

- Phase B completed and GO approved
- Phase B APIs stable and contract-locked
- telemetry baseline available

## Milestone Sequence

### C0 - UX Parity Baseline Capture

Tasks:

- capture current UI screenshots for all key routes
- map architecture sections to existing routes/components
- identify mandatory deltas and risk areas

Acceptance:

- `P0`: full route inventory documented
- `P1`: delta map approved

### C1 - Host Creation Flow Restructure

Tasks:

- align flow to architecture sequence (including giving-back and payout UX expectations)
- ensure validation and state persistence for all steps
- keep progress indicator accurate and robust

Acceptance:

- `P0`: step sequencing and data integrity correct
- `P1`: copy and interaction parity complete

### C2 - Public Dreamboard Enhancements

Tasks:

- contributor display behavior parity
- charity section display when enabled
- improved closed/funded/return-visit states

Acceptance:

- `P0`: public state logic correct for active/funded/closed
- `P1`: charity visibility and copy parity complete

### C3 - Contributor Journey Completion

Tasks:

- align amount/details/payment/thank-you flow
- implement remind-me UX touchpoint using Phase B reminder API
- strengthen duplicate/edge handling UX

Acceptance:

- `P0`: contribution path stable across providers
- `P1`: reminder UX fully functional

### C4 - Host Dashboard Expansion

Tasks:

- align list/detail/dashboard sections with architecture
- include payout details and post-campaign summary views
- include notification preference UI surface if in architecture scope

Acceptance:

- `P0`: payout status and totals presented correctly
- `P1`: dashboard section parity complete

### C5 - Admin UX Expansion

Tasks:

- implement admin sections required by architecture (dreamboards, contributions, payouts, charities, reports/settings as scoped)
- connect to Phase B backend datasets

Acceptance:

- `P1`: required admin sections available
- `P1`: filter/search/export paths functional

### C6 - Comms and Content Alignment

Tasks:

- align UI copy and message templates to copy matrix
- remove legacy naming drift
- ensure all user-visible strings use canonical terminology

Acceptance:

- `P0`: no critical legacy-brand strings in active UX surfaces
- `P1`: copy matrix compliance pass

### C7 - Accessibility and Edge Cases

Tasks:

- execute accessibility plan (keyboard, screen reader, contrast, focus)
- implement missing empty/loading/error states
- verify edge-case pathways

Acceptance:

- `P0`: no blocking a11y defects in critical flows
- `P1`: WCAG 2.1 AA target satisfied for key screens

### C8 - E2E/UAT and Performance Sweep

Tasks:

- run UAT scenarios across devices/viewports/providers
- verify telemetry instrumentation
- run regression and performance checks

Acceptance:

- `P0`: critical UAT scenarios pass
- `P1`: telemetry event coverage complete

### C9 - Production Rollout

Tasks:

- execute Phase C rollout runbook
- complete GO/NO-GO template
- complete post-release watch and closeout

Acceptance:

- `P0`: rollout gates pass
- `P0`: signed GO decision
- `P1`: watch window clean

## Global Gate Model

### P0

- critical journey correctness (create/contribute/payout/dashboard)
- no severe accessibility blockers
- no production-breaking regressions

### P1

- full UX parity for committed scope
- robust admin/observability readiness
- complete copy/content parity

### P2

- polish/motion refinements
- low-risk visual improvements

## Required Commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm openapi:generate
pnpm test tests/unit/openapi-spec.test.ts
```

Add E2E/UAT commands as available in repo.

## Exit Criteria

- Phase C `P0/P1` complete
- signed GO decision
- post-release stabilization complete
- docs updated and evidence archived
