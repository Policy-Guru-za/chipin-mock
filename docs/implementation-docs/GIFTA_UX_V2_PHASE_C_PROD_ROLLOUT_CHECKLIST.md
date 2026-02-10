# Gifta UX v2 Phase C Production Rollout Checklist

## 1) Pre-Flight

| ID | Task | Evidence | Done |
|---|---|---|---|
| C0-01 | Phase B GO evidence verified | `docs/implementation-docs/evidence/ux-v2/phase-b/20260208-B9-go-no-go-decision.md` (Decision + Sign-Off) | [x] |
| C0-02 | Phase C P0/P1 tests complete | `docs/implementation-docs/evidence/ux-v2/phase-c/20260209-C8-e2e-uat-and-performance-sweep.md` (Sections 12, 13) + `docs/implementation-docs/evidence/ux-v2/phase-c/20260209-C9-production-rollout.md` (Section 2) | [x] |
| C0-03 | UAT critical scenarios complete | `docs/implementation-docs/evidence/ux-v2/phase-c/20260209-C8-e2e-uat-and-performance-sweep.md` (Section 2) | [x] |
| C0-04 | Accessibility P0 checks pass | `docs/implementation-docs/evidence/ux-v2/phase-c/20260209-C8-e2e-uat-and-performance-sweep.md` (Section 8) + `docs/implementation-docs/evidence/ux-v2/phase-c/20260209-C7-accessibility-and-edge-cases.md` (Sections 2, 3, 5, 8) | [x] |
| C0-05 | Rollback route validated | `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_ROLLOUT_RUNBOOK.md` (C-R6) + `docs/implementation-docs/GIFTA_UX_V2_AGENT_EXECUTION_CONTRACT.md` (Rollback Contract) + `docs/implementation-docs/evidence/ux-v2/phase-b/20260208-B9-rollout-runbook-execution.md` (B-R7); rollback location: Vercel dashboard `Project -> Deployments -> previous stable -> Promote/Redeploy`; toggles OFF: `UX_V2_ENABLE_BANK_WRITE_PATH=false`, `UX_V2_ENABLE_CHARITY_WRITE_PATH=false`; preserve deploy/Sentry/telemetry logs before rollback | [x] |

## 2) Deploy + Initial Exposure

| ID | Task | Evidence | Done |
|---|---|---|---|
| C1-01 | Deploy artifact (`c353a8382d266a07b0c28303a3096a3c2a412fc1`, `main`) | Vercel deployment log with deployment ID, commit SHA, start/end timestamps, and build outcome | [ ] |
| C1-02 | Route smoke: `/` and `/sign-in` | Healthy: landing/auth render and interactive; Unhealthy: 5xx/blank/error boundary/console errors; Evidence: full-page screenshots + browser console capture + timestamp | [ ] |
| C1-03 | Route smoke: `/create/child` -> `/create/review` | Healthy: 6-step host flow completes and publish action succeeds; Unhealthy: step redirect loops, action failure, validation dead-end; Evidence: step-by-step screenshots + publish log + timestamp | [ ] |
| C1-04 | Route smoke: `/{slug}` and `/{slug}/contribute` | Healthy: board data and contribution flow load without blocking errors; Unhealthy: state-card mismatch, missing CTA, flow crash; Evidence: slug walkthrough screenshots + console/network snapshot + timestamp | [ ] |
| C1-05 | Route smoke: `/dashboard` and `/dashboard/{id}` | Healthy: host summary, totals, and status cards render for authenticated host; Unhealthy: data load failures, incorrect status, blocked actions; Evidence: authenticated screenshots + timestamp | [ ] |
| C1-06 | Route smoke: `/admin/*` critical (`/admin/dream-boards`, `/admin/contributions`, `/admin/payouts`) | Healthy: admin pages render and key tables/actions load; Unhealthy: auth loops, table/data failures, critical UI errors; Evidence: per-route screenshots + console capture + timestamp | [ ] |

## 3) Hold Point

| ID | Task | Evidence | Done |
|---|---|---|---|
| C2-01 | 30-min hold started immediately after initial exposure | Record T+0 timestamp + operator initials | [ ] |
| C2-02 | Frontend severe errors within threshold | Threshold: `> baseline + 2` severe events for 2 consecutive checks, or any P0 crash => rollback; Evidence: dashboard snapshots at T+5/T+15/T+30 | [ ] |
| C2-03 | API 5xx within threshold | Threshold: `>1%` any 5-minute bucket OR `>2%` for 3 consecutive minutes => rollback; Evidence: API dashboard snapshots at T+5/T+15/T+30 | [ ] |
| C2-04 | Contribution completion stable | Threshold: drop >15% vs 7-day same-hour baseline (min sample 20 attempts); sustained 2 checks => rollback; Evidence: funnel/conversion snapshots | [ ] |
| C2-05 | Telemetry smoke subset flowing | Required events: `guest_view_loaded`, `contribution_started`, `contribution_redirect_started`, terminal contribution event (`contribution_completed` or `contribution_failed`), `host_create_started`, `host_create_published`; missing any => block ramp | [ ] |

Hold-point protocol:
- Checkpoints required: T+5m, T+15m, T+30m.
- Record each checkpoint in this checklist and GO/NO-GO template.
- If all checks pass at T+30m, proceed to section 4.
- If any threshold breaches, execute C-R6 rollback immediately.

## 4) Full Exposure

| ID | Task | Evidence | Done |
|---|---|---|---|
| C3-01 | Exposure ramp executed (`10% -> 50% -> 100%`; fallback: direct `100%` if constrained ramp unsupported) | Config/deploy snapshots per step + timestamps + operator initials | [ ] |
| C3-02 | Smoke subset rerun at each exposure step (`C1-02` through `C1-06`) with min hold `>=10 minutes` per step | Per-step smoke logs/screenshots + hold duration timestamps + pass/fail notes | [ ] |
| C3-03 | GO/NO-GO template completed and decision packet assembled | `docs/implementation-docs/GIFTA_UX_V2_PHASE_C_GO_NO_GO_TEMPLATE.md` with CG/CV status + checklist link + hold-point metrics snapshots + rollback readiness confirmation | [ ] |

GO packet requirements before final decision:
- Completed checklist (`C0` through `C3`) links/evidence.
- Completed GO/NO-GO template with CV-01 through CV-07 outcomes.
- Hold-point metric snapshots (T+5/T+15/T+30 and ramp checkpoints).
- Rollback readiness confirmation (deployment rollback path + toggle rollback path).

## 5) Closeout

| ID | Task | Evidence | Done |
|---|---|---|---|
| C4-01 | Evidence archived | folder link | [ ] |
| C4-02 | Docs synced to deployed behavior | commit link | [ ] |
| C4-03 | Deferred P2 items logged | ticket links | [ ] |

## Final Status

- [ ] Phase C accepted
- [ ] Phase C rolled back
