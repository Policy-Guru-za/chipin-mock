# C9 — Production Rollout

## Objective

Prepare, validate, and execute the Phase C production rollout package.
Complete the GO/NO-GO pre-gate assessment using C8 evidence, populate
the production rollout checklist, execute final local gate verification,
perform the manual viewport verification deferred from C8, execute the
rollout runbook steps, and produce the closeout evidence package and
agent handoff payload. This is an operational execution milestone — no
new features, no UI changes, no business logic modifications. Every
output is a verification, a checklist completion, or a documentation
artifact.

---

## Context & Constraints

- Read these docs in order **before any work**:
  1. `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md`
  2. `docs/implementation-docs/GIFTA_UX_V2_DECISION_REGISTER.md`
  3. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_EXECUTION_PLAN.md`
     (C9 milestone definition)
  4. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_ROLLOUT_RUNBOOK.md`
     (**authoritative** operational playbook — steps C-R0 through C-R7)
  5. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_GO_NO_GO_TEMPLATE.md`
     (**authoritative** gate template — pre-gates CG-01 through CG-06,
     validation gates CV-01 through CV-07)
  6. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_PROD_ROLLOUT_CHECKLIST.md`
     (**authoritative** checklist — sections 1 through 5)
  7. `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_E2E_UAT_PLAN.md`
     (UAT exit criteria and device matrix)
  8. `docs/implementation-docs/GIFTA_UX_V2_ANALYTICS_TELEMETRY_SPEC.md`
     (telemetry event catalog for CV-07 verification)
  9. `docs/napkin/napkin.md` (all learnings — read fully)
  10. `docs/implementation-docs/evidence/ux-v2/phase-c/20260209-C8-e2e-uat-and-performance-sweep.md`
      (**required input** — C8 evidence package; if this file does not
      exist, STOP — C8 is not complete)
- Gate commands: `pnpm lint && pnpm typecheck && pnpm test`
- All gates **must pass** before proceeding past sub-step 1.
- **Scope boundary — C9 is operational only.** Do NOT:
  - Modify any component, page, layout, or business logic file
  - Modify Phase B backend APIs, DB schema, migration files, or
    webhook handlers
  - Change fee calculation logic (`src/lib/payments/fees.ts`)
  - Change any user-facing copy
  - Change any accessibility attributes
  - Add new features, tests, or UI elements
  - Change `tailwind.config.ts`, `next.config.js`, or
    `vitest.config.ts`
  - Change any test files
- `UX_V2_ENABLE_BANK_WRITE_PATH` and
  `UX_V2_ENABLE_CHARITY_WRITE_PATH` remain **OFF** until explicit
  rollout toggle decision.
- **API contract strings are out of scope.** Do NOT change webhook
  event names, API scope strings, OpenAPI enum values, database
  column/enum names, webhook header names, or URL slugs.
- **Allowed file changes:** Documentation files only — evidence,
  checklists, GO/NO-GO template, and rollout runbook annotations.
  No source code changes of any kind.

---

## Prerequisite Verification (hard gate)

Before any sub-step, verify these preconditions exist:

| Precondition | Source | How to verify |
|---|---|---|
| C8 evidence file exists | `docs/implementation-docs/evidence/ux-v2/phase-c/20260209-C8-*` | File exists and contains all 14 required sections |
| C8 P0 gate: PASS | C8 evidence "Gate Outputs" section | All UAT P0 scenarios passing |
| C8 P1 gate: PASS | C8 evidence "Gate Outputs" section | All UAT P1 scenarios passing |
| C8 GO/NO-GO readiness: PASS | C8 evidence section 12 | CG-02, CG-03, CG-04, CG-05 all PASS |
| C0–C7 evidence files exist | `docs/implementation-docs/evidence/ux-v2/phase-c/` | 8 evidence files present (C0 through C7) |
| Phase B GO approved | Phase B evidence | Phase B GO decision signed |

**If any precondition fails → STOP. Do not proceed. Document the
failure and report which precondition is missing.**

---

## Build Sub-steps (execute in order)

### Sub-step 0: Final Local Gate Verification

Run the full gate sequence one final time to confirm the codebase
is release-ready from the C8 baseline.

