# CREATE FLOW STEP 3: THE DATES
## Gifta UX v2 Implementation Specification

**Document Version:** 1.0
**Route:** `/create/dates`
**Step Number:** 3 of 6
**Status:** Implementation-Ready

---

## 1. SCREEN OVERVIEW

### Purpose
Step 3 establishes the timeline for the Dreamboard campaign. This screen captures three date fields that determine when celebrations happen and when the contribution window closes. Smart defaults and a intuitive date picker make scheduling effortless.

### Route & File Structure
```
Route: /create/dates (GET, POST via server action)
Files:
  ├── src/app/(host)/create/dates/page.tsx (Main page component)
  ├── src/app/(host)/create/dates/layout.tsx (Optional nested layout)
  └── src/components/common/DatePicker.tsx (Reusable date picker)
```

### Layout Container
- **Component:** `CreateFlowShell`
- **Props:**
  - `stepLabel: "Step 3 of 6"`
  - `title: "When's the big day? 🎈"`
  - `subtitle: "Set the celebration dates."`
- **Wrapper:** Full-width section with max-w-5xl, px-6 py-12
- **Background:** #FEFDFB

### User Flow
1. User lands on `/create/dates` (redirects if gift step not completed)
2. Load existing draft dates if present
3. Set birthday date (required, future date)
4. Set party date (optional, >= birthday date)
5. Set campaign end date (optional, <= party date)
6. Smart defaults:
   - Birthday: User input required
   - Party date: Same as birthday (unless toggled)
   - Campaign end: Same as party date (auto-adjusts)
7. Click "Continue to giving back"
8. Server validates all dates
9. On success: Save draft and redirect to `/create/giving-back`
10. On error: Show error banner and allow retry

---

## 2. PROGRESS INDICATOR

### Step Indicator Component
- **Type:** `WizardStepIndicatorCompact` on mobile (< 768px)
- **Type:** `WizardStepIndicator` on desktop (>= 768px)
- **Current Step:** 3 (filled circle with "3")
- **Previous Steps:** 1, 2 (filled circles with checkmarks ✓)
- **Upcoming Steps:** 4, 5, 6 (hollow circles)

### Compact Variant (Mobile)
```
Step 3 of 6                The Dates
[████████████░░░░░░░░░░░░] 50%
```

### Full Variant (Desktop)
```
✓ ─────── ✓ ─────── ● ─────── ○ ─────── ○ ─────── ○
The Child The Gift The Dates Giving Back Payout Review
```

---

## 3. VISUAL LAYOUT

### Mobile Layout (< 768px)
```
┌─────────────────────────────────────────────┐
│ STEP 3 OF 6                                 │
│ When's the big day? 🎈                     │
│ Set the celebration dates.                  │
│                                             │
│ [████████████░░░░░░░░░░░░░░░░░] 50%       │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ [Error banner if validation failed]   │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ Birthday date (required)              │  │
│ │ [📅 12 June 2024    ]                 │  │
│ │                                       │  │
│ │ ☐ Party is on a different day        │  │
│ │   (optional - if not checked,        │  │
│ │    party = birthday)                 │  │
│ │                                       │  │
│ │ [If checked:                          │  │
│ │  Party date (optional)                │  │
│ │  [📅 12 June 2024    ]                │  │
│ │                                       │  │
│ │  Campaign end date (optional)         │  │
│ │  [📅 12 June 2024    ]                │  │
│ │  (Must be <= party date)              │  │
│ │ ]                                     │  │
│ │                                       │  │
│ │ Time until your campaign closes:      │  │
│ │ 42 days from today                    │  │
│ │                                       │  │
│ │ [Continue to giving back ] (full w)   │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ ← Back                                      │
└─────────────────────────────────────────────┘
```

