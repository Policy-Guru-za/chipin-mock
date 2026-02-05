# Gifta Platform Simplification

**Implementation Specification for AI Coding Agent**

Version: 1.0 DRAFT  
Date: February 2026

> **Status note (2026-02-05):** historical implementation plan. Current runtime behavior is defined by `src/` and the canonical docs in `docs/Platform-Spec-Docs/` (start at `CANONICAL.md`). For an audited “as-built” view, see `docs/forensic-audit/REPORT.md`.

---

## EXECUTIVE DIRECTIVE

You are executing a strategic simplification of the Gifta platform. This is not a feature addition — it is a focused reduction of scope to sharpen product-market fit.

**Core repositioning:**

- Gifta is a social coordination tool for birthday gifting, not a commerce platform.
- We are in the pooling business, not the fulfillment business.
- Money flows from contributors to a Karri Card. We never hold funds.

**What this means technically:**

- Remove all Takealot product integration.
- Remove GivenGain philanthropy integration.
- Remove overflow charity logic.
- Karri Card becomes the sole payout method.
- Gift definition becomes manual: parent enters name + description, AI generates artwork.
- Immediate debit from contributor, daily batch credit to Karri Card.
- WhatsApp Business API for notifications, not just share links.

---

## ARCHITECTURE CHANGES SUMMARY

### Integrations: Before vs After

| Integration | Before | After |
|-------------|--------|-------|
| Takealot Product Scraping | Active | **REMOVE** |
| Takealot Gift Card API | Active | **REMOVE** |
| GivenGain Philanthropy | Active | **REMOVE** |
| Karri Card | Optional | **SOLE PAYOUT** |
| PayFast/Ozow/SnapScan | Active | Keep (inbound) |
| Resend Email | Active | Keep |
| WhatsApp Business API | Share links only | **Full notifications** |
| AI Image Generation | None | **NEW - Gift artwork** |

### Database Schema: Removals

The following fields/concepts are being deprecated:

- `giftType` enum: Remove `'takealot_product'` and `'philanthropy'` values.
- `giftData` JSONB: Simplify structure (remove product URLs, Takealot IDs).
- `payoutMethod` enum: Remove `'takealot_gift_card'` and `'philanthropy_donation'`.
- `payoutType` enum: Remove `'takealot_gift_card'` and `'philanthropy_donation'` values, keep only `'karri_card'`.
- `payoutItemType` enum: Remove `'overflow'` value (no charity overflow).
- `overflowGiftData`: Remove entirely.

The following fields are being **ADDED**:

- `giftName`: varchar(200) - Parent's description of the dream gift.
- `giftImageUrl`: text - URL to AI-generated artwork (stored in Vercel Blob).
- `giftImagePrompt`: text - The prompt used to generate the artwork (for regeneration).
- `karriCardNumber`: varchar(20) - Required for all Dream Boards.
- `karriCardHolderName`: varchar(100) - Cardholder name for verification.
- `hostWhatsAppNumber`: varchar(20) - For notifications.
- `partyDate`: date - The birthday party date (also serves as pot close date).

---

## FILES TO DELETE

Remove these files entirely. They represent integrations and features we are deprecating.

### Takealot Integration (DELETE)

```
src/lib/integrations/takealot.ts
src/lib/integrations/takealot-gift-cards.ts
src/app/api/internal/products/fetch/route.ts
src/app/api/internal/products/search/route.ts
src/app/api/internal/products/takealot/route.ts
src/app/api/internal/products/takealot/search/route.ts
tests/unit/takealot-parse.test.ts
docs/Platform-Spec-Docs/TAKEALOT.md
```

### GivenGain / Philanthropy (DELETE)

```
src/lib/integrations/givengain.ts
src/lib/dream-boards/causes.ts
src/lib/dream-boards/overflow.ts
tests/unit/dream-board-overflow.test.ts
docs/Platform-Spec-Docs/PHILANTHROPY.md
```

### Forms Referencing Takealot (DELETE)

```
src/components/forms/TakealotGiftForm.tsx
```

### Payout Integration Tests (DELETE - will rewrite)

```
tests/unit/payout-integrations.test.ts
```

---

## FILES TO MODIFY

These files require changes to remove deprecated features and add new functionality.

### Database Schema

**File:** `src/lib/db/schema.ts`

Changes required:

