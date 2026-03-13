# Journeys

> **Status:** Current reference  
> **Last reviewed:** March 13, 2026

## Host Journey

Authenticated via Clerk.

Current create flow:

1. `/create/child`
2. `/create/gift`
3. `/create/dates`
4. `/create/voucher`
5. `/create/review`

Legacy compatibility routes `/create/giving-back` and `/create/payout` redirect to `/create/voucher`; they are not active wizard steps.

Hosts then manage boards from `/dashboard` and `/dashboard/[id]`.
Active host product UI does not surface charity summaries or controls.

## Guest Journey

Public mobile-web flow:

1. `/{slug}` public Dreamboard
2. `/{slug}/contribute` amount/details step
3. `/{slug}/contribute/payment` payment step
4. `/{slug}/thanks` or `/{slug}/payment-failed`

Current display rules:

- guests see percentage plus aggregate Rand progress
- guests do not see individual contribution amounts
- guests do not see charity panels or charity impact copy in the active product
- host viewing own public board gets a dashboard shortcut banner

## Admin Journey

Admin surfaces live under `/admin` and require Clerk plus allowlist access.

Current admin pages:

- `/admin`
- `/admin/dream-boards`
- `/admin/contributions`
- `/admin/payouts`
- `/admin/reports`
- `/admin/settings`

Historical charity reconciliation remains available through ops/admin data paths, but the charity records page is not part of the active admin navigation.

## Lifecycle Notes

- Dreamboards remain contribute-able while `active` or `funded`
- close is explicit through the partner API
- no in-repo scheduler auto-closes on `party_date` or `campaign_end_date`