### Tablet Layout (768px - 1024px)
```
┌──────────────────────────────────────────────────────────┐
│ STEP 3 OF 6                                              │
│ When's the big day? 🎈                                 │
│ Set the celebration dates.                              │
│                                                          │
│ ✓ ─── ✓ ─── ● ─── ○ ─── ○ ─── ○                       │
│ The Child The Gift The Dates Giving Back Payout Review │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ [Error banner if validation failed]                │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Birthday date (required)                           │  │
│ │ [📅 12 June 2024            ]                      │  │
│ │                                                    │  │
│ │ ☐ Party is on a different day                     │  │
│ │                                                    │  │
│ │ [If checked:                                       │  │
│ │   ┌──────────────┐  ┌───────────────────────────┐ │  │
│ │   │ Party date   │  │ Campaign end date         │ │  │
│ │   │ [📅 12 Jun]  │  │ [📅 12 June 2024      ]  │ │  │
│ │   └──────────────┘  └───────────────────────────┘ │  │
│ │ ]                                                  │  │
│ │                                                    │  │
│ │ Time until campaign closes: 42 days from today    │  │
│ │                                                    │  │
│ │ [Continue to giving back                 ]        │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Desktop Layout (>= 1024px)
```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 3 OF 6                                                      │
│ When's the big day? 🎈                                         │
│ Set the celebration dates.                                      │
│                                                                  │
│ ✓ ─────── ✓ ─────── ● ─────── ○ ─────── ○ ─────── ○           │
│ The Child The Gift The Dates Giving Back Payout Setup Review  │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ [Error banner if validation failed]                          ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Birthday date (required)                                     ││
│ │ [📅 12 June 2024                              ]              ││
│ │                                                              ││
│ │ ☐ Party is on a different day                              ││
│ │   Check this if the party is on a different date than      ││
│ │   the birthday. The campaign will close on the party date. ││
│ │                                                              ││
│ │ [If checked:                                                ││
│ │   ┌─────────────────────────┐  ┌─────────────────────────┐ ││
│ │   │ Party date              │  │ Campaign end date       │ ││
│ │   │ [📅 14 June 2024    ]   │  │ [📅 14 June 2024    ]   │ ││
│ │   └─────────────────────────┘  └─────────────────────────┘ ││
│ │ ]                                                            ││
│ │                                                              ││
│ │ Time until campaign closes:                                 ││
│ │ 42 days from today (gives you plenty of time to collect!)  ││
│ │                                                              ││
│ │ [Continue to giving back                             ]      ││
│ └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. FIELD SPECIFICATIONS

### Field 1: Birthday Date

**Label:** "Birthday date"
**Input Type:** Date picker (`<input type="date">`) with modal calendar
**HTML Name Attribute:** `birthdayDate`
**Required:** Yes
**Format:** YYYY-MM-DD (ISO 8601) internally, displayed as "12 June 2024" for user
**Min Date:** Today (current date)
**Max Date:** 10 years from today (configurable)
**Placeholder Display:** "Select a date..."

**Tailwind Classes:**
```
Input: rounded-xl border-[#E7E5E4] focus:ring-primary/30 focus:border-primary
  h-11 px-4 py-2 bg-white text-text placeholder-text-muted
  transition-all duration-200

Calendar Icon:
  Position: Left side of input
  Color: primary (#0D9488)
  Size: 20px × 20px
```

**Validation Rules (Zod Schema):**
```typescript
birthdayDate: z
  .string()
  .refine((date) => {
    const d = new Date(date);
    return d >= startOfToday() && d <= addYears(new Date(), 10);
  }, 'Birthday must be in the future (within 10 years)')
```

**Error Messages:**
- Required: "Birthday date is required"
- In past: "Birthday must be in the future"
- Too far in future: "Birthday must be within 10 years"

**Default Value:** Load from draft or empty: `draft?.birthdayDate ?? ""`

**Date Picker Behavior:**
- Click input: Opens calendar modal
- Calendar shows current month
- Previous/Next month arrows enabled/disabled based on min/max dates
- Today's date highlighted in subtle color
- All past dates disabled (grayed out, non-clickable)
- Click date: Closes modal, updates input, formats as "12 June 2024"
- Keyboard: Arrow keys navigate dates, Enter selects, Escape closes
- Mobile: Native date picker via `<input type="date">`

**Accessibility:**
- `<label htmlFor="birthdayDate">` with `text-sm font-medium text-text`
- `aria-required="true"`
- `aria-label="Birthday date, use calendar to select"`
- Modal calendar: `role="dialog"` with `aria-label="Select birthday date"`
- Today button: "Today" link with `aria-label="Jump to today"`
- Month/year navigation: `aria-label="Previous month" / "Next month"`
- Date cells: `role="button"` with `aria-label="June 12, 2024"` and `aria-current="date"` for today
- Screen reader: "Edit birthday date, required, use calendar to select"

---

### Field 2: Party Checkbox (Conditional Disclosure)

**Label:** "Party is on a different day"
**Input Type:** Checkbox (`<input type="checkbox">`)
**HTML Name Attribute:** `partyIsDifferent`
**Default:** Unchecked (false)
**Behavior:** Reveals party date and campaign end date fields when checked

