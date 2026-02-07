# Gifta UX v2 DB Expansion - Production Rollout Checklist

Use with:

- `docs/implementation-docs/GIFTA_UX_V2_DB_ROLLOUT_RUNBOOK.md`
- `docs/implementation-docs/GIFTA_UX_V2_GO_NO_GO_TEMPLATE.md`
- `drizzle/migrations/0012_expand_ux_data_model.sql`

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

---

## 1) Pre-Flight (Runbook R0)

| ID | Task | Command / Evidence | Expected Result | Done |
|---|---|---|---|---|
| R0-01 | Change window approved + on-call staffed | Ticket/approval link | Approved | [ ] |
| R0-02 | Backup/restore point verified | Snapshot link | Verified | [ ] |
| R0-03 | Migration files present in `main` | `git ls-files drizzle/migrations/0012_expand_ux_data_model.sql drizzle/migrations/meta/_journal.json` | Both files listed | [ ] |
| R0-04 | Baseline health check | `curl -fsS "$APP_BASE_URL/health/live" && curl -fsS "$APP_BASE_URL/health/ready"` | Both return HTTP 200 | [ ] |
| R0-05 | Pre-migration bank write-path probe | Runbook `R0-C1` | HTTP is not 201 | [ ] |
| R0-06 | Pre-migration charity write-path probe | Runbook `R0-C2` | HTTP is not 201 | [ ] |

Hard stop: if R0-05 or R0-06 returns `201`, do not proceed.

---

## 2) Optional Data Reset (Runbook R1)

| ID | Task | Command / Evidence | Expected Result | Done |
|---|---|---|---|---|
| R1-01 | Purge decision recorded | Release note link | Keep or purge decision documented | [ ] |
| R1-02 | Purge executed (if selected) | Runbook `R1` SQL | SQL executes successfully | [ ] |

---

## 3) Execute Migration (Runbook R2)

| ID | Task | Command / Evidence | Expected Result | Done |
|---|---|---|---|---|
| R2-01 | Execute migration | `psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f drizzle/migrations/0012_expand_ux_data_model.sql` | Exit code 0 | [ ] |

---

## 4) Schema + Enum Validation (Runbook R3/R4)

| ID | Task | Command / Evidence | Expected Result | Done |
|---|---|---|---|---|
| R3-01 | New tables | Runbook `R3-Q1` | `charities` and `contribution_reminders` non-null | [ ] |
| R3-02 | New dream board columns | Runbook `R3-Q2` | All listed columns returned | [ ] |
| R3-03 | Constraints present | Runbook `R3-Q3` | All five constraints present | [ ] |
| R3-04 | Indexes present | Runbook `R3-Q4` | All required indexes present | [ ] |
| R4-01 | Enum values verified | Runbook `R4-Q1` | Expected enum labels present | [ ] |

---

## 5) Write-Path Guardrail Recheck (Runbook R5)

| ID | Task | Command / Evidence | Expected Result | Done |
|---|---|---|---|---|
| R5-01 | Post-migration bank write-path probe | Re-run Runbook `R0-C1` | HTTP is not 201 | [ ] |
| R5-02 | Post-migration charity write-path probe | Re-run Runbook `R0-C2` | HTTP is not 201 | [ ] |

Hard stop: if either probe returns `201`, mark NO-GO.

---

## 6) Hold Point (20 minutes, Runbook R6)

| ID | Task | Command / Evidence | Expected Result | Done |
|---|---|---|---|---|
| R6-01 | Start hold timer | Timestamp log | 20-minute window started | [ ] |
| R6-02 | Health polling | Runbook `R6-M1` | 100% success (all polls 200) | [ ] |
| R6-03 | Contribution status check | Runbook `R6-M2` | No unexplained failed-state spike | [ ] |
| R6-04 | Payout status check | Runbook `R6-M3` | No unexplained failed-state spike | [ ] |
| R6-05 | 5xx + constraint-error monitoring | Dashboard evidence | 5xx increase <= 0.5pp and no sustained constraint-error spike | [ ] |

---

## 7) Existing-Flow Smoke Checks (Runbook R7)

| ID | Task | Command / Evidence | Expected Result | Done |
|---|---|---|---|---|
| R7-01 | Existing Karri create flow | Smoke evidence link | PASS | [ ] |
| R7-02 | Existing contribution flow | Smoke evidence link | PASS | [ ] |
| R7-03 | Existing payout automation path | Smoke evidence link | PASS | [ ] |

---

## 8) Decision and Rollback Control (Runbook R8/R9)

| ID | Task | Command / Evidence | Expected Result | Done |
|---|---|---|---|---|
| R8-01 | GO/NO-GO template completed | `docs/implementation-docs/GIFTA_UX_V2_GO_NO_GO_TEMPLATE.md` | Fully filled and signed | [ ] |
| R9-01 | If NO-GO: app rollback executed | Deploy log link | Previous app release restored | [ ] |
| R9-02 | If NO-GO: schema left forward | DB notes | No ad-hoc destructive DB rollback | [ ] |

---

## 9) Post-Window Closeout + Doc Sync (Runbook R10)

| ID | Task | Command / Evidence | Expected Result | Done |
|---|---|---|---|---|
| R10-01 | Record execution timeline and outputs | Release notes link | Evidence complete | [ ] |
| R10-02 | Regenerate OpenAPI | `pnpm openapi:generate` | Command succeeds | [ ] |
| R10-03 | Validate generated OpenAPI | `pnpm test tests/unit/openapi-spec.test.ts` | Test passes | [ ] |
| R10-04 | Canonical/API/DATA docs synced | Doc links | Reflect deployed behavior | [ ] |
| R10-05 | Follow-up tasks logged | Ticket links | NOT NULL tighten + snapshot-collision follow-up tracked | [ ] |

---

## Final Status

- [ ] Production migration accepted
- [ ] Rolled back
