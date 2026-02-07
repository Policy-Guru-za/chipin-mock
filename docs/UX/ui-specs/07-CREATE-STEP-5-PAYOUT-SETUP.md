# CREATE FLOW STEP 5: PAYOUT SETUP
## Gifta UX v2 Implementation Specification

**Document Version:** 1.0
**Route:** `/create/payout`
**Step Number:** 5 of 6
**Status:** Implementation-Ready

---

## 1. SCREEN OVERVIEW

### Purpose
Step 5 configures where collected funds will be sent after the Dreamboard closes. This critical step captures payout method (Karri card or bank transfer), payment details, and contact information. Clear UI hierarchy emphasizes the recommended Karri Card option while supporting bank transfers as fallback.

### Route & File Structure
```
Route: /create/payout (GET, POST via server action)
Files:
  ├── src/app/(host)/create/payout/page.tsx (Main page)
  ├── src/app/(host)/create/payout/layout.tsx (Optional)
  ├── src/components/payout/PayoutMethodSelector.tsx (Method cards)
  ├── src/components/payout/KarriFields.tsx (Karri form)
  ├── src/components/payout/BankFields.tsx (Bank form)
  └── lib/integrations/payout-provider.ts (Validation)
```

### Layout Container
- **Component:** `CreateFlowShell`
- **Props:**
  - `stepLabel: "Step 5 of 6"`
  - `title: "Where should we send the funds? 💳"`
  - `subtitle: "Set up your payout method."`
- **Wrapper:** Full-width max-w-5xl, px-6 py-12
- **Background:** #FEFDFB

### User Flow
1. User lands on `/create/payout` (redirects if charity step not completed)
2. Load existing payout draft if present
3. Show intro copy with explanation
4. Display two payout method cards:
   - Karri Card (RECOMMENDED ⭐, with badge)
   - Bank Transfer
5. User selects one method
6. Fields appear for selected method:
   - **Karri:** Card number, expiry, CVV (or just confirmation)
   - **Bank:** Bank name (dropdown), Account number, Branch code, Holder name
7. Capture common fields: Payout email, WhatsApp number (SA format)
8. Click "Continue to review"
9. Server validates payout details
10. Save to draft and redirect to `/create/review`

---

## 2. PROGRESS INDICATOR

### Step Indicator Component
- **Type:** `WizardStepIndicatorCompact` on mobile
- **Type:** `WizardStepIndicator` on desktop
- **Current Step:** 5 (filled circle with "5")
- **Previous Steps:** 1, 2, 3, 4 (checkmarks ✓)
- **Upcoming Step:** 6 (hollow circle)

### Compact Variant (Mobile)
```
Step 5 of 6                Payout Setup
[███████████████░░░░░░░░░] 83.3%
```

### Full Variant (Desktop)
```
✓ ─ ✓ ─ ✓ ─ ✓ ─ ● ─ ○
The Child Gift Dates Giving Back Payout Review
```

---

## 3. VISUAL LAYOUT

### Mobile Layout (< 768px)
```
┌─────────────────────────────────────────────┐
│ STEP 5 OF 6                                 │
│ Where should we send the funds? 💳         │
│ Set up your payout method.                  │
│                                             │
│ [███████████████░░░░░░░░░░░░░░░] 83.3%    │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ [Error banner if validation failed]   │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ Once the Dreamboard closes, we'll    │  │
│ │ send the collected funds your way so  │  │
│ │ you can buy Sophie's gift.            │  │
│ │                                       │  │
│ │ Select your payout method:            │  │
│ │                                       │  │
│ │ ┌─────────────────────────────────┐  │  │
│ │ │ ⭐ RECOMMENDED                 │  │  │
│ │ │ Karri Card                      │  │  │
│ │ │ Instant payouts, no fees        │  │  │
│ │ │ [Selected] ✓                    │  │  │
│ │ └─────────────────────────────────┘  │  │
│ │                                       │  │
│ │ ┌─────────────────────────────────┐  │  │
│ │ │ Bank Transfer                   │  │  │
│ │ │ 1-3 business days, standard EFT │  │  │
│ │ └─────────────────────────────────┘  │  │
│ │                                       │  │
│ │ Karri Card Details                   │  │
│ │ Card number                          │  │
│ │ [1234 5678 9012 3456      ]         │  │
│ │ Expiry & CVV                         │  │
│ │ [MM/YY]  [CVV]                       │  │
│ │                                       │  │
│ │ Contact Information                  │  │
│ │ Payout email                         │  │
│ │ [parent@example.com       ]          │  │
│ │                                       │  │
│ │ WhatsApp number                      │  │
│ │ [+27 82 123 4567         ]           │  │
│ │ South Africa (SA) format required    │  │
│ │                                       │  │
│ │ [Continue to review       ] (full w)  │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ ← Back                                      │
└─────────────────────────────────────────────┘
```