**Tailwind Classes (Checkbox):**
```
Checkbox: w-5 h-5 rounded accent-primary border-border
  checked:bg-primary checked:border-primary
  focus:ring-primary/30 cursor-pointer
  transition-colors duration-200
```

**Helper Text:**
"Check this if the party is on a different date than the birthday. The campaign will close on the party date."

**Accessibility:**
- `<label htmlFor="partyIsDifferent">` clickable
- `aria-controls="partyDateSection"` to link to revealed section
- Label text clickable: Entire label is a click target (> 44px touch area)
- Screen reader: "Checkbox: Party is on a different day"

**JavaScript Behavior:**
- Show/hide party date and campaign end date fields based on checkbox state
- Animated reveal with fade-in (0.3s)
- If unchecked, clear party date and campaign end date fields
- Validation adjusts based on checkbox state

---

### Field 3: Party Date (Conditional)

**Label:** "Party date"
**Visibility:** Only shown if "Party is on a different day" checkbox is checked
**Input Type:** Date picker
**HTML Name Attribute:** `partyDate`
**Required:** Only if checkbox checked
**Format:** YYYY-MM-DD internally, "14 June 2024" for display
**Min Date:** Birthday date (calculated from Field 1)
**Max Date:** 30 days after birthday (or same as campaign end if set)

**Validation Rules (Zod Schema):**
```typescript
partyDate: z
  .string()
  .optional()
  .refine((date) => {
    if (!partyIsDifferent) return true; // Not required if checkbox unchecked
    return date && new Date(date) >= new Date(birthdayDate);
  }, 'Party date must be on or after the birthday')
```

**Error Messages:**
- Required if checkbox checked: "Party date is required"
- Before birthday: "Party date must be on or after the birthday"
- After campaign end: "Party date must be before or on the campaign end date"

**Default Value:** Load from draft or empty: `draft?.partyDate ?? ""`

**Accessibility:**
- `<label htmlFor="partyDate">`
- `aria-required={partyIsDifferent}` (required only if checkbox checked)
- `aria-describedby="partyDate-error"` if error
- Screen reader: "Party date, date picker, required if party is different from birthday"

---

### Field 4: Campaign End Date (Conditional)

**Label:** "Campaign end date"
**Visibility:** Only shown if "Party is on a different day" checkbox is checked
**Input Type:** Date picker
**HTML Name Attribute:** `campaignEndDate`
**Required:** Only if checkbox checked
**Format:** YYYY-MM-DD internally, "15 June 2024" for display
**Min Date:** Party date (or birthday if party date not set)
**Max Date:** 60 days after birthday
**Smart Default:** Same as party date (auto-updates when party date changes)

**Validation Rules (Zod Schema):**
```typescript
campaignEndDate: z
  .string()
  .optional()
  .refine((date) => {
    if (!partyIsDifferent) return true;
    const partyDateObj = new Date(partyDate || birthdayDate);
    return date && new Date(date) >= partyDateObj;
  }, 'Campaign end date must be on or after the party date')
```

**Error Messages:**
- Required if checkbox checked: "Campaign end date is required"
- Before party date: "Campaign end date must be on or after the party date"
- Too far in future: "Campaign end date must be within 60 days of birthday"

**Default Value:** Auto-set to party date value: `partyDate || birthdayDate`

**Accessibility:**
- `<label htmlFor="campaignEndDate">`
- `aria-required={partyIsDifferent}`
- `aria-describedby="campaignEndDate-error"` if error
- Screen reader: "Campaign end date, date picker, required if party is different"

---

### Field 5: Campaign Duration Display (Informational)

**Label:** "Time until campaign closes:"
**Display Type:** Calculated text (not an input)
**Formula:** `Math.floor((campaignEndDate - today) / (1000 * 60 * 60 * 24))` days
**Format:** "{X} days from today"

**Example Values:**
- 42 days: "Time until campaign closes: 42 days from today"
- 1 day: "Time until campaign closes: 1 day from today (Closes tomorrow!)"
- 0 days: "Time until campaign closes: Campaign closes today"

**Helper Copy:**
"(gives you plenty of time to collect!)"

**Responsive Sizing:**
- Mobile: Full width, text-base
- Desktop: Inline with padding, text-sm

**Update Behavior:**
- Recalculate whenever any date field changes
- Animated update: Fade out, fade in with new value
- Show warning if < 7 days remaining

---

## 5. INTERACTIVE BEHAVIORS

