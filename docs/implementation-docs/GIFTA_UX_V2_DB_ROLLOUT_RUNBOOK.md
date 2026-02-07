# Gifta UX v2 DB Expansion - Rollout Runbook

## Purpose

Roll out the UX-v2 data model safely, with no product-behavior expansion during this release.

## Release Contract (Authoritative for this rollout)

- Scope: schema-first DB migration only (`0012_expand_ux_data_model`).
- Non-scope: bank/charity UI enablement and any new bank/charity write-path activation.
- Data policy: no backfill; legacy test data is disposable in this phase.
- Rollback model: rollback app deploy first; keep schema forward unless a pre-reviewed DB rollback script is approved.
- Hard stop criteria: partial/failed migration, failed health checks, critical create/contribute/payout breakage, or sustained constraint-error spike.

## Glossary (Normalized Terms)

- Dream Board: canonical two-word entity name (`dream_boards` table).
- Schema-first: apply DB migration before enabling new product behavior.
- Write-path disabled: bank/charity create/update writes are rejected in production.
- Hold point: mandatory observation window between migration and GO decision.

## References

- Migration: `drizzle/migrations/0012_expand_ux_data_model.sql`
- Schema: `src/lib/db/schema.ts`
- Decision template: `docs/implementation-docs/GIFTA_UX_V2_GO_NO_GO_TEMPLATE.md`
- Operator checklist: `docs/implementation-docs/GIFTA_UX_V2_PROD_ROLLOUT_CHECKLIST.md`

---

## Deployment Strategy

Use a safe additive rollout:

1. Apply migration directly in production during a controlled window.
2. Validate schema, constraints, indexes, and enums.
3. Verify bank/charity write paths remain disabled.
4. Observe system health in a hold point before GO/NO-GO.

No backfill in this phase.

---

## R0 - Preconditions (Must Pass)

1. Production backup/restore point created (Neon snapshot/branch).
2. `main` contains:
   - `drizzle/migrations/0012_expand_ux_data_model.sql`
   - `_journal.json` entry for `0012_expand_ux_data_model`
3. No concurrent destructive DB work in the same window.
4. Tooling risk acknowledged:
   - `pnpm drizzle:generate` snapshot collision (`0005`/`0006`) can still occur.
   - rollout uses explicit SQL execution.
5. No-backfill policy accepted for this phase.
6. Baseline health is green:

```bash
curl -fsS "$APP_BASE_URL/health/live"
curl -fsS "$APP_BASE_URL/health/ready"
```

Expected: both return HTTP `200`.

### R0-C1 - Bank Write-Path Disabled Probe (Pre-Migration)

```bash
curl -sS -o /tmp/gifta_bank_probe_pre.json -w "%{http_code}\n" \
  -X POST "$API_BASE_URL/api/v1/dream-boards" \
  -H "authorization: Bearer $PARTNER_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "child_name": "Probe Child",
    "child_photo_url": "https://example.com/child.jpg",
    "party_date": "2030-01-10",
    "gift_name": "Probe Gift",
    "gift_image_url": "https://example.com/gift.jpg",
    "goal_cents": 25000,
    "payout_method": "bank",
    "payout_email": "probe@example.com",
    "host_whatsapp_number": "+27821234567",
    "bank_name": "Standard Bank",
    "bank_account_number": "1234567890",
    "bank_branch_code": "051001",
    "bank_account_holder": "Probe Parent"
  }'
```

Expected: HTTP is not `201` (target `400/403/409`).

### R0-C2 - Charity Write-Path Disabled Probe (Pre-Migration)

```bash
curl -sS -o /tmp/gifta_charity_probe_pre.json -w "%{http_code}\n" \
  -X POST "$API_BASE_URL/api/v1/dream-boards" \
  -H "authorization: Bearer $PARTNER_API_KEY" \
  -H "content-type: application/json" \
  -d '{
    "child_name": "Probe Child",
    "child_photo_url": "https://example.com/child.jpg",
    "party_date": "2030-01-10",
    "gift_name": "Probe Gift",
    "gift_image_url": "https://example.com/gift.jpg",
    "goal_cents": 25000,
    "payout_method": "karri_card",
    "payout_email": "probe@example.com",
    "host_whatsapp_number": "+27821234567",
    "karri_card_number": "1234567890123456",
    "karri_card_holder_name": "Probe Parent",
    "charity_enabled": true,
    "charity_id": "00000000-0000-4000-8000-000000000001",
    "charity_split_type": "percentage",
    "charity_percentage_bps": 1000
  }'
```

Expected: HTTP is not `201` (target `400/403/409`).

If either probe returns `201`, stop rollout and go NO-GO.

---

## R1 - Optional Test-Data Purge (No Backfill Path)

Run only if team chooses purge strategy.

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

Expected: successful execution; decision logged in release notes.

