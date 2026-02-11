# CREATE FLOW STEP 4: GIVING BACK
## Gifta UX v2 Implementation Specification

**Document Version:** 1.0
**Route:** `/create/giving-back`
**Step Number:** 4 of 6
**Status:** Runtime-aligned with goal-model notes

---

## Runtime Alignment (2026-02-11)

- Runtime source: `src/app/(host)/create/giving-back/page.tsx`, `src/app/(host)/create/giving-back/actions.ts`, `src/lib/charities/service.ts`.
- Charity split logic in runtime is contribution-based:
  - Percentage split: 5% to 50% of each contribution.
  - Threshold split: fixed R50 to R500 total charity allocation cap.
- Host create flow does not collect goal amount; any references below to “% of goal amount” are historical wording and should be interpreted as contribution-based split behavior.
- If no active charities exist, runtime shows an informational state and allows continuing without charity.

## 1. SCREEN OVERVIEW

### Purpose
Step 4 introduces Gifta's charitable giving feature, allowing parents to optionally direct a portion of contributions to causes they care about. This screen balances optional giving with simplicity: gift comes first, charitable impact is a bonus. Smart defaults (OFF) ensure this doesn't impede flow.

### Route & File Structure
```
Route: /create/giving-back (GET, POST via server action)
Files:
  ├── src/app/(host)/create/giving-back/page.tsx (Main page)
  ├── src/app/(host)/create/giving-back/layout.tsx (Optional)
  ├── src/components/charity/CharitySelector.tsx (Charity picker)
  ├── src/components/charity/CharitySplitInput.tsx (Split controls)
  └── lib/integrations/charity-api.ts (Charity data service)
```

### Layout Container
- **Component:** `CreateFlowShell`
- **Props:**
  - `stepLabel: "Step 4 of 6"`
  - `title: "Want to share the love? 💚"`
  - `subtitle: "Help a cause while celebrating [Child]."`
- **Wrapper:** Full-width max-w-5xl, px-6 py-12
- **Background:** #FEFDFB

### User Flow
1. User lands on `/create/giving-back` (redirects if dates not set)
2. Load existing draft (charity selection if any)
3. Default: Toggle is OFF (no charity sharing)
4. If toggle ON:
   - Display charity selector (6 categories, logos, descriptions)
   - Select one charity
   - Choose split type: Percentage (5-50%) or Fixed amount first (R50-R500)
   - Adjust split value with slider or input
   - Preview split: "We'll give R100 to [Charity] and R499 to Sophie's gift"
5. Click "Continue to payout setup"
6. Server saves charity selection (or none)
7. Redirect to `/create/payout`

---

## 2. PROGRESS INDICATOR

### Step Indicator Component
- **Type:** `WizardStepIndicatorCompact` on mobile
- **Type:** `WizardStepIndicator` on desktop
- **Current Step:** 4 (filled circle with "4")
- **Previous Steps:** 1, 2, 3 (checkmarks ✓)
- **Upcoming Steps:** 5, 6 (hollow circles)

### Compact Variant (Mobile)
```
Step 4 of 6                Giving Back
[██████████████░░░░░░░░░░░] 66.7%
```

### Full Variant (Desktop)
```
✓ ─── ✓ ─── ✓ ─── ● ─── ○ ─── ○
The Child The Gift The Dates Giving Back Payout Review
```

---

## 3. VISUAL LAYOUT

### Mobile Layout (< 768px)
```
┌─────────────────────────────────────────────┐
│ STEP 4 OF 6                                 │
│ Want to share the love? 💚                 │
│ Help a cause while celebrating Sophie.     │
│                                             │
│ [██████████████░░░░░░░░░░░░░░░] 66.7%    │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ [Error banner if validation failed]   │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ OPTIONAL GIVING                       │  │
│ │                                       │  │
│ │ Some families choose to share their   │  │
│ │ joy by directing a portion of        │  │
│ │ contributions to a cause they care   │  │
│ │ about. This is completely optional — │  │
│ │ [Child]'s gift comes first.          │  │
│ │                                       │  │
│ │ Share a portion with charity          │  │
│ │ [OFF ◯]                              │  │
│ │                                       │  │
│ │ [If toggled ON:                       │  │
│ │                                       │  │
│ │  Select a charity                    │  │
│ │  Categories: Animals, Children,      │  │
│ │  Hunger, Homeless, Education,        │  │
│ │  Environment                         │  │
│ │                                       │  │
│ │  ┌─────────────────────────────────┐ │  │
│ │  │ 🐾 Animals for Africa   [>]     │ │  │
│ │  │ Protecting wildlife and habitat │ │  │
│ │  │ South Africa                    │ │  │
│ │  └─────────────────────────────────┘ │  │
│ │  (carousel of charity cards)        │  │
│ │                                       │  │
│ │  ┌─────────────────────────────────┐ │  │
│ │  │ How much to share?              │ │  │
│ │  │                                 │ │  │
│ │  │ ◉ Percentage of goal            │ │  │
│ │  │   [========●────] 25%            │ │  │
│ │  │                                 │ │  │
│ │  │ ◯ Fixed amount (given first)    │ │  │
│ │  │   [R  100 - R  500]             │ │  │
│ │  └─────────────────────────────────┘ │  │
│ │                                       │  │
│ │  Split preview:                      │  │
│ │  "We'll give R150 to Animals for     │  │
│ │   Africa and R450 to Sophie's gift"  │  │
│ │ ]                                     │  │
│ │                                       │  │
│ │ [Continue to payout setup ] (full w)  │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ ← Back                                      │
└─────────────────────────────────────────────┘
```

