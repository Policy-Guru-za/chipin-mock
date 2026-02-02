# Karri Card Integration

> **Status:** Core (Sole Payout Method)  
> **Priority:** P0 (Required for MVP)  
> **Updated:** February 2026

---

## Strategic Context

Karri Card is the **sole payout method** for ChipIn v2.0. This simplifies the platform by removing fulfillment complexity.

**Why Karri Card only:**
1. We are in the **pooling business**, not the fulfillment business
2. Single, predictable payout flow
3. Parent controls how to use the funds
4. No need to manage product catalogs or gift card logistics
5. Regulatory simplicity (card-to-card transfer)

**What Karri provides:**
1. Flexible spending for any gift
2. Trusted SA fintech brand
3. Parental controls built in
4. Viral loop (guests discover Karri, become future hosts)

---

## Integration Model: Immediate Debit, Daily Batch Credit

ChipIn follows an **immediate debit, daily batch credit** model:

```
┌─────────────────────────────────────────────────────────────────┐
│                     Contribution Flow                           │
│                                                                 │
│   Guest ──► PayFast/Ozow/SnapScan ──► Contribution Record      │
│              (Immediate Debit)         (Status: completed)      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ (Pot closes on party date)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Karri Credit Queue                          │
│                                                                 │
│   Closed Pot ──► karri_credit_queue ──► Daily Batch Job        │
│                  (Status: pending)      (6 AM SAST)             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Karri Card Credit                           │
│                                                                 │
│   Batch Job ──► Karri API ──► Status: completed                │
│                              ──► WhatsApp confirmation          │
└─────────────────────────────────────────────────────────────────┘
```

**Key principle:** We never hold funds. Money flows through us, not to us.

---

## API Requirements

### What We Need from Karri

```typescript
interface KarriAPI {
  // Verify a Karri Card is valid
  verifyCard(cardNumber: string): Promise<CardVerification>;
  
  // Credit a Karri Card with pot funds
  creditCard(params: CreditParams): Promise<CreditResult>;
  
  // Check credit status (if async)
  getCreditStatus(transactionId: string): Promise<CreditStatus>;
}

interface CardVerification {
  valid: boolean;
  cardholderFirstName?: string;  // For display: "Credit to Maya's Karri Card"
  last4?: string;                // For confirmation messages
  errorCode?: string;            // If invalid
}

interface CreditParams {
  cardNumber: string;
  amountCents: number;
  reference: string;             // Idempotency key: "chipin-{dreamBoardId}-{timestamp}"
  description: string;           // "Maya's 7th Birthday Gift"
}

interface CreditResult {
  transactionId: string;
  status: 'completed' | 'pending' | 'failed';
  completedAt?: Date;
  errorMessage?: string;
}
```

---

## User Experience

### Host: Entering Karri Card Details

During Dream Board creation (Step 3: Details):

```
┌─────────────────────────────────────┐
│  Where should we send the funds?   │
│                                     │
│  Karri Card Number:                │
│  ┌─────────────────────────────────┐│
│  │ 5234 1234 5678 1234             ││
│  └─────────────────────────────────┘│
│                                     │
│  Cardholder Name:                  │
│  ┌─────────────────────────────────┐│
│  │ Maya Thompson                   ││
│  └─────────────────────────────────┘│
│                                     │
│  ✓ Card verified                   │
│                                     │
│  ℹ️ Funds will be credited to this │
│     card when the pot closes       │
│     (on party date)                │
│                                     │
└─────────────────────────────────────┘
```

### Host: Payout Confirmation

After pot closes and credit is processed:

```
WhatsApp:
✅ R2,400 has been credited to your Karri Card ending in 1234.

Thank you for using ChipIn! 🎁
```

---

## Batch Processing

### Queue Table: `karri_credit_queue`

```sql
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
```

### Daily Batch Job

Runs daily at 6 AM SAST:

