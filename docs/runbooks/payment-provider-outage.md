> **Document Status:** Reference only. Reviewed March 12, 2026.
> Useful context only. Do not use this file as the source of truth for current runtime behavior or agent policy.
> Canonical replacement: `docs/Platform-Spec-Docs/NFR-OPERATIONS.md`.
# Runbook: Payment Provider Outage

> 2026-03-19 note: Gifta's current public guest flow is a Stitch-coming-soon placeholder with no live checkout provider. Treat this runbook as legacy/future contingency guidance only unless a live provider is reintroduced.

## Purpose
Guide for responding to historical or future live checkout provider outages, degradations, or widespread payment failures.

## Detection Signals
- Sentry alerts for payment initiation or webhook failures.
- Elevated 5xx/timeout rate on payment routes.
- Provider status page indicates incident.
- Spike in `payment_status=failed` or `processing` stuck > 15 minutes.

## Immediate Triage
1. Identify impacted provider(s) and incident start time.
2. Check provider dashboards/status pages.
3. Inspect recent deploys and logs for regression indicators.
4. Confirm scope: new payments, webhooks, or both.

## Mitigation Steps
**If provider is down or degraded:**
1. Pause payment initiation for the impacted provider(s) (return 503 + friendly message).
2. If multiple providers are impacted, temporarily block new contributions.
3. Inform support and prepare customer-facing status update.

**If only webhooks are failing:**
1. Keep payment initiation enabled.
2. Mark payments as `processing` and increase reconciliation polling cadence.
3. Queue webhook replays if available.

## Communication Template
**Internal (Slack/Email):**
> Payment provider incident detected for **[PROVIDER]**. Scope: **[INITIATION/WEBHOOK/BOTH]**. Start time: **[UTC]**. Mitigation: **[ACTION]**. Next update in **[X]** minutes.

**External (Status Page/Email):**
> We’re experiencing payment issues with **[PROVIDER]**. Contributions may be temporarily unavailable. We’re working to restore service and will provide updates.

## Recovery
1. Re-enable payment initiation.
2. Reprocess/reconcile pending payments.
3. Backfill any missing webhooks.
4. Verify normal error rates and payment completion.

## Post‑Incident
- RCA documenting root cause, time to detect, time to mitigate.
- Follow-up tasks to add/remove guardrails.
