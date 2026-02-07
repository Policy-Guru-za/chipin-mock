# 10 — CONTRIBUTE AMOUNT & DETAILS (Information Gathering)

**Route:** `/[slug]/contribute` (initial step / combined form)
**Purpose:** Capture contribution amount, display name, anonymity preference, and optional birthday message
**Audience:** Contributors (gift-givers)
**Device Priority:** Mobile-first
**Context:** User has clicked "Chip in" on dream board; now fills out details before payment

---

## 1. Screen Overview

This is the **information gathering screen** where contributors specify:
1. How much they want to contribute
2. How they want their name displayed
3. Whether to remain anonymous
4. (Optional) A birthday message for the child

Philosophy: **Fast, encouraging, no friction.** Most contributors want to spend <90 seconds here. Social proof ("Most people chip in R250") removes decision paralysis.

---

## 2. Visual Layout

### Mobile (375px viewport)
```
┌─────────────────────────────────────┐
│                                     │
│  [← Back] Chip in for Emma          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Most people chip in R250 💝         │
│  (social proof, gray text)          │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  HOW MUCH WOULD YOU LIKE TO          │
│  CONTRIBUTE?                        │
│  (Outfit 12px, uppercase, gray)     │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │  R150    │  │  R250  ⭐│        │
│  │          │  │          │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  ┌──────────┐  ┌──────────┐        │
│  │  R500    │  │  Other   │        │
│  │          │  │          │        │
│  └──────────┘  └──────────┘        │
│                                     │
│  (Grid 2x2, 12px gap)              │
│  (Selected = sage border + bg tint) │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  YOUR NAME (as it will appear)      │
│  (Outfit 12px, uppercase, gray)     │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ The Mason Family                ││
│  │ (placeholder, 14px)             ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ☑ Keep my name private (Anonymous) │
│  (Checkbox, Outfit 14px)            │
│                                     │
│  (When checked: hide name field)    │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ADD A BIRTHDAY MESSAGE             │
│  (Collapsed by default, link)       │
│  (Outfit 12px, uppercase, sage)     │
│                                     │
│  (When clicked: expand textarea)    │
│                                     │
│  ┌─────────────────────────────────┐│
│  │ "Dear Emma, wishing you..."      ││
│  │ (max 500 chars, counter)         ││
│  │ (100/500)                        ││
│  └─────────────────────────────────┘│
│                                     │
├─────────────────────────────────────┤
│                                     │
│  Remind me in 3 days 🔔             │
│  (Gray text link, small)            │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────────┐│
│  │  Continue to payment →           ││
│  │  (Sage button, filled)           ││
│  └─────────────────────────────────┘│
│                                     │
│  🔒 Payments secured by PayFast     │
│                                     │
└─────────────────────────────────────┘
```

### Desktop (1024px viewport)
```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│  [← Back] Chip in for [Child]                                 │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Most people chip in R250 💝                                   │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  HOW MUCH WOULD YOU LIKE TO CONTRIBUTE?                       │
│                                                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │  R150    │  │  R250  ⭐│  │  R500    │  │  Other   │      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘      │
│                                                                │
│  (Grid 4 columns, same styling as mobile)                     │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  YOUR NAME (as it will appear)                                │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ The Mason Family                                       │   │
│  │ (placeholder)                                          │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  ☑ Keep my name private (Anonymous)                            │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ADD A BIRTHDAY MESSAGE                                       │
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │ "Dear Emma, wishing you..."                            │   │
│  │                                                        │   │
│  │ (100/500)                                              │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  Remind me in 3 days 🔔                                       │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Continue to payment →                                 │   │
│  │  (Sage button, filled, 60% width max 400px)            │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                │
│  🔒 Payments secured by PayFast                               │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 3. Section-by-Section Specification

### 3.1 Header / Breadcrumb

**Purpose:** Show context and allow back navigation
**Layout:** Sticky on mobile, static on desktop
**Background:** White or subtle bg `#FDF8F3`