1. Run `pnpm lint` — record output (0 errors expected)
2. Run `pnpm typecheck` — record output (0 errors expected)
3. Run `pnpm test` — record total test count and file count
4. Run `pnpm openapi:generate` — verify OpenAPI spec regenerates
5. Run `pnpm test tests/unit/openapi-spec.test.ts` — verify
   contract parity
6. Run `pnpm build` — verify production build succeeds
7. Compare test counts to C8 baseline — must be identical or
   higher (zero regression)

**If any gate fails → STOP.** The codebase has drifted since C8.
Investigate, do NOT fix in C9 (C9 cannot modify source).

After this sub-step: all gates green, build clean.

---

### Sub-step 1: Pre-Flight Checklist Completion

Populate the production rollout checklist
(`GIFTA_UX_V2_PHASE_C_PROD_ROLLOUT_CHECKLIST.md`) section 1
(Pre-Flight) with evidence links from C0–C8.

| Checklist ID | Task | Evidence Source |
|---|---|---|
| C0-01 | Phase B GO evidence verified | Phase B GO evidence file path |
| C0-02 | Phase C P0/P1 tests complete | C8 evidence "Gate Outputs" section |
| C0-03 | UAT critical scenarios complete | C8 evidence "UAT Scenario Results" section |
| C0-04 | Accessibility P0 checks pass | C8 evidence "Accessibility Regression" section + C7 evidence |
| C0-05 | Rollback route validated | Rollback play documented in runbook (C-R6) |

For C0-05, verify that the rollback path is actionable:
- Confirm the rollout runbook C-R6 section specifies revert steps
- Confirm feature toggles can disable UX v2 exposure
- Record the verification in the checklist

Mark each item `[x]` with the evidence link.

After this sub-step: Pre-flight section fully populated.

---

### Sub-step 2: GO/NO-GO Pre-Gate Assessment

Populate the GO/NO-GO template
(`GIFTA_UX_V2_PHASE_C_GO_NO_GO_TEMPLATE.md`) pre-gate section
(CG-01 through CG-06) using evidence from the complete Phase C
execution.

| Gate | Check | Evidence Source |
|---|---|---|
| CG-01 | Phase B GO confirmed | Phase B GO evidence file |
| CG-02 | Phase C P0 test gates pass | C8 evidence "Gate Outputs" — `pnpm lint`, `pnpm typecheck`, `pnpm test` all PASS |
| CG-03 | Phase C P1 test gates pass | C8 evidence "Gate Outputs" — coverage thresholds met, P1 UAT/edge-case tests passing |
| CG-04 | UAT critical scenarios pass | C8 evidence "UAT Scenario Results" — UAT-01 through UAT-12 status |
| CG-05 | Accessibility P0 checks pass | C8 evidence "Accessibility Regression" + C7 evidence "UX A11y Checklist" |
| CG-06 | Rollback path validated | Runbook C-R6 documented + sub-step 1 C0-05 verification |

For each gate:
- Set status to `PASS` or `FAIL`
- Fill in the evidence link column with the specific evidence
  file path and section reference
- If any gate is `FAIL`, document the specific failure and STOP

Fill in the template header fields:
- Date: current date
- Release lead: `Ryan Laubscher`
- Operator: `AI Agent (Phase C)`

After this sub-step: all 6 pre-gates assessed.

---

### Sub-step 3: Deployment Preparation Documentation (C-R1)

Document the deployment preparation steps per runbook C-R1.
Since this is a Vercel-hosted Next.js app, document:

1. **Release artifact identification:**
   - Record the current git commit SHA (`git rev-parse HEAD`)
   - Record the branch name
   - Record the `pnpm build` success from sub-step 0

2. **Config/toggle verification:**
   - Confirm `UX_V2_ENABLE_BANK_WRITE_PATH` default state (OFF)
   - Confirm `UX_V2_ENABLE_CHARITY_WRITE_PATH` default state (OFF)
   - List any other UX v2 feature toggles and their default states
   - Record in evidence

3. **Dashboard and alert channel readiness:**
   - Document which monitoring surfaces should be open during
     rollout (Vercel dashboard, Sentry, any analytics dashboards)
   - Document the alert channel (if applicable)
   - This is documentation for the human operator — record what
     needs to be monitored

After this sub-step: deployment prep documented.

---

### Sub-step 4: Smoke Route Checklist Preparation (C-R2)