### Desktop Layout (>= 1024px)
```
┌──────────────────────────────────────────────────────────────────┐
│ STEP 4 OF 6                                                      │
│ Want to share the love? 💚                                      │
│ Help a cause while celebrating Sophie.                          │
│                                                                  │
│ ✓ ─── ✓ ─── ✓ ─── ● ─── ○ ─── ○                               │
│ The Child The Gift The Dates Giving Back Payout Setup Review  │
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ [Error banner if validation failed]                          ││
│ └──────────────────────────────────────────────────────────────┘│
│                                                                  │
│ ┌──────────────────────────────────────────────────────────────┐│
│ │ Some families choose to share their joy by directing a       ││
│ │ portion of contributions to a cause they care about. This    ││
│ │ is completely optional — Sophie's gift comes first.         ││
│ │                                                              ││
│ │ Share a portion with charity                                ││
│ │ [     OFF      ◯    ]  [        ON       ◉        ]        ││
│ │                                                              ││
│ │ [If toggled ON:                                            ││
│ │                                                              ││
│ │  Select a charity (6 categories shown)                      ││
│ │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      ││
│ │  │ 🐾 Animals   │  │ 👶 Children  │  │ 🍽️  Hunger  │      ││
│ │  │ for Africa   │  │ Believe Kids │  │ World Food  │      ││
│ │  │ South Africa │  │ SA           │  │ Programme   │      ││
│ │  │ [SELECTED] ✓ │  │              │  │             │      ││
│ │  └──────────────┘  └──────────────┘  └──────────────┘      ││
│ │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      ││
│ │  │ 🏠 Homeless  │  │ 🎓 Education │  │ 🌍Environment│      ││
│ │  │ Homeless     │  │ Teach South  │  │ WWF South    │      ││
│ │  │ Project      │  │ Africa       │  │ Africa       │      ││
│ │  │              │  │              │  │              │      ││
│ │  └──────────────┘  └──────────────┘  └──────────────┘      ││
│ │                                                              ││
│ │  ┌────────────────────────────────────────────────────────┐ ││
│ │  │ How much to share?                                     │ ││
│ │  │                                                        │ ││
│ │  │ ◉ Percentage of goal                                  │ ││
│ │  │   [===============●─────────────────] 25%             │ ││
│ │  │   5%                                      50%          │ ││
│ │  │                                                        │ ││
│ │  │ ◯ Fixed amount (given first to charity)              │ ││
│ │  │   [R  100     ] Range: R50 - R500                      │ ││
│ │  │                                                        │ ││
│ │  │ Split preview:                                         │ ││
│ │  │ "Out of your R 600 goal:                             │ ││
│ │  │  • R 150 goes to Animals for Africa                  │ ││
│ │  │  • R 450 goes to Sophie's gift"                      │ ││
│ │  └────────────────────────────────────────────────────────┘ ││
│ │ ]                                                            ││
│ │                                                              ││
│ │ [Continue to payout setup                          ]        ││
│ └──────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────┘
```

---

## 4. FIELD SPECIFICATIONS

### Field 1: Charitable Giving Toggle

**Label:** "Share a portion with charity"
**Input Type:** Toggle switch (radio buttons or checkbox styled as toggle)
**HTML Name Attribute:** `shareWithCharity`
**Default Value:** false (OFF)
**States:** OFF | ON
**Required:** No (entire section is optional)

**Tailwind Classes (Toggle):**
```
Toggle Container: inline-flex items-center gap-3
  border border-border rounded-xl px-4 py-2

Toggle Labels:
  Inactive: text-text-muted opacity-50
  Active: text-text font-medium

Toggle Switch:
  w-12 h-6 rounded-full relative
  bg-border transition-all duration-300

  When ON:
    bg-primary
    Slider moves right: translate-x-6

Visual States:
  OFF ◯  →  ON ◉
```

**Behavior:**
- Click toggle: Reveal/hide charity selection section
- Animated reveal with fade + slide
- If toggled OFF: Clear charity selection (optional feature)
- If toggled ON: Scroll to charity selector (smooth scroll)

**Accessibility:**
- `<input type="radio" name="shareWithCharity" value="true" />` or checkbox variant
- Two radio options: "off" and "on"
- Or single checkbox with visual toggle styling
- `aria-label="Toggle charitable giving"`
- `aria-pressed="false"` / `aria-pressed="true"` if toggle role
- Large click area: >= 44x44px
- Keyboard: Tab to toggle, Space/Enter to change state

---

### Field 2: Charity Selector (Conditional)

**Visibility:** Only shown if toggle is ON
**Label:** "Select a charity"
**Selection Type:** Single select (radio buttons styled as cards)
**Display Style:** Card-based grid layout
**Number of Options:** 6 charities (configurable, one per category)

