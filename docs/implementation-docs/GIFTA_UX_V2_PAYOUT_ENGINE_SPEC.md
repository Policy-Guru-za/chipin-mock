# Gifta UX v2 Payout Engine Spec

## Purpose

Define deterministic payout creation, processing, and settlement behavior across supported payout types.

## Supported Payout Types

- `karri_card`: gift payout to parent Karri card
- `bank`: gift payout to parent bank account
- `charity`: charity payout for charity-enabled boards

## Preconditions for Payout Creation

- Dream Board status is payout-eligible (`closed` unless explicitly extended by decision update)
- Contribution ledger totals are finalized for payout window
- Payout method data passes validation constraints

## Calculation Contract

Inputs:

- `contribution_amount_total_cents` (gift-intent amount sum)
- `platform_fee_total_cents`
- `charity_total_cents`

Outputs:

- `gift_payout_cents`
- `charity_payout_cents`
- `gross_cents`
- `net_cents`

Formula baseline:

- `gross_cents = contribution_amount_total_cents`
- `gift_payout_cents = gross_cents - charity_total_cents`
- `charity_payout_cents = charity_total_cents`
- `net_cents` for each payout item equals its amount unless additional payout fee model is introduced

## Payout Plan Generation

For each eligible board:

1. Compute totals.
2. Determine expected payout types:
   - always one gift payout matching board payout method (`karri_card` or `bank`)
   - add `charity` payout when charity total > 0
3. Skip creating duplicate payout type rows if existing row found.
4. Insert corresponding `payout_items` rows.

Idempotency key:

- uniqueness by DB constraint `(dream_board_id, type)`

## Recipient Data Contract

### `karri_card`

- `email`
- `payoutMethod=karri_card`
- `cardNumberEncrypted`
- `karriCardHolderName`

### `bank`

- `email`
- `payoutMethod=bank`
- `bankName`
- `bankAccountNumberEncrypted`
- `bankAccountLast4`
- `bankBranchCode`
- `bankAccountHolder`

### `charity`

- `charityId`
- `charityName`
- `bankDetailsEncrypted`
- settlement period metadata (`month`, `year`)

No plaintext sensitive values in recipient payload.

## State Machine

- `pending` -> `processing`
- `processing` -> `completed`
- `processing` -> `failed`
- `failed` -> `processing` (retry path)

Terminal state:

- `completed`

A Dream Board transitions to `paid_out` only when all required payout rows for that board are `completed`.

## Automation Rules

- Karri automation may process `karri_card` payouts when enabled.
- Bank and charity payouts initially manual unless explicit automation added and documented.
- Unsupported automation attempt must return deterministic error (`unsupported_operation`).

## Failure and Retry Policy

- store failure reason in payout row
- bounded retry policy with audit trail
- no infinite retries
- retries must preserve idempotency and external reference integrity

## Audit Requirements

Record audit event on:

- payout creation
- automation start/completion/failure
- manual status changes
- recipient data updates
- note/receipt/certificate actions

## Reconciliation Requirements

- payout totals must reconcile with contribution ledger for each board
- charity payout totals must reconcile with charity allocation ledger
- monthly reconciliation export required for finance review

## Acceptance Criteria

- `P0`: payout plan generation correct for all method combinations
- `P0`: no duplicate payout records per `(dream_board_id, type)`
- `P0`: board `paid_out` transition only when all expected payouts complete
- `P1`: retry behavior bounded and observable
- `P1`: reconciliation reports match ledger totals
