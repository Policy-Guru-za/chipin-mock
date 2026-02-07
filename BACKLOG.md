# Backlog

- [ ] Enforce NOT NULL on `dream_boards.gift_name` and `dream_boards.party_date` after create flow writes v2.0 fields (add follow-up migration). Owner: Droid. ETA: Phase 5.
- [ ] Rewrite `payout_type` and `payout_item_type` enums to remove deprecated values once legacy payout/overflow code is removed (align with spec Phase 2/6). Owner: Droid. ETA: Phase 6.
- [ ] Update Clerk migration docs to remove `AUTH_CLERK_ENABLED` references after hard cutover decision. Owner: Droid. ETA: Next doc sync.
- [ ] Resolve fee semantics mismatch: checkout charges `amount + fee` but `net_cents = amount - fee` and `raised_cents` aggregates `net_cents`. Owner: Droid. ETA: TBD.
- [ ] Fix Karri batch retry bug: `pending` result resets attempts counter (infinite retry risk). Owner: Droid. ETA: TBD.
- [ ] Fix seed/demo correctness: encrypt seeded Karri card numbers and align seeded webhook event types/payloads with runtime catalog. Owner: Droid. ETA: TBD.
- [ ] Fix Drizzle migration metadata collision (`0005_snapshot.json` / `0006_snapshot.json`) so `pnpm drizzle:generate` works again without manual SQL migration authoring. Owner: Droid. ETA: Next migration tooling pass.
- [ ] Tighten new UX v2 DB constraints after UI rollout: make `birthday_date`, `child_age`, and `campaign_end_date` required once create/edit flows persist them consistently. Owner: Droid. ETA: Post UX rollout.
- [ ] [B1][D-002] Align OpenAPI enums with locked values: `PayoutMethod` => `karri_card|bank`, `PayoutType` => `karri_card|bank|charity` (remove runtime-contract drift). Owner: Droid. ETA: Phase B1.
- [ ] [B2][D-006] Add explicit runtime toggles to block/allow bank+charity write-paths; default deny until B4 parity gates pass. Owner: Droid. ETA: Phase B2.
- [ ] [B5][D-007] Implement reminder dispatch worker with bounded retries and `sent_at` idempotent update semantics. Owner: Droid. ETA: Phase B5.
- [ ] [B6][D-004][D-005] Correct financial model: ensure `raised_cents` tracks gift contribution amount and funded transition uses lock semantics. Owner: Droid. ETA: Phase B6.
- [ ] [B3/B4][D-008] Implement charity payout plan generation, monthly batch flow, and per-charity reconciliation report output. Owner: Droid. ETA: Phase B3-B4.
- [ ] [C6][D-009] Remove remaining user-facing legacy `chipin` branding strings from API/meta/export surfaces. Owner: Droid. ETA: Phase C6.
- [ ] [C8][D-010] Add enforceable accessibility gate (WCAG 2.1 AA checks) to release verification pipeline. Owner: Droid. ETA: Phase C8.