**Charity Card Layout:**
```
Card Structure (each charity):
┌─────────────────────────────────────┐
│ [Logo 48x48] 🐾                     │
│ Animals for Africa                  │
│ "Protecting wildlife and habitats"  │
│ South Africa                        │
│ [If selected: ✓ SELECTED]          │
└─────────────────────────────────────┘

Responsive Sizes:
- Mobile (< 768px): 1 column, 100% width, stacked vertically
- Tablet (768-1024px): 2 columns
- Desktop (>= 1024px): 3 columns, ~200px width per card
```

**Categories & Sample Charities:**
```
Animals: Animals for Africa
  Logo: 🐾
  Description: "Protecting wildlife and habitats"
  Location: South Africa

Children: Believe Kids South Africa
  Logo: 👶
  Description: "Empowering vulnerable children"
  Location: South Africa

Hunger: World Food Programme
  Logo: 🍽️
  Description: "Fighting hunger and malnutrition"
  Location: Global/South Africa

Homeless: Homeless Project South Africa
  Logo: 🏠
  Description: "Supporting homeless communities"
  Location: South Africa

Education: Teach South Africa
  Logo: 🎓
  Description: "Improving education access"
  Location: South Africa

Environment: WWF South Africa
  Logo: 🌍
  Description: "Conservation and sustainability"
  Location: South Africa
```

**Card Styling:**
```
Unselected:
  rounded-2xl border border-border bg-white
  p-4 cursor-pointer transition-all duration-200
  hover:border-primary hover:shadow-soft

Selected:
  rounded-2xl border-2 border-primary bg-primary/5
  p-4 shadow-soft ring-4 ring-primary/10

Logo:
  w-12 h-12 (48x48px) mb-2

Name:
  font-medium text-text text-base

Description:
  text-sm text-text-secondary italic

Location:
  text-xs text-text-muted

Checkmark (if selected):
  Position: top-right corner
  Color: primary
  Size: 20x20px
  Icon: ✓ or checkmark SVG
```

**Validation Rules:**
```typescript
charityId: z
  .string()
  .optional()
  .refine(
    (id) => {
      if (!shareWithCharity) return true; // Not required if toggle OFF
      return id && validCharityIds.includes(id);
    },
    'Please select a charity'
  )
```

**Error Messages:**
- Required if sharing: "Please select a charity"
- Invalid charity: "Selected charity is not available"

**Default Value:**
```typescript
draft?.charityId ?? null
```

**Accessibility:**
- Each card is a radio button (hidden, styled as card)
- `<input type="radio" name="charity" value="animals-for-africa" />`
- Card has `role="radio"` and `aria-checked="true/false"`
- `aria-label="Select Animals for Africa as your charity"` on each card
- Keyboard: Tab to charity cards, Space/Enter to select
- Screen reader: "Radio button group: Select a charity. Animals for Africa, selected. Protecting wildlife and habitats. South Africa."

---

### Field 3: Split Type Selection

**Label:** "How much to share?"
**Input Type:** Radio buttons (styled as option group)
**HTML Name Attribute:** `splitType`
**Options:**
  1. "Percentage of goal" (default)
  2. "Fixed amount (given first)"
**Default Value:** "percentage"
**Visibility:** Only shown if charity selected (ON toggle AND charity picked)

**Option 1: Percentage of Goal**
```
Radio Label:
"Percentage of goal"

Input:
<input type="radio" name="splitType" value="percentage" checked />

Description (optional):
"Share a % of the total goal amount with the charity"

Subfield: Slider + Input
  Slider range: 5% to 50%
  Step: 1%
  Default: 25%

  Visual: [5%]───────●───────────[50%]

  Input (optional): Show % value next to slider
  Format: "25%"

Styling:
  Slider:
    Track: h-2 bg-border rounded-full
    Filled: bg-gradient-to-r from-primary to-primary-700
    Thumb: w-5 h-5 rounded-full bg-primary ring-2 ring-white shadow-soft

  Labels: text-xs text-text-muted at each end
```

**Option 2: Fixed Amount**
```
Radio Label:
"Fixed amount (given first to charity)"

Input:
<input type="radio" name="splitType" value="fixed_amount" />

Description:
"Give a fixed R amount first, then rest goes to gift"

Subfield: Currency Input
  Range: R50 to R500
  Step: R5 or R1
  Default: R100

  Format: "R  100"
  Prefix: "R  " (aligned right)

Styling:
  Input: h-11 rounded-xl border-border
  Placeholder: "100"
  Min/Max hints: "Range: R50 - R500"
```

**Validation Rules:**
```typescript
splitPercentage: z
  .coerce.number()
  .int()
  .min(5, "Minimum 5%")
  .max(50, "Maximum 50%")
  .optional(),

splitAmount: z
  .coerce.number()
  .int()
  .min(50, "Minimum R50")
  .max(500, "Maximum R500")
  .optional(),
```

**Error Messages:**
- Percentage below min: "Percentage must be at least 5%"
- Percentage above max: "Percentage cannot exceed 50%"
- Amount below min: "Amount must be at least R50"
- Amount above max: "Amount cannot exceed R500"