---

## R2 - Execute Migration

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f drizzle/migrations/0012_expand_ux_data_model.sql
```

Expected: command exits `0`.

---

## R3 - Post-Migration Schema Validation

### R3-Q1 - New Tables

```sql
SELECT to_regclass('public.charities') AS charities_table,
       to_regclass('public.contribution_reminders') AS reminders_table;
```

Expected: both values are non-null.

### R3-Q2 - Dream Board Expansion Columns

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

Expected: all listed columns returned.

### R3-Q3 - Required Constraints

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

Expected: all five constraint names returned.

### R3-Q4 - Required Indexes

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

Expected: all listed indexes returned.

---

## R4 - Enum Validation (Drift Guard)

### R4-Q1 - Enum Values

```sql
SELECT t.typname AS enum_name,
       e.enumlabel AS enum_value
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN ('payout_method', 'payout_type', 'payout_item_type', 'charity_split_type')
ORDER BY t.typname, e.enumsortorder;
```

Expected:

- `payout_method`: `karri_card`, `bank`
- `payout_type`: `karri_card`, `bank`, `charity`
- `payout_item_type`: `gift`, `charity`
- `charity_split_type`: `percentage`, `threshold`

---

## R5 - Post-Migration Write-Path Guardrail Verification

Re-run `R0-C1` and `R0-C2`.

Expected: both remain non-`201`.

Hard stop: if either returns `201`, go NO-GO.

---

## R6 - Hold Point (20 Minutes)

Start timer immediately after R5 passes.

### R6-M1 - Health Poll (every 5 minutes)

```bash
for i in 1 2 3 4; do
  date
  curl -fsS "$APP_BASE_URL/health/live" >/dev/null
  curl -fsS "$APP_BASE_URL/health/ready" >/dev/null
  sleep 300
done
```

Expected: no failures; all checks HTTP `200`.

### R6-M2 - Recent Contribution Status Distribution

```sql
SELECT payment_status, COUNT(*)
FROM contributions
WHERE created_at > NOW() - INTERVAL '20 minutes'
GROUP BY payment_status
ORDER BY payment_status;
```

Expected: no unexplained spike in failed states vs pre-window baseline.

### R6-M3 - Recent Payout Status Distribution

```sql
SELECT status, COUNT(*)
FROM payouts
WHERE created_at > NOW() - INTERVAL '20 minutes'
GROUP BY status
ORDER BY status;
```

Expected: no unexplained spike in failed states vs pre-window baseline.

### R6-M4 - Monitoring Thresholds

Expected pass thresholds:

- Endpoint health success rate: `100%`
- 5xx rate increase vs baseline: `<= 0.5 percentage points`
- Constraint-error events tied to new checks: no sustained spike (no two consecutive failing samples)

---

## R7 - App-Level Smoke Checks (Existing Flows)

1. Existing Karri create flow still works.
2. Contribution flow still works for existing providers.
3. Existing payout automation path remains unaffected.

Expected: all three pass.

---

## R8 - GO/NO-GO Decision Gate

Use `docs/implementation-docs/GIFTA_UX_V2_GO_NO_GO_TEMPLATE.md`.

GO requires all of the following:

1. R2 command succeeded.
2. R3 and R4 validations passed.
3. R5 probes stayed blocked.
4. R6 hold point thresholds passed.
5. R7 smoke checks passed.

---

## R9 - Rollback / Contingency

Preferred rollback model: code rollback, schema stays forward.

If issues occur:

1. Roll back app deploy first.
2. Keep new schema objects.
3. Disable newly introduced write-path toggles/guards.

Only perform DB rollback with a separate, pre-reviewed script.

---

## R10 - Closeout and Doc Sync

1. Record timeline, operator, and evidence links.
2. Attach outputs for R3, R4, R5, and R6.
3. Confirm incident-free observation window completion.
4. Run and review:

```bash
pnpm openapi:generate
pnpm test tests/unit/openapi-spec.test.ts
```

5. Confirm canonical docs reflect deployed behavior:

- `docs/Platform-Spec-Docs/CANONICAL.md`
- `docs/Platform-Spec-Docs/API.md`
- `docs/Platform-Spec-Docs/DATA.md`

---

## Exit Criteria

1. Migration applied successfully.
2. All schema/enum validations passed.
3. Write-path guardrails verified blocked.
4. Hold point thresholds passed.
5. Existing create/contribute/payout flows remained green.
6. GO/NO-GO record completed and signed.

---

## Recommended Immediate Next Tasks

1. Implement explicit runtime gating for bank/charity write paths if not already present.
2. Add integration tests for:
   - bank payout method
   - charity split validation (percentage + threshold)
   - contribution reminder scheduling
3. After rollout stabilizes, add migration for tighter NOT NULL enforcement on UX-required fields.
