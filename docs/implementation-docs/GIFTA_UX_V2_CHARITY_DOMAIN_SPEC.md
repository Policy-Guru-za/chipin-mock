# Gifta UX v2 Charity Domain Spec

## Purpose

Define charity domain lifecycle, validation, and payout/reporting behavior required by UX v2.

## Domain Entities

### Charity

Required fields:

- `id`
- `name` (unique)
- `description`
- `category`
- `logo_url`
- `bank_details_encrypted`
- `contact_name`
- `contact_email`
- `is_active`

Optional:

- `website`

### Dream Board Charity Config

- `charity_enabled`
- `charity_id`
- `charity_split_type`
- `charity_percentage_bps` or `charity_threshold_cents`

## Validation Rules

- if `charity_enabled=false`: all charity config fields null
- if `charity_enabled=true`:
  - charity exists and `is_active=true`
  - split type required
  - percentage mode: `charity_percentage_bps` in allowed range; threshold null
  - threshold mode: `charity_threshold_cents` minimum threshold; percentage null

## Allocation Rules

### Percentage Mode

- charity allocation = `contribution_amount * percentage`
- round deterministically to cents

### Threshold Mode

- allocate up to threshold total for board
- once threshold reached, subsequent allocations = 0

## Lifecycle Rules

- inactive charity cannot be assigned to newly created/updated active board
- existing boards linked to charity may remain readable when charity later deactivated
- deactivation blocks new board associations

## Admin Operations

Required operations:

- list charities with filters (active/category)
- create charity
- update charity metadata
- activate/deactivate charity
- view donation and payout history

## Reporting Requirements

- per charity totals by period
- pending charity payout totals
- completed charity payouts with references
- downloadable report dataset for reconciliation

## B4 Service DTOs

### CharitySummaryDTO

- `id`
- `name`
- `description`
- `category`
- `logo_url`
- `website`
- `contact_name`
- `contact_email`
- `is_active`

### MonthlyCharitySummaryDTO

- `charity_id`
- `charity_name`
- `total_charity_cents`
- `payout_count`
- `board_count`

### BoardCharityBreakdownDTO

- `dream_board_id`
- `charity_id`
- `charity_name`
- `split_type` (`percentage` | `threshold`)
- `total_charity_cents`
- `allocated_contribution_count`

## Security Requirements

- charity bank details stored encrypted
- no plaintext bank details in logs
- API responses expose masked/minimal recipient details only

## Acceptance Criteria

- `P0`: invalid charity config rejected at API and DB levels
- `P0`: allocations deterministic and test-covered
- `P1`: admin service supports required filters and summaries
- `P1`: reporting outputs reconcile with payout ledger
- `P2`: category/search performance optimized for admin UX