### Desktop Layout (>= 1024px)
```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 5 OF 6                                                      │
│ Where should we send the funds? 💳                              │
│ Set up your payout method.                                      │
│                                                                  │
│ ✓ ─ ✓ ─ ✓ ─ ✓ ─ ● ─ ○                                          │
│ The Child Gift Dates Giving Back Payout Review                 │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ [Error banner if validation failed]                          ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Once the Dreamboard closes, we'll send the collected funds  ││
│ │ your way so you can buy Sophie's gift.                       ││
│ │                                                              ││
│ │ Select your payout method:                                  ││
│ │                                                              ││
│ │ ┌──────────────────────────┐  ┌──────────────────────────┐  ││
│ │ │ ⭐ RECOMMENDED           │  │ Bank Transfer            │  ││
│ │ │ Karri Card               │  │ 1-3 business days,       │  ││
│ │ │ Instant payouts, no fees │  │ standard EFT             │  ││
│ │ │ [SELECTED] ✓             │  │                          │  ││
│ │ └──────────────────────────┘  └──────────────────────────┘  ││
│ │                                                              ││
│ │ ┌──────────────────────────────────────────────────────────┐ ││
│ │ │ Karri Card Details                                       │ ││
│ │ │ Card number                                              │ ││
│ │ │ [1234 5678 9012 3456                       ]             │ ││
│ │ │                                                          │ ││
│ │ │ ┌────────────────────┐  ┌────────────────────────────┐  │ ││
│ │ │ │ Expiry (MM/YY)     │  │ CVV (3 digits)            │  │ ││
│ │ │ │ [12/25]            │  │ [123]                     │  │ ││
│ │ │ └────────────────────┘  └────────────────────────────┘  │ ││
│ │ └──────────────────────────────────────────────────────────┘ ││
│ │                                                              ││
│ │ ┌──────────────────────────────────────────────────────────┐ ││
│ │ │ Contact Information                                      │ ││
│ │ │                                                          │ ││
│ │ │ Payout email                    WhatsApp number         │ ││
│ │ │ [parent@example.com      ]      [+27 82 123 4567]      │ ││
│ │ │ We'll send confirmations       South Africa format      │ ││
│ │ │                                                          │ ││
│ │ └──────────────────────────────────────────────────────────┘ ││
│ │                                                              ││
│ │ [Continue to review                                  ]      ││
│ └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. FIELD SPECIFICATIONS

### Field 1: Payout Method Selection

**Label:** "Select your payout method:"
**Input Type:** Radio buttons (styled as selectable cards)
**HTML Name Attribute:** `payoutMethod`
**Options:**
  1. "karri_card" (recommended, default)
  2. "bank_transfer"
**Default Value:** "karri_card"
**Required:** Yes

**Option 1: Karri Card (Recommended)**
```
Card Container (selected state):
  ┌──────────────────────────────┐
  │ ⭐ RECOMMENDED               │
  │ Karri Card                   │
  │ Instant payouts, no fees     │
  │ [SELECTED] ✓                 │
  └──────────────────────────────┘

Styling:
  Unselected:
    rounded-2xl border border-border bg-white
    p-4 cursor-pointer hover:border-primary hover:shadow-soft
    transition-all duration-200

  Selected:
    rounded-2xl border-2 border-primary bg-primary/5
    p-4 shadow-soft ring-4 ring-primary/10

Recommended Badge:
  Position: top-left
  Background: primary
  Text: "⭐ RECOMMENDED"
  Size: text-xs font-semibold
  Color: white
  Padding: px-2 py-1 rounded-full

Checkmark:
  Position: top-right
  Icon: ✓
  Color: primary
  Size: 20x20px
```

**Option 2: Bank Transfer**
```
Card Container (unselected):
  ┌──────────────────────────────┐
  │ Bank Transfer                │
  │ 1-3 business days,           │
  │ standard EFT                 │
  └──────────────────────────────┘

Styling: Same as unselected Karri (no recommended badge)
```

**Validation:**
```typescript
payoutMethod: z.enum(['karri_card', 'bank_transfer'])
```

**Accessibility:**
- Each card is a radio button input (hidden, styled as card)
- `<input type="radio" name="payoutMethod" value="karri_card" />`
- Card has `role="radio"` aria attributes
- `aria-label="Select Karri Card for instant payouts"`
- Large click area (entire card)
- Keyboard: Tab through options, Space/Enter to select

---

### Field 2: Karri Card Fields (Conditional)

**Visibility:** Only shown if payoutMethod = "karri_card"
**Animation:** Fade in / out (300ms)

#### Field 2a: Card Number

**Label:** "Card number"
**Input Type:** Text with formatting (`<input type="text">`)
**HTML Name Attribute:** `karriCardNumber`
**Placeholder:** `"1234 5678 9012 3456"`
**Format:** 16 digits, displayed as "XXXX XXXX XXXX XXXX"
**Required:** Yes (if Karri selected)
**Mask:** Auto-format spaces after every 4 digits

**Validation Rules (Zod):**
```typescript
karriCardNumber: z
  .string()
  .refine(
    (val) => /^\d{16}$/.test(val.replace(/\s/g, '')),
    'Card number must be 16 digits'
  )
  .refine(
    (val) => luhnCheck(val.replace(/\s/g, '')),
    'Card number is invalid (Luhn check failed)'
  )
```

**Error Messages:**
- Required: "Card number is required"
- Invalid length: "Card number must be 16 digits"
- Invalid format: "Card number is invalid"
- Luhn check: "Card number failed validation"

**Accessibility:**
- `<label htmlFor="karriCardNumber">`
- `aria-required="true"`
- Screen reader: "Edit card number, 16 digits required, spaces auto-formatted"

---

#### Field 2b: Expiry Date

**Label:** "Expiry (MM/YY)"
**Input Type:** Text with masking (`<input type="text">`)
**HTML Name Attribute:** `karriExpiry`
**Placeholder:** `"MM/YY"` or `"12/25"`
**Format:** MM/YY (2 digits, forward slash, 2 digits)
**Required:** Yes (if Karri selected)
**Mask:** Auto-format as MM/YY

**Validation Rules (Zod):**
```typescript
karriExpiry: z
  .string()
  .refine(
    (val) => /^\d{2}\/\d{2}$/.test(val),
    'Expiry must be MM/YY format'
  )
  .refine(
    (val) => {
      const [month, year] = val.split('/');
      const expiry = new Date(2000 + parseInt(year), parseInt(month) - 1);
      return expiry > new Date();
    },
    'Card has expired'
  )