```typescript
async function processDailyKarriBatch(): Promise<BatchResult> {
  const pending = await db
    .select()
    .from(karriCreditQueue)
    .where(eq(karriCreditQueue.status, 'pending'));

  const results = { processed: 0, succeeded: 0, failed: 0, errors: [] };

  for (const entry of pending) {
    results.processed++;
    
    await db
      .update(karriCreditQueue)
      .set({ status: 'processing', lastAttemptAt: new Date() })
      .where(eq(karriCreditQueue.id, entry.id));

    try {
      const result = await karri.creditCard({
        cardNumber: entry.karriCardNumber,
        amountCents: entry.amountCents,
        reference: entry.reference,
        description: `ChipIn Birthday Gift`,
      });

      if (result.status === 'completed') {
        await db
          .update(karriCreditQueue)
          .set({ status: 'completed', completedAt: new Date() })
          .where(eq(karriCreditQueue.id, entry.id));
        
        results.succeeded++;
        
        // Send WhatsApp confirmation
        await sendPayoutConfirmation(entry);
      }
    } catch (error) {
      const attempts = entry.attempts + 1;
      
      if (attempts >= 3) {
        await db
          .update(karriCreditQueue)
          .set({ status: 'failed', attempts, errorMessage: error.message })
          .where(eq(karriCreditQueue.id, entry.id));
        
        results.failed++;
        results.errors.push({ dreamBoardId: entry.dreamBoardId, error: error.message });
        
        // Alert admin
        await sendAdminAlert(entry, error);
      } else {
        await db
          .update(karriCreditQueue)
          .set({ status: 'pending', attempts, errorMessage: error.message })
          .where(eq(karriCreditQueue.id, entry.id));
      }
    }
  }

  return results;
}
```

### Idempotency

Each credit has a unique `reference` format: `chipin-{dreamBoardId}-{timestamp}`

Karri API must:
1. Accept the reference as an idempotency key
2. Reject duplicate references (return success for already-processed)
3. Return the original transaction result if retried

---

## Security Considerations

### Card Number Handling

| Concern | Approach |
|---------|----------|
| Transmission | HTTPS only |
| Storage | Encrypted at rest using `CARD_DATA_ENCRYPTION_KEY` |
| Display | Show only last 4 digits (`****1234`) |
| Validation | Luhn checksum validation before API call |

### Verification Flow

1. Host enters card number during Dream Board creation
2. Call `karri.verifyCard()` before allowing proceed
3. Store encrypted card number and cardholder name
4. Re-verify before processing payout (card may have been cancelled)

### Failure Handling

| Scenario | Handling |
|----------|----------|
| Card verification fails | Block Dream Board creation, show error |
| Credit fails (transient) | Retry in next batch (up to 3 attempts) |
| Credit fails (permanent) | Mark as failed, alert admin, email host |
| Card cancelled after creation | Alert host, request new card details |

---

## Environment Variables

```bash
# Karri Card API
KARRI_API_URL=""
KARRI_API_KEY=""

# Batch Processing
KARRI_BATCH_ENABLED="true"
KARRI_BATCH_SCHEDULE="0 6 * * *"  # 6 AM SAST daily

# Card Data Encryption
CARD_DATA_ENCRYPTION_KEY=""  # 32-byte key for AES-256
```

---

## Implementation Phases

### Phase 1: Manual (Current)

1. Host enters Karri Card number
2. On pot close, entry created in `karri_credit_queue`
3. Admin manually processes credits via Karri portal
4. Admin marks entries as completed
5. System sends WhatsApp confirmation

### Phase 2: API Integration (Target)

1. Automated card verification on entry
2. Daily batch job calls Karri API
3. Automated retry logic
4. WhatsApp + email notifications
5. Admin dashboard for monitoring

### Phase 3: Deep Integration (Future)

1. Real-time verification with cardholder name display
2. Instant credits (if Karri supports)
3. "Sign up for Karri" flow for non-cardholders
4. Analytics on Karri adoption

---

## Commercial Terms

| Item | Status |
|------|--------|
| Revenue share | To be negotiated |
| API access | Required for v2.0 |
| Branding | "Powered by Karri" acceptable |
| SLA | 99.9% uptime required |
| Support | Karri handles card-related support |

---

## Removed Features

The following Karri-related features from v1.0 have been removed:

| Feature | Reason |
|---------|--------|
| Karri as optional payout | Now sole payout method |
| Takealot gift card payout | Removed in simplification |
| Philanthropy donation payout | Removed in simplification |
| Guest Karri promotion | Deferred to post-MVP |