- Remove `'takealot_product'` and `'philanthropy'` from `giftTypeEnum`.
- Replace `giftTypeEnum` with a single value or remove enum entirely.
- Remove `'takealot_gift_card'` and `'philanthropy_donation'` from `payoutMethodEnum`.
- Replace `payoutMethodEnum` with single `'karri_card'` value.
- Add new columns: `giftName`, `giftImageUrl`, `giftImagePrompt`, `karriCardNumber`, `karriCardHolderName`, `hostWhatsAppNumber`, `partyDate`.
- Remove `overflowGiftData` column.
- Mark `giftData` as deprecated (keep for migration, remove later).

### Dream Board Validation

**Files:**
- `src/lib/dream-boards/schema.ts`
- `src/lib/dream-boards/validation.ts`

Changes required:

- Remove Takealot URL validation.
- Remove philanthropy-specific validation.
- Add validation for: `giftName` (required, 2-200 chars), `karriCardNumber` (required, valid format), `hostWhatsAppNumber` (required, valid SA mobile).
- Add `partyDate` validation (must be future date, max 6 months out).

### Dream Board View Model

**Files:**
- `src/lib/dream-boards/view-model.ts`
- `src/lib/dream-boards/gift-info.ts`

Changes required:

- Remove gift type switching logic (no more product vs philanthropy).
- Simplify to single gift model: name + image + target amount.
- Remove overflow charity display logic.

### Payout Service

**Files:**
- `src/lib/payouts/service.ts`
- `src/lib/payouts/automation.ts`
- `src/lib/payouts/calculation.ts`

Changes required:

- Remove Takealot gift card payout logic.
- Remove GivenGain donation logic.
- Implement Karri Card as sole payout method.
- Implement daily batch processing for Karri Card credits.

### Create Flow Pages

**Files:**
- `src/app/(host)/create/gift/page.tsx`
- `src/app/(host)/create/details/page.tsx`
- `src/app/(host)/create/review/page.tsx`

Changes required:

- Remove Takealot URL input and product preview.
- Add gift name input field.
- Add gift description textarea (for AI image generation prompt).
- Add 'Generate Artwork' button that calls AI image API.
- Add Karri Card input fields (card number, holder name).
- Add WhatsApp number input.
- Add party date picker.

### Guest View Pages

**Files:**
- `src/app/(guest)/[slug]/page.tsx`
- `src/app/(guest)/[slug]/contribute/page.tsx`

Changes required:

- Remove product-specific display logic.
- Display AI-generated gift artwork instead of product image.
- Show percentage funded + totals raised vs goal (no individual contribution amounts).
- Show suggested contribution amounts: R50 | R100 | R200 | Other.

### Host Dashboard

**File:** `src/app/(host)/dashboard/[id]/page.tsx`

Changes required:

- Show Rand amount raised (host-only view).
- Show percentage progress.
- Remove Takealot purchase trigger.
- Add 'Complete & Credit Karri Card' action when pot closes.

---

## NEW FILES TO CREATE

### AI Image Generation Service

**File:** `src/lib/integrations/image-generation.ts`

**Purpose:** Generate stylized, non-photorealistic artwork for gift descriptions.

**Implementation requirements:**

- Use environment variable: `GEMINI_API_KEY`
- Optional environment variable: `GEMINI_IMAGE_MODEL` (defaults to `gemini-2.5-flash-image`)
- Function: `generateGiftArtwork(giftDescription: string): Promise<{ imageUrl: string, prompt: string }>`
- Prompt engineering: Prepend style directive to ensure non-photorealistic output.
- Upload generated image to Vercel Blob.
- Return Blob URL for storage in database.
- Implement retry logic with exponential backoff.
- Implement cost tracking (log tokens/credits used).

**Style directive for prompts:**

```typescript
const STYLE_DIRECTIVE = `Create a whimsical, playful illustration in a
watercolor and hand-drawn style. The image should feel warm, celebratory,
and child-friendly. DO NOT create photorealistic images. Use soft colors
and gentle shapes. The subject is: `;

const fullPrompt = STYLE_DIRECTIVE + userGiftDescription;
```

### WhatsApp Business API Integration

**File:** `src/lib/integrations/whatsapp.ts`

**Purpose:** Send transactional notifications via WhatsApp Business API.

**Environment variables:**

- `WHATSAPP_BUSINESS_API_URL`
- `WHATSAPP_BUSINESS_API_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`

**Functions to implement:**

