# Data Model

> **Status:** Current reference  
> **Last reviewed:** March 12, 2026  
> **Primary source of truth:** [`src/lib/db/schema.ts`](../../src/lib/db/schema.ts)

## Core Enums

- `dream_board_status`: `draft | active | funded | closed | paid_out | expired | cancelled`
- `payout_method`: `karri_card | bank`
- `charity_split_type`: `percentage | threshold`
- `payment_status`: `pending | processing | completed | failed | refunded`
- `payment_provider`: `payfast | ozow | snapscan`
- `payout_status`: `pending | processing | completed | failed`
- `payout_type`: `karri_card | bank | charity`

## Core Tables

### `dream_boards`

Stores host, child, gift, payout, charity, messaging, and lifecycle state.

Important fields:

- child details, birthday, party date, optional party datetime
- gift fields and icon/image path
- `goal_cents`
- payout method + method-specific recipient data
- optional charity configuration
- `status`

### `contributions`

Stores guest contribution attempts and completion state.

Important money fields:

- `amount_cents`: contributor-selected gift amount
- `fee_cents`: platform fee charged on top
- `net_cents`: generated column for payout-ledger math
- `charity_cents`: optional charity allocation

### `payouts`

Stores gift payout rows and, when applicable, charity payout rows.

### `payout_items`

Line items attached to payout records.

### `charities`

Admin-managed charity catalog for optional giving-back flows.

### `contribution_reminders`

Reminder scheduling, retry, and WhatsApp opt-in / opt-out state.

## Current Money Semantics

- Goal progress uses completed `amount_cents`
- Checkout total uses `amount_cents + fee_cents`
- `net_cents` exists for payout-ledger calculations, not goal progress

## Retention

Current retention constants live in [`src/lib/retention/retention.ts`](../../src/lib/retention/retention.ts):

- IP address window: `30` days
- closed/paid-out/expired/cancelled board grace window: `90` days

## Views / Aggregations

Current aggregate helpers live in:

- [`src/lib/db/views.ts`](../../src/lib/db/views.ts)
- [`src/lib/db/queries.ts`](../../src/lib/db/queries.ts)

Those helpers currently aggregate completed contribution totals from `amount_cents`.