#### Back Button
- **Style:** Text link with `←` arrow icon (or back arrow SVG)
- **Text:** `"Back"` (Outfit 14px, sage text)
- **Color:** Sage `#6B9E88` on hover darken to `#5A8E78`
- **Action:** Navigate to previous page (dreamboard slug) OR `/` if direct link
- **Keyboard:** Tab-accessible, Enter/Space to trigger

#### Heading
- **Text:** `"Chip in for [Child]"` (Fraunces 24px, 700 weight)
- **Positioning:** Left-aligned on mobile, centered on desktop
- **Spacing:** 24px below breadcrumb on mobile, 32px on desktop

---

### 3.2 Social Proof Section

**Purpose:** Reduce decision paralysis with anchoring ("R250 is normal")
**Display:** Prominent but not pushy
**Styling:** Subtle bg `#FDF8F3`, centered, 24px padding

#### Text
- **Copy:** `"Most people chip in R250 💝"` (Outfit 16px, 600 weight, text-gray-700)
- **Accessibility:** Informational only, not a form field
- **A/B test variants:**
  - "Most people chip in R250 💝"
  - "Thousands of contributors choose R250 💝"
  - "The favorite amount: R250 💝"

---

### 3.3 Amount Selector

**Purpose:** Quick selection with "Other" fallback
**Type:** Toggle button group + custom input field

#### Button Layout
- **Desktop:** 4 columns (R150, R250, R500, Other)
- **Mobile:** 2x2 grid (responsive)
- **Gap:** 12px between buttons
- **Button size:** 100% of column width
- **Min height:** 64px (touch-friendly)

#### Button Styling (Unselected)
- **Background:** White
- **Border:** 1px solid `#E5E7EB` (gray-200)
- **Text:** Fraunces 18px, 700 weight, text-gray-900
- **Padding:** 16px
- **Rounded:** `rounded-lg`
- **Hover:** Border `#D1D5DB` (gray-300), bg `#F9FAFB` (gray-50)

