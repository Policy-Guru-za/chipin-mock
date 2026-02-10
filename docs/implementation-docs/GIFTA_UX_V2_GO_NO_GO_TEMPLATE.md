# Gifta UX v2 DB Expansion - GO / NO-GO Template

Date: `YYYY-MM-DD`
Release window: `HH:MM-HH:MM (TZ)`
Release lead: `Name`
DB operator: `Name`
On-call: `Name`

Related docs:

- `docs/implementation-docs/GIFTA_UX_V2_DB_ROLLOUT_RUNBOOK.md`
- `docs/implementation-docs/GIFTA_UX_V2_PROD_ROLLOUT_CHECKLIST.md`
- `drizzle/migrations/0012_expand_ux_data_model.sql`

## Release Contract (Authoritative for this rollout)

- Scope: schema-first DB migration only (`0012_expand_ux_data_model`).
- Non-scope: bank/charity UI enablement and any new bank/charity write-path activation.
- Data policy: no backfill; legacy test data is disposable in this phase.
- Rollback model: rollback app deploy first; keep schema forward unless a pre-reviewed DB rollback script is approved.
- Hard stop criteria: partial/failed migration, failed health checks, critical create/contribute/payout breakage, or sustained constraint-error spike.

## Glossary (Normalized Terms)

- Dreamboard: canonical two-word entity name (`dream_boards` table).
- Schema-first: apply DB migration before enabling new product behavior.
- Write-path disabled: bank/charity create/update writes are rejected in production.
- Hold point: mandatory observation window between migration and GO decision.

---

## 1) Scope Confirmation

- Change type: schema-first migration only.
- Migration: `0012_expand_ux_data_model`.
- In scope:
  - bank/charity schema support
  - charities + contribution_reminders tables
  - host/Dreamboard/contribution/payout schema extensions
- Out of scope:
  - bank/charity product launch
  - activation of new bank/charity write paths

Decision note:

`summary...`

---

## 2) Pre-GO Gate (All must be PASS)

Use runbook step IDs for evidence.

| Gate ID | Check | Evidence / Command | Pass Threshold | Status |
|---|---|---|---|---|
| PG-01 | Backup and restore point | Snapshot link | Verified and restorable | `[ ] PASS [ ] FAIL` |
| PG-02 | Change window + on-call | Approval/ticket link | Approved | `[ ] PASS [ ] FAIL` |
| PG-03 | Baseline health | Runbook R0 health commands | `/health/live` and `/health/ready` both 200 | `[ ] PASS [ ] FAIL` |
| PG-04 | Write-path disable probe (bank) | Runbook `R0-C1` | HTTP is not 201 | `[ ] PASS [ ] FAIL` |
| PG-05 | Write-path disable probe (charity) | Runbook `R0-C2` | HTTP is not 201 | `[ ] PASS [ ] FAIL` |
| PG-06 | Migration files present in main | `git ls-files drizzle/migrations/0012_expand_ux_data_model.sql drizzle/migrations/meta/_journal.json` | Both files listed | `[ ] PASS [ ] FAIL` |
| PG-07 | No conflicting DB changes | Release notes/ticket | None active in same window | `[ ] PASS [ ] FAIL` |

If any gate FAILs, do not start migration.

---

## 3) Known Risks and Waivers

| Risk ID | Risk | Mitigation | Waiver Needed? | Approver | Expiry | Notes |
|---|---|---|---|---|---|---|
| RW-001 | Drizzle snapshot collision (`0005`/`0006`) | Use explicit SQL migration path | `Y/N` | `Name` | `YYYY-MM-DD` | |
| RW-002 | Write-path drift (bank/charity unexpectedly enabled) | Run probes R0-C1/R0-C2 and R5 | `Y/N` | `Name` | `YYYY-MM-DD` | |
| RW-003 | Constraint-related production errors | Hold point + monitoring thresholds | `Y/N` | `Name` | `YYYY-MM-DD` | |

Any active waiver must be explicitly approved before GO.

---

## 4) Live Execution Log

Primary command (runbook R2):

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f drizzle/migrations/0012_expand_ux_data_model.sql
```

Execution timeline:

- Start: `HH:MM`
- Migration complete: `HH:MM`
- Validation start: `HH:MM`
- Validation complete: `HH:MM`
- Hold point start: `HH:MM`
- Hold point end: `HH:MM`

Operator notes:

`notes...`

---

## 5) Validation Gate (All must be PASS)

| Gate ID | Check | Evidence / Command | Pass Threshold | Status |
|---|---|---|---|---|
| VG-01 | Tables present | Runbook `R3-Q1` | Both table names non-null | `[ ] PASS [ ] FAIL` |
| VG-02 | Columns present | Runbook `R3-Q2` | All listed columns returned | `[ ] PASS [ ] FAIL` |
| VG-03 | Constraints present | Runbook `R3-Q3` | All five constraints returned | `[ ] PASS [ ] FAIL` |
| VG-04 | Indexes present | Runbook `R3-Q4` | All required indexes returned | `[ ] PASS [ ] FAIL` |
| VG-05 | Enum values | Runbook `R4-Q1` | Expected values present for all enums | `[ ] PASS [ ] FAIL` |
| VG-06 | Post-migration write-path guard (bank) | Runbook `R5` (bank probe) | HTTP is not 201 | `[ ] PASS [ ] FAIL` |
| VG-07 | Post-migration write-path guard (charity) | Runbook `R5` (charity probe) | HTTP is not 201 | `[ ] PASS [ ] FAIL` |
| VG-08 | Hold point health | Runbook `R6-M1` | 100% health poll success | `[ ] PASS [ ] FAIL` |
| VG-09 | Error-rate threshold | Monitoring dashboard link | 5xx increase <= 0.5pp vs baseline | `[ ] PASS [ ] FAIL` |
| VG-10 | Constraint-error threshold | Monitoring link + runbook R6 metrics | No sustained spike (no 2 consecutive failing samples) | `[ ] PASS [ ] FAIL` |
| VG-11 | Existing-flow smoke checks | Runbook `R7` evidence | 3/3 pass (create/contribute/payout) | `[ ] PASS [ ] FAIL` |

If any validation gate FAILs, mark NO-GO and execute rollback play.

---

## 6) Decision

### Decision Status

- [ ] GO - keep release active
- [ ] NO-GO - rollback app deploy

Decision timestamp: `HH:MM`

Decision rationale:

`summary...`

---

## 7) If NO-GO (Action Log)

Trigger reason:

- [ ] Migration failure
- [ ] Health check failure
- [ ] Critical write-path breakage
- [ ] Sustained error spike
- [ ] Write-path guardrail probe unexpectedly passed (`201`)
- [ ] Other: `...`

Action timeline:

- Rollback started: `HH:MM`
- Rollback complete: `HH:MM`
- Current status: `...`

Incident / follow-up links:

`link`

---

## 8) Post-Rollout Doc and API Sync Gate

- [ ] `pnpm openapi:generate` run and reviewed
- [ ] `pnpm test tests/unit/openapi-spec.test.ts` passes
- [ ] `docs/Platform-Spec-Docs/CANONICAL.md` reflects deployed behavior
- [ ] `docs/Platform-Spec-Docs/API.md` reflects deployed behavior
- [ ] `docs/Platform-Spec-Docs/DATA.md` reflects deployed behavior

Evidence links:

`link`

---

## 9) Sign-Off

Engineering lead: `Name / Time`
Product lead: `Name / Time`
Ops/on-call: `Name / Time`

Final status:

- [ ] Accepted
- [ ] Rolled back
