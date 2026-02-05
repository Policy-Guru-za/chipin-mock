# Backlog

- [ ] Enforce NOT NULL on `dream_boards.gift_name` and `dream_boards.party_date` after create flow writes v2.0 fields (add follow-up migration). Owner: Droid. ETA: Phase 5.
- [ ] Rewrite `payout_type` and `payout_item_type` enums to remove deprecated values once legacy payout/overflow code is removed (align with spec Phase 2/6). Owner: Droid. ETA: Phase 6.
- [ ] Update Clerk migration docs to remove `AUTH_CLERK_ENABLED` references after hard cutover decision. Owner: Droid. ETA: Next doc sync.
- [ ] Resolve fee semantics mismatch: checkout charges `amount + fee` but `net_cents = amount - fee` and `raised_cents` aggregates `net_cents`. Owner: Droid. ETA: TBD.
- [ ] Fix Karri batch retry bug: `pending` result resets attempts counter (infinite retry risk). Owner: Droid. ETA: TBD.
- [ ] Fix seed/demo correctness: encrypt seeded Karri card numbers and align seeded webhook event types/payloads with runtime catalog. Owner: Droid. ETA: TBD.
