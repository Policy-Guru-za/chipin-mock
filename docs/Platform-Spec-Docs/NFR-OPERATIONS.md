# NFR and Operations

> **Status:** Current reference  
> **Last reviewed:** March 12, 2026

## Health Endpoints

- `/health/live`
- `/health/ready`
- `/api/health`
- `/health/ready` reports Karri as `disabled` in standard mode when both `UX_V2_ENABLE_KARRI_WRITE_PATH` and `KARRI_AUTOMATION_ENABLED` are false
- Karri credentials are only required for readiness when the Karri write path or automation mode is enabled, unless `MOCK_KARRI=true`

## Operational Jobs

External scheduler required for:

- webhook processing
- Karri batch
- payment reconciliation
- reminder dispatch
- retention run

## Observability

- Sentry is the primary error-reporting integration
- OpenTelemetry wiring is optional
- Axiom env support is optional
- `proxy.ts` ensures request IDs are attached at the app edge

## Performance / Reliability Notes

- Current lint baseline passes with warnings only
- Current type/test baselines are green
- `pnpm docs:audit` is part of the documentation integrity gate and should run beside the standard code gates

## Webhook Endpoint Rollback Tooling

- Before applying the webhook-endpoint event sanitization migration in any non-local environment, generate a rollback artifact with `pnpm webhooks:snapshot -- --ticket <change-ticket>`.
- Validate the snapshot against the target database before any restore or rollback with `pnpm webhooks:restore -- --input <artifact-path> --dry-run`.
- Restore re-applies `events` and `is_active` by row id and aborts if any snapshot row is missing from the target database.