- `sendDreamBoardLink(phoneNumber: string, dreamBoardUrl: string, childName: string): Promise<void>`
- `sendContributionNotification(phoneNumber: string, contributorName: string, childName: string): Promise<void>`
- `sendFundingCompleteNotification(phoneNumber: string, childName: string, totalRaised: number): Promise<void>`
- `sendPayoutConfirmation(phoneNumber: string, childName: string, amountCredited: number): Promise<void>`

Message templates must be pre-approved in WhatsApp Business Manager.

### Karri Card Service (Enhanced)

**File:** `src/lib/integrations/karri-batch.ts`

**Purpose:** Batch processing for Karri Card credits.

**Implementation requirements:**

- Function: `queueKarriCredit(karriCardNumber: string, amountCents: number, reference: string): Promise<void>`
- Function: `processDailyKarriBatch(): Promise<BatchResult>`
- Store pending credits in database table: `karri_credit_queue`.
- Daily batch job processes all pending credits.
- Idempotency: use unique reference per Dream Board payout.
- Failure handling: retry failed credits in next batch, alert after 3 failures.

### Gift Artwork Component

**File:** `src/components/gift/GiftArtworkGenerator.tsx`

**Purpose:** Client component for generating and previewing gift artwork during create flow.

**Component requirements:**

- Input: Gift description textarea.
- Button: 'Generate Artwork' (calls `/api/internal/generate-artwork`).
- Display: Loading state with playful animation.
- Display: Generated artwork preview.
- Button: 'Regenerate' (allows retry with same or modified description).
- Stores: `imageUrl` and `prompt` in form state for submission.

### Artwork Generation API Route

**File:** `src/app/api/internal/artwork/generate/route.ts`

**Purpose:** Server-side endpoint for AI image generation.

**Implementation requirements:**

- POST endpoint, requires authentication (host session).
- Rate limit: 5 generations per session per hour.
- Input validation: description must be 10-500 characters.
- Returns: `{ imageUrl: string, prompt: string }`
- Error handling: return friendly error for rate limit, API failure.

---

## DATABASE MIGRATION

Create a new migration file:

**File:** `drizzle/migrations/0008_chipin_simplification.sql`

### Migration Script

```sql
-- Add new columns
ALTER TABLE dream_boards ADD COLUMN gift_name VARCHAR(200);
ALTER TABLE dream_boards ADD COLUMN gift_image_url TEXT;
ALTER TABLE dream_boards ADD COLUMN gift_image_prompt TEXT;
ALTER TABLE dream_boards ADD COLUMN karri_card_number VARCHAR(20);
ALTER TABLE dream_boards ADD COLUMN karri_card_holder_name VARCHAR(100);
ALTER TABLE dream_boards ADD COLUMN host_whatsapp_number VARCHAR(20);
ALTER TABLE dream_boards ADD COLUMN party_date DATE;

-- Migrate existing data (if any Dream Boards exist)
UPDATE dream_boards
SET gift_name = COALESCE(
  gift_data->>'productName',
  gift_data->>'causeName',
  'Birthday Gift'
),
party_date = COALESCE(birthday_date, deadline::date);

-- Make required columns NOT NULL after migration
ALTER TABLE dream_boards ALTER COLUMN gift_name SET NOT NULL;
ALTER TABLE dream_boards ALTER COLUMN party_date SET NOT NULL;

-- Update enums (requires dropping and recreating)
-- Note: This requires careful handling of existing data
ALTER TYPE payout_method RENAME TO payout_method_old;
CREATE TYPE payout_method AS ENUM ('karri_card');
ALTER TABLE dream_boards ALTER COLUMN payout_method TYPE payout_method
  USING 'karri_card'::payout_method;
DROP TYPE payout_method_old;

-- Update payout_type enum (used in payouts table)
ALTER TYPE payout_type RENAME TO payout_type_old;
CREATE TYPE payout_type AS ENUM ('karri_card');
ALTER TABLE payouts ALTER COLUMN type TYPE payout_type
  USING 'karri_card'::payout_type;
DROP TYPE payout_type_old;

-- Update payout_item_type enum (remove 'overflow')
ALTER TYPE payout_item_type RENAME TO payout_item_type_old;
CREATE TYPE payout_item_type AS ENUM ('gift');
ALTER TABLE payout_items ALTER COLUMN type TYPE payout_item_type
  USING 'gift'::payout_item_type;
DROP TYPE payout_item_type_old;

-- Create Karri credit queue table
CREATE TABLE karri_credit_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dream_board_id UUID NOT NULL REFERENCES dream_boards(id),
  karri_card_number VARCHAR(20) NOT NULL,
  amount_cents INTEGER NOT NULL,
  reference VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  attempts INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_karri_queue_status ON karri_credit_queue(status);
CREATE INDEX idx_karri_queue_created ON karri_credit_queue(created_at);
```

