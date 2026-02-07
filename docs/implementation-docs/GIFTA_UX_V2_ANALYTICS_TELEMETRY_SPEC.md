# Gifta UX v2 Analytics and Telemetry Spec

## Purpose

Define required analytics events, operational metrics, and alerting for UX v2.

## Principles

- event names stable and versioned by contract
- no sensitive PII in telemetry payloads
- every critical user journey has start/success/failure signals

## Product Event Catalog

### Host Journey

- `host_create_started`
- `host_create_step_completed`
- `host_create_failed`
- `host_create_published`

Required properties:

- `step`
- `dream_board_id` (where available)
- `payout_method`
- `charity_enabled`

### Guest/Contributor Journey

- `guest_view_loaded`
- `contribution_started`
- `contribution_redirect_started`
- `contribution_completed`
- `contribution_failed`
- `reminder_requested`

Required properties:

- `dream_board_id`
- `payment_provider`
- `amount_cents`
- `failure_code` (on failure)

### Payout/Operations

- `payout_created`
- `payout_processing_started`
- `payout_completed`
- `payout_failed`
- `charity_payout_created`
- `reminder_dispatched`
- `reminder_failed`

Required properties:

- `payout_id`
- `payout_type`
- `dream_board_id`
- `amount_cents`
- `failure_code` (if applicable)

## Operational Metrics

- API 5xx rate
- payout failure rate by type
- reminder send success/failure rate
- contribution conversion funnel
- create flow drop-off by step

## Dashboards

Minimum dashboards:

1. Critical path health (create/contribute/payout)
2. Payment and payout reliability
3. Reminder and comms reliability
4. UX funnel conversion

## Alerts

Trigger alerts for:

- sustained 5xx spike (> threshold)
- payout failure spike
- reminder dispatch failure rate > threshold
- zero events on expected high-traffic critical events (possible outage)

## Acceptance Criteria

- `P1`: all required events emitted in critical journeys
- `P1`: dashboards available and reviewed pre-rollout
- `P0`: alerts configured for money-movement and critical path failures
