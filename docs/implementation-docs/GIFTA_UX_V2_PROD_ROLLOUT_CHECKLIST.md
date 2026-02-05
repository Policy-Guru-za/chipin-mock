# Gifta UX v2 DB Expansion — Production Rollout Checklist

Use with:

- `docs/implementation-docs/GIFTA_UX_V2_DB_ROLLOUT_RUNBOOK.md`
- `drizzle/migrations/0012_expand_ux_data_model.sql`

---

## 1) Pre-Flight (Before Change Window)

- [ ] Confirm approved change window + owner on-call.
- [ ] Confirm production backup/restore point exists (Neon branch/snapshot).
- [ ] Confirm `main` includes:
  - [ ] `drizzle/migrations/0012_expand_ux_data_model.sql`
  - [ ] `drizzle/migrations/meta/_journal.json` entry for `0012_expand_ux_data_model`
- [ ] Confirm this change follows direct-to-production policy (no staging DB path).
- [ ] Confirm no-backfill policy is accepted (legacy test data is disposable).
- [ ] Confirm no concurrent destructive DB changes in same release.
- [ ] Confirm app feature flags/write paths for bank + charity are still disabled (schema-first only).

---

## 2) Optional Test-Data Reset

- [ ] Decide reset strategy:
  - [ ] Keep existing test data (still no backfill required), or
  - [ ] Purge runtime test data before migration.

- [ ] If purging, run:

```sql
TRUNCATE TABLE
  contribution_reminders,
  karri_credit_queue,
  payout_items,
  payouts,
  contributions,
  dream_boards,
  charities
RESTART IDENTITY CASCADE;
```

- [ ] Record reset decision/evidence in release notes.

---

## 3) Execute Migration (Production)

- [ ] Run:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f drizzle/migrations/0012_expand_ux_data_model.sql
```

- [ ] Confirm command exits `0`.

---

## 4) Immediate Post-Run Validation

- [ ] New tables exist:

```sql
SELECT to_regclass('public.charities') AS charities_table,
       to_regclass('public.contribution_reminders') AS reminders_table;
```

- [ ] Dreamboard expansion columns exist:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'dream_boards'
  AND column_name IN (
    'child_age','birthday_date','campaign_end_date','gift_description',
    'bank_name','bank_account_number_encrypted','bank_account_last4',
    'bank_branch_code','bank_account_holder',
    'charity_enabled','charity_id','charity_split_type',
    'charity_percentage_bps','charity_threshold_cents'
  )
ORDER BY column_name;
```

- [ ] Confirm no backfill required/attempted (per test-phase policy).

- [ ] Required constraints present:

```sql
SELECT conname
FROM pg_constraint
WHERE conname IN (
  'valid_dream_board_dates',
  'valid_charity_split_config',
  'valid_dream_board_payout_data',
  'valid_charity_amount',
  'valid_amounts'
)
ORDER BY conname;
```

- [ ] New indexes present:

```sql
SELECT indexname
FROM pg_indexes
WHERE tablename IN ('dream_boards', 'charities', 'contribution_reminders')
  AND indexname IN (
    'idx_dream_boards_campaign_end_date',
    'idx_dream_boards_charity_enabled',
    'idx_dream_boards_payout_method',
    'unique_charities_name',
    'idx_charities_category',
    'idx_charities_active',
    'idx_contribution_reminders_dream_board',
    'idx_contribution_reminders_due',
    'unique_contribution_reminder'
  )
ORDER BY indexname;
```

---

## 5) App-Level Smoke Checks

- [ ] `GET /health/live` returns healthy.
- [ ] `GET /health/ready` returns healthy.
- [ ] Create flow still works for existing Karri path (no bank/charity UI enabled yet).
- [ ] Contribution flow works for existing providers.
- [ ] Existing payout automation path unaffected.
- [ ] Error monitoring shows no spike in DB constraint errors.

---

## 6) Rollback Trigger Criteria

Trigger rollback-to-previous-app-release (schema stays forward) if any apply:

- [ ] Migration fails partially and cannot be corrected in window.
- [ ] Health endpoints fail after migration.
- [ ] Critical write paths break (create/contribute/payout).
- [ ] Sustained error spike tied to new DB constraints.

Action:

- [ ] Roll back app deploy first.
- [ ] Keep schema as-is unless a separately reviewed DB rollback script is approved.

---

## 7) Post-Window Closeout

- [ ] Record migration execution timestamp + operator.
- [ ] Save validation query outputs to release notes.
- [ ] Confirm incident-free observation window complete.
- [ ] Open/confirm follow-up task to tighten new NOT NULL constraints after UI rollout.
- [ ] Confirm follow-up task to fix Drizzle snapshot collision remains tracked.

---

## 8) Sign-Off

- [ ] Engineering owner sign-off
- [ ] Product owner sign-off
- [ ] Ops/on-call sign-off

Status:

- [ ] ✅ Production migration accepted
