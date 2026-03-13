# Data Model

> **Status:** Current reference  
> **Last reviewed:** March 12, 2026  
> **Primary source of truth:** [`src/lib/db/schema.ts`](../../src/lib/db/schema.ts)

## Core Enums

- `dream_board_status`: `draft | active | funded | closed | paid_out | expired | cancelled`
- `payout_method`: `karri_card | bank | takealot_voucher`
- `charity_split_type`: `percentage | threshold`
- `payment_status`: `pending | processing | completed | failed | refunded`
- `payment_provider`: `payfast | ozow | snapscan`
- `payout_status`: `pending | processing | completed | failed`
- `payout_type`: `karri_card | bank | takealot_voucher | charity`

## Core Tables

### `dream_boards`

Stores host, child, gift, payout, charity, messaging, and lifecycle state.

Important fields:

- child details, birthday, party date, optional party datetime
- gift fields and icon/image path
- `goal_cents`
- payout method + method-specific recipient data
- default host-create path writes `payout_method='takealot_voucher'` and clears Karri/bank fields
- partner/API `karri_card` writes are gated by `UX_V2_ENABLE_KARRI_WRITE_PATH`; bank writes remain gated by `UX_V2_ENABLE_BANK_WRITE_PATH`
- optional charity configuration
- `status`

### `contributions`

Stores guest contribution attempts and completion state.

Important money fields:

- `amount_cents`: contributor-selected gift amount
- `fee_cents`: legacy compatibility field; new contribution rows write `0`
- `net_cents`: generated legacy compatibility field for contribution payout math; new rows now match `amount_cents`
- `charity_cents`: optional charity allocation

### `payouts`

Stores gift payout rows and, when applicable, charity payout rows.

- gift payout type matches the Dreamboard `payout_method`
- `takealot_voucher` rows are manual placeholder fulfilment records; they are not auto-executed

### `payout_items`

Line items attached to payout records.

### `charities`

Admin-managed charity catalog for optional giving-back flows.

### `contribution_reminders`

Reminder scheduling, retry, and WhatsApp opt-in / opt-out state.

## Current Money Semantics

- Goal progress uses completed `amount_cents`
- Active checkout total uses `amount_cents`
- Historical rows may still carry non-zero `fee_cents`; payout calculations must continue to respect stored values
- Contribution `net_cents` remains for backward compatibility, not goal progress

## Retention

Current retention constants live in [`src/lib/retention/retention.ts`](../../src/lib/retention/retention.ts):

- IP address window: `30` days
- closed/paid-out/expired/cancelled board grace window: `90` days

## Views / Aggregations

Current aggregate helpers live in:

- [`src/lib/db/views.ts`](../../src/lib/db/views.ts)
- [`src/lib/db/queries.ts`](../../src/lib/db/queries.ts)

Those helpers currently aggregate completed contribution totals from `amount_cents`.