Prepare the smoke route verification checklist for the human
operator to execute during controlled enablement. Populate
rollout checklist section 2 (Deploy + Initial Exposure) with
specific URLs and expected behaviors.

| Checklist ID | Route | Expected Behavior | Verification Method |
|---|---|---|---|
| C1-01 | UI artifact deployed | Vercel deploy succeeds | Deploy log shows success |
| C1-02 | `/` (landing) + `/sign-in` | Landing renders, auth redirects work | Visual + no console errors |
| C1-03 | `/create/child` through `/create/review` | All 6 create steps navigate correctly | Walk through each step |
| C1-04 | `/[slug]` + `/[slug]/contribute` | Public board renders, contribute form loads | Use test board slug |
| C1-05 | `/dashboard` | Dashboard loads with board list | Logged-in host session |
| C1-06 | `/admin/*` critical pages | Admin dreamboards, contributions, payouts load | Admin session |

For each route, document:
- The exact URL pattern
- What "healthy" looks like (renders without error, correct copy,
  correct layout)
- What "unhealthy" looks like (blank page, error boundary, wrong
  data, console errors)

After this sub-step: smoke checklist ready for human execution.

---

### Sub-step 5: Hold Point Monitoring Guide (C-R3)

Document the 30-minute hold point monitoring plan for the human
operator. Prepare rollout checklist section 3 (Hold Point).

**Monitoring targets:**

| Signal | Where to Monitor | Threshold | Escalation |
|---|---|---|---|
| Frontend error rate | Sentry dashboard | No severe spike vs. pre-deploy baseline | Trigger C-R6 rollback |
| API failure rate | Vercel/Sentry | No sustained 5xx spike | Trigger C-R6 rollback |
| Contribution completion | Payment provider dashboard / DB query | Conversion rate within ±10% of baseline | Investigate, potential C-R6 |
| Payout operations | Admin panel / Karri dashboard | No new failures post-deploy | Investigate, potential C-R6 |
| Telemetry event flow | Analytics dashboard | Events flowing for all 17 catalog events | Document gaps as P2 |

**Hold point protocol:**
1. Start timer at deploy completion
2. Check each signal at T+5min, T+15min, T+30min
3. Record observations at each checkpoint
4. At T+30min: if all thresholds respected, proceed to C-R4
5. If any threshold breached: execute C-R6 rollback play

After this sub-step: monitoring guide documented.

---

### Sub-step 6: Validation Gate Preparation (CV-01 through CV-07)

Pre-populate the GO/NO-GO template validation gates section with
verification instructions for the human operator.

| Gate | Check | How to Verify |
|---|---|---|
| CV-01 | Host create flow healthy | Complete a test board creation end-to-end in production |
| CV-02 | Guest contribution flow healthy | Submit a test contribution (minimum amount) via each active provider |
| CV-03 | Reminder UX path healthy | Request a reminder on a test board, verify no error |
| CV-04 | Host dashboard correctness | View dashboard with test board, verify amounts and status display |
| CV-05 | Admin critical UX paths healthy | Navigate admin dreamboards, contributions, payouts pages |
| CV-06 | Frontend/API error thresholds respected | Sentry error count within threshold after hold point |
| CV-07 | Telemetry event continuity confirmed | Verify analytics events flowing in dashboard for test actions |

Each gate gets a `PASS`/`FAIL` status after human execution.
Pre-fill the "Evidence" column with instructions on what
screenshot/log to capture.

After this sub-step: validation gates ready for human execution.

---

### Sub-step 7: Manual Viewport Verification Checklist

Complete the device/viewport manual checklist deferred from C8
sub-step 10. This is documentation for the human operator to
execute on real devices during or immediately after rollout.

| # | Device / Browser | Viewport | Routes to Verify | Status |
|---|---|---|---|---|
| 1 | iPhone Safari | 375×812 | `/[slug]`, `/[slug]/contribute`, `/create/*`, `/dashboard` | PENDING |
| 2 | Android Chrome | 360×800 | `/[slug]`, `/[slug]/contribute`, `/create/*`, `/dashboard` | PENDING |
| 3 | Desktop Chrome | 1440×900 | All routes | PENDING |
| 4 | Desktop Safari | 1440×900 | All routes | PENDING |

