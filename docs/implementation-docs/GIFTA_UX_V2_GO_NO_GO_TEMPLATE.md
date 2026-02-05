# Gifta UX v2 DB Expansion — Go / No-Go Template

Date: `YYYY-MM-DD`  
Release window: `HH:MM–HH:MM (TZ)`  
Release lead: `Name`  
DB operator: `Name`  
On-call: `Name`

Related docs:

- `docs/implementation-docs/GIFTA_UX_V2_DB_ROLLOUT_RUNBOOK.md`
- `docs/implementation-docs/GIFTA_UX_V2_PROD_ROLLOUT_CHECKLIST.md`
- `drizzle/migrations/0012_expand_ux_data_model.sql`

---

## 1) Scope Confirmation

- Change type: **Schema-first migration only** (no UI enablement in this release)
- Data policy: **No backfill required** (test-phase legacy data may be deleted)
- Migration: `0012_expand_ux_data_model`
- In-scope:
  - Bank payout schema support
  - Charity Option A schema support
  - Reminder + charity tables
  - Host/dreamboard/contribution/payout schema extensions
- Out-of-scope:
  - Bank/charity UI rollout
  - Feature flag activation for new write paths

---

## 2) Pre-Go Gate (All must be ✅)

- [ ] Backup/restore point verified
- [ ] Direct-to-production path acknowledged (no staging environment/DB)
- [ ] Prod change window approved
- [ ] On-call staffed and acknowledged
- [ ] No conflicting DB changes during window
- [ ] Current app health stable (`/health/live`, `/health/ready`)
- [ ] Rollback plan reviewed (code rollback first, schema forward)
- [ ] Drizzle snapshot collision risk acknowledged; SQL migration path confirmed

Evidence links:

- Test-data handling decision evidence (kept vs purged): `link`
- Backup confirmation: `link`
- Change approval ticket: `link`

---

## 3) Execution Plan (Live)

Command:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f drizzle/migrations/0012_expand_ux_data_model.sql
```

Execution timeline:

- Start: `HH:MM`
- Migration complete: `HH:MM`
- Validation complete: `HH:MM`

Operator notes:

`notes...`

---

## 4) Validation Gate (All must be ✅)

- [ ] `charities` + `contribution_reminders` tables exist
- [ ] New `dream_boards` columns exist
- [ ] No backfill executed/required (per testing-phase policy)
- [ ] New constraints present (`valid_dream_board_dates`, `valid_charity_split_config`, `valid_dream_board_payout_data`, `valid_charity_amount`, `valid_amounts`)
- [ ] New indexes present
- [ ] Smoke checks pass (create/contribute/payout unchanged for existing flows)
- [ ] Error monitoring normal (no sustained migration-induced spikes)

Validation evidence link(s):

`link`

---

## 5) Decision

### Decision status

- [ ] **GO** — proceed and keep release active
- [ ] **NO-GO** — initiate rollback-to-previous-app-release

Decision timestamp: `HH:MM`

Decision rationale:

`summary...`

---

## 6) If NO-GO (Action Log)

- Trigger reason:
  - [ ] Migration failure
  - [ ] Health check failure
  - [ ] Critical write-path breakage
  - [ ] Sustained error spike
  - [ ] Other: `...`
- Rollback action started: `HH:MM`
- Rollback action completed: `HH:MM`
- Current status after rollback: `...`
- Follow-up incident ticket: `link`

---

## 7) Sign-Off

Engineering lead: `Name / Time`  
Product lead: `Name / Time`  
Ops/on-call: `Name / Time`

Final status:

- [ ] Accepted
- [ ] Rolled back