```

**Error Messages:**
- Required: "Expiry date is required"
- Invalid format: "Expiry must be MM/YY (e.g., 12/25)"
- Card expired: "Card has expired"

**Responsive Sizing:**
- Mobile: Full width or 40% (smaller input)
- Desktop: Auto width, ~100px

**Accessibility:**
- `<label htmlFor="karriExpiry">`
- `aria-required="true"`
- Screen reader: "Edit expiry date, MM/YY format required"

---

#### Field 2c: CVV

**Label:** "CVV (3 digits)"
**Input Type:** Text with masking (`<input type="text">`)
**HTML Name Attribute:** `karriCvv`
**Placeholder:** `"123"`
**Format:** 3 or 4 digits (depends on card type)
**Required:** Yes (if Karri selected)
**Max Length:** 4
**Attribute:** `inputMode="numeric"` on mobile

**Validation Rules (Zod):**
```typescript
karriCvv: z
  .string()
  .refine(
    (val) => /^\d{3,4}$/.test(val),
    'CVV must be 3 or 4 digits'
  )
```

**Error Messages:**
- Required: "CVV is required"
- Invalid: "CVV must be 3 or 4 digits"

**Security Considerations:**
- Never log or store CVV
- Client-side validation only (don't send to backend)
- Use Stripe or similar for card tokenization
- Clear on blur (optional security measure)

**Accessibility:**
- `<label htmlFor="karriCvv">`
- `aria-required="true"`
- Screen reader: "Edit CVV, 3 or 4 digits required"

---

### Field 3: Bank Transfer Fields (Conditional)

**Visibility:** Only shown if payoutMethod = "bank_transfer"
**Animation:** Fade in / out (300ms)

#### Field 3a: Bank Name

**Label:** "Bank name"
**Input Type:** Dropdown select (`<select>`)
**HTML Name Attribute:** `bankName`
**Required:** Yes (if bank selected)
**Options:** List of major SA banks

**Sample Banks:**
```
- Absa Bank
- Bank of China
- FirstRand Bank
- Investec
- Nedbank
- Standard Bank
- Van Shaik
- African Bank
- Capitec Bank
- ICBC
- TymeBank
- Vodacom Money
```

**Validation Rules:**
```typescript
bankName: z
  .string()
  .min(1, "Bank name is required")
  .refine(
    (val) => validBanks.includes(val),
    'Bank not recognized'
  )
```

**Error Messages:**
- Required: "Please select a bank"
- Invalid: "Bank not recognized"

**Styling:**
```
Select:
  rounded-xl border-border h-11
  px-4 py-2 bg-white text-text
  focus:border-primary focus:ring-primary/30
```

**Accessibility:**
- `<label htmlFor="bankName">`
- `aria-required="true"`
- Dropdown accessible via keyboard and screen reader

---

#### Field 3b: Account Number

**Label:** "Account number"
**Input Type:** Text with validation (`<input type="text">`)
**HTML Name Attribute:** `accountNumber`
**Placeholder:** `"1234567890"`
**Format:** 8-15 digits (varies by bank)
**Required:** Yes (if bank selected)
**Max Length:** 15

**Validation Rules:**
```typescript
accountNumber: z
  .string()
  .refine(
    (val) => /^\d{8,15}$/.test(val),
    'Account number must be 8-15 digits'
  )
```

**Error Messages:**
- Required: "Account number is required"
- Invalid length: "Account number must be 8-15 digits"
- Invalid format: "Account number must contain only digits"

**Responsive:**
- Mobile: Full width, h-11
- Desktop: Full width or 1/2 width (next to branch code)

**Accessibility:**
- `<label htmlFor="accountNumber">`
- `aria-required="true"`
- `aria-describedby="accountNumber-hint"`
- Helper text: "Check your bank statement or app"

---

#### Field 3c: Branch Code

**Label:** "Branch code"
**Input Type:** Text with validation (`<input type="text">`)
**HTML Name Attribute:** `branchCode`
**Placeholder:** `"000000"`
**Format:** 6 digits (South African branch codes)
**Required:** Yes (if bank selected)
**Max Length:** 6
**Auto-fill:** Optional - can fetch from bank API based on bank name

**Validation Rules:**
```typescript
branchCode: z
  .string()
  .refine(
    (val) => /^\d{6}$/.test(val),
    'Branch code must be 6 digits'
  )