**Accessibility:**
- Radio buttons styled as clickable options
- `aria-describedby` on radio to explain each option
- Slider: `aria-label="Share percentage"`, `aria-valuemin="5"`, `aria-valuemax="50"`, `aria-valuenow="25"`, `aria-valuetext="25 percent"`
- Currency input: `aria-label="Fixed charity contribution amount in rands"`
- Keyboard: Tab through options, Space/Enter to select, Arrow keys on slider

---

### Field 5: Split Preview (Informational)

**Label:** None (automatically updated info box)
**Display:** Calculated text showing how goal will be split
**Positioning:** Below split controls
**Format Example:** "Out of your R600 goal: R150 goes to Animals for Africa, R450 goes to Sophie's gift"

**Calculation Logic:**
```typescript
function calculateSplit(goalCents: number, splitType: string, splitValue: number) {
  const goalRands = goalCents / 100;

  if (splitType === 'percentage') {
    const charityAmount = Math.round((goalRands * splitValue) / 100);
    const giftAmount = goalRands - charityAmount;
    return { charityAmount, giftAmount };
  } else if (splitType === 'fixed_amount') {
    const charityAmount = splitValue;
    const giftAmount = goalRands - charityAmount;
    return { charityAmount, giftAmount };
  }

  return { charityAmount: 0, giftAmount: goalRands };
}
```

**Display Box Styling:**
```
Container: rounded-2xl bg-primary/5 border border-primary/20 p-4

Text: text-sm text-text
Format:
  "Out of your R {goal} goal:
   • R {charityAmount} goes to {charityName}
   • R {giftAmount} goes to {childName}'s gift"

Update Behavior:
  Real-time: Updates as slider/input changes
  Animation: Fade out, update, fade in (100ms)
  aria-live="polite" for screen reader announcement
```

**Accessibility:**
- `role="status"` or `aria-live="polite"` for dynamic updates
- `aria-label="Goal split preview"`
- Screen reader: "Out of your 600 rands goal: 150 rands goes to Animals for Africa, 450 rands goes to Sophie's gift"

---

## 5. INTERACTIVE BEHAVIORS

### Form Submission Flow

**Submit Handler:** `saveGivingBackAction` (server action)

**Pre-submission Validations:**
1. If toggle OFF: All charity fields ignored, skip to validation pass
2. If toggle ON:
   - Charity must be selected
   - Split type must be selected
   - Split value must be valid (within range)
3. Show error banner if validation fails
4. Disable submit button until valid (if toggle ON)

**Submission Process:**
```typescript
async function saveGivingBackAction(formData: FormData) {
  'use server';

  // 1. Authenticate
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);

  // 2. Check previous steps completed
  if (!draft?.campaignEndDate) {
    redirect('/create/dates');
  }

  // 3. Extract form fields
  const shareWithCharity = formData.get('shareWithCharity') === 'on';
  const charityId = formData.get('charityId');
  const splitType = formData.get('splitType');
  const splitPercentage = formData.get('splitPercentage');
  const splitAmount = formData.get('splitAmount');

  // 4. If sharing, validate charity selection
  if (shareWithCharity) {
    const charitySchema = z.object({
      charityId: z.string().min(1, "Charity is required"),
      splitType: z.enum(['percentage', 'fixed_amount']),
      splitValue: z.coerce.number(),
    });

    const result = charitySchema.safeParse({
      charityId,
      splitType,
      splitValue: splitType === 'percentage' ? splitPercentage : splitAmount,
    });

    if (!result.success) {
      redirect('/create/giving-back?error=invalid_charity');
    }

    // 5. Save charity selection
    await updateDreamBoardDraft(session.hostId, {
      charityId: result.data.charityId,
      splitType: result.data.splitType,
      splitValue: result.data.splitValue,
      charityOptIn: true,
    });
  } else {
    // 6. If not sharing, clear charity data
    await updateDreamBoardDraft(session.hostId, {
      charityId: null,
      splitType: null,
      splitValue: null,
      charityOptIn: false,
    });
  }

  // 7. Redirect to next step
  redirect('/create/payout');
}
```

**Error Handling:**
- Show error banner for validation failures
- Keep form data intact for correction
- Highlight affected fields with red borders

**Zod Schema:**
```typescript
const givingBackSchema = z.object({
  shareWithCharity: z.boolean().default(false),
  charityId: z.string().optional(),
  splitType: z.enum(['percentage', 'fixed_amount']).optional(),
  splitPercentage: z
    .coerce.number()
    .int()
    .min(5)
    .max(50)
    .optional(),
  splitAmount: z
    .coerce.number()
    .int()
    .min(50)
    .max(500)
    .optional(),
}).refine(
  (data) => {
    if (!data.shareWithCharity) return true; // All valid if not sharing
    return data.charityId && data.splitType &&
      (data.splitPercentage || data.splitAmount);
  },
  { message: 'Please complete charity selection' }
);
```

### Toggle ON/OFF Behavior

**When Toggle Turns ON:**
1. Reveal charity selection section with fade + slide animation (300ms)
2. Focus automatically moves to charity selector (or scroll into view)
3. Show helper text: "Some families choose to share their joy..."
4. Disable continue button if charity not yet selected
5. Display split preview once split value set

