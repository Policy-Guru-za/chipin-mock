# Gifta UX v2 Phase B GO / NO-GO Template

Date: `YYYY-MM-DD`
Window: `HH:MM-HH:MM (TZ)`
Release lead: `Name`
Operator: `Name`
On-call: `Name`

## Scope Confirmation

- [ ] Phase B backend behavior enablement only
- [ ] Phase C UI rollout excluded

## Pre-GO Gates (All PASS)

| Gate | Check | Evidence | Status |
|---|---|---|---|
| BG-01 | Phase A completion confirmed | link | `[ ] PASS [ ] FAIL` |
| BG-02 | Phase B P0 tests pass | test report link | `[ ] PASS [ ] FAIL` |
| BG-03 | Phase B P1 tests pass | test report link | `[ ] PASS [ ] FAIL` |
| BG-04 | OpenAPI parity pass | command output link | `[ ] PASS [ ] FAIL` |
| BG-05 | Health baseline green | health output | `[ ] PASS [ ] FAIL` |
| BG-06 | Rollback path validated | ticket/log | `[ ] PASS [ ] FAIL` |

If any FAIL, do not proceed.

## Live Execution Log

- Deploy start: `HH:MM`
- Canary start: `HH:MM`
- Hold point start: `HH:MM`
- Hold point end: `HH:MM`
- Full enablement: `HH:MM`

Notes:

`...`

## Validation Gates (All PASS)

| Gate | Check | Evidence | Status |
|---|---|---|---|
| BV-01 | Karri create flow | smoke link | `[ ] PASS [ ] FAIL` |
| BV-02 | Bank create flow | smoke link | `[ ] PASS [ ] FAIL` |
| BV-03 | Charity create flow | smoke link | `[ ] PASS [ ] FAIL` |
| BV-04 | Payout generation parity | evidence link | `[ ] PASS [ ] FAIL` |
| BV-05 | Reminder scheduling and dispatch health | evidence link | `[ ] PASS [ ] FAIL` |
| BV-06 | Error-rate thresholds respected | dashboard link | `[ ] PASS [ ] FAIL` |
| BV-07 | No critical regressions in existing flows | smoke link | `[ ] PASS [ ] FAIL` |

## Decision

- [ ] GO
- [ ] NO-GO

Timestamp: `HH:MM`
Rationale:

`...`

## If NO-GO

Reason:

- [ ] Critical functional regression
- [ ] Contract/API regression
- [ ] Financial correctness concern
- [ ] Error spike
- [ ] Other: `...`

Rollback timeline:

- Started: `HH:MM`
- Completed: `HH:MM`

Incident link:

`...`

## Sign-Off

Engineering: `Name/Time`
Ops: `Name/Time`
Product: `Name/Time`