---

## ENVIRONMENT VARIABLES

### Variables to REMOVE from .env.example

```bash
# REMOVE - Takealot
TAKEALOT_GIFTCARD_AUTOMATION_ENABLED
TAKEALOT_GIFTCARD_API_URL
TAKEALOT_GIFTCARD_API_KEY

# REMOVE - GivenGain
GIVENGAIN_AUTOMATION_ENABLED
GIVENGAIN_API_URL
GIVENGAIN_API_KEY
```

### Variables to ADD to .env.example

```bash
# AI Image Generation
GEMINI_API_KEY=""
GEMINI_IMAGE_MODEL="gemini-2.5-flash-image"

# WhatsApp Business API
WHATSAPP_BUSINESS_API_URL=""
WHATSAPP_BUSINESS_API_TOKEN=""
WHATSAPP_PHONE_NUMBER_ID=""

# Karri Card (enhanced)
KARRI_BATCH_ENABLED="true"
KARRI_BASE_URL=""
KARRI_API_KEY=""

# Internal jobs (external scheduler required)
INTERNAL_JOB_SECRET=""

# Sandbox flags
MOCK_PAYMENTS="false"
MOCK_PAYMENT_WEBHOOKS="false"
MOCK_KARRI="false"
MOCK_SENTRY="false"
```

---

## IMPLEMENTATION PHASES

Execute these phases in order. Each phase must pass lint, typecheck, and tests before proceeding.

### Phase 1: Database Schema Update

1. Create migration file: `drizzle/migrations/0008_chipin_simplification.sql`
2. Update `src/lib/db/schema.ts` with new columns and modified enums.
3. Also modify `payoutTypeEnum` and `payoutItemTypeEnum` to remove deprecated values.
4. Run `drizzle:generate` to verify migration.
5. Update `src/lib/db/seed.ts` to use new schema.
6. Run lint, typecheck. Fix any errors.

**Gate:** `pnpm lint && pnpm typecheck` must pass.

### Phase 2: Remove Deprecated Integrations

1. Delete files listed in FILES TO DELETE section.
2. Remove imports of deleted files throughout codebase.
3. Clean up `src/components/forms/index.ts` to remove TakealotGiftForm export.
4. Remove references to deleted functionality in AGENTS.md, docs/.
5. Update `src/lib/health/checks.ts` to remove Takealot/GivenGain checks.
6. Run lint, typecheck. Fix any errors.

**Gate:** `pnpm lint && pnpm typecheck` must pass.

### Phase 3: Implement AI Image Generation

1. Create `src/lib/integrations/image-generation.ts`.
2. Create `src/app/api/internal/artwork/generate/route.ts`.
3. Create `src/components/gift/GiftArtworkGenerator.tsx`.
4. Write unit tests for image generation service.
5. Run lint, typecheck, tests. Fix any errors.

**Gate:** `pnpm lint && pnpm typecheck && pnpm test` must pass.

### Phase 4: Implement WhatsApp Business API

1. Create `src/lib/integrations/whatsapp.ts`.
2. Create WhatsApp message template definitions.
3. Integrate WhatsApp notifications into contribution flow.
4. Integrate WhatsApp notifications into payout flow.
5. Write unit tests for WhatsApp service.
6. Run lint, typecheck, tests. Fix any errors.

**Gate:** `pnpm lint && pnpm typecheck && pnpm test` must pass.

### Phase 5: Refactor Create Flow

1. Update `src/lib/dream-boards/schema.ts` with new validation.
2. Update `src/lib/dream-boards/draft.ts` to handle new fields (giftName, giftImageUrl, giftImagePrompt, karriCardNumber, karriCardHolderName, hostWhatsAppNumber, partyDate).
3. Update `src/app/(host)/create/gift/page.tsx` - replace Takealot with gift name + artwork generator.
4. Update `src/app/(host)/create/details/page.tsx` - add Karri Card fields, WhatsApp field.
5. Update `src/app/(host)/create/review/page.tsx` - show new fields.
6. Update view models and form handlers.
7. Run lint, typecheck, tests. Fix any errors.