```

**Error Messages:**
- Required: "Branch code is required"
- Invalid length: "Branch code must be 6 digits"
- Invalid format: "Branch code must contain only digits"

**Auto-fill Feature (Optional Enhancement):**
- If bank selected and branch code focused, show popular branch codes for that bank
- User can click to fill, or type manually
- Dropdown: "Select a branch"

**Accessibility:**
- `<label htmlFor="branchCode">`
- `aria-required="true"`
- `aria-describedby="branchCode-hint"`
- Helper: "6-digit code from your bank"

---

#### Field 3d: Account Holder Name

**Label:** "Account holder name"
**Input Type:** Text (`<input type="text">`)
**HTML Name Attribute:** `accountHolderName`
**Placeholder:** `"John Doe"`
**Format:** Letters, spaces (1-100 chars)
**Required:** Yes (if bank selected)
**Max Length:** 100

**Validation Rules:**
```typescript
accountHolderName: z
  .string()
  .min(1, "Account holder name is required")
  .max(100, "Name must be 100 characters or less")
  .regex(/^[a-zA-Z\s'-]+$/, "Only letters, spaces, hyphens, apostrophes")
```

**Error Messages:**
- Required: "Account holder name is required"
- Too long: "Name must be 100 characters or less"
- Invalid format: "Only letters, spaces, hyphens, and apostrophes allowed"

**Responsive:**
- Mobile: Full width, h-11
- Desktop: Full width or 1/2 width (next to account number)

**Accessibility:**
- `<label htmlFor="accountHolderName">`
- `aria-required="true"`
- Screen reader: "Edit account holder name as it appears on bank statement"

---

### Field 4: Payout Email (Common to Both Methods)

**Label:** "Payout email"
**Input Type:** Email (`<input type="email">`)
**HTML Name Attribute:** `payoutEmail`
**Placeholder:** `"parent@example.com"`
**Format:** Valid email address
**Required:** Yes (both methods)
**Max Length:** 254 (RFC 5321)

**Validation Rules:**
```typescript
payoutEmail: z
  .string()
  .email("Please enter a valid email address")
  .max(254, "Email is too long")
```

**Error Messages:**
- Required: "Email is required"
- Invalid format: "Please enter a valid email address"
- Too long: "Email is too long"

**Helper Text:**
"We'll send confirmations when the Dreamboard closes and funds are processed."

**Responsive:**
- Mobile: Full width, h-11
- Desktop: Full width or 1/2 width (next to WhatsApp)

**Accessibility:**
- `<label htmlFor="payoutEmail">`
- `aria-required="true"`
- `aria-describedby="payoutEmail-help"`
- Screen reader: "Edit payout email address"

---

### Field 5: WhatsApp Number (Common)

**Label:** "WhatsApp number"
**Input Type:** Tel with formatting (`<input type="tel">`)
**HTML Name Attribute:** `whatsappNumber`
**Placeholder:** `"+27 82 123 4567"`
**Format:** South African phone format: +27XXXXXXXXX (11 digits)
**Required:** Yes (both methods)
**Mask:** Auto-format as "+27 XX XXX XXXX"

**Validation Rules:**
```typescript
whatsappNumber: z
  .string()
  .refine(
    (val) => /^\+27\d{9}$/.test(val.replace(/\s/g, '')),
    'WhatsApp number must be South Africa format: +27XXXXXXXXX'
  )
```

**Error Messages:**
- Required: "WhatsApp number is required"
- Invalid format: "WhatsApp must be South Africa format (e.g., +27821234567)"
- Invalid length: "WhatsApp number must be 11 digits"

**Helper Text:**
"South Africa (SA) format required. We'll send WhatsApp confirmations."

**Auto-formatting:**
- User types: 821234567
- Displays as: +27 82 123 4567
- Stored as: +27821234567

**Responsive:**
- Mobile: Full width, h-11
- Desktop: Full width or 1/2 width (next to email)

**Accessibility:**
- `<label htmlFor="whatsappNumber">`
- `aria-required="true"`
- `aria-describedby="whatsappNumber-help"`
- `inputMode="tel"` on mobile
- Screen reader: "Edit WhatsApp number, South Africa format required"

---

## 5. INTERACTIVE BEHAVIORS

### Form Submission Flow

**Submit Handler:** `savePayoutAction` (server action)

**Pre-submission Validations:**
1. Payout method required
2. If Karri:
   - Card number (16 digits, Luhn check)
   - Expiry (MM/YY, not expired)
   - CVV (3-4 digits)
3. If Bank:
   - Bank name required
   - Account number (8-15 digits)
   - Branch code (6 digits)
   - Account holder name (letters only)
4. Email required and valid
5. WhatsApp required and valid (SA format)
6. Show error banner if validation fails
7. Disable submit button until all valid

**Submission Process:**
```typescript
async function savePayoutAction(formData: FormData) {
  'use server';

  // 1. Authenticate
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);

  // 2. Check previous steps completed
  if (!draft?.charityOptIn === undefined) {
    redirect('/create/giving-back');
  }

  // 3. Extract form fields
  const payoutMethod = formData.get('payoutMethod');
  const payoutEmail = formData.get('payoutEmail');
  const whatsappNumber = formData.get('whatsappNumber');

  // 4. Extract method-specific fields
  let payoutDetails: PayoutDetails;

  if (payoutMethod === 'karri_card') {
    const karriCardNumber = formData.get('karriCardNumber');
    const karriExpiry = formData.get('karriExpiry');
    const karriCvv = formData.get('karriCvv');

    const result = karriSchema.safeParse({
      cardNumber: karriCardNumber,
      expiry: karriExpiry,
      cvv: karriCvv,
    });

    if (!result.success) {
      redirect('/create/payout?error=invalid_karri');
    }

    payoutDetails = {
      method: 'karri_card',
      cardNumber: maskCardNumber(result.data.cardNumber), // Store masked
      expiry: result.data.expiry,
      // CVV NOT stored (security)
    };
  } else if (payoutMethod === 'bank_transfer') {
    const bankName = formData.get('bankName');
    const accountNumber = formData.get('accountNumber');
    const branchCode = formData.get('branchCode');
    const accountHolderName = formData.get('accountHolderName');

    const result = bankSchema.safeParse({
      bankName,
      accountNumber,
      branchCode,
      accountHolderName,
    });

    if (!result.success) {
      redirect('/create/payout?error=invalid_bank');
    }

    payoutDetails = {
      method: 'bank_transfer',
      bankName: result.data.bankName,
      accountNumber: result.data.accountNumber,
      branchCode: result.data.branchCode,
      accountHolderName: result.data.accountHolderName,
    };
  }

  // 5. Validate common fields
  const commonResult = commonPayoutSchema.safeParse({
    email: payoutEmail,
    whatsapp: whatsappNumber,
  });

  if (!commonResult.success) {
    redirect('/create/payout?error=invalid_contact');
  }

  // 6. Save to draft
  await updateDreamBoardDraft(session.hostId, {
    payoutMethod,
    payoutDetails,
    payoutEmail: commonResult.data.email,
    whatsappNumber: commonResult.data.whatsapp,
  });

  // 7. Redirect to review
  redirect('/create/review');
}
```

**Error Handling:**
- Show error banner for validation failures
- Keep form data intact (except CVV for security)
- Highlight affected fields with red borders
- Clear error on field focus

**Zod Schemas:**
```typescript
const karriSchema = z.object({
  cardNumber: z
    .string()
    .refine((val) => /^\d{16}$/.test(val.replace(/\s/g, ''))),
  expiry: z.string().refine((val) => /^\d{2}\/\d{2}$/.test(val)),
  cvv: z.string().refine((val) => /^\d{3,4}$/.test(val)),
});

const bankSchema = z.object({
  bankName: z.string().min(1),
  accountNumber: z.string().refine((val) => /^\d{8,15}$/.test(val)),
  branchCode: z.string().refine((val) => /^\d{6}$/.test(val)),
  accountHolderName: z
    .string()
    .min(1)
    .max(100)
    .regex(/^[a-zA-Z\s'-]+$/),
});

const commonPayoutSchema = z.object({
  email: z.string().email(),
  whatsapp: z.string().refine((val) => /^\+27\d{9}$/.test(val.replace(/\s/g, ''))),
});
```

### Method Selection Interaction

**On Karri Card Select:**
1. Method cards update (Karri gets checkmark + border)
2. Karri fields fade in (300ms animation)
3. Bank fields fade out (300ms animation)
4. Focus moves to card number input (auto-focus)
5. Pre-populate from draft if exists

**On Bank Transfer Select:**
1. Method cards update (Bank gets checkmark + border)
2. Bank fields fade in (300ms animation)
3. Karri fields fade out (300ms animation)
4. Focus moves to bank name dropdown
5. Pre-populate from draft if exists

**Card Number Formatting (Karri)**
- User types: 1234567890123456
- Displays as: 1234 5678 9012 3456
- Auto-insert spaces after every 4 digits
- On paste: Auto-format immediately
- Store unformatted in FormData

**Expiry Formatting (Karri)**
- User types: 1225
- Displays as: 12/25
- Auto-insert slash after 2nd digit
- On paste: Auto-format
- Validate not expired

**Branch Code Auto-fill (Bank)**
- User selects bank
- Branch code field shows loading state
- Fetch popular branch codes from API
- Show dropdown with major branches
- User can type manually or select

### Real-time Validation

**Card Number (on blur):**
1. Validate length (16 digits)
2. Run Luhn check
3. Show error or checkmark

**Expiry (on blur):**
1. Validate format (MM/YY)
2. Check not expired
3. Show error if invalid

**CVV (on blur):**
1. Validate length (3-4 digits)
2. Show error if invalid

**Email (on blur):**
1. Validate format
2. Show error if invalid

**WhatsApp (on change):**
1. Format number
2. Validate SA format
3. Show error if invalid

---

## 6. COMPONENT TREE

```
<CreatePayoutPage> (Page Component)
├── Redirect handlers (auth, flow validation)
├── Data loading (getDreamBoardDraft, getValidBanks)
├── Error resolution
│
└── <CreateFlowShell>
    ├── Header
    │
    └── <Card>
        ├── <CardHeader>
        │   ├── <CardTitle> "Payment information"
        │   └── <CardDescription> "How we'll send your funds"
        │
        └── <CardContent className="space-y-6">
            ├── <InfoBox>
            │   Text: "Once the Dreamboard closes..."
            │ </InfoBox>
            │
            ├── {errorMessage && (
            │     <ErrorBanner />
            │   )}
            │
            └── <form action={savePayoutAction}>
                ├── <FormField>
                │   <label> "Select your payout method:"
                │
                │   <div className="grid md:grid-cols-2 gap-4">
                │     <PayoutMethodCard
                │       method="karri_card"
                │       recommended={true}
                │       selected={selectedMethod === 'karri_card'}
                │       onChange={setSelectedMethod}
                │     />
                │     <PayoutMethodCard
                │       method="bank_transfer"
                │       selected={selectedMethod === 'bank_transfer'}
                │       onChange={setSelectedMethod}
                │     />
                │   </div>
                │ </FormField>
                │
                ├── {selectedMethod === 'karri_card' && (
                │     <motion.div className="space-y-4">
                │       <FormField>
                │         <label htmlFor="karriCardNumber">
                │         <Input
                │           id="karriCardNumber"
                │           type="text"
                │           placeholder="1234 5678 9012 3456"
                │           maxLength="19"
                │           onChange={handleCardNumberChange}
                │         />
                │       </FormField>
                │
                │       <div className="grid grid-cols-2 gap-4">
                │         <FormField>
                │           <label htmlFor="karriExpiry">
                │           <Input
                │             id="karriExpiry"
                │             type="text"
                │             placeholder="MM/YY"
                │             maxLength="5"
                │           />
                │         </FormField>
                │         <FormField>
                │           <label htmlFor="karriCvv">
                │           <Input
                │             id="karriCvv"
                │             type="text"
                │             placeholder="123"
                │             maxLength="4"
                │             inputMode="numeric"
                │           />
                │         </FormField>
                │       </div>
                │     </motion.div>
                │   )}
                │
                ├── {selectedMethod === 'bank_transfer' && (
                │     <motion.div className="space-y-4">
                │       <FormField>
                │         <label htmlFor="bankName">
                │         <Select>
                │           {validBanks.map(bank => (
                │             <option value={bank.id}>{bank.name}</option>
                │           ))}
                │         </Select>
                │       </FormField>
                │
                │       <div className="grid md:grid-cols-2 gap-4">
                │         <FormField>
                │           <label htmlFor="accountNumber">
                │           <Input ... />
                │         </FormField>
                │         <FormField>
                │           <label htmlFor="branchCode">
                │           <Input ... />
                │         </FormField>
                │       </div>
                │
                │       <FormField>
                │         <label htmlFor="accountHolderName">
                │         <Input ... />
                │       </FormField>
                │     </motion.div>
                │   )}
                │
                ├── <div className="border-t pt-6">
                │   <h3 className="font-medium mb-4">Contact Information</h3>
                │
                │   <div className="grid md:grid-cols-2 gap-4">
                │     <FormField>
                │       <label htmlFor="payoutEmail">
                │       <Input
                │         id="payoutEmail"
                │         type="email"
                │         placeholder="parent@example.com"
                │       />
                │     </FormField>
                │
                │     <FormField>
                │       <label htmlFor="whatsappNumber">
                │       <Input
                │         id="whatsappNumber"
                │         type="tel"
                │         placeholder="+27 82 123 4567"
                │         onChange={handleWhatsAppFormat}
                │       />
                │     </FormField>
                │   </div>
                │ </div>
                │
                └── <Button type="submit">
                    Continue to review
                  </Button>
```

---

## 7. TYPESCRIPT INTERFACES & SCHEMAS

### Props Interface

```typescript
interface CreatePayoutPageProps {
  searchParams?: PayoutSearchParams;
}

interface PayoutSearchParams {
  error?: string;
}
```

### Form Data Types

```typescript
interface PayoutFormData {
  payoutMethod: 'karri_card' | 'bank_transfer';
  // Karri-specific
  karriCardNumber?: string;
  karriExpiry?: string;
  karriCvv?: string;
  // Bank-specific
  bankName?: string;
  accountNumber?: string;
  branchCode?: string;
  accountHolderName?: string;
  // Common
  payoutEmail: string;
  whatsappNumber: string;
}

interface PayoutDraft {
  payoutMethod: 'karri_card' | 'bank_transfer';
  payoutDetails: PayoutDetails;
  payoutEmail: string;
  whatsappNumber: string;
  updatedAt: Date;
}

type PayoutDetails = KarriDetails | BankDetails;

interface KarriDetails {
  method: 'karri_card';
  cardNumber: string; // Masked: 1234 5678 9012 3456
  expiry: string; // 12/25
  // CVV NOT stored
}

interface BankDetails {
  method: 'bank_transfer';
  bankName: string;
  accountNumber: string;
  branchCode: string;
  accountHolderName: string;
}
```

### Zod Schemas

```typescript
const karriSchema = z.object({
  cardNumber: z
    .string()
    .refine(
      (val) => /^\d{16}$/.test(val.replace(/\s/g, '')),
      'Card number must be 16 digits'
    )
    .refine(
      (val) => luhnCheck(val.replace(/\s/g, '')),
      'Card number is invalid'
    ),
  expiry: z
    .string()
    .refine((val) => /^\d{2}\/\d{2}$/.test(val), 'Must be MM/YY')
    .refine(
      (val) => {
        const [m, y] = val.split('/');
        const exp = new Date(2000 + parseInt(y), parseInt(m) - 1);
        return exp > new Date();
      },
      'Card has expired'
    ),
  cvv: z
    .string()
    .refine((val) => /^\d{3,4}$/.test(val), 'Must be 3-4 digits'),
});

const bankSchema = z.object({
  bankName: z.string().min(1, 'Bank required').refine(
    (val) => validBankIds.includes(val),
    'Invalid bank'
  ),
  accountNumber: z
    .string()
    .refine(
      (val) => /^\d{8,15}$/.test(val),
      'Must be 8-15 digits'
    ),
  branchCode: z
    .string()
    .refine((val) => /^\d{6}$/.test(val), 'Must be 6 digits'),
  accountHolderName: z
    .string()
    .min(1, 'Name required')
    .max(100)
    .regex(/^[a-zA-Z\s'-]+$/, 'Letters only'),
});

const commonPayoutSchema = z.object({
  payoutEmail: z.string().email('Invalid email'),
  whatsappNumber: z
    .string()
    .refine(
      (val) => /^\+27\d{9}$/.test(val.replace(/\s/g, '')),
      'Invalid SA WhatsApp format'
    ),
});
```

---

## 8. FILE STRUCTURE

```
src/
├── app/
│   └── (host)/
│       └── create/
│           └── payout/
│               ├── page.tsx (Main page, server action)
│               ├── layout.tsx (Optional)
│               └── error.tsx (Optional)
│
├── components/
│   ├── layout/
│   │   ├── CreateFlowShell.tsx
│   │   └── WizardStepIndicator.tsx
│   ├── payout/
│   │   ├── PayoutMethodSelector.tsx (Method cards)
│   │   ├── PayoutMethodCard.tsx (Individual card)
│   │   ├── KarriFields.tsx (Karri form)
│   │   ├── BankFields.tsx (Bank form)
│   │   └── ContactFields.tsx (Email + WhatsApp)
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── badge.tsx
│
└── lib/
    ├── integrations/
    │   └── payout-provider.ts (Validation, bank data)
    ├── dream-boards/
    │   └── draft.ts (Save payout data)
    ├── auth/
    │   └── clerk-wrappers.ts
    ├── utils/
    │   └── card-validation.ts (Luhn, masking)
    └── observability/
        └── logger.ts
```

---

## 9. SERVER ACTIONS

### `savePayoutAction`

**Purpose:** Validate payout details, save to draft, redirect to review

**Input:** FormData from form submission

**Process:**
1. Authenticate user
2. Load draft
3. Verify charity step completed
4. Extract method and all relevant fields
5. Validate method-specific fields (Karri or Bank)
6. Validate common fields (email, WhatsApp)
7. Mask sensitive data before storing
8. Save to draft
9. Redirect to review

**Validation:**
- Method: Required, must be 'karri_card' or 'bank_transfer'
- Karri: 16-digit card, valid expiry, 3-4 digit CVV
- Bank: Valid bank name, 8-15 digit account, 6 digit branch, valid name
- Email: Valid email format
- WhatsApp: SA format only

**Security Considerations:**
- Never log or store CVV
- Mask card numbers (store only last 4 digits or fully masked)
- Use HTTPS only
- Encrypt sensitive fields in database
- Consider tokenization service (Stripe, etc.)

---

## 10. STATE MANAGEMENT

### Draft Persistence

**What's Stored:**
- `payoutMethod` ('karri_card' | 'bank_transfer')
- `payoutDetails` (method-specific object)
- `payoutEmail` (email address)
- `whatsappNumber` (phone number)
- `updatedAt` (ISO timestamp)

**Sensitive Data:**
- Card number: Masked (store only last 4 digits + masked: ·······5678)
- CVV: NEVER stored
- Bank account: Store full (encrypted in database)

**Where:**
- Primary: Database (dream_boards `draft_data` JSONB)
- Session: Form state (React)
- CVV: In-memory only during submission, never persisted

**Loading Draft:**
```typescript
const draft = await getDreamBoardDraft(session.hostId);
const payoutMethod = draft?.payoutMethod ?? 'karri_card';
const payoutEmail = draft?.payoutEmail ?? '';
const whatsappNumber = draft?.whatsappNumber ?? '';
```

**Saving Draft:**
```typescript
await updateDreamBoardDraft(session.hostId, {
  payoutMethod,
  payoutDetails, // Method-specific
  payoutEmail,
  whatsappNumber,
});
```

### Client-Side State

```typescript
const [selectedMethod, setSelectedMethod] = useState(draft?.payoutMethod ?? 'karri_card');
const [karriCardNumber, setKarriCardNumber] = useState(draft?.payoutDetails?.cardNumber ?? '');
const [payoutEmail, setPayoutEmail] = useState(draft?.payoutEmail ?? '');
// ... more fields
```

---

## 11. RESPONSIVE DESIGN

### Breakpoints

**Mobile (< 768px):**
- Method cards: 1 column, stacked
- Form fields: Full width, stacked
- Contact fields: Full width each
- Button: Full width

**Tablet (768px - 1024px):**
- Method cards: 2 columns, side-by-side
- Form fields: Full width or 2-column for small inputs
- Contact fields: 2 columns (email + WhatsApp)
- Button: Auto width

**Desktop (>= 1024px):**
- Max-width card (700px)
- Method cards: 2 columns
- Form fields: 2-column where appropriate
- Contact fields: 2 columns
- Button: Auto width

### Touch & Accessibility

**Minimum Touch Targets:** 44x44px
- Method cards: Full card clickable (> 44px)
- Inputs: h-11 (44px) minimum
- Dropdowns: h-11 (44px)
- Buttons: h-11 or h-14

**Spacing:**
- Field gaps: gap-4 to gap-6
- Card padding: px-6 py-8
- Label to input: 2 (8px)

---

## 12. ANIMATIONS & TRANSITIONS

### Entry Animation

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

.card { animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both; }
```

### Method Card Selection

```css
.method-card {
  transition: all 200ms ease;

  &:hover:not(.selected) {
    border-color: #D6D3D1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  &.selected {
    animation: scaleIn 0.2s ease-out;
  }
}
```

### Field Transitions (Karri/Bank)

```css
@keyframes slideDown {
  from {
    opacity: 0;
    height: 0;
    transform: translateY(-12px);
  }
  to {
    opacity: 1;
    height: auto;
    transform: translateY(0);
  }
}

.method-fields {
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 13. ACCESSIBILITY (WCAG 2.1 AA)

### Labels & Form Association

```html
<label for="payoutEmail" class="text-sm font-medium">
  Payout email
</label>
<input id="payoutEmail" type="email" required />

<!-- Error association -->
<input aria-describedby="payoutEmail-error" aria-invalid={hasError} />
{hasError && (
  <span id="payoutEmail-error" role="alert">{errorMessage}</span>
)}
```

### ARIA Attributes

```html
<!-- Method selection -->
<fieldset>
  <legend>Select your payout method</legend>
  <div role="radiogroup">
    <label>
      <input
        type="radio"
        name="payoutMethod"
        value="karri_card"
        aria-label="Karri Card: Instant payouts, no fees"
      />
    </label>
  </div>
</fieldset>

<!-- Required fields -->
<input aria-required="true" aria-label="Card number" />

<!-- Error messages -->
<div role="alert" aria-live="assertive">{errorMessage}</div>

<!-- Loading state -->
<button aria-busy="true" disabled>Processing...</button>
```

### Keyboard Navigation

**Tab Order:**
1. Method cards (clickable via Enter/Space)
2. Method-specific fields (depending on selected method)
3. Email input
4. WhatsApp input
5. Continue button
6. Back link

**Screen Reader Experience:**

**Page Load:**
"Page loaded: Create Dreamboard, Step 5 of 6, Payout Setup. Select payout method."

**Method Card Focus:**
"Radio button: Karri Card, Recommended. Instant payouts, no fees. Selected."

**Card Number Field:**
"Edit card number. Card number must be 16 digits. Required."

**Expiry Field:**
"Edit expiry date. Format MM/YY. Required."

**Email Field:**
"Edit payout email. We'll send confirmations when Dreamboard closes. Required."

**Error Message:**
"Alert: Card number is invalid. Card number must be 16 digits."

### Color Contrast

- Text on background: >= 4.5:1 (WCAG AA)
- Recommended badge: >= 4.5:1
- Error text: >= 4.5:1
- Input borders: >= 3:1

### Visual Indicators

- Required fields: `*` asterisk + `aria-required="true"`
- Errors: Icon + text + border
- Selected method: Border + checkmark + background
- Validation success: Checkmark icon

---

## 14. ERROR HANDLING

### Validation Errors (as per spec sections)

**Card Number (Karri):**
- "Card number is required"
- "Card number must be 16 digits"
- "Card number is invalid"

**Expiry (Karri):**
- "Expiry is required"
- "Expiry must be MM/YY format"
- "Card has expired"

**CVV (Karri):**
- "CVV is required"
- "CVV must be 3 or 4 digits"

**Bank Name:**
- "Please select a bank"
- "Bank not recognized"

**Account Number:**
- "Account number is required"
- "Account number must be 8-15 digits"

**Branch Code:**
- "Branch code is required"
- "Branch code must be 6 digits"

**Account Holder Name:**
- "Account holder name is required"
- "Name must be 100 characters or less"
- "Only letters, spaces, hyphens, and apostrophes allowed"

**Email:**
- "Email is required"
- "Please enter a valid email address"

**WhatsApp:**
- "WhatsApp number is required"
- "WhatsApp must be South Africa format (e.g., +27821234567)"

---

## 15. EDGE CASES

### Case 1: Draft Already Exists

**Scenario:** User navigates back to `/create/payout`

**Behavior:**
- Load all payout data from draft
- Pre-select method (Karri or Bank)
- Pre-populate all fields except CVV
- Show appropriate method form

### Case 2: Card Already Stored

**Scenario:** User previously saved Karri card, returns to edit

**Behavior:**
- Show masked card number (display last 4 digits: ·······5678)
- Pre-populate expiry (if stored)
- CVV field cleared (never stored)
- Allow user to update any field

### Case 3: Invalid Expiry

**Scenario:** User saves card expiring next month

**Behavior:**
- Validation passes at save time
- Warning (optional): "Card expires soon"
- Allow save
- Post-Dreamboard completion, may trigger card update flow

### Case 4: Large Account Number

**Scenario:** User's account number is 15 digits (max)

**Behavior:**
- Allow (within validation range)
- Display fully
- Store all digits

### Case 5: WhatsApp Number Format Variations

**Scenario:** User enters "0821234567" or "0027821234567"

**Behavior:**
- Strip leading 0, add +27
- Strip leading 00, add +27
- Format to: +27 82 123 4567
- Validate final format

### Case 6: Rapid Method Switch

**Scenario:** User toggles Karri → Bank → Karri rapidly

**Behavior:**
- Animation plays each time
- Form state persists per method (if in draft)
- On submit, only selected method's fields sent
- Previous method's data cleared or ignored

### Case 7: Session Expires Before Submit

**Scenario:** User fills payout form, session expires

**Behavior:**
- Form submission fails with 401
- Redirect to login
- After login, redirect to `/create/payout`
- Draft still there with payout data (except CVV)

### Case 8: Bank Selection Not Available

**Scenario:** Bank fetch API fails or returns empty

**Behavior:**
- Show error: "Unable to load banks. Please try again."
- Allow manual entry of bank name (text input fallback)
- Retry button for bank fetch

### Case 9: Validation Success

**Scenario:** All fields valid, user clicks Continue

**Behavior:**
- Button shows loading state: "Processing..."
- Submit request sent
- On success: Redirect to `/create/review`
- On error: Show error banner, allow retry

### Case 10: CVV Re-entry

**Scenario:** User wants to change CVV field

**Behavior:**
- Clear on focus (security)
- Re-enter value
- Not displayed on blur (input type="password" or asterisks)
- Not stored anywhere except during submission

---

## SUMMARY

This specification provides complete details for implementing Step 5 (Payout Setup) of Gifta's Create Flow. The page captures critical payment information with emphasis on security and UX. Key features:

- **Recommended Path:** Karri Card highlighted as fastest, fee-free option
- **Fallback Support:** Bank transfer for users without Karri
- **Security-First:** CVV never stored, card masking, encrypted database
- **Enterprise-Grade:** Full accessibility, comprehensive validation, error recovery
- **Mobile-Friendly:** Responsive inputs, auto-formatting, large touch targets
- **Comprehensive:** Edge case handling, session recovery, sensitive data protection

Ready for implementation by an AI agent using Next.js, React, TypeScript, Tailwind CSS, Zod validation, and encryption libraries.