For each device, document what to verify:
- Layout renders without horizontal scroll
- Touch targets ≥ 44×44px on mobile
- Text readable without zoom
- Forms usable (input focus, keyboard doesn't obscure)
- Animations respect `prefers-reduced-motion`

After this sub-step: viewport checklist documented.

---

### Sub-step 8: Rollback Play Documentation (C-R6)

Verify and document the rollback procedure in detail:

1. **Application rollback:**
   - Vercel instant rollback to previous deployment
   - Verify rollback URL pattern / dashboard location

2. **Feature toggle rollback:**
   - Disable any UX v2 exposure toggles
   - Document which env vars need to change

3. **Backend stability:**
   - Confirm Phase B backend remains stable (no C9 backend changes)
   - Document that DB schema is unchanged

4. **Evidence preservation:**
   - If rollback triggered, capture: deploy logs, Sentry errors,
     timeline of events, screenshots of failures
   - Store in evidence folder

After this sub-step: rollback play fully documented.

---

### Sub-step 9: Closeout and Evidence Archival (C-R7)

1. **Archive release evidence:**
   - Verify all C0–C8 evidence files are present in
     `docs/implementation-docs/evidence/ux-v2/phase-c/`
   - Create the C9 evidence file (see Evidence File Structure below)

2. **Documentation sync:**
   - Verify docs reflect deployed behavior
   - Check that `CHANGELOG.md` has a Phase C entry
   - Verify `AGENTS.md` reflects current state

3. **P2 deferral log:**
   - Compile all P2 deferrals from C0–C8 evidence files into a
     consolidated list with owner and target date
   - Include: Lighthouse audit, real-device testing, load testing,
     axe-core automation, runtime telemetry verification, Web Vitals
     measurement, `text-text-muted` token consolidation,
     marketing/auth error boundaries, leaf-route loading states,
     high-contrast mode support

4. **Agent handoff payload** (per execution contract):
   - Execution summary by phase (B + C)
   - Gate pass/fail matrix (all milestones)
   - Production rollout status (GO/NO-GO/PENDING)
   - Unresolved risk register
   - Exact next-step list for any open items

5. Append C9 learnings to `docs/napkin/napkin.md` under
   `## C9 Learnings (YYYY-MM-DD)`

After this sub-step: closeout complete.

---

## Evidence File Structure

Create evidence file at:
`docs/implementation-docs/evidence/ux-v2/phase-c/YYYYMMDD-C9-production-rollout.md`

The C9 evidence file must contain these sections:

### 1) Prerequisite Verification
- C8 evidence file: EXISTS/MISSING
- C8 P0 gate: PASS/FAIL
- C8 P1 gate: PASS/FAIL
- C0–C7 evidence files: all present / list missing
- Phase B GO: confirmed / not confirmed

### 2) Final Gate Verification
- `pnpm lint`: PASS/FAIL (errors: N, warnings: N)
- `pnpm typecheck`: PASS/FAIL
- `pnpm test`: PASS/FAIL (N files, N tests)
- `pnpm openapi:generate`: PASS/FAIL
- `pnpm test tests/unit/openapi-spec.test.ts`: PASS/FAIL
- `pnpm build`: PASS/FAIL (time: Ns)
- Test count comparison to C8 baseline: MATCH/REGRESSION

### 3) Pre-Flight Checklist Status
| ID | Task | Status | Evidence |
|---|---|---|---|
| C0-01 | Phase B GO verified | ✓/✗ | link |
| C0-02 | P0/P1 tests complete | ✓/✗ | link |
| C0-03 | UAT scenarios complete | ✓/✗ | link |
| C0-04 | Accessibility checks pass | ✓/✗ | link |
| C0-05 | Rollback validated | ✓/✗ | link |

### 4) GO/NO-GO Pre-Gate Assessment
| Gate | Status | Evidence |
|---|---|---|
| CG-01 | PASS/FAIL | link |
| CG-02 | PASS/FAIL | link |
| CG-03 | PASS/FAIL | link |
| CG-04 | PASS/FAIL | link |
| CG-05 | PASS/FAIL | link |
| CG-06 | PASS/FAIL | link |

### 5) Deployment Preparation
- Git SHA: `{sha}`
- Branch: `{branch}`
- Build status: PASS
- Toggle states documented: YES/NO

### 6) Smoke Route Checklist (for human execution)
Table from sub-step 4 with status column

### 7) Hold Point Monitoring Guide
Table from sub-step 5

### 8) Validation Gates (for human execution)
CV-01 through CV-07 with status column

### 9) Manual Viewport Checklist (for human execution)
Table from sub-step 7 with status column

### 10) Rollback Play
- Rollback method documented: YES/NO
- Toggle rollback documented: YES/NO
- Evidence preservation plan: YES/NO

### 11) P2 Consolidated Deferral Log

| ID | Item | Source Milestone | Owner | Target Date |
|---|---|---|---|---|
| P2-01 | Lighthouse performance audit | C8 | TBD | TBD |
| P2-02 | Real-device viewport testing | C8 | TBD | TBD |
| ... | ... | ... | ... | ... |

### 12) Agent Handoff Payload
- Phase B summary: {status}
- Phase C summary: {status}
- Gate matrix: all milestones
- Rollout status: GO / NO-GO / PENDING
- Unresolved risks: {list}
- Next steps: {list}

### 13) Phase C Milestone Summary

| Milestone | Date | Status | Test Delta |
|---|---|---|---|
| C0 | 2026-02-08 | Complete | baseline |
| C1 | 2026-02-08 | Complete | +N tests |
| C2 | 2026-02-08 | Complete | +N tests |
| C3 | 2026-02-08 | Complete | +N tests |
| C4 | 2026-02-08 | Complete | +N tests |
| C5 | 2026-02-09 | Complete | +N tests |
| C6 | 2026-02-09 | Complete | +N tests |
| C7 | 2026-02-09 | Complete | +N tests |
| C8 | 2026-02-09 | Complete | +N tests |
| C9 | YYYY-MM-DD | {status} | +0 (operational) |

### 14) Risk Assessment
- Known risks with mitigation
- Open items requiring human action
- Timeline dependencies

---

## Acceptance Criteria

### P0 (blocks rollout decision)
- C8 evidence file exists and all 14 sections populated
- All 6 GO/NO-GO pre-gates (CG-01 through CG-06) assessed as PASS
- Pre-flight checklist (C0-01 through C0-05) fully populated with
  evidence links
- Final local gates pass (`pnpm lint && pnpm typecheck && pnpm test
  && pnpm build`)
- Test count matches or exceeds C8 baseline (zero regression)
- Rollback play documented with actionable steps
- Agent handoff payload complete

### P1 (blocks full release sign-off)
- Smoke route checklist prepared with specific URLs and expected
  behaviors for all 6 route groups
- Hold point monitoring guide prepared with thresholds and
  escalation paths
- Validation gates (CV-01 through CV-07) documented with
  verification instructions
- Manual viewport checklist prepared for 4 device/browser
  combinations
- P2 deferral log consolidated from all milestones with owners
- Phase C milestone summary table complete
- CHANGELOG.md updated with Phase C entry
- Napkin learnings appended

### P2 (defer with waiver — log in evidence)
- Live smoke route execution (requires production deployment)
- Hold point monitoring execution (requires production deployment)
- Validation gate execution (requires production deployment)
- Real-device viewport testing (requires physical devices)
- GO/NO-GO decision signing (requires human sign-off)
- Runtime telemetry delivery confirmation (requires live environment)

---

## Human Operator Actions (cannot be automated)

The following actions require human execution after the agent
completes sub-steps 0–9. The agent prepares all documentation
and checklists; the human executes:

1. **Deploy to Vercel** — push/merge to production branch
2. **Execute smoke routes** — walk through checklist from sub-step 4
3. **Monitor hold point** — follow guide from sub-step 5
4. **Execute validation gates** — complete CV-01 through CV-07
5. **Test on real devices** — follow viewport checklist from sub-step 7
6. **Sign GO/NO-GO decision** — fill in Decision section of template
7. **Execute rollback if needed** — follow play from sub-step 8

---

## Stop Conditions

- C8 evidence file missing or incomplete → STOP (C8 not done)
- Any GO/NO-GO pre-gate (CG-01 through CG-06) fails → STOP,
  document which gate failed and why
- Local gate failure (`lint`, `typecheck`, `test`, `build`) → STOP,
  codebase has drifted since C8
- Test count regression vs. C8 baseline → STOP, investigate
- Any source file modified → STOP (C9 is documentation only)
- Any test file modified → STOP (C9 is documentation only)
- Schema or migration file touched → STOP
- Phase B GO evidence not found → STOP
