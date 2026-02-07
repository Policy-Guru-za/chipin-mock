# Gifta UX v2 Accessibility and Edge Case Test Plan

## Purpose

Convert UX architecture accessibility and edge-case expectations into executable acceptance tests.

## Accessibility Standard

Target: WCAG 2.1 AA across user-facing surfaces.

## Test Areas

### A11Y-01 Keyboard Navigation

Checks:

- all interactive controls reachable by `Tab`
- visible focus indicators
- logical tab order
- modal escape and focus trap behavior

Priority: `P0`

### A11Y-02 Screen Reader Semantics

Checks:

- form labels associated correctly
- icon-only controls have `aria-label`
- status updates use live regions when needed
- decorative images have empty alt text

Priority: `P0`

### A11Y-03 Contrast and Color Reliance

Checks:

- body text contrast >= 4.5:1
- large text >= 3:1
- state indicators not color-only

Priority: `P1`

### A11Y-04 Form Error Accessibility

Checks:

- error messages linked to fields
- required markers accessible
- validation messaging announced

Priority: `P0`

## Edge Case Matrix

| ID | Scenario | Expected Handling | Priority |
|---|---|---|---|
| EC-01 | No contributions by close | graceful close; no payout creation | P0 |
| EC-02 | Duplicate contribution submit | idempotent behavior; no duplicate record | P0 |
| EC-03 | Payment provider timeout | actionable retry UX | P0 |
| EC-04 | Reminder requested after close window | deterministic rejection | P0 |
| EC-05 | Payout fails | retry path + clear status | P0 |
| EC-06 | Charity disabled board with stale charity fields | validation blocks inconsistent payload | P0 |
| EC-07 | Session expiry during create flow | draft recovery and redirect flow | P1 |
| EC-08 | Missing optional media/assets | robust fallback display | P1 |

## Required Test Methods

- automated accessibility checks where available
- manual keyboard and screen-reader checks
- integration tests for edge-case API behavior
- UI smoke checks for empty/loading/error states

## Exit Criteria

- all `P0` accessibility and edge-case tests pass
- no unresolved severe accessibility defects on critical journeys
- `P1` gaps documented with explicit remediation plan if temporary