### Form Submission Flow

**Submit Handler:** `saveDatesAction` (server action)

**Pre-submission Validations:**
1. Birthday date required and valid (future, within 10 years)
2. If party checkbox checked:
   a. Party date must be >= birthday date
   b. Campaign end date must be >= party date
3. Campaign end date must be <= party date (or birthday if no party date)
4. Show error banner if any validation fails
5. Disable submit button until all valid

**Submission Process:**
```typescript
async function saveDatesAction(formData: FormData) {
  'use server';

  // 1. Authenticate and get draft
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);

  // 2. Check previous steps completed
  if (!draft?.giftImageUrl) {
    redirect('/create/gift');
  }

  // 3. Extract form fields
  const birthdayDate = formData.get('birthdayDate');
  const partyIsDifferent = formData.get('partyIsDifferent') === 'on';
  const partyDate = formData.get('partyDate');
  const campaignEndDate = formData.get('campaignEndDate');

  // 4. Determine final dates
  const finalPartyDate = partyIsDifferent && partyDate ? partyDate : birthdayDate;
  const finalCampaignEndDate = campaignEndDate || finalPartyDate;

  // 5. Validate via Zod
  const result = datesSchema.safeParse({
    birthdayDate,
    partyDate: finalPartyDate,
    campaignEndDate: finalCampaignEndDate,
  });

  if (!result.success) {
    redirect('/create/dates?error=invalid');
  }

  // 6. Save to draft
  await updateDreamBoardDraft(session.hostId, {
    birthdayDate: result.data.birthdayDate,
    partyDate: result.data.partyDate,
    campaignEndDate: result.data.campaignEndDate,
  });

  // 7. Redirect to next step
  redirect('/create/giving-back');
}
```

**Error Handling:**
- Parse error from URL searchParams
- Map error code to user-friendly message
- Show in red banner at top of card
- Clear error on input focus

**Zod Schema:**
```typescript
const datesSchema = z.object({
  birthdayDate: z
    .string()
    .refine(
      (date) => {
        const d = new Date(date);
        return d >= startOfToday() && d <= addYears(new Date(), 10);
      },
      'Birthday must be in the future (within 10 years)'
    ),
  partyDate: z
    .string()
    .refine(
      (date) => new Date(date) >= new Date(birthdayDate),
      'Party date must be on or after the birthday'
    ),
  campaignEndDate: z
    .string()
    .refine(
      (date) => new Date(date) >= new Date(partyDate || birthdayDate),
      'Campaign end date must be on or after the party date'
    ),
});
```

### Conditional Field Visibility

**Checkbox State Management:**
```typescript
const [partyIsDifferent, setPartyIsDifferent] = useState(false);

// Show/hide fields with animation
{partyIsDifferent && (
  <motion.div
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: 'auto' }}
    exit={{ opacity: 0, height: 0 }}
    transition={{ duration: 0.3 }}
  >
    {/* Party date and campaign end date fields */}
  </motion.div>
)}
```

### Date Picker Interactions

**On Input Click:**
1. Focus input
2. Open calendar modal
3. Show month/year header
4. Display calendar grid
5. Highlight today
6. Disable past dates

**Keyboard Navigation:**
- **Tab:** Move to next date (today or first enabled)
- **Shift+Tab:** Move to previous date
- **Arrow keys:** Move between dates (up/down/left/right)
- **Page Up/Down:** Previous/next month
- **Home/End:** First/last date of month
- **Enter/Space:** Select focused date
- **Escape:** Close modal

**Date Selection:**
1. User clicks date or presses Enter
2. Update input value
3. Format as "12 June 2024"
4. Store ISO format in FormData
5. Close modal
6. Move focus back to input
7. Recalculate campaign duration
8. Trigger dependent field updates (e.g., party date min becomes birthday)

### Campaign Duration Display

**Real-Time Update:**
- Recalculate whenever birthdayDate, partyDate, or campaignEndDate changes
- Animated number update (fade out/in)
- Format: "{X} days from today"
- Update helper copy based on days remaining:
  - >= 30: "gives you plenty of time to collect!"
  - 14-29: "good timeframe to gather contributions"
  - 7-13: "approaching deadline"
  - < 7: "ending soon!" (with warning icon)

---

## 6. COMPONENT TREE