**Gate:** `pnpm lint && pnpm typecheck && pnpm test` must pass.

### Phase 6: Refactor Guest and Payout Flows

1. Update `src/app/(guest)/[slug]/page.tsx` - show AI artwork, percentage only.
2. Update `src/app/(guest)/[slug]/contribute/page.tsx` - suggested amounts, simplified UX.
3. Refactor `src/lib/payouts/service.ts` - Karri Card only.
4. Create `src/lib/integrations/karri-batch.ts` for daily batch processing.
5. Create `/api/internal/karri/batch` route for scheduled job.
6. Update host dashboard to show Rand amounts (host only) and new payout flow.
7. Run full test suite.

**Gate:** `pnpm lint && pnpm typecheck && pnpm test` must pass.

---

## UX SPECIFICATIONS

### Contribution Amount Display Rules

| Context | Show % | Show Rands |
|---------|--------|------------|
| Guest view (public) | ✅ YES | ❌ NO |
| Host dashboard | ✅ YES | ✅ YES |
| Contributor list (public) | Names only | ❌ NO |
| WhatsApp notification to host | ✅ YES | ✅ YES |

### Suggested Contribution Amounts

Display these preset amounts with an 'Other' option for custom entry:

- **R50** — Minimum suggested
- **R100** — Default/highlighted
- **R200** — Premium option
- **Other** — Opens custom amount input

Minimum contribution: R20 (enforced in validation).  
Maximum contribution: R5,000 (enforced in validation).

### Mobile-First, Desktop-Allowed

Design principles:

- All layouts mobile-first (375px base width).
- Desktop users see the same layout, slightly wider.
- Do NOT block or redirect desktop users.
- Do NOT create separate desktop layouts.
- Touch targets: minimum 44x44px.
- Form inputs: full width on mobile.

### Contributor Flow: One Screen

The contributor experience must fit on a single screen (no scrolling on standard mobile):

```
┌─────────────────────────────────────┐
│  [Child Photo]                      │
│                                     │
│  Help make Maya's dream come true   │
│                                     │
│  ████████████░░░░░░░  67% funded    │
│                                     │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌───────┐  │
│  │ R50 │ │R100 │ │R200 │ │ Other │  │
│  └─────┘ └─────┘ └─────┘ └───────┘  │
│                                     │
│  Your name: ___________________     │
│                                     │
│  ┌─────────────────────────────┐    │
│  │     Chip In Now             │    │
│  └─────────────────────────────┘    │
│                                     │
│  Claire M., John D., Sarah K.      │
│  and 4 others have contributed      │
└─────────────────────────────────────┘
```

---

## PAYOUT FLOW: IMMEDIATE DEBIT, DAILY BATCH CREDIT

### Contribution Processing

When a guest contributes:

1. Guest selects amount and clicks 'Chip In Now'.
2. Redirect to PayFast/Ozow/SnapScan for payment.
3. Payment provider debits guest immediately.
4. Webhook confirms payment success.
5. Contribution record created with status `'completed'`.
6. Dream Board progress updated.
7. WhatsApp notification sent to host (if opted in).

**Key principle:** Money leaves contributor immediately. No 'pending' state visible to contributor.

### Pot Close Logic

A Dream Board closes when:

- Party date is reached (automatic), OR
- Host manually closes the pot (early), OR
- Funding target is reached AND host confirms close.

On pot close:

1. Calculate total raised (sum of completed contributions minus fees).
2. Create entry in `karri_credit_queue`.
3. Update Dream Board status to `'closed'`.
4. Send WhatsApp notification to host: "Your pot has closed! R{amount} will be credited to Karri Card ending in {last4}."

### Daily Batch Processing

Scheduled job runs daily at 6 AM SAST:

1. Query `karri_credit_queue` WHERE status = `'pending'`.
2. For each pending credit, call Karri Card API.
3. On success: update status to `'completed'`, set `completed_at`.
4. On failure: increment `attempts`, set `error_message`.
5. If attempts >= 3: update status to `'failed'`, send alert email.
6. Send WhatsApp confirmation to host on successful credit.

**Key principle:** We never hold funds. Money flows through us, not to us.

---

## TESTING REQUIREMENTS

### Unit Tests to Write

