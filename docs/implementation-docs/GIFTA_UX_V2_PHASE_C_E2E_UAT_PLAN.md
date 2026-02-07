# Gifta UX v2 Phase C E2E and UAT Plan

## Purpose

Define end-to-end and UAT acceptance scenarios for full UX v2 release readiness.

## Test Personas

- Parent/Host (new board creation)
- Contributor (mobile first)
- Admin operator
- Partner API consumer (read-facing validations)

## Environment Requirements

- Phase B backend enabled in staging
- representative payment provider configuration
- seeded test data for charity and payout cases

## Scenario Matrix

| ID | Persona | Scenario | Priority | Pass Criteria |
|---|---|---|---|---|
| UAT-01 | Host | Create board with Karri payout | P0 | board created; share link works |
| UAT-02 | Host | Create board with bank payout | P0 | board created; bank details persisted securely |
| UAT-03 | Host | Create board with charity percentage split | P0 | charity config accepted; preview accurate |
| UAT-04 | Host | Create board with charity threshold split | P0 | threshold behavior configured correctly |
| UAT-05 | Guest | Contribute via PayFast | P0 | completion path + status updates correct |
| UAT-06 | Guest | Contribute via Ozow | P0 | completion path + status updates correct |
| UAT-07 | Guest | Contribute via SnapScan | P0 | QR flow + status check behavior correct |
| UAT-08 | Guest | Request reminder | P1 | reminder accepted and delivered once |
| UAT-09 | Host | View dashboard progress and payout details | P0 | amounts/statuses correct |
| UAT-10 | Admin | Process payout review flow | P0 | status transitions and audit logs correct |
| UAT-11 | Admin | Charity management/report workflows | P1 | dataset and filtering behavior correct |
| UAT-12 | Accessibility | Keyboard + screen reader on critical routes | P0 | no blocking issues |

## Device and Viewport Matrix

Minimum coverage:

- iPhone Safari viewport class
- Android Chrome viewport class
- Desktop Chrome
- Desktop Safari (if available)

## Data Validation Checks

- goal progress math and funded status
- payout totals and method labels
- charity allocation and reporting consistency
- reminder schedule bounds

## Defect Severity Rules

- Blocker: critical journey broken, money correctness issue, severe a11y failure
- Major: significant UX mismatch or broken non-critical section
- Minor: cosmetic/polish issue

## Exit Criteria

- all `P0` UAT scenarios pass
- no unresolved blocker defects
- `P1` scenarios pass or have explicit approved containment