**When Toggle Turns OFF:**
1. Collapse charity section with fade + slide animation
2. Clear charity selection data (optional: warn before clearing)
3. Re-enable continue button (no charity selection required)
4. Reset split preview
5. Form is now valid to submit

**Edge Case: Tab Away and Back**
- If toggle ON but charity not selected, preserve toggle state
- If toggle OFF, ignore any selected charity (data not sent to server)
- On page refresh, reload from draft

### Slider Interaction (Percentage)

**On Slider Drag:**
1. Show value in real-time: "25%"
2. Update split preview instantly (debounced, 100ms)
3. Show charity amount and gift amount changing
4. Maintain smooth drag (no stuttering)
5. On release: Validate value within range

**Keyboard Support:**
- Arrow Right/Up: Increase by 1%
- Arrow Left/Down: Decrease by 1%
- Shift+Arrow: Change by 5%
- Home: Jump to 5% (minimum)
- End: Jump to 50% (maximum)

### Currency Input Interaction (Fixed Amount)

**On Input Change:**
1. Only allow numbers (strip non-numeric)
2. Format as "R  {value}" (right-aligned)
3. Real-time validation feedback
4. Auto-clamp to min (R50) and max (R500)
5. Update split preview instantly

**Keyboard:**
- Up/Down arrows: Increment/decrement by R1 (or R5)
- Ctrl/Cmd+Up: Jump to max (R500)
- Ctrl/Cmd+Down: Jump to min (R50)

---

## 6. COMPONENT TREE

```
<CreateGivingBackPage> (Page Component)
├── Redirect handlers (auth, flow validation)
├── Data loading (getDreamBoardDraft)
├── Error resolution
│
└── <CreateFlowShell>
    ├── Header
    │
    └── <Card>
        ├── <CardHeader>
        │   ├── <CardTitle> "Share with a cause"
        │   └── <CardDescription> "Help others while celebrating"
        │
        └── <CardContent className="space-y-6">
            ├── {errorMessage && (
            │     <ErrorBanner />
            │   )}
            │
            └── <form action={saveGivingBackAction}>
                ├── <InfoBox>
                │   Text: "Some families choose to share..."
                │ </InfoBox>
                │
                ├── <FormField>
                │   ├── <label> "Share a portion with charity"
                │   ├── <ToggleSwitch
                │   │   value={shareWithCharity}
                │   │   onChange={setShareWithCharity}
                │   │ />
                │   └── States: "OFF" / "ON"
                │
                ├── {shareWithCharity && (
                │     <motion.div className="space-y-6">
                │       <FormField>
                │         ├── <label> "Select a charity"
                │         └── <CharityGrid>
                │             {charities.map(charity => (
                │               <CharityCard
                │                 key={charity.id}
                │                 charity={charity}
                │                 selected={selectedCharityId === charity.id}
                │                 onChange={() => setSelectedCharityId(charity.id)}
                │               />
                │             ))}
                │           </CharityGrid>
                │       </FormField>
                │
                │       <FormField>
                │         ├── <label> "How much to share?"
                │         │
                │         ├── <RadioGroup>
                │         │   ├── <RadioOption value="percentage">
                │         │   │   Label: "Percentage of goal"
                │         │   │   <Slider 5-50% />
                │         │   │ </RadioOption>
                │         │   │
                │         │   └── <RadioOption value="fixed_amount">
                │         │       Label: "Fixed amount"
                │         │       <CurrencyInput R50-R500 />
                │         │     </RadioOption>
                │         │ </RadioGroup>
                │
                │       <SplitPreview
                │         charityName={selectedCharity.name}
                │         charityAmount={charityAmount}
                │         giftAmount={giftAmount}
                │       />
                │     </motion.div>
                │   )}
                │
                └── <Button type="submit">
                    Continue to payout setup
                  </Button>
```

---

## 7. TYPESCRIPT INTERFACES & SCHEMAS

### Props Interface

```typescript
interface CreateGivingBackPageProps {
  searchParams?: GivingBackSearchParams;
}

interface GivingBackSearchParams {
  error?: string;
}
```

### Form Data Types

```typescript
interface GivingBackFormData {
  shareWithCharity: boolean;
  charityId?: string;
  splitType?: 'percentage' | 'fixed_amount';
  splitValue?: number; // percentage (5-50) or amount (50-500)
}

interface GivingBackDraft {
  charityOptIn: boolean;
  charityId?: string;
  splitType?: 'percentage' | 'fixed_amount';
  splitValue?: number;
  updatedAt: Date;
}

interface Charity {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  category: 'animals' | 'children' | 'hunger' | 'homeless' | 'education' | 'environment';
  location: string;
}
```

### Zod Schemas