```
<CreateDatesPage> (Page Component)
├── Redirect handlers (auth, flow validation)
├── Data loading (getDreamBoardDraft)
├── Error resolution
│
└── <CreateFlowShell>
    ├── Header
    │
    └── <Card>
        ├── <CardHeader>
        │   ├── <CardTitle> "Celebration dates"
        │   └── <CardDescription> "When's the big day?"
        │
        └── <CardContent className="space-y-6">
            ├── {errorMessage && (
            │     <ErrorBanner />
            │   )}
            │
            └── <form action={saveDatesAction}>
                ├── <FormField>
                │   ├── <label htmlFor="birthdayDate">
                │   ├── <DatePickerInput
                │   │   id="birthdayDate"
                │   │   name="birthdayDate"
                │   │   value={birthdayDate}
                │   │   onChange={setBirthdayDate}
                │   │   minDate={today}
                │   │   maxDate={addYears(today, 10)}
                │   │ />
                │   └── {error && <ErrorMessage />}
                │
                ├── <FormField className="flex items-center gap-2">
                │   ├── <input
                │   │   type="checkbox"
                │   │   id="partyIsDifferent"
                │   │   name="partyIsDifferent"
                │   │   checked={partyIsDifferent}
                │   │   onChange={(e) => setPartyIsDifferent(e.target.checked)}
                │   │ />
                │   ├── <label htmlFor="partyIsDifferent">
                │   │   Party is on a different day
                │   │ </label>
                │   └── <p className="text-xs text-text-muted">
                │       Check this if the party is on...
                │     </p>
                │
                ├── {partyIsDifferent && (
                │     <motion.div>
                │       <FormField>
                │         ├── <label htmlFor="partyDate">
                │         └── <DatePickerInput ... />
                │       </FormField>
                │       <FormField>
                │         ├── <label htmlFor="campaignEndDate">
                │         └── <DatePickerInput ... />
                │       </FormField>
                │     </motion.div>
                │   )}
                │
                ├── <div className="info-box">
                │   <p>
                │     Time until campaign closes: <strong>{daysRemaining} days</strong>
                │   </p>
                │   <p className="text-sm text-text-muted">
                │     (gives you plenty of time to collect!)
                │   </p>
                │ </div>
                │
                └── <Button type="submit">
                    Continue to giving back
                  </Button>
```

---

## 7. TYPESCRIPT INTERFACES & SCHEMAS

### Props Interface

```typescript
interface CreateDatesPageProps {
  searchParams?: DatesSearchParams;
}

interface DatesSearchParams {
  error?: string;
}
```

### Form Data Types

```typescript
interface DatesFormData {
  birthdayDate: string; // ISO 8601 format YYYY-MM-DD
  partyDate: string; // ISO 8601 format YYYY-MM-DD
  campaignEndDate: string; // ISO 8601 format YYYY-MM-DD
}

interface DatesDraft {
  birthdayDate: string;
  partyDate: string;
  campaignEndDate: string;
  updatedAt: Date;
}
```

### Zod Schemas

```typescript
const datesSchema = z.object({
  birthdayDate: z
    .string()
    .refine(
      (date) => {
        const d = new Date(date);
        return d >= startOfToday() && d <= addYears(new Date(), 10);
      },
      'Birthday must be in the future (within 10 years)'
    ),
  partyDate: z
    .string()
    .refine(
      (date, ctx) => {
        if (!ctx.data.birthdayDate) return false;
        return new Date(date) >= new Date(ctx.data.birthdayDate);
      },
      'Party date must be on or after the birthday'
    ),
  campaignEndDate: z
    .string()
    .refine(
      (date, ctx) => {
        const partyDate = ctx.data.partyDate || ctx.data.birthdayDate;
        return new Date(date) >= new Date(partyDate);
      },
      'Campaign end date must be on or after the party date'
    ),
});

type DatesFormPayload = z.infer<typeof datesSchema>;
```

### Error Messages

```typescript
const datesErrorMessages: Record<string, string> = {
  invalid: 'Please check your dates. Birthday must be in the future.',
  invalid_party_date: 'Party date must be on or after the birthday.',
  invalid_campaign_end: 'Campaign end date must be on or after the party date.',
  birthday_required: 'Birthday date is required.',
  birthday_in_past: 'Birthday must be in the future.',
  birthday_too_far: 'Birthday must be within 10 years from today.',
};
```

---

## 8. FILE STRUCTURE

