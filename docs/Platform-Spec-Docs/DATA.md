# Data Model

> **Status:** Current reference  
> **Last reviewed:** March 19, 2026  
> **Primary source of truth:** [`src/lib/db/schema.ts`](../../src/lib/db/schema.ts) for persisted compatibility fields; the active product contract below follows the intended bank + optional Karri direction while calling out remaining legacy voucher drift explicitly.

## Core Enums

- `dream_board_status`: `draft | active | funded | closed | paid_out | expired | cancelled`
- `payout_method`: active product contract `karri_card | bank` (legacy persisted compatibility still retains `takealot_voucher` until runtime cleanup lands)
- `charity_split_type`: `percentage | threshold` (schema retained for historical/internal use)
- `payment_status`: `pending | processing | completed | failed | refunded`
- `payment_provider`: `stitch`
- `payout_status`: `pending | processing | completed | failed`
- `payout_type`: active product contract `karri_card | bank | charity` (legacy persisted compatibility still retains `takealot_voucher` rows until runtime cleanup lands)

## Core Tables

### `dream_boards`

Stores host, child, gift, payout, historical charity, messaging, and lifecycle state.

Important fields:

- child details, birthday, party date, optional party datetime
- gift fields and icon/image path
- `goal_cents`
- payout method + method-specific recipient data
- intended host-create path writes bank payout details and optionally Karri details when selected
- partner/API `karri_card` writes are gated by `UX_V2_ENABLE_KARRI_WRITE_PATH`; bank writes remain gated by `UX_V2_ENABLE_BANK_WRITE_PATH`
- optional historical charity configuration; active product writes clear these fields
- `status`

### `contributions`

Stores guest contribution attempts and completion state.

Important money fields:

- `amount_cents`: contributor-selected gift amount
- `fee_cents`: legacy compatibility field; new contribution rows write `0`
- `net_cents`: generated legacy compatibility field for contribution payout math; new rows now match `amount_cents`
- `charity_cents`: optional historical/internal charity allocation; active product writes `null`

### `payouts`

Stores gift payout rows and, when applicable, historical charity payout rows.

- gift payout type matches the Dreamboard `payout_method`
- legacy `takealot_voucher` rows may still exist in persisted compatibility data until runtime cleanup lands

### `payout_items`

Line items attached to payout records.

### `charities`

Admin-managed charity catalog retained for historical ops and reconciliation, not active Dreamboard product navigation.

### `contribution_reminders`

Reminder scheduling, retry, and WhatsApp opt-in / opt-out state.

## Current Money Semantics

- Goal progress uses completed `amount_cents`
- Active checkout total uses `amount_cents`
- Active product charity allocation is disabled for new Dreamboards and new completed contributions
- Current guest payment product state is a Stitch-coming-soon placeholder only; no live checkout is documented as active
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
