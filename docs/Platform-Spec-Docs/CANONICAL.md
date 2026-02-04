# ChipIn Canonical Spec (Source of Truth)

> **Version:** 1.1.1  
> **Last Updated:** January 21, 2026  
> **Status:** Authoritative

---

## Purpose

Resolve conflicts across docs. When anything disagrees, this file wins.

---

## Core Decisions

### Product Scope

- **Dream Board:** one manual gift goal (parent-written) with AI artwork.
- **Guest flow:** mobile-web; single CTA; no sign-in.
- **Host flow:** Clerk authentication; 4-step wizard + review/share.

### Gift and Payout Model

- **Single payout method:** Karri Card only.
- **No charity overflow:** extra funds remain part of the single Karri payout.
- **Payouts:** one payout per Dream Board (`karri_card`).

### Public vs Private Display

- **Public guest view:** percentage only (no exact amounts) while funding the gift.
- **Host view:** exact amounts, contributor details, payout totals.
- **Funded state:** guest view remains gift-focused (no charity switch).

### Payments

- **Phase 1 providers:** PayFast (primary), Ozow (EFT), SnapScan (QR).
- **PayFast ITN hardening required:** signature verification, source validation, amount check, PayFast validate call, idempotency.
- **Stitch:** parked until float/settlement/compliance clarified; revisit in Phase 2.

### Auth and Session Storage

- Clerk handles authentication and session state.
- No magic link tokens or session storage in Vercel KV.

### Package Manager

- **pnpm only**.

---

## Data Model Canonical Fields

### dream_boards (selected)

- `gift_name`, `gift_image_url`, `gift_image_prompt`
- `goal_cents` (gift target)
- `payout_method` = `karri_card`
- `karri_card_number`, `karri_card_holder_name`, `host_whatsapp_number`
- `party_date` (pot close date)
- `status` = `draft | active | funded | closed | paid_out | expired | cancelled`

### payouts

- One payout per Dream Board.
- `type` = `karri_card`

---

## Canonical Behavior

- **Funding phase:** gift progress until goal reached; contributions can continue until close.
- **Raised calculations:** `raised_cents` is net contributions; overfunding is allowed but not redirected.
- **Close conditions:** manual close or deadline; closing triggers a Karri payout.

---

## Documents Updated to Match

All docs in `docs/Platform-Spec-Docs/`, plus `README.md` and `AGENTS.md`.
