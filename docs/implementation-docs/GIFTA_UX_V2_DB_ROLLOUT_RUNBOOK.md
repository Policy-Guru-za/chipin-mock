# Gifta UX v2 DB Expansion — Rollout Runbook

## Purpose

Roll out the UX-v2 data model safely, with no UI changes until schema is live.

Source migration:

- `drizzle/migrations/0012_expand_ux_data_model.sql`

Related schema:

- `src/lib/db/schema.ts`

---

## What This Rollout Changes

1. Expands payout model to support bank + charity payout types.
2. Adds charity split Option A fields (percentage bps or threshold cents).
3. Adds new `charities` and `contribution_reminders` tables.
4. Adds host notification prefs + phone.
5. Adds dreamboard fields for birthday/age/campaign end + bank payout details.
6. Adds contribution fields for email/anonymous/charity amount.

No UI rollout is included in this runbook.

---

## Deployment Strategy

Use a **safe additive rollout**:

1. Apply DB migration directly to production during a controlled window.
2. Validate constraints + indexes.
3. Keep bank/charity write paths disabled in app until feature code is ready.
4. No backfill required (test-phase policy; existing data is disposable).

---

## Preconditions (Must Pass)

1. Production backup/restore point created (Neon branch/snapshot).
2. `main` includes:
   - `drizzle/migrations/0012_expand_ux_data_model.sql`
   - `drizzle/migrations/meta/_journal.json` entry for `0012_expand_ux_data_model`
3. No pending destructive DB work in same release.
4. Confirm this known tooling issue is still isolated:
   - `pnpm drizzle:generate` may fail due snapshot metadata collision (`0005`/`0006`).
   - This rollout uses explicit SQL migration execution.
5. Confirm test-phase data policy:
   - legacy dreamboards/rows are not relied on
   - no backfill will be performed

---

## Step 1 — Production Rollout

Run during a low-write production window.

If you want a clean test-phase reset first, you may purge existing runtime rows before migration.

### Optional: test-data purge (no backfill path)

```sql
DO $$
DECLARE
  existing_tables TEXT;
BEGIN
  SELECT string_agg(format('%I', table_name), ', ')
  INTO existing_tables
  FROM unnest(ARRAY[
    'contribution_reminders',
    'karri_credit_queue',
    'payout_items',
    'payouts',
    'contributions',
    'dream_boards',
    'charities'
  ]) AS t(table_name)
  WHERE to_regclass(format('public.%I', table_name)) IS NOT NULL;

  IF existing_tables IS NOT NULL THEN
    EXECUTE format('TRUNCATE TABLE %s RESTART IDENTITY CASCADE;', existing_tables);
  END IF;
END $$;
```

### Execute migration

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f drizzle/migrations/0012_expand_ux_data_model.sql
```

### Production validation SQL

```sql
-- 1) New tables
SELECT to_regclass('public.charities') AS charities_table,
       to_regclass('public.contribution_reminders') AS reminders_table;

-- 2) Dreamboard new columns
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

-- 3) Constraint sanity
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

Expected:

- tables exist
- columns exist
- all listed constraints present

## Step 2 — Data Policy (No Backfill)

1. No backfill is required in current phase.
2. Legacy/test records are non-authoritative and may be deleted.
3. New schema fields are populated only by new writes once UX flows are enabled.

---

## Operational Guardrails

1. Keep current flows writing Karri until bank payout logic is deployed.
2. Do not enable charity payout execution until:
   - charity selection write path is live
   - payout service creates `payout_items.type='charity'` where required
   - reconciliation/reporting is verified
3. Keep internal API pathing unchanged; auth split is documented (Clerk vs `INTERNAL_JOB_SECRET`).

---

## Rollback / Contingency

### Preferred rollback model: **code rollback, schema stay-forward**

Why:

- migration is additive
- enum value removals are non-trivial and risky under load

If release issues occur:

1. Roll back app deploy first.
2. Keep new columns/tables in place.
3. Disable any newly introduced write paths/flags.

### If hard DB rollback is absolutely required

Use a separate, reviewed rollback SQL script (not ad-hoc in prod), because:

- dropping enum values requires type recreation
- dropping columns/tables may lose data

---

## Exit Criteria

1. Migration applied successfully in production.
2. Validation SQL checks pass.
3. Error monitoring clean (no migration-induced write failures).
4. Existing create/contribute/payout flows remain green.
5. No backfill tasks remain open for this rollout.

---

## Recommended Immediate Next Tasks

1. Implement write-path support for:
   - `campaign_end_date`, `birthday_date`, `child_age`
   - bank payout fields (encrypted)
   - charity Option A fields
2. Add integration tests for:
   - payout method = bank
   - charity split percent + threshold validation
   - contribution reminder scheduling
3. After rollout stabilizes, add migration to enforce NOT NULL on UX-required fields.