```
src/
├── app/
│   └── (host)/
│       └── create/
│           └── dates/
│               ├── page.tsx (Main page component, server action)
│               ├── layout.tsx (Optional nested layout)
│               └── error.tsx (Optional error boundary)
│
├── components/
│   ├── layout/
│   │   ├── CreateFlowShell.tsx
│   │   └── WizardStepIndicator.tsx
│   ├── common/
│   │   ├── DatePicker.tsx (Reusable date picker with modal)
│   │   ├── DatePickerInput.tsx (Input with calendar icon)
│   │   └── CalendarModal.tsx (Modal calendar grid)
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── checkbox.tsx
│       └── modal.tsx
│
└── lib/
    ├── dream-boards/
    │   └── draft.ts (getDreamBoardDraft, updateDreamBoardDraft)
    ├── auth/
    │   └── clerk-wrappers.ts (requireHostAuth)
    ├── date-utils.ts (Date formatting, validation helpers)
    └── observability/
        └── logger.ts
```

---

## 9. SERVER ACTIONS

### `saveDatesAction`

**Purpose:** Validate date fields, save to draft, redirect to next step

**Input:** FormData from form submission

**Process:**
1. Authenticate user
2. Load existing draft
3. Verify previous steps completed (gift step)
4. Extract and parse date fields
5. Determine final dates based on checkbox state
6. Validate via Zod schema
7. Save to database
8. Redirect to next step or error page

**Validation:**
- Birthday date: Required, future, within 10 years
- Party date: Required if checkbox checked, >= birthday
- Campaign end date: Required if checkbox checked, >= party date

**Redirect Logic:**
```
Success:
  redirect('/create/giving-back')

Errors:
  redirect('/create/dates?error=invalid')          // Zod validation failed
  redirect('/create/dates?error=invalid_dates')    // Date logic error
  redirect('/create/gift')                         // Gift step not completed
  redirect('/auth/login')                          // Session expired
```

---

## 10. STATE MANAGEMENT

### Draft Persistence

**What's Stored:**
- `birthdayDate` (ISO string YYYY-MM-DD)
- `partyDate` (ISO string YYYY-MM-DD)
- `campaignEndDate` (ISO string YYYY-MM-DD)
- `updatedAt` (ISO timestamp)

**Where It's Stored:**
- Primary: Database (dream_boards table, `draft_data` JSONB)
- Session: Form state (React state or hidden fields)
- Duration: Until published or 30 days

**Loading Draft:**
```typescript
const draft = await getDreamBoardDraft(session.hostId);
const birthdayDate = draft?.birthdayDate ?? '';
```

**Saving Draft:**
```typescript
await updateDreamBoardDraft(session.hostId, {
  birthdayDate: result.data.birthdayDate,
  partyDate: result.data.partyDate,
  campaignEndDate: result.data.campaignEndDate,
});
```

### Client-Side State

```typescript
const [birthdayDate, setBirthdayDate] = useState(draft?.birthdayDate ?? '');
const [partyIsDifferent, setPartyIsDifferent] = useState(!!draft?.partyDate);
const [partyDate, setPartyDate] = useState(draft?.partyDate ?? birthdayDate);
const [campaignEndDate, setCampaignEndDate] = useState(
  draft?.campaignEndDate ?? partyDate || birthdayDate
);
const [daysRemaining, setDaysRemaining] = useState(
  calculateDaysRemaining(campaignEndDate)
);

// Update daysRemaining when campaignEndDate changes
useEffect(() => {
  setDaysRemaining(calculateDaysRemaining(campaignEndDate));
}, [campaignEndDate]);
```

---

## 11. RESPONSIVE DESIGN

### Breakpoints

**Mobile (< 768px):**
- Full-width date inputs
- Stacked layout
- Single column
- Native date picker on mobile devices
- Button: full width, h-11

**Tablet (768px - 1024px):**
- Full-width date inputs
- Conditional fields stacked
- Could use 2-column for party date + campaign end (optional)
- Button: auto width

**Desktop (>= 1024px):**
- Max-width card (600px)
- 2-column layout for party date + campaign end (when shown)
- Button: auto width

### Touch & Accessibility

**Minimum Touch Targets:** 44x44px
- Date input fields: h-11 (44px)
- Calendar dates: 40x40px (minimum)
- Checkbox: 20x20px (label extends target to 44x44px)
- Buttons: h-11 or h-14

**Spacing:**
- Field gaps: gap-6 (24px)
- Card padding: px-6 py-8 (mobile), px-8 py-10 (desktop)
- Label to input: 2 (8px)

---

## 12. ANIMATIONS & TRANSITIONS

### Entry Animation

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