- `src/lib/integrations/image-generation.ts`: Mock API, test prompt construction, error handling.
- `src/lib/integrations/whatsapp.ts`: Mock API, test message formatting, error handling.
- `src/lib/integrations/karri-batch.ts`: Test queue operations, batch processing, retry logic.
- `src/lib/dream-boards/schema.ts`: Test new validation rules.
- `src/lib/payouts/service.ts`: Test Karri-only payout flow.

### Integration Tests to Update

- `tests/integration/api-dream-boards*.test.ts`: Update for new schema.
- `tests/integration/api-payouts.test.ts`: Update for Karri-only flow.
- `tests/integration/payout-actions.test.ts`: Update for Karri-only flow.

### Tests to Delete

- Any test referencing Takealot product fetching.
- Any test referencing GivenGain donations.
- Any test referencing philanthropy overflow.

---

## DOCUMENTATION UPDATES

### Files to Update

**File:** `AGENTS.md`

Update to reflect simplified architecture:

- Remove Takealot from tech stack and integration list.
- Remove GivenGain / philanthropy references.
- Add AI image generation to tech stack.
- Add WhatsApp Business API to tech stack.
- Update Dream Board creation flow description.
- Update payout method description (Karri Card only).

**File:** `docs/Platform-Spec-Docs/SPEC.md`

Update product specification to reflect:

- Single gift per Dream Board (not product from catalog).
- AI-generated artwork.
- Karri Card as sole payout.
- WhatsApp-first notifications.

**File:** `docs/Platform-Spec-Docs/INTEGRATIONS.md`

Rewrite to cover:

- AI Image Generation (new).
- WhatsApp Business API (new).
- Karri Card (enhanced with batch processing).
- PayFast/Ozow/SnapScan (unchanged).
- Resend email (unchanged).

**File:** `docs/Platform-Spec-Docs/PAYMENTS.md`

Update to clarify:

- Immediate debit model.
- Daily batch credit to Karri Card.
- No fund holding.

**File:** `README.md`

Update quick start and feature list.

---

## VALIDATION CHECKLIST

Before declaring this implementation complete, verify:

### Functional Requirements

- [ ] Host can create Dream Board with manual gift name and AI-generated artwork.
- [ ] Host must provide Karri Card details during creation.
- [ ] Host must provide WhatsApp number during creation.
- [ ] Guest can view Dream Board and see percentage funded + totals raised vs goal.
- [ ] Guest can contribute using suggested amounts or custom amount.
- [ ] Guest contribution is debited immediately via payment provider.
- [ ] Host receives WhatsApp notification on new contribution.
- [ ] Host dashboard shows Rand amount raised.
- [ ] Pot closes on party date or when host manually closes.
- [ ] Closed pot creates Karri credit queue entry.
- [ ] Daily batch job processes Karri credits.
- [ ] Host receives WhatsApp notification on successful Karri credit.

### Non-Functional Requirements

- [ ] `pnpm lint` passes with no errors.
- [ ] `pnpm typecheck` passes with no errors.
- [ ] `pnpm test` passes with no failures.
- [ ] No references to Takealot in codebase (except historical migrations).
- [ ] No references to GivenGain/philanthropy in codebase.
- [ ] All new environment variables documented in `.env.example`.
- [ ] AGENTS.md updated with new architecture.
- [ ] Database migration tested locally.

---

## APPENDIX: PARKED FEATURES

The following features have been explicitly scoped out of this implementation. Do not implement them.

### Retailer Commission Deals

**Concept:** Tag Karri Card usage and receive commission from retailers when the card is used to purchase the gift.

**Status:** PARKED. Requires partnership agreements and technical integration with Karri that is out of scope.

### Multiple Gifts per Dream Board

**Concept:** Allow parents to add multiple gift options for contributors to choose from.

**Status:** PARKED. Intentionally keeping one gift per Dream Board for simplicity and focus.

### Contributor Reminders

**Concept:** Send WhatsApp reminders to contributors who clicked the link but didn't complete payment.

**Status:** PARKED. Requires storing contributor contact info before payment, raises privacy concerns.

### Desktop-Optimized Layouts

**Concept:** Create separate, optimized layouts for desktop users.

**Status:** PARKED. Mobile-first approach serves all users. Desktop not blocked, just not prioritized.

---

## END OF SPECIFICATION

Execute this specification phase by phase. Do not skip phases. Each phase must pass its gate before proceeding to the next.

If you encounter ambiguity or blockers, document them in BACKLOG.md and proceed with the clearest interpretation.

**Goal: Enterprise-grade implementation with zero compromises on code quality.**
