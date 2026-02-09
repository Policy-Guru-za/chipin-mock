# C9 — Production Rollout

## Objective

Prepare the Phase C production rollout package and split execution
cleanly into:

- **C9A (agent-prep):** all pre-live verification, checklist/template
  population, thresholds, rollback, and handoff documentation.
- **C9B (human-live):** deployment, smoke checks, hold-point monitoring,
  validation-gate execution, real-device checks, and GO/NO-GO signing.

This is an operational milestone. No product logic changes. Every output
is verification, checklist/template completion, or evidence artifact.

---

## Context & Constraints

- Read these docs in order **before any work**:
  1. `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`
  2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
  3. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_EXECUTION_PLAN.md`
     (C9 milestone definition)
  4. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_ROLLOUT_RUNBOOK.md`
     (**authoritative** runbook — C-R0 through C-R7)
  5. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_GO_NO_GO_TEMPLATE.md`
     (**authoritative** template — CG-01 through CG-06, CV-01 through CV-07)
  6. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_PROD_ROLLOUT_CHECKLIST.md`
     (**authoritative** checklist — sections 1 through 5)
  7. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_E2E_UAT_PLAN.md`
  8. `docs/implementation-docs/GIFTA_UX_V2_ANALYTICS_TELEMETRY_SPEC.md`
  9. `docs/napkin/napkin.md` (read fully)
  10. Latest C8 evidence file matching:
      `docs/implementation-docs/evidence/ux-v2/phase-c/*-C8-e2e-uat-and-performance-sweep.md`
      (required input; if missing, STOP)
- Required gate sequence for pre-live verification:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm openapi:generate`
  - `pnpm vitest run tests/unit/openapi-spec.test.ts`
  - `pnpm build`
- All gates **must pass** before proceeding beyond sub-step 1.
- `UX_V2_ENABLE_BANK_WRITE_PATH` and `UX_V2_ENABLE_CHARITY_WRITE_PATH`
  remain **OFF** unless a human explicitly toggles during C9B.
- **Scope boundary — C9 is operational only.** Do NOT:
  - Modify components/pages/layouts/business logic
  - Modify Phase B APIs, DB schema, migrations, webhook handlers
  - Change fee logic in `src/lib/payments/fees.ts`
  - Change user-facing copy or accessibility attributes
  - Add tests/features/UI
  - Change `tailwind.config.ts`, `next.config.js`, or `vitest.config.ts`
- **Allowed file changes:** documentation only:
  - C9 evidence file
  - rollout checklist/template population
  - runbook annotations if required
  - `docs/napkin/napkin.md`
- **Generated-file drift policy:** if gate commands create non-doc diffs
  (example: regenerated artifacts outside docs), treat as drift and STOP.
  Record NO-GO diagnostic. Do not patch source in C9.

---

## Prerequisite Verification (hard gate)

Before any sub-step, verify:

| Precondition | Source | How to verify |
|---|---|---|
| Latest C8 evidence exists | `docs/implementation-docs/evidence/ux-v2/phase-c/*-C8-e2e-uat-and-performance-sweep.md` | Select latest by date and confirm 14 sections present |
| C8 P0 gate: PASS | C8 evidence "Gate Outputs" + "GO/NO-GO Readiness Assessment" | Required P0 scenarios and CG-02 pass |
| C8 P1 gate: PASS | C8 evidence "Gate Outputs" + "GO/NO-GO Readiness Assessment" | Required P1 scenarios and CG-03 pass |
| C8 pre-gate mapping ready | C8 evidence section 12 | CG-02, CG-03, CG-04, CG-05 all PASS |
| C0 through C7 evidence exists | `docs/implementation-docs/evidence/ux-v2/phase-c/` | Eight files present (C0 through C7) |
| Phase B GO approved | Phase B evidence | Signed GO decision exists |

If any precondition fails: STOP. Do not enter C9A execution.

---

## Build Sub-steps (execute in order)

### Sub-step 0: Final Local Gate Verification (C9A)

Run final pre-live gate verification against C8 baseline.

1. Capture pre-gate status: `git status --short`
2. Run `pnpm lint` and record errors/warnings
3. Run `pnpm typecheck`
4. Run `pnpm test` and record file/test counts
5. Run `pnpm openapi:generate`
6. Run `pnpm vitest run tests/unit/openapi-spec.test.ts`
7. Run `pnpm build`
8. Capture post-gate status: `git status --short`
9. Compare current test counts to C8 baseline (must be equal or higher)

Gate interpretation rules:

- Any gate failure: STOP (drift since C8)
- Any non-doc file changed after gates: STOP (drift diagnostic)
- Do not remediate code in C9; hand back to milestone remediation

After this sub-step: gates green, no non-doc drift, baseline verified.

---

### Sub-step 1: Pre-Flight Checklist Completion (C-R0 alignment)

Populate rollout checklist section 1 (Pre-Flight):

| Checklist ID | Task | Evidence Source |
|---|---|---|
| C0-01 | Phase B GO evidence verified | Phase B GO evidence path |
| C0-02 | Phase C P0/P1 tests complete | C8 "Gate Outputs" + C9 sub-step 0 results |
| C0-03 | UAT critical scenarios complete | C8 "UAT Scenario Results" |
| C0-04 | Accessibility P0 checks pass | C8 "Accessibility Regression" + C7 evidence |
| C0-05 | Rollback route validated | Runbook C-R6 + C9 rollback prep section |

For C0-05, explicitly confirm:

- rollback action location in Vercel
- UX v2 exposure toggles that can be turned OFF
- evidence/log capture checklist for rollback path

Mark each row `[x]` with evidence link.

---

### Sub-step 2: GO/NO-GO Pre-Gate Assessment (CG-01 through CG-06)

Populate pre-GO gates in:
`docs/implementation-docs/GIFTA_UX_V2_PHASE_C_GO_NO_GO_TEMPLATE.md`

| Gate | Check | Evidence Source |
|---|---|---|
| CG-01 | Phase B GO confirmed | Phase B GO evidence |
| CG-02 | Phase C P0 test gates pass | C8 + C9 gate outputs |
| CG-03 | Phase C P1 test gates pass | C8 + C9 gate outputs |
| CG-04 | UAT critical scenarios pass | C8 UAT matrix |
| CG-05 | Accessibility P0 checks pass | C8/C7 accessibility evidence |
| CG-06 | Rollback path validated | Runbook C-R6 + checklist C0-05 |

For each gate:

- Set `PASS` or `FAIL`
- Fill evidence with file path + section reference
- If any `FAIL`, STOP and record blocking reason

Template header fields:

- Date: current date
- Release lead: `Ryan Laubscher`
- Operator: `AI Agent (Phase C C9A)`

After this sub-step: pre-gates complete; if all PASS, C9A continues.

---

### Sub-step 3: Deployment Preparation Documentation (C-R1)

Document C-R1 readiness:

1. **Release artifact**
   - `git rev-parse HEAD`
   - active branch name
   - `pnpm build` result from sub-step 0
2. **Config/toggles**
   - `UX_V2_ENABLE_BANK_WRITE_PATH` default OFF
   - `UX_V2_ENABLE_CHARITY_WRITE_PATH` default OFF
   - any additional UX v2 toggles and default state
3. **Monitoring surfaces**
   - Vercel deployment logs
   - Sentry project view for frontend/api issues
   - telemetry dashboard/event stream
   - operator comms channel/on-call contact

After this sub-step: C-R1 documentation complete.

---

### Sub-step 4: Smoke Route Checklist Preparation (C-R2)

Populate rollout checklist section 2 (Deploy + Initial Exposure):

| Checklist ID | Route | Expected Behavior | Verification Method |
|---|---|---|---|
| C1-01 | Deploy artifact | Deployment succeeds | Vercel deploy log |
| C1-02 | `/` and `/sign-in` | Landing/auth healthy | Visual + no console errors |
| C1-03 | `/create/child` to `/create/review` | 6-step host flow works | End-to-end walkthrough |
| C1-04 | `/[slug]` and `/[slug]/contribute` | Board + contribution loads | Test slug walkthrough |
| C1-05 | `/dashboard` | Host dashboard data renders | Authenticated host session |
| C1-06 | `/admin/*` critical | Admin views render | Authenticated admin session |

For each route, define:

- exact URL path/pattern
- healthy state
- unhealthy state
- required evidence (screenshot/log reference)

After this sub-step: C-R2 smoke checklist ready for human execution.

---

### Sub-step 5: Hold Point Monitoring Guide (C-R3, quantitative)

Populate rollout checklist section 3 with explicit thresholds.

| Signal | Baseline Window | Threshold (breach) | Escalation |
|---|---|---|---|
| Frontend severe errors | Previous 24h same-hour median per 5min | `> baseline + 2` severe events for 2 consecutive checks, or any P0 crash | Trigger C-R6 rollback |
| API 5xx rate | Pre-deploy 30min window | `>1%` for any 5-min bucket or `>2%` for 3 consecutive minutes | Trigger C-R6 rollback |
| Contribution completion rate | Trailing 7-day same-hour baseline (minimum sample 20 attempts) | Drop greater than 15% vs baseline | Investigate immediately; rollback if sustained for 2 checks |
| Payout operation health | Previous 24h payout failure trend | Any new release-correlated payout failure | Investigate; probable rollback |
| Telemetry smoke subset | N/A (action-triggered) | Missing any required smoke event after smoke flows | Block ramp; fix instrumentation path before proceed |

Required telemetry smoke subset for hold-point verification:

- `guest_view_loaded`
- `contribution_started`
- `contribution_redirect_started`
- one terminal contribution event:
  - `contribution_completed`, or
  - `contribution_failed`
- `host_create_started`
- `host_create_published`

Hold-point protocol:

1. Start timer at initial exposure complete
2. Check at T+5m, T+15m, T+30m
3. Record each checkpoint in checklist + GO/NO-GO log
4. If all thresholds pass at T+30m, proceed to C-R4
5. If any threshold breaches, execute C-R6 rollback

After this sub-step: quantitative C-R3 guide complete.

---

### Sub-step 6: Full Exposure and Decision Workflow Prep (C-R4/C-R5)

Populate rollout checklist section 4 (Full Exposure) and prepare
decision workflow.

1. Define exposure ramp plan:
   - preferred: `10% -> 50% -> 100%`
   - if constrained exposure unsupported: document "direct 100%" path
2. For each ramp step, define:
   - smoke subset to rerun (`C1-02` through `C1-06`)
   - minimum hold duration (`>=10 minutes`)
   - stop/rollback triggers (reuse C-R3 thresholds)
3. Map checklist IDs:
   - `C3-01` full exposure enabled
   - `C3-02` full smoke suite pass
   - `C3-03` GO/NO-GO template completed
4. Pre-stage GO packet requirements:
   - completed checklist links
   - completed GO/NO-GO template
   - hold-point metrics snapshots
   - rollback readiness confirmation

After this sub-step: C-R4/C-R5 preparation complete.

---

### Sub-step 7: Validation Gate Preparation (CV-01 through CV-07)

Pre-fill validation gate instructions in GO/NO-GO template:

| Gate | Check | How to Verify |
|---|---|---|
| CV-01 | Host create flow healthy | Create/publish one test board in production |
| CV-02 | Guest contribution flow healthy | Submit minimum contribution on active providers |
| CV-03 | Reminder UX path healthy | Request reminder and verify persisted state |
| CV-04 | Host dashboard correctness | Validate totals/status for test board |
| CV-05 | Admin critical UX healthy | Navigate admin dreamboards/contributions/payouts |
| CV-06 | Frontend/API thresholds respected | Validate against C-R3 metrics checks |
| CV-07 | Telemetry continuity confirmed | Verify smoke subset during rollout, then verify broader catalog continuity during post-release watch |

Evidence expectations for each CV gate:

- screenshot or log link
- timestamp
- operator initials
- PASS/FAIL status

After this sub-step: validation section execution-ready.

---

### Sub-step 8: Manual Viewport Verification Checklist

Carry forward C8 deferred real-device checklist for C9B:

| # | Device / Browser | Viewport | Routes to Verify | Status |
|---|---|---|---|---|
| 1 | iPhone Safari | 375x812 | `/[slug]`, `/[slug]/contribute`, `/create/*`, `/dashboard` | PENDING (C9B) |
| 2 | Android Chrome | 360x800 | `/[slug]`, `/[slug]/contribute`, `/create/*`, `/dashboard` | PENDING (C9B) |
| 3 | Desktop Chrome | 1440x900 | All routes | PENDING (C9B) |
| 4 | Desktop Safari | 1440x900 | All routes | PENDING (C9B) |

For each entry, verify:

- no horizontal overflow
- touch targets >= 44x44 on mobile
- readable text without zoom
- keyboard/input usability
- reduced-motion behavior

After this sub-step: viewport checklist ready for human execution.

---

### Sub-step 9: Rollback Play Documentation (C-R6)

Document rollback play with exact operator actions:

1. **App rollback**
   - rollback to previous Vercel deployment
   - record deployment ID and timestamp
2. **Toggle rollback**
   - disable UX v2 exposure toggles
   - record env var changes + propagation checks
3. **Backend stability statement**
   - no C9 backend/schema changes
   - Phase B remains baseline
4. **Evidence preservation**
   - deploy logs
   - Sentry error links
   - timeline with timestamps
   - screenshots of failing paths

After this sub-step: rollback play executable and auditable.

---

### Sub-step 10: C9A Closeout Package (pre-live)

Create/update C9 evidence and handoff package with C9A status only.

1. Verify C0 through C8 evidence presence
2. Create C9 evidence file (structure below)
3. Populate all C9A sections as complete
4. Mark C9B live-execution sections as `PENDING (human-run)`
5. Consolidate P2 deferrals from C0 through C8 with owner + target date
6. Build required handoff payload per execution contract
7. Append `## C9 Learnings (YYYY-MM-DD)` to `docs/napkin/napkin.md`

C9A completion state:

- `READY_FOR_LIVE_EXECUTION` if all C9A criteria pass
- This is not GO sign-off

---

### Sub-step 11: Post-Live Finalization (C9B follow-through)

Run after human completes live execution.

1. Ingest completed checklist/template outcomes
2. Update C9 evidence with actual C9B statuses
3. Record GO/NO-GO decision, timestamp, and sign-off fields
4. Record unresolved risks and follow-up actions
5. Finalize milestone status (`GO` or `NO-GO`)

If live execution has not occurred, keep C9B sections pending.

---

## Evidence File Structure

Create:
`docs/implementation-docs/evidence/ux-v2/phase-c/YYYYMMDD-C9-production-rollout.md`

Required sections:

### 1) Prerequisite Verification
- Selected C8 evidence file path
- C8 P0/P1 readiness status
- C0 through C7 file presence
- Phase B GO confirmation

### 2) Final Gate Verification (C9A)
- `pnpm lint`: PASS/FAIL (errors N, warnings N)
- `pnpm typecheck`: PASS/FAIL
- `pnpm test`: PASS/FAIL (N files, N tests)
- `pnpm openapi:generate`: PASS/FAIL
- `pnpm vitest run tests/unit/openapi-spec.test.ts`: PASS/FAIL
- `pnpm build`: PASS/FAIL
- test-count delta vs C8
- pre/post `git status --short` snapshots

### 3) Drift Check Result
- non-doc diffs detected: YES/NO
- drift files list (if any)
- disposition (STOP/continue)

### 4) Pre-Flight Checklist Status (C0-01 through C0-05)
Status + evidence links

### 5) GO/NO-GO Pre-Gate Assessment (CG-01 through CG-06)
Status + evidence links

### 6) Deployment Preparation (C-R1)
Artifact IDs, toggle states, monitoring surfaces, on-call channel

### 7) Smoke Route Checklist (C-R2)
Prepared checklist with route-level evidence requirements

### 8) Hold Point Monitoring Guide (C-R3)
Quantitative threshold table + checkpoint protocol

### 9) Full Exposure Plan (C-R4/C-R5)
Ramp plan + stop criteria + GO packet requirements

### 10) Validation Gate Instructions (CV-01 through CV-07)
Verification method + evidence requirements per gate

### 11) Manual Viewport Checklist (deferred C9B execution)
Device matrix + required checks

### 12) Rollback Play (C-R6)
App rollback + toggle rollback + evidence-preservation checklist

### 13) C9A Handoff Payload
- phase execution summary
- gate matrix summary
- rollout status (`READY_FOR_LIVE_EXECUTION` / `BLOCKED`)
- unresolved risks
- exact next-step list for C9B operator

### 14) C9B Live Execution Log (human-run)
- deploy start/end
- hold-point checkpoints
- smoke execution notes
- full-exposure steps

### 15) C9B Validation Outcomes
- CV-01 through CV-07 PASS/FAIL with evidence
- viewport matrix statuses

### 16) Final Decision + Sign-off
- GO / NO-GO
- timestamp
- rationale
- Engineering/Ops/Product sign-off

### 17) Consolidated P2 Deferrals
| ID | Item | Source Milestone | Owner | Target Date |
|---|---|---|---|---|

### 18) Final Risk Assessment
- known risks
- mitigations
- open follow-ups

---

## Acceptance Criteria

### P0 (blocks C9A handoff to live execution)
- C8 evidence present and eligible (pre-gate mapping PASS)
- CG-01 through CG-06 all `PASS`
- C0-01 through C0-05 checklist complete with evidence
- local gate suite PASS:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm openapi:generate`
  - `pnpm vitest run tests/unit/openapi-spec.test.ts`
  - `pnpm build`
- test count matches/exceeds C8 baseline
- no non-doc drift from gate execution
- C-R1 through C-R6 prep sections complete
- C9A handoff payload complete

### P1 (blocks final GO sign-off in C9B)
- smoke routes executed and recorded
- hold-point checks passed with C-R3 thresholds
- full exposure step completed per C-R4
- CV-01 through CV-07 executed with evidence
- real-device viewport matrix executed
- GO/NO-GO decision signed by required roles
- C9 evidence finalized with C9B outcomes

### P2 (allowed defer with waiver; document in evidence)
- extended telemetry catalog continuity beyond smoke subset
- long-window conversion stability confirmation
- additional real-device/browser permutations beyond defined matrix

---

## Human Operator Actions (C9B, cannot be automated)

After C9A package is ready, human operator executes:

1. Deploy to Vercel (production)
2. Execute smoke routes (checklist section 2)
3. Monitor 30-minute hold point (checklist section 3)
4. Execute full-exposure steps (checklist section 4)
5. Execute CV-01 through CV-07 gates
6. Execute real-device viewport checks
7. Sign GO/NO-GO decision
8. Execute rollback if required

Then return outcomes for sub-step 11 finalization.

---

## Stop Conditions

- C8 evidence missing/incomplete/failed pre-gates
- any CG pre-gate fails
- any local gate fails (`lint`, `typecheck`, `test`, `openapi`, openapi parity test, `build`)
- test count regresses vs C8 baseline
- non-doc drift appears after gate execution
- any source/test/schema/migration file manually modified
- Phase B GO evidence missing