.card {
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

### Conditional Field Reveal

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

.conditional-fields {
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Calendar Modal

```css
@keyframes modalFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.calendar-modal {
  animation: modalFadeIn 0.2s ease-out;
}

@keyframes scaleIn {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

.modal-content {
  animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Date Selection Feedback

```css
.date-selected {
  animation: pulse 0.4s ease-out;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}
```

### Campaign Duration Update

```css
@keyframes fadeInOut {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}

.duration-updated {
  animation: fadeInOut 0.4s ease-in-out;
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
<label for="birthdayDate" class="text-sm font-medium text-text">
  Birthday date
</label>
<input id="birthdayDate" name="birthdayDate" type="date" required />

<!-- Error association -->
<input
  aria-describedby="birthdayDate-error"
  aria-invalid={hasError}
/>
{hasError && (
  <span id="birthdayDate-error" role="alert">
    {errorMessage}
  </span>
)}
```

### ARIA Attributes

```html
<!-- Date inputs -->
<input aria-required="true" aria-label="Birthday date" />
<input aria-required="partyIsDifferent" aria-label="Party date" />

<!-- Checkbox -->
<input
  type="checkbox"
  aria-controls="conditional-fields"
  aria-label="Party is on a different day"
/>

<!-- Modal calendar -->
<dialog role="dialog" aria-label="Select birthday date" aria-modal="true">
  <h2 id="calendar-title">June 2024</h2>
  <button aria-label="Previous month">‹</button>
  <button aria-label="Next month">›</button>

  <!-- Date grid -->
  <div role="group" aria-label="Select date">
    <button role="button" aria-label="12 June 2024">12</button>
  </div>
</dialog>

<!-- Campaign duration -->
<div aria-live="polite" aria-atomic="true">
  Time until campaign closes: <strong>42 days from today</strong>
</div>

<!-- Error messages -->
<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

### Keyboard Navigation

**Tab Order:**
1. Birthday date input
2. Party checkbox
3. Party date input (if visible)
4. Campaign end date input (if visible)
5. Continue button
6. Back link

**Keyboard in Calendar Modal:**
- **Arrow keys:** Navigate dates
- **Page Up/Down:** Previous/next month
- **Home/End:** First/last date of month
- **Enter/Space:** Select date
- **Escape:** Close modal

**Screen Reader Experience:**

**Page Load:**
"Page loaded: Create Dreamboard, Step 3 of 6, The Dates. Form requires birthday date."

**Birthday Field Focus:**
"Edit birthday date, date, required, use calendar modal to select"

**Checkbox Focus:**
"Checkbox: Party is on a different day, not checked"

**On Checkbox Check:**
"Region updated: Party date and campaign end date fields are now visible"

**Calendar Modal:**
"Dialog: Select birthday date. June 2024. Use arrow keys to navigate dates, Enter to select."

**Error Message:**
"Alert: Birthday must be in the future"

### Color Contrast

- Text on background: >= 4.5:1 (WCAG AA)
- Disabled dates in calendar: >= 3:1 (WCAG AA)
- Primary button text: >= 4.5:1 (WCAG AA)
- Error text (#DC2626): >= 4.5:1 (WCAG AA)

### Visual Indicators (not color-only)

- Required fields: `*` asterisk + `aria-required="true"`
- Errors: Icon + text + border color
- Calendar today: Circle outline + bold text
- Selected date: Filled background + white text
- Disabled dates: Grayed out text + lower opacity

---

## 14. ERROR HANDLING

### Validation Errors

**Client-Side:**
```typescript
const validateBirthdayDate = (date: string): string | null => {
  if (!date) return "Birthday date is required";
  const d = new Date(date);
  if (d < startOfToday()) return "Birthday must be in the future";
  if (d > addYears(new Date(), 10)) return "Birthday must be within 10 years";
  return null;
};
```

**Server-Side:**
```typescript
const result = datesSchema.safeParse({
  birthdayDate,
  partyDate: finalPartyDate,
  campaignEndDate: finalCampaignEndDate,
});

if (!result.success) {
  redirect('/create/dates?error=invalid_dates');
}
```

### Error Messages

```
invalid         → "Please check your dates. Birthday must be in the future."
invalid_dates   → "Date validation failed. Please review and try again."
birthday_past   → "Birthday must be in the future."
birthday_far    → "Birthday must be within 10 years from today."
party_before_bd → "Party date must be on or after the birthday."
campaign_before → "Campaign end date must be on or after the party date."
```

### Error Recovery

**Transient Errors (network):**
1. Show error banner
2. Keep form data intact
3. Allow immediate retry

**Permanent Errors (validation):**
1. Show error banner with explanation
2. Highlight affected field(s)
3. Clear error on field focus
4. Allow correction and resubmit

**Fatal Errors (auth, session):**
1. Redirect to login
2. Return to `/create/dates` after auth

---

## 15. EDGE CASES

### Case 1: Draft Already Exists

**Scenario:** User navigates back to `/create/dates`

**Behavior:**
- Load all dates from draft
- Pre-populate all fields
- Show party checkbox checked if partyDate differs from birthdayDate
- Show conditional fields if checkbox was checked
- Allow modification and re-save

### Case 2: Birthday Today

**Scenario:** User tries to set birthday to today

**Behavior:**
- Validation fails: "Birthday must be in the future"
- Show error message
- Today's date disabled in calendar (grayed out, non-clickable)

### Case 3: Leap Year Edge Case

**Scenario:** User selects February 29

**Behavior:**
- Allow February 29 (valid date)
- Store as "2025-02-29" (if 2025 is leap year) or adjusted
- Display as "29 February 2025"
- Handle gracefully for non-leap years

### Case 4: Campaign Duration Very Long

**Scenario:** User sets birthday 10 years in future

**Behavior:**
- Allow (within validation max)
- Campaign duration: 3650+ days
- Display: "3650+ days from today"
- Helper copy: "You have plenty of time to gather contributions!"

### Case 5: Campaign Closes Tomorrow

**Scenario:** Party date set to tomorrow

**Behavior:**
- Allow (valid date)
- Display: "Time until campaign closes: 1 day from today (Closes tomorrow!)"
- Show warning icon (optional)
- Suggest extending if needed

### Case 6: Party Date Same as Birthday

**Scenario:** User checks "Party is on a different day" but sets same date as birthday

**Behavior:**
- Allow (valid configuration)
- Campaign end date defaults to party date
- Show: "0 days between birthday and party"
- Display: "Time until campaign closes: {X} days from today"

### Case 7: Very Old Phone Browser

**Scenario:** Mobile browser without native date picker support

**Behavior:**
- Fallback to text input with format hint: "YYYY-MM-DD"
- Or provide custom date picker component
- Calendar modal always available (non-native)
- Validation handles both formats

### Case 8: Timezone Edge Cases

**Scenario:** User in UTC+2, sets birthday for "tomorrow" at midnight UTC

**Behavior:**
- Handle timezone consistently (store as ISO date without time)
- Validate against local "today" (using `startOfToday()`)
- Display in user's local timezone
- Compare dates as dates only (ignore time)

### Case 9: User Session Expires During Form

**Scenario:** User fills dates, session expires before submission

**Behavior:**
- Form submission fails with 401 auth error
- Redirect to login
- After login, redirect to `/create/dates`
- Draft dates still there (server-side persisted)

### Case 10: Rapid Form Submission

**Scenario:** User clicks Continue button multiple times

**Behavior:**
- Button disabled on first click
- Show loading state
- Ignore subsequent clicks
- Only one submission sent to server

---

## 16. COMPONENT CODE REFERENCE

### Page Component Structure

```typescript
// src/app/(host)/create/dates/page.tsx

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { DatePickerInput } from '@/components/common/DatePickerInput';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft, updateDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const datesSchema = z.object({
  birthdayDate: z.string().refine(...),
  partyDate: z.string().refine(...),
  campaignEndDate: z.string().refine(...),
});

async function saveDatesAction(formData: FormData) {
  'use server';
  // Implementation as per spec
}

export default async function CreateDatesPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  // Implementation as per spec
}
```

---

## SUMMARY

This specification provides complete details for implementing Step 3 (The Dates) of Gifta's Create Flow. The page establishes campaign timeline with smart date picking and conditional fields. Key features:

- **Smart Defaults:** Campaign ends on party date automatically
- **Conditional Disclosure:** Party date/campaign end only shown if needed
- **Real-Time Feedback:** Campaign duration updates as dates change
- **Enterprise-Grade:** Full accessibility, robust validation, error recovery
- **Mobile-First:** Native date pickers on mobile, custom calendars as fallback
- **Comprehensive:** Edge case handling, timezone awareness, robust error messages

Ready for implementation by an AI agent using Next.js, React, TypeScript, Tailwind CSS, date-fns library, and Zod validation.