#### Button Styling (Selected)
- **Background:** `#E8F5F0` (sage tint, from-[#E4F0E8])
- **Border:** 2px solid `#0D9488` (teal)
- **Text:** Fraunces 18px, 700 weight, teal `#0D9488`
- **Padding:** 16px (maintained)
- **Star emoji:** Add `⭐` after R250 default selection

#### "Other" Input Field (Conditional)
- **Trigger:** Click "Other" button
- **Display:** Replace button with text input field
- **Styling:** Same height as buttons (64px), width 100%
- **Label:** Hidden (implicit from button context)
- **Placeholder:** "Enter amount (R20 - R10,000)"
- **Input type:** `type="number"`, `inputMode="numeric"`
- **Min/Max:** Validate `amount >= 20 && amount <= 10000`
- **Currency prefix:** `R` shown in input (or use `$` for mobile money)
- **Format:** Display as `R[amount]` with commas (e.g., `R1,250`)

#### Validation Rules
- **Min:** R20 (minimum contribution)
- **Max:** R10,000 (anti-fraud limit)
- **Required:** Must select or enter amount
- **Error message:** "Please select or enter an amount between R20 and R10,000"
- **Real-time feedback:** Show error below field if invalid

#### Default Selection
- **R250 is pre-selected** (marked with ⭐)
- **Rationale:** A/B tested, common donation amount, not too high/low

---

### 3.4 Name Input Field

**Purpose:** Collect how contributor wants to be credited
**Display:** Full-width text input
**Styling:** `rounded-lg`, `shadow-soft`, 16px padding

#### Label
- **Text:** `"YOUR NAME (as it will appear)"` (Outfit 12px, 700 weight, uppercase, text-gray-500)
- **Positioning:** Above input, 8px gap

#### Input Field
- **Type:** `type="text"`
- **Placeholder:** `"The Mason Family"` (gray-400)
- **Max length:** 50 characters
- **Font:** Outfit 16px, text-gray-900
- **Border:** 1px solid `#E5E7EB` (gray-200)
- **Focus:** Border `#0D9488` (teal), shadow-focus
- **Height:** 48px (44px touch target + padding)
- **Padding:** 12px left/right, 8px top/bottom

#### Validation
- **Required:** Yes (unless anonymous checked)
- **Min length:** 2 characters
- **Max length:** 50 characters
- **Allowed characters:** Letters, numbers, spaces, hyphens, apostrophes
- **Sanitization:** Trim whitespace, capitalize first letter of each word
- **Error message:** "Please enter a name (2-50 characters)"

#### Conditional Display
- **Hidden when:** `is_anonymous === true`
- **Transition:** Fade out + slide up (0.2s ease-out)
- **When unhidden:** Slide down + fade in, focus input automatically

---

### 3.5 Anonymous Checkbox

**Purpose:** Allow contributors to remain hidden from public list
**Display:** Below name input, full-width or left-aligned
**Styling:** Checkbox + label inline

#### Checkbox
- **Type:** `<input type="checkbox">`
- **Label text:** `"Keep my name private (Anonymous)"` (Outfit 14px, text-gray-900)
- **Size:** 20x20px (accessible touch target)
- **Color:** Sage `#6B9E88` when checked
- **Focus:** Blue outline, 2px, 2px offset
- **Spacing:** 12px gap between checkbox and label

#### Behavior
- **When checked:**
  - Name input field hides (fade out, slide up)
  - Display in contributor list as "💝 Anonymous" with heart emoji
  - Name value cleared from form data
- **When unchecked:**
  - Name input shows (fade in, slide down)
  - Focus name input for convenience
  - Restore previous name if exists

#### Accessibility
- **ARIA:** `aria-label="Keep my name private"`, `aria-checked="true|false"`
- **Keyboard:** Space to toggle when focused

---

### 3.6 Birthday Message Section

**Purpose:** Allow personal touch (optional, but encouraged)
**Display:** Collapsed by default, expand on click
**Styling:** Clean, spacious text area

#### Collapsed State
- **Display:** Link/button text `"ADD A BIRTHDAY MESSAGE 🎂"` (Outfit 12px, uppercase, sage text, no border)
- **Hover:** Underline, sage darker
- **Click action:** Expand textarea below, focus input
- **Animation:** Slide down + fade in (0.3s ease-out)

#### Expanded Textarea
- **Placeholder:** `"Write a message for Emma! (e.g., 'Dear Emma, we're so excited for your birthday...')"`
- **Max length:** 500 characters
- **Font:** Outfit 14px, text-gray-900
- **Height:** 120px (4-5 lines), grow to 200px max if typed
- **Padding:** 12px
- **Border:** 1px solid gray-200
- **Focus:** Border teal, shadow
- **Rounded:** `rounded-lg`

#### Character Counter
- **Display:** Below textarea, right-aligned
- **Format:** `"[current]/500"` (Outfit 12px, text-gray-500)
- **Styling:** Gray text, updated in real-time
- **Warnings:**
  - 400+ chars: Show count in orange-600
  - 490+ chars: Show count in red-600, "You have [X] characters left"

#### Collapse Trigger (Optional)
- **Display:** "Collapse" link or collapse icon (↑) at bottom-right of textarea
- **Action:** Collapse textarea, save message value
- **Animation:** Slide up + fade out

#### Validation
- **Required:** No (optional field)
- **Max 500 chars:** Enforce hard limit, disable typing beyond
- **Content:** No validation, allow any text (name/email/phone validation optional in backend)
- **Sanitization:** XSS protection, HTML entities escaped

---

### 3.7 Reminder Link

**Purpose:** Encourage return visits and gift follow-up
**Display:** Text link, subtle
**Styling:** Outfit 12px, sage text, underlined on hover

#### Link
- **Text:** `"Remind me in 3 days 🔔"` (Outfit 12px)
- **Color:** Sage `#6B9E88`
- **Hover:** Underline, darker sage
- **Action:** Open email capture modal
- **Position:** Below message section, left-aligned or centered

#### Email Capture Modal (Triggered)
- **Title:** `"Get a reminder 🔔"` (Fraunces 20px)
- **Description:** `"We'll send you a reminder in 3 days so you can check on the progress."`
- **Input:** Email field (required, validated)
- **Button:** `"Send Reminder"` (sage button)
- **Close:** X button, backdrop click, Esc key
- **Success:** Toast notification "Reminder set! Check your email."
- **API call:** `POST /api/reminders/create` with dreamboard_slug + email

---

### 3.8 Primary CTA Section

**Purpose:** Move contributor to payment page
**Display:** Full-width button, prominent
**Styling:** Sage filled button (not ghost)

#### Button Style
- **Style:** Filled button (primary action)
- **Background:** Sage `#6B9E88`
- **Text Color:** White
- **Text:** `"Continue to payment →"` (Outfit 16px, 600 weight)
- **Padding:** 16px vertical, 24px horizontal
- **Rounded:** `rounded-lg`
- **Width:** 100% on mobile, 60% max 400px on desktop
- **Hover:** bg `#5A8E78` (darker sage)
- **Active:** bg `#4A7E68` (even darker)
- **Disabled:** opacity-50, cursor-not-allowed (if validation fails)
- **Shadow:** `shadow-soft` on hover, none default

#### Loading State
- **On click:** Show spinner inside button
- **Disable clicks:** Prevent double submission
- **Duration:** Show spinner for entire API call (~1-2s)
- **Text:** Change to "Processing..." or show spinner + "Continue"

#### Click Behavior
- **Validation:** Check all required fields (amount, name if not anonymous)
- **If valid:** Submit form to `/[slug]/contribute/payment` (POST or navigation)
- **If invalid:** Show inline error messages, don't navigate
- **Tracking:** Log event `contribute_amount_submitted` with amount, anonymous flag

---

### 3.9 Trust Badge

**Purpose:** Reassure about payment security
**Display:** Below button, center-aligned
**Styling:** Small, gray text

#### Text
- **Copy:** `"🔒 Payments secured by PayFast"` (Outfit 12px, text-gray-500)
- **Icon:** 🔒 emoji or lock SVG (16x16px)
- **Spacing:** 12px above button

#### Link (Optional)
- **Link:** PayFast security page (not required, but OK if added)
- **Target:** `_blank`, `rel="noopener noreferrer"`
- **Text:** Make entire badge clickable (aria-label for screen readers)

---

## 4. Component Tree (React Hierarchy)

```
<ContributeAmountDetailsPage slug={string}>
  <Metadata title="Contribute to [Child]'s Dreamboard" />

  <Header>
    <BackButton href={previousUrl} />
    <Heading text={`Chip in for ${child.name}`} />
  </Header>

  <SocialProofSection text="Most people chip in R250 💝" />

  <FormContainer>
    <AmountSelector
      defaultValue={250}
      options={[150, 250, 500, 'other']}
      onSelect={(amount) => setAmount(amount)}
      selectedAmount={amount}
    >
      <AmountButton value={150} />
      <AmountButton value={250} isDefault />
      <AmountButton value={500} />
      <AmountButtonOther
        isSelected={amount === 'other'}
        onCustomAmount={(val) => setCustomAmount(val)}
      />
      {amount === 'other' && (
        <CustomAmountInput
          value={customAmount}
          onChange={(val) => setCustomAmount(val)}
          onError={(err) => setAmountError(err)}
        />
      )}
    </AmountSelector>

    <NameInputSection
      isHidden={isAnonymous}
      value={displayName}
      onChange={(val) => setDisplayName(val)}
      onError={(err) => setNameError(err)}
    />

    <AnonymousCheckbox
      checked={isAnonymous}
      onChange={(checked) => setIsAnonymous(checked)}
    />

    <BirthdayMessageSection
      defaultExpanded={false}
      value={message}
      onChange={(val) => setMessage(val)}
      maxLength={500}
    >
      <MessageTextarea
        placeholder="Write a message for [Child]..."
        value={message}
        onChange={(val) => setMessage(val)}
      />
      <CharacterCounter current={message.length} max={500} />
      {showReminderModal && (
        <ReminderModal
          onClose={() => setShowReminderModal(false)}
          onSubmit={(email) => submitReminder(email)}
        />
      )}
    </BirthdayMessageSection>

    <ReminderLink
      onClick={() => setShowReminderModal(true)}
    >
      Remind me in 3 days 🔔
    </ReminderLink>

    <PrimaryCallToAction
      disabled={!isFormValid()}
      loading={isSubmitting}
      onClick={handleSubmit}
    >
      Continue to payment →
    </PrimaryCallToAction>

    <TrustBadge text="🔒 Payments secured by PayFast" />
  </FormContainer>

  {validationErrors && (
    <ErrorSummary errors={validationErrors} />
  )}
</ContributeAmountDetailsPage>
```

---

## 5. TypeScript Interfaces

```typescript
// Page Props
interface ContributeAmountDetailsPageProps {
  params: {
    slug: string;
  };
}

// Form Data
interface ContributionFormData {
  dreamboard_slug: string;
  amount: number;
  display_name?: string;
  is_anonymous: boolean;
  message?: string;
  email?: string;
  contributor_ip?: string;
  user_agent?: string;
}

// Component Props
interface AmountSelectorProps {
  options: (number | 'other')[];
  defaultValue: number;
  selectedAmount: number | 'other';
  onSelect: (amount: number | 'other') => void;
  onCustomAmount?: (amount: number) => void;
}

interface NameInputSectionProps {
  value: string;
  onChange: (name: string) => void;
  isHidden: boolean;
  onError: (error: string | null) => void;
}

interface AnonymousCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

interface BirthdayMessageSectionProps {
  value: string;
  onChange: (message: string) => void;
  maxLength: number;
  defaultExpanded?: boolean;
}

interface ReminderModalProps {
  onClose: () => void;
  onSubmit: (email: string) => Promise<void>;
}

interface PrimaryCallToActionProps {
  disabled: boolean;
  loading: boolean;
  onClick: () => Promise<void>;
  children: string;
}

// API Request/Response
interface SubmitContributionRequest {
  dreamboard_slug: string;
  amount: number;
  display_name?: string;
  is_anonymous: boolean;
  message?: string;
  email?: string;
}

interface SubmitContributionResponse {
  success: boolean;
  contribution_id: string;
  redirect_to: string; // /[slug]/contribute/payment
  session_token?: string;
}

interface ReminderRequest {
  dreamboard_slug: string;
  email: string;
}

interface ReminderResponse {
  success: boolean;
  reminder_id: string;
  message: string;
}

// Validation Errors
interface ValidationErrors {
  amount?: string;
  display_name?: string;
  message?: string;
  form?: string;
}
```

---

## 6. File Structure

```
src/
├── app/
│   └── [slug]/
│       └── contribute/
│           ├── page.tsx                    # Main form page
│           ├── layout.tsx
│           ├── error.tsx
│           └── loading.tsx
├── components/
│   └── contribute/
│       ├── ContributeAmountDetails/
│       │   ├── ContributeAmountDetails.tsx # Container
│       │   ├── AmountSelector.tsx
│       │   ├── NameInputSection.tsx
│       │   ├── AnonymousCheckbox.tsx
│       │   ├── BirthdayMessageSection.tsx
│       │   ├── ReminderLink.tsx
│       │   ├── ReminderModal.tsx
│       │   └── TrustBadge.tsx
│       └── shared/
│           ├── PrimaryCallToAction.tsx
│           └── ValidationErrors.tsx
├── lib/
│   ├── contribution.ts                    # Form submission logic
│   ├── validation.ts                      # Form validation rules
│   └── formatting.ts                      # Currency formatting
├── hooks/
│   ├── useContributionForm.ts             # Form state management
│   └── useValidation.ts                   # Validation logic
└── types/
    └── contribution.ts                    # TypeScript definitions
```

---

## 7. Data Fetching & Form Submission

### Form State Management (Client-side)
```typescript
// hooks/useContributionForm.ts
export function useContributionForm(slug: string) {
  const [formData, setFormData] = useState<ContributionFormData>({
    dreamboard_slug: slug,
    amount: 250,
    display_name: '',
    is_anonymous: false,
    message: '',
  });

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAmountChange = (amount: number | 'other') => {
    setFormData((prev) => ({
      ...prev,
      amount: typeof amount === 'number' ? amount : prev.amount,
    }));
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({ ...prev, display_name: name }));
    validateField('display_name', name);
  };

  const handleAnonymousChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_anonymous: checked,
      display_name: checked ? '' : prev.display_name,
    }));
  };

  const handleMessageChange = (message: string) => {
    if (message.length <= 500) {
      setFormData((prev) => ({ ...prev, message }));
    }
  };

  const validateField = (field: string, value: any) => {
    const errors = validateFormData({ ...formData, [field]: value });
    setValidationErrors(errors);
  };

  const isFormValid = () => {
    const errors = validateFormData(formData);
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitForm = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      const response = await submitContribution(formData);
      localStorage.setItem(`gifta_contribution_${slug}`, JSON.stringify({
        id: response.contribution_id,
        timestamp: Date.now(),
      }));
      window.location.href = response.redirect_to;
    } catch (error) {
      setValidationErrors({
        form: error instanceof Error ? error.message : 'Something went wrong',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    validationErrors,
    isSubmitting,
    handleAmountChange,
    handleNameChange,
    handleAnonymousChange,
    handleMessageChange,
    submitForm,
    isFormValid,
  };
}
```

### Form Validation
```typescript
// lib/validation.ts
export function validateFormData(
  data: ContributionFormData
): ValidationErrors {
  const errors: ValidationErrors = {};

  // Validate amount
  if (data.amount < 20 || data.amount > 10000) {
    errors.amount = 'Amount must be between R20 and R10,000';
  }

  // Validate display name (if not anonymous)
  if (!data.is_anonymous) {
    if (!data.display_name || data.display_name.trim().length < 2) {
      errors.display_name = 'Please enter a name (2-50 characters)';
    }
    if (data.display_name.length > 50) {
      errors.display_name = 'Name must be 50 characters or less';
    }
  }

  // Validate message (optional, but check length)
  if (data.message && data.message.length > 500) {
    errors.message = 'Message must be 500 characters or less';
  }

  return errors;
}
```

### API Submission
```typescript
// app/api/[slug]/contribute/amount-details/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { validateFormData } from '@/lib/validation';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const body = await req.json() as ContributionFormData;

  // Validate input
  const errors = validateFormData(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { success: false, errors },
      { status: 400 }
    );
  }

  // Fetch dreamboard
  const dreamboard = await db.dreamboard.findUnique({
    where: { slug: params.slug },
  });

  if (!dreamboard || !dreamboard.is_published) {
    return NextResponse.json(
      { error: 'Dreamboard not found' },
      { status: 404 }
    );
  }

  // Check if expired
  if (new Date() > dreamboard.expires_at) {
    return NextResponse.json(
      { error: 'This Dreamboard has closed' },
      { status: 410 }
    );
  }

  // Create pending contribution (no payment yet)
  const contribution = await db.contribution.create({
    data: {
      dreamboard_id: dreamboard.id,
      amount: body.amount,
      display_name: body.is_anonymous ? null : body.display_name,
      is_anonymous: body.is_anonymous,
      message: body.message || null,
      status: 'pending', // Waiting for payment
      email: body.email,
      created_at: new Date(),
    },
  });

  return NextResponse.json({
    success: true,
    contribution_id: contribution.id,
    redirect_to: `/${params.slug}/contribute/payment`,
  });
}
```

---

## 8. Responsive Behavior

### Mobile (375px - 767px)
- Full-width form, 16px horizontal padding
- Amount buttons: 2x2 grid, each 100% of column width
- Name input: 100% width, 48px height
- Message textarea: 100% width, 120px height
- Button: 100% width, 48px height
- Fonts: Body 14px, labels 12px

### Tablet (768px - 1023px)
- Form max-width 600px, centered
- Amount buttons: 4 columns if space, else 2x2
- Same spacing as mobile, slightly larger padding
- Fonts: Body 14px, labels 12px

### Desktop (1024px+)
- Form max-width 700px, left-aligned or centered
- Amount buttons: 4 columns side-by-side
- Spacing: 24px horizontal padding, 32px vertical gaps
- Fonts: Body 14px, labels 12px (same)
- Button: 60% width max 400px

---

## 9. Animations & Micro-interactions

### Page Load
- **Duration:** 0.3s fade-in
- **Effect:** Entire form fades in from bottom (translateY +10px)

### Name Field Show/Hide
- **Trigger:** Anonymous checkbox toggle
- **Duration:** 0.2s
- **Effect:** Slide up + fade out (hide), slide down + fade in (show)
- **Focus:** Auto-focus name input when revealed

### Message Textarea Expand/Collapse
- **Trigger:** Click "ADD A BIRTHDAY MESSAGE" or "Collapse"
- **Duration:** 0.3s
- **Effect:** Height transition, easing `ease-out`
- **Focus:** Auto-focus textarea when expanded

### Amount Button Selection
- **Duration:** 0.15s
- **Effect:** Border color + background change
- **No scale:** Avoid physical shift that confuses

### Button Click Feedback
- **Hover:** Border darkens, opacity slight increase
- **Active:** Scale 0.98, brief visual feedback
- **Loading:** Spinner appears, text fades to "Processing..."

### Error Messages
- **Duration:** 0.2s fade-in
- **Color:** Red-600, below affected field
- **Display:** As inline error text, not toast

### Success Toast (Reminder set)
- **Duration:** 3s auto-dismiss
- **Effect:** Slide up from bottom, fade in/out
- **Position:** Bottom-right on desktop, bottom on mobile

---

## 10. Accessibility (WCAG 2.1 AA)

### Keyboard Navigation
- **Tab order:** Back → Heading → Amount buttons → Custom amount → Name → Anonymous → Message → Reminder → Submit
- **Enter/Space:** Activate all buttons
- **Esc:** Close modals (reminder)

### Screen Reader Announcements
```typescript
// Amount selector
<fieldset>
  <legend>How much would you like to contribute?</legend>
  <button aria-pressed={selectedAmount === 150}>R150</button>
  <button aria-pressed={selectedAmount === 250}>R250, recommended</button>
</fieldset>

// Name input
<label htmlFor="display_name">
  Your name (as it will appear)
</label>
<input
  id="display_name"
  aria-invalid={!!nameError}
  aria-describedby={nameError ? "name_error" : undefined}
/>

// Anonymous checkbox
<input
  type="checkbox"
  aria-label="Keep my name private (Anonymous)"
  aria-checked={isAnonymous}
/>

// Message field
<label htmlFor="message">Add a birthday message (optional)</label>
<textarea
  id="message"
  aria-describedby="message_count"
/>
<span id="message_count" aria-live="polite">
  {message.length} of 500 characters
</span>
```

### Focus Indicators
- **Style:** 2px solid blue-500 outline, 2px offset
- **Visible:** Always on keyboard navigation
- **Color contrast:** >7:1 with background

### Color Contrast
- **Text-gray-900 on white:** 16.4:1 ✓
- **Sage (#6B9E88) on white:** 4.8:1 ✓
- **Text-gray-500 on white:** 7:1 ✓

### Form Labels
- **All inputs have labels** (not placeholders alone)
- **Labels visible:** 100% of time (not hidden)
- **Associated with `htmlFor`**

---

## 11. Error Handling

### Validation Errors (Client-side)
**Display:** Inline below field, red-600 text, 12px font

```
❌ Please enter a name (2-50 characters)
```

**Trigger:** On blur or submit attempt

### Amount Validation Error
- **Message:** "Amount must be between R20 and R10,000"
- **Display:** Below custom input or amount section
- **Disable submit:** Until resolved

### Name Validation Error
- **Message:** "Please enter a name (2-50 characters)"
- **Display:** Below name input
- **Hidden when:** Anonymous checked

### Message Character Limit
- **Hard limit:** Prevent typing beyond 500 chars
- **Warning:** At 400+ chars, show orange counter
- **At 490+ chars:** Show "You have [X] characters left" warning in red

### Network Error (Failed to submit)
**Display:** Error banner below form

```
Something went wrong. Please check your connection and try again.
[Retry button]
```

**Auto-retry:** No, require user action

### Dreamboard Expired
**Page load error:** Display message

```
Hmm, this Dreamboard has closed.
[Return to home]
```

**HTTP 410 Gone**

### Dreamboard Not Found
**Page load error:** 404 state

```
Dreamboard not found. It may have been deleted.
[Return to home]
```

---

## 12. Edge Cases

### Edge Case: User enters R0 or negative amount
- **Handling:** Validation error, "Must be R20 or more"
- **Prevent:** `input type="number"` min="20"

### Edge Case: Name field has 1000+ characters pasted
- **Handling:** Silently trim to 50 chars, show counter
- **Prevent:** HTML `maxlength="50"`

### Edge Case: Message pasted with line breaks
- **Handling:** Allow (preserve formatting), just count all chars
- **Display:** Textarea allows `\n`, show in message

### Edge Case: User toggles anonymous multiple times
- **Handling:** Remember last typed name in state
- **Restore:** If toggle off, show previous name

### Edge Case: User refreshes page mid-form
- **Handling:** Lose all data (form not saved to localStorage)
- **UX:** Acceptable (fast form, ~90 seconds)
- **Optional enhancement:** Save to localStorage on change

### Edge Case: "Other" selected, then R250 clicked
- **Handling:** Switch back to R250, clear custom input
- **State:** Clear `customAmount`, set `selectedAmount = 250`

### Edge Case: User closes reminder modal without email
- **Handling:** Dismiss modal, continue form
- **Optional:** Don't require email, it's a nice-to-have

### Edge Case: Reminder email invalid
- **Handling:** Show validation error in modal, prevent submit
- **Pattern:** Standard email regex validation

---

## 13. Testing Checklist

- [ ] Amount buttons toggle correctly (only one selected)
- [ ] Custom amount input only shows when "Other" selected
- [ ] Custom amount validates (R20-R10,000)
- [ ] Name field hidden when anonymous checked
- [ ] Name field shows/restores correctly when unchecked
- [ ] Message textarea expands on click
- [ ] Message character counter updates in real-time
- [ ] Message hard limit prevents typing >500 chars
- [ ] Reminder modal opens/closes correctly
- [ ] Reminder email validation works
- [ ] Submit button disabled until form valid
- [ ] Submit button shows loading state
- [ ] Form submission sends all data correctly
- [ ] Keyboard navigation works (Tab, Enter, Esc)
- [ ] Screen reader announces all fields and errors
- [ ] Focus indicators visible on all interactive elements
- [ ] Mobile layout stacks vertically
- [ ] Desktop layout shows proper spacing
- [ ] Error messages appear inline below fields
- [ ] Success toast shows after reminder set
- [ ] Back button navigates correctly

---

## 14. Success Metrics

- **Form abandonment rate:** <20% (target <10%)
- **Average time to complete:** <90 seconds
- **Message adoption rate:** >40% (write birthday messages)
- **Custom amount selection rate:** 20-30% (not just presets)
- **Anonymous selection rate:** 5-10%
- **Reminder signup rate:** 15-25%
- **Form validation errors:** <5% (smooth UX)
- **Mobile completion rate:** >85% (device parity with desktop)

