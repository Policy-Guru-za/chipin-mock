# NFR and Operations

> **Status:** Current reference  
> **Last reviewed:** March 12, 2026

## Health Endpoints

- `/health/live`
- `/health/ready`
- `/api/health`

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
