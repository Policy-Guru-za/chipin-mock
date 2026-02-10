# Gifta UX v2 API Contract Parity Spec

## Purpose

Define required parity between API runtime behavior, OpenAPI schema, DB enums, and UX v2 expectations.

## Contract Sources

- Runtime routes in `src/app/api/*`
- Serialization layer in `src/lib/api/*`
- OpenAPI generator `src/lib/api/openapi.ts`
- DB schema enums in `src/lib/db/schema.ts`

## Canonical Enum Set

### Dreamboard

- `payout_method`: `karri_card` | `bank`
- `charity_split_type`: `percentage` | `threshold`
- `status`: `draft` | `active` | `funded` | `closed` | `paid_out` | `expired` | `cancelled`

### Payout

- `type`: `karri_card` | `bank` | `charity`
- `status`: `pending` | `processing` | `completed` | `failed`

### Contribution

- `payment_provider`: `payfast` | `ozow` | `snapscan`
- `payment_status`: `pending` | `processing` | `completed` | `failed` | `refunded`

## Required Endpoint Parity

## 1) Dream Boards API

### `POST /api/v1/dream-boards`

Must support:

- base child/gift/date/message fields
- payout method dependent payloads
- optional charity payload with full validation

Validation contract:

- if `payout_method=karri_card`, require Karri fields
- if `payout_method=bank`, require bank fields
- if `charity_enabled=true`, require `charity_id` + split config
- reject split config mismatches (`percentage` with threshold value, vice versa)

### `GET /api/v1/dream-boards`

- list output includes canonical `payout_method`
- stable pagination contract

## 2) Payout API

### `GET /api/v1/payouts/pending`

- filter must support full set of operational payout types used by payouts system
- serialized `type` values must match canonical enum set

### `POST /api/v1/payouts/{id}/confirm`, `POST /api/v1/payouts/{id}/fail`

- status transitions must match payout state machine
- response/error shape must be consistent with OpenAPI

## 3) Internal Reminder API

### `POST /api/internal/contributions/reminders`

- strict request schema
- deterministic dedupe behavior
- explicit reason codes for invalid reminder windows

## Required Schema Changes in OpenAPI

1. `PayoutMethod` enum must include `bank`.
2. `PayoutType` enum must include `karri_card`, `bank`, `charity`.
3. Dreamboard create schema must include bank and charity fields + conditional requirements description.
4. Recipient data schemas must include bank/charity-safe shapes where relevant.
5. Error response examples must include validation/path-specific errors for payout/charity fields.

## Error Taxonomy

Required stable error codes:

- `validation_error`
- `conflict`
- `not_found`
- `rate_limited`
- `internal_error`
- `unsupported_operation`
- `invalid_reminder_window`

All errors must include request metadata envelope currently used by API response layer.

## Compatibility Policy

- additive fields preferred
- breaking response field renames prohibited without versioned migration path
- if deprecating fields, document deprecation in OpenAPI description and migration notes

## Contract Test Requirements

- runtime enum set equals OpenAPI enum set
- required/optional field parity tests for create payloads
- serialization tests for payout variants
- error code snapshot tests for invalid payload matrices

## Parity Acceptance Criteria

- `P0`: no runtime/OpenAPI enum drift
- `P0`: payout-related schemas and runtime responses match exactly
- `P1`: no undocumented response fields for key endpoints
- `P1`: deprecations documented and tested
