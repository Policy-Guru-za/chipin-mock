# Gifta UX v2 Decision Register

## Purpose

Lock critical implementation decisions for UX v2. AI agents must treat `Status: LOCKED` as mandatory.

## Change Rule

A locked decision may change only via explicit update in this file with rationale and timestamp.

## Decision Table

| ID | Decision | Status | Effective Value | Rationale | Impacted Areas |
|---|---|---|---|---|---|
| D-001 | Payout method enum | LOCKED | `karri_card`, `bank` | Matches the intended active product contract: bank payout by default, optional Karri path, no Takealot voucher product truth | DB, API, payouts, UI |
| D-002 | Payout type enum | LOCKED | `karri_card`, `bank`, `charity` | Supports gift payout + optional charity payout ledger without treating vouchers as an active product path | Payout engine, admin, reports |
| D-003 | Charity split modes | LOCKED | `percentage`, `threshold` | Matches UX v2 architecture options | Create flow, validation, payout calc |
| D-004 | Fee semantics | LOCKED | Contributor chooses gift amount; active checkout charges that amount with no added platform fee; raised amount tracks gift amount | Fee-free active product + stable payout math for legacy rows | Payment create, views, funded logic, payouts |
| D-005 | Raised/funded source | LOCKED | `raised_cents` reflects contribution amount toward gift goal; funded when raised >= goal | Prevent fee distortion in goal progress | Guest/host UI, lifecycle transitions |
| D-006 | Write-path policy (Phase B) | LOCKED | Enable bank + charity writes only after B4 parity gates pass | Prevent partial launch drift | API routes, rollout gates |
| D-007 | Reminder SLA | LOCKED | Reminder scheduling max 14 days; send pipeline retries with idempotent dedupe | Prevent spam/duplication | Reminder job, comms |
| D-008 | Charity payout cadence | LOCKED | Monthly charity payout batch with per-charity reconciliation report | Operational predictability | Payout engine, admin reports |
| D-009 | Branding strings | LOCKED | `Gifta` primary brand string across UI, metadata, comms | Remove legacy naming drift | UI, templates, docs |
| D-010 | Accessibility baseline | LOCKED | WCAG 2.1 AA for all user-facing screens | UX architecture requirement | UI acceptance gates |

## Derived Implementation Rules

- Any code path assuming a Takealot voucher host payout path is a defect against the intended UX v2 product contract.
- OpenAPI enums must match runtime enums in all payout and Dreamboard schemas.
- Charity-enabled boards require complete charity configuration; partial payloads rejected.
- Reminder scheduling and dispatch must be idempotent by `(dream_board_id, email, remind_at)`.

## Decision Audit Log

| Date (UTC) | Change | Author | Notes |
|---|---|---|---|
| 2026-03-19 | Updated D-001/D-002 to the intended bank + optional Karri payout truth; legacy voucher drift remains a runtime cleanup follow-up | AI agent | Docs-leading alignment after the Stitch placeholder pivot |
| 2026-02-06 | Initial decision lock for UX v2 execution | AI agent | Created to unblock deterministic implementation |