```typescript
const givingBackSchema = z.object({
  shareWithCharity: z.boolean().default(false),
  charityId: z.string().optional(),
  splitType: z.enum(['percentage', 'fixed_amount']).optional(),
  splitValue: z
    .coerce.number()
    .int()
    .optional(),
}).refine(
  (data) => {
    if (!data.shareWithCharity) return true;
    if (!data.charityId || !data.splitType) return false;

    if (data.splitType === 'percentage') {
      return data.splitValue && data.splitValue >= 5 && data.splitValue <= 50;
    } else {
      return data.splitValue && data.splitValue >= 50 && data.splitValue <= 500;
    }
  },
  { message: 'Please complete charity selection and amount' }
);

const charitySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  logoUrl: z.string().url(),
  category: z.enum(['animals', 'children', 'hunger', 'homeless', 'education', 'environment']),
  location: z.string(),
});
```

---

## 8. FILE STRUCTURE

```
src/
├── app/
│   └── (host)/
│       └── create/
│           └── giving-back/
│               ├── page.tsx (Main page, server action)
│               ├── layout.tsx (Optional)
│               └── error.tsx (Optional)
│
├── components/
│   ├── layout/
│   │   ├── CreateFlowShell.tsx
│   │   └── WizardStepIndicator.tsx
│   ├── charity/
│   │   ├── CharitySelector.tsx (Main charity picker)
│   │   ├── CharityCard.tsx (Individual charity option)
│   │   ├── CharityGrid.tsx (Grid layout container)
│   │   ├── SplitTypeSelector.tsx (Radio options)
│   │   ├── SplitSlider.tsx (Percentage slider)
│   │   ├── SplitInput.tsx (Currency input)
│   │   └── SplitPreview.tsx (Info box display)
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── radio.tsx
│       ├── slider.tsx
│       ├── input.tsx
│       └── toggle.tsx
│
└── lib/
    ├── integrations/
    │   └── charity-api.ts (Fetch charities)
    ├── dream-boards/
    │   └── draft.ts (Save giving back data)
    ├── auth/
    │   └── clerk-wrappers.ts
    └── observability/
        └── logger.ts
```

---

## 9. SERVER ACTIONS

### `saveGivingBackAction`

**Purpose:** Validate charity selection, save giving back settings, redirect

**Input:** FormData from form submission

**Process:**
1. Authenticate user
2. Load draft
3. Verify dates step completed
4. Extract form fields
5. If toggle OFF: Clear charity data (or skip saving)
6. If toggle ON: Validate charity, split type, split value
7. Save to draft
8. Redirect to next step

**Validation:**
- If shareWithCharity = true: charityId, splitType, splitValue required
- If shareWithCharity = false: All charity fields optional
- Charity ID must exist in database
- Split value must be within range for type

**Redirect Logic:**
```
Success:
  redirect('/create/payout')

Errors:
  redirect('/create/giving-back?error=invalid_charity')
  redirect('/create/giving-back?error=invalid_split')
  redirect('/create/dates')  // Previous step not completed
  redirect('/auth/login')    // Session expired
```

---

## 10. STATE MANAGEMENT

### Draft Persistence

**What's Stored:**
- `charityOptIn` (boolean)
- `charityId` (string, nullable)
- `splitType` ('percentage' | 'fixed_amount', nullable)
- `splitValue` (number, nullable)
- `updatedAt` (ISO timestamp)

**Where:**
- Primary: Database (dream_boards `draft_data` JSONB)
- Session: React state + form fields
- Duration: Until published or 30 days

**Loading Draft:**
```typescript
const draft = await getDreamBoardDraft(session.hostId);
const shareWithCharity = draft?.charityOptIn ?? false;
const selectedCharityId = draft?.charityId ?? null;
```

**Saving Draft:**
```typescript
if (shareWithCharity) {
  await updateDreamBoardDraft(session.hostId, {
    charityOptIn: true,
    charityId,
    splitType,
    splitValue,
  });
} else {
  await updateDreamBoardDraft(session.hostId, {
    charityOptIn: false,
    charityId: null,
    splitType: null,
    splitValue: null,
  });
}
```

### Client-Side State

```typescript
const [shareWithCharity, setShareWithCharity] = useState(draft?.charityOptIn ?? false);
const [selectedCharityId, setSelectedCharityId] = useState(draft?.charityId ?? null);
const [splitType, setSplitType] = useState(draft?.splitType ?? 'percentage');
const [splitPercentage, setSplitPercentage] = useState(draft?.splitValue ?? 25);
const [splitAmount, setSplitAmount] = useState(draft?.splitValue ?? 100);

// Derived state
const selectedCharity = charities.find(c => c.id === selectedCharityId);
const { charityAmount, giftAmount } = calculateSplit(
  goalCents,
  splitType,
  splitType === 'percentage' ? splitPercentage : splitAmount
);
```

---

## 11. RESPONSIVE DESIGN

### Breakpoints

**Mobile (< 768px):**
- Charity cards: 1 column, stacked vertically
- Card width: 100% - padding
- Split controls: Full width stacked
- Toggle: Full width with labels

**Tablet (768px - 1024px):**
- Charity cards: 2 columns
- Card width: ~45% each
- Split controls: Could be side-by-side (optional)
- Toggle: Full width

**Desktop (>= 1024px):**
- Charity cards: 3 columns
- Card width: ~30% each
- Max-width card container: 700px
- Split controls: Full width or side-by-side
- Toggle: Inline or full width

### Touch & Accessibility

**Minimum Touch Targets:** 44x44px
- Toggle: w-full h-12 with large label area
- Charity cards: min 40x40px (logo) + 44px min touch area
- Radio buttons: 20x20px (label extends to 44x44px)
- Slider: 44x44px touch zone around thumb
- Currency input: h-11 (44px)

**Spacing:**
- Card gap: gap-4 to gap-6 (16-24px)
- Field gaps: gap-6 (24px)
- Logo margin: mb-2
- Padding: px-4 py-3 on cards, px-6 py-8 on form

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

### Toggle Reveal/Collapse

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

.charity-section {
  animation: slideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Charity Card Selection

```css
.charity-card {
  transition: all 200ms ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  &.selected {
    animation: scaleIn 0.2s ease-out;
  }
}

@keyframes scaleIn {
  from { transform: scale(0.95); }
  to { transform: scale(1); }
}
```

### Slider Feedback

```css
.slider-thumb {
  transition: box-shadow 150ms ease;

  &:active {
    box-shadow: 0 0 0 8px rgba(13, 148, 136, 0.15);
  }
}
```

### Split Preview Update

```css
@keyframes fadeInOut {
  0% { opacity: 1; }
  50% { opacity: 0.6; }
  100% { opacity: 1; }
}

.split-preview-updated {
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
<label htmlFor="shareWithCharity" class="text-sm font-medium">
  Share a portion with charity
</label>
<input id="shareWithCharity" type="checkbox" />

<!-- Charity selection -->
<fieldset>
  <legend class="font-medium">Select a charity</legend>
  <div role="radiogroup">
    {charities.map(charity => (
      <label key={charity.id}>
        <input
          type="radio"
          name="charity"
          value={charity.id}
          aria-label={`Select ${charity.name}`}
        />
        {/* Charity card content */}
      </label>
    ))}
  </div>
</fieldset>
```

### ARIA Attributes

```html
<!-- Toggle -->
<button
  role="switch"
  aria-checked={shareWithCharity}
  aria-label="Enable charitable giving"
>
  {shareWithCharity ? 'ON' : 'OFF'}
</button>

<!-- Conditional section -->
<div aria-hidden={!shareWithCharity}>
  {/* Charity selector */}
</div>

<!-- Slider -->
<input
  type="range"
  min="5"
  max="50"
  step="1"
  aria-label="Share percentage"
  aria-valuemin="5"
  aria-valuemax="50"
  aria-valuenow={splitPercentage}
  aria-valuetext={`${splitPercentage} percent`}
/>

<!-- Split preview -->
<div aria-live="polite" aria-atomic="true">
  Split preview text updates here
</div>

<!-- Error messages -->
<div role="alert" aria-live="assertive">
  {errorMessage}
</div>
```

### Keyboard Navigation

**Tab Order:**
1. Toggle switch
2. Charity cards (if toggle ON)
3. Split type radio buttons (if charity selected)
4. Slider or currency input (if split type selected)
5. Continue button

**Keyboard in Controls:**
- **Space/Enter on toggle:** Change state
- **Tab through charity cards:** Focus each
- **Space/Enter on card:** Select charity
- **Space/Enter on radio:** Select split type
- **Arrow keys on slider:** Change value
- **Up/Down in currency:** Increment/decrement

**Screen Reader Experience:**

**Page Load:**
"Page loaded: Create Dreamboard, Step 4 of 6, Giving Back. Optional charitable giving section."

**Toggle Focus:**
"Switch: Share a portion with charity. Off. Press Space to toggle."

**On Toggle ON:**
"Switch: Share a portion with charity. On. Region with radio group charity selector is now visible."

**Charity Card Focus:**
"Radio button: Select Animals for Africa. Not selected. Protecting wildlife and habitats. South Africa."

**Slider Focus:**
"Slider: Share percentage. Minimum 5 percent. Maximum 50 percent. Current value: 25 percent."

**Split Preview:**
"Status: Out of your 600 rands goal: 150 rands to Animals for Africa, 450 rands to Sophie's gift."

### Color Contrast

- Text on background: >= 4.5:1 (WCAG AA)
- Toggle labels: >= 4.5:1
- Primary button: >= 4.5:1
- Error text: >= 4.5:1

### Visual Indicators

- Required: Handled via optional toggle (no `*` needed)
- Errors: Icon + text message + border
- Selected charity: Border + background + checkmark icon
- Active radio: Filled circle + label bold

---

## 14. ERROR HANDLING

### Validation Errors

**Client-Side:**
```typescript
const validateCharity = (charityId?: string): string | null => {
  if (!shareWithCharity) return null; // Not required if toggle OFF
  if (!charityId) return "Please select a charity";
  if (!validCharityIds.includes(charityId)) return "Selected charity is not available";
  return null;
};

const validateSplitValue = (splitValue?: number, splitType?: string): string | null => {
  if (!shareWithCharity) return null;
  if (!splitValue) return "Please enter a split value";

  if (splitType === 'percentage') {
    if (splitValue < 5) return "Percentage must be at least 5%";
    if (splitValue > 50) return "Percentage cannot exceed 50%";
  } else if (splitType === 'fixed_amount') {
    if (splitValue < 50) return "Amount must be at least R50";
    if (splitValue > 500) return "Amount cannot exceed R500";
  }
  return null;
};
```

### Error Messages

```
invalid_charity   → "Please complete charity selection"
invalid_split     → "Please set a valid split amount"
charity_required  → "Charity selection is required"
charity_invalid   → "Selected charity is not available"
split_invalid     → "Split amount is out of range"
percentage_low    → "Percentage must be at least 5%"
percentage_high   → "Percentage cannot exceed 50%"
amount_low        → "Amount must be at least R50"
amount_high       → "Amount cannot exceed R500"
```

### Error Recovery

**Validation Failures:**
1. Show error banner at top
2. Highlight affected field (red border)
3. Keep form data intact
4. Allow immediate correction
5. Clear error on field focus

**Network/Session Errors:**
1. Show generic error: "Something went wrong. Please try again."
2. Redirect to login if session expired
3. Allow retry

---

## 15. EDGE CASES

### Case 1: Toggle OFF (Default)

**Scenario:** User skips charitable giving entirely

**Behavior:**
- Charity section hidden
- All charity data ignored on submission
- Form valid and submittable immediately
- Draft saved with charityOptIn = false

### Case 2: Toggle ON, No Charity Selected Yet

**Scenario:** User turns on toggle but doesn't select charity

**Behavior:**
- Charity grid shown
- Split controls disabled/hidden until charity selected
- Split preview not shown
- Continue button disabled until charity + split complete

### Case 3: Charity Selection Changes

**Scenario:** User selects Animal charity, then switches to Education

**Behavior:**
- Previous selection deselected (radio button behavior)
- New charity selected with checkmark
- Split value persists (slider/input value unchanged)
- Split preview updates with new charity name

### Case 4: Split Type Switch

**Scenario:** User changes from Percentage to Fixed Amount

**Behavior:**
- Percentage slider hidden, fixed amount input shown
- Previous value cleared (or converted: 25% of R600 = R150)
- Split preview updates to show fixed amount scenario
- Focus moves to currency input

### Case 5: Extreme Split Values

**Scenario:** Slider set to 50%, Goal is R100

**Behavior:**
- Calculation: 50% of R100 = R50 charity, R50 gift
- Display: "R50 goes to Animals for Africa, R50 goes to Sophie's gift"
- Both amounts visible and equal
- User warned (optional): "This is a large percentage of the goal"

### Case 6: Small Goal vs. Fixed Amount

**Scenario:** Goal is R200, user sets fixed amount R500

**Behavior:**
- Validation: Fixed amount capped at R500 (max allowed)
- Calculation: R500 > R200 (goal) = Invalid
- Error: "Fixed amount cannot exceed the goal amount" (optional validation)
- Or show split preview: "R500 charity contribution exceeds R200 goal"

### Case 7: Charity Not Found

**Scenario:** Draft has charity ID that no longer exists in system

**Behavior:**
- Load charities from API
- If draft charity not in list, clear selection
- Show warning (optional): "Selected charity is no longer available"
- User must re-select
- Or auto-select first available charity

### Case 8: Multiple Rapid Toggles

**Scenario:** User toggles ON/OFF/ON rapidly

**Behavior:**
- Animation plays each time
- Form state kept in sync
- On OFF: Clear charity selection (optionally warn)
- On ON again: No charity pre-selected, must choose again

### Case 9: Page Refresh During Selection

**Scenario:** User selecting charity, browser refreshed

**Behavior:**
- Reload from draft
- Pre-populate toggle state
- Pre-populate charity selection (if saved)
- Re-populate split type and value (if saved)
- Continue from where they left off

### Case 10: Session Expires Before Submit

**Scenario:** User fills charity selection, session expires

**Behavior:**
- Form submission fails with 401
- Redirect to login
- After login, redirect to `/create/giving-back`
- Draft still saved with charity selection

---

## 16. COMPONENT CODE REFERENCE

### Page Component Structure

```typescript
// src/app/(host)/create/giving-back/page.tsx

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { CharitySelector } from '@/components/charity/CharitySelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft, updateDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const givingBackSchema = z.object({
  shareWithCharity: z.boolean().default(false),
  charityId: z.string().optional(),
  splitType: z.enum(['percentage', 'fixed_amount']).optional(),
  splitValue: z.coerce.number().optional(),
});

async function saveGivingBackAction(formData: FormData) {
  'use server';
  // Implementation as per spec
}

export default async function CreateGivingBackPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  // Implementation as per spec
}
```

---

## SUMMARY

This specification provides complete details for implementing Step 4 (Giving Back) of Gifta's Create Flow. The page offers optional charitable giving with delightful UI and smart defaults. Key features:

- **Optional By Design:** Toggle defaults to OFF, no friction
- **Delightful UI:** Card-based charity selector, real-time split preview
- **Smart Defaults:** Percentage split (25%), clear preview of impact
- **Enterprise-Grade:** Full accessibility, robust validation, error recovery
- **Mobile-First:** Responsive charity grid (1-3 columns)
- **Comprehensive:** Edge case handling, draft persistence, session recovery

Ready for implementation by an AI agent using Next.js, React, TypeScript, Tailwind CSS, and Zod validation.
