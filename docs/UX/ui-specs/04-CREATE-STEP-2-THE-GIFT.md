# CREATE FLOW STEP 2: THE GIFT
## Gifta UX v2 Implementation Specification

**Document Version:** 1.0
**Route:** `/create/gift`
**Step Number:** 2 of 6
**Status:** Runtime-aligned with major behavior changes from original draft

---

## Runtime Alignment (2026-02-11)

- Runtime source: `src/app/(host)/create/gift/page.tsx`, `src/components/gift/GiftIconPicker.tsx`, `src/lib/icons/*`.
- This step uses static curated gift icons (`/icons/gifts/*.png`), not AI image generation or upload.
- Goal amount is not collected in host create flow; `goalCents` is persisted as `0` in draft and publish path.
- Legacy references to `GiftArtworkGenerator`/Claude image generation in this file are target-state only and not in runtime.
- If any section below conflicts with these bullets, treat runtime source files above as authoritative.

## 1. SCREEN OVERVIEW

### Purpose
Step 2 transforms the Dreamboard from a person into a purpose. This screen captures gift name, optional description, and a curated icon selection.

### Route & File Structure
```
Route: /create/gift (GET, POST via server action)
Files:
  ├── src/app/(host)/create/gift/page.tsx (Main page component)
  ├── src/components/gift/GiftIconPicker.tsx (Icon selection)
  └── src/lib/icons/gift-icons.ts (Icon catalog and lookup helpers)
```

### Layout Container
- **Component:** `CreateFlowShell` (from `@/components/layout/CreateFlowShell`)
- **Props:**
  - `stepLabel: "Step 2 of 6"`
  - `title: "What's [Child]'s one big wish? 🎁"`
  - `subtitle: "Tell us about the dream gift."`
- **Wrapper:** Full-width section with max-w-5xl, px-6 py-12, centered flex column gap-6
- **Background:** App background color #FEFDFB

### User Flow
1. Authenticated user lands on `/create/gift` (redirects if child step not completed)
2. If draft exists, pre-populate gift name, description, and selected icon
3. User enters gift name (real-time validation)
4. User optionally adds description
5. User selects a curated icon (with suggestion based on gift text and child age)
6. User clicks "Continue to dates"
7. Server validates all fields
8. On success: Save draft and redirect to `/create/dates`
9. On error: Show error banner and allow retry

---

## 2. PROGRESS INDICATOR

### Step Indicator Component
- **Type:** `WizardStepIndicatorCompact` on mobile (< 768px)
- **Type:** `WizardStepIndicator` on desktop (>= 768px)
- **Current Step:** 2 (shown as filled circle with "2")
- **Previous Step:** 1 (shown as filled circle with checkmark ✓)
- **Upcoming Steps:** 3, 4, 5, 6 (shown as hollow circles)

### Compact Variant (Mobile, < 768px)
```
Step 2 of 6                The Gift
[████████░░░░░░░░░░░░░░░] 33.3%
```
- Shows "Step 2 of 6" + "The Gift"
- Progress bar filled 33.3% (2/6)
- Color gradient: from-primary to-accent

### Full Variant (Desktop, >= 768px)
```
✓ ─────────── ● ─────────── ○ ─────────── ○ ─────────── ○ ─────────── ○
The Child    The Gift      The Dates    Giving Back   Payout Setup  Review
```
- Previous step (1) shown with checkmark ✓ in primary circle
- Current step (2) filled circle with "2", border-2 border-primary, ring-4 ring-primary/10
- Upcoming steps 3-6 shown as hollow circles
- Connector lines: filled (primary) up to step 2, unfilled (border) after

### Encouraging Copy
- Small text above progress (optional): "You're on step 2! Almost there."
- Or motivational variant: "This is where the magic happens! Let's pick the perfect gift."

---

## 3. VISUAL LAYOUT

### Mobile Layout (< 768px)
```
┌─────────────────────────────────────────────┐
│ STEP 2 OF 6                                 │
│ What's Sophie's one big wish? 🎁           │
│ Tell us about the dream gift.               │
│                                             │
│ [████████░░░░░░░░░░░░░░░░░░░] 33.3%      │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ [Error banner if validation failed]   │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ ┌───────────────────────────────────────┐  │
│ │ Gift name                             │  │
│ │ [Pink Electric Scooter     ]          │  │
│ │                                       │  │
│ │ Gift description (optional)           │  │
│ │ [A super fun way to...     ]          │  │
│ │ (0/150 characters)                    │  │
│ │                                       │  │
│ │ Gift image                            │  │
│ │ ┌─────────────────────────────────┐  │  │
│ │ │  [Selected image or placeholder]│  │  │
│ │ │  250x250px square               │  │  │
│ │ └─────────────────────────────────┘  │  │
│ │                                       │  │
│ │ [✨ Generate image] [Upload image]   │  │
│ │                                       │  │
│ │ Goal amount (R)                       │  │
│ │ [R 599                 ]              │  │
│ │ Tip: Set it slightly higher to        │  │
│ │ account for smaller contributions     │  │
│ │                                       │  │
│ │ [Continue to dates        ] (full w)  │  │
│ └───────────────────────────────────────┘  │
│                                             │
│ ← Back                                      │
└─────────────────────────────────────────────┘
```

### Tablet Layout (768px - 1024px)
```
┌──────────────────────────────────────────────────────────┐
│ STEP 2 OF 6                                              │
│ What's Sophie's one big wish? 🎁                        │
│ Tell us about the dream gift.                           │
│                                                          │
│ ✓ ──── ● ──── ○ ──── ○ ──── ○ ──── ○                  │
│ The Child The Gift The Dates Giving Back Payout Review │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ [Error banner if validation failed]                │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ ┌────────────────────────────────────────────────────┐  │
│ │ Gift name                                          │  │
│ │ [Pink Electric Scooter                    ]        │  │
│ │                                                    │  │
│ │ Gift description (optional)                        │  │
│ │ [A super fun and eco-friendly...          ]        │  │
│ │ (28/150 characters)                                │  │
│ │                                                    │  │
│ │ ┌─────────────────┐  ┌────────────────────────┐   │  │
│ │ │ Gift Image      │  │ Goal Amount (R)        │   │  │
│ │ │ ┌─────────────┐ │  │ [R 599             ]   │   │  │
│ │ │ │  [300x300]  │ │  │                        │   │  │
│ │ │ │  Image or   │ │  │ Tip: Set it slightly   │   │  │
│ │ │ │  Placeholder│ │  │ higher to account for  │   │  │
│ │ │ │             │ │  │ smaller contributions  │   │  │
│ │ │ └─────────────┘ │  │                        │   │  │
│ │ │ [✨ Gen] [Upload]│  │                        │   │  │
│ │ └─────────────────┘  └────────────────────────┘   │  │
│ │                                                    │  │
│ │ [Continue to dates                 ]              │  │
│ └────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────┘
```

### Desktop Layout (>= 1024px)
```
┌──────────────────────────────────────────────────────────────────────┐
│ STEP 2 OF 6                                                          │
│ What's Sophie's one big wish? 🎁                                    │
│ Tell us about the dream gift.                                        │
│                                                                      │
│ ✓ ──────── ● ──────── ○ ──────── ○ ──────── ○ ──────── ○           │
│ The Child   The Gift   The Dates  Giving Back Payout Setup Review  │
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ [Error banner if validation failed]                             ││
│ └──────────────────────────────────────────────────────────────────┘│
│                                                                      │
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ Gift name                                                        ││
│ │ [Pink Electric Scooter                              ]            ││
│ │                                                                  ││
│ │ Gift description (optional)                                      ││
│ │ [A super fun and eco-friendly scooter that Sarah's been...]     ││
│ │ (64/150 characters)                                              ││
│ │                                                                  ││
│ │ ┌──────────────────────────┐  ┌──────────────────────────────┐ ││
│ │ │ Gift Image               │  │ Goal Amount (R)              │ ││
│ │ │ ┌────────────────────────┤  │ [R 599                    ]  │ ││
│ │ │ │                        │  │                              │ ││
│ │ │ │  [350x350 Image]       │  │ Tip: Set it slightly higher  │ ││
│ │ │ │  or Placeholder        │  │ to account for smaller       │ ││
│ │ │ │                        │  │ contributions. Covers fees    │ ││
│ │ │ │                        │  │ & gives kids some spending   │ ││
│ │ │ │                        │  │ money.                       │ ││
│ │ │ └────────────────────────┤  │                              │ ││
│ │ │ [✨ Generate]  [Upload]   │  └──────────────────────────────┘ ││
│ │ └──────────────────────────┘                                    ││
│ │                                                                  ││
│ │ [Continue to dates                                 ]             ││
│ └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

---

## 4. FIELD SPECIFICATIONS

### Field 1: Gift Name

**Label:** "Gift name"
**Input Type:** Text (`<input type="text">`)
**HTML Name Attribute:** `giftName`
**Placeholder:** `"Pink Electric Scooter"`
**Min Length:** 1 character
**Max Length:** 100 characters
**Required:** Yes

**Tailwind Classes:**
```
Input: rounded-xl border-[#E7E5E4] focus:ring-primary/30 focus:border-primary
  h-11 px-4 py-2 bg-white text-text placeholder-text-muted
  transition-all duration-200
```

**Validation Rules (Zod Schema):**
```typescript
giftName: z
  .string()
  .min(1, "Gift name is required")
  .max(100, "Gift name must be 100 characters or less")
  .trim()
```

**Error Messages:**
- Required: "Gift name is required"
- Too long: "Gift name must be 100 characters or less"

**Default Value:** Load from draft: `draft?.giftName ?? ""`

**Accessibility:**
- `<label htmlFor="giftName">` with `text-sm font-medium text-text`
- `aria-required="true"`
- `aria-describedby="giftName-error"` if error
- Auto-focus on page load
- Screen reader: "Enter the name of the dream gift"

**Interactive Behaviors:**
- Real-time character count display (optional): "50/100 characters"
- Clear on focus if contains placeholder text
- Validation on blur
- Trim whitespace on save

---

### Field 2: Gift Description (Optional)

**Label:** "Gift description (optional)"
**Input Type:** Textarea (`<textarea>`)
**HTML Name Attribute:** `giftDescription`
**Placeholder:** `"A fun way to zoom around the neighborhood..."`
**Max Length:** 150 characters
**Required:** No
**Rows:** 3-4 (mobile), 4-5 (desktop)

**Tailwind Classes:**
```
Textarea: rounded-xl border-[#E7E5E4] focus:ring-primary/30 focus:border-primary
  px-4 py-2 bg-white text-text placeholder-text-muted
  transition-all duration-200 resize-none
  min-h-[100px] md:min-h-[120px]
```

**Validation Rules (Zod Schema):**
```typescript
giftDescription: z
  .string()
  .max(150, "Description must be 150 characters or less")
  .optional()
  .transform((v) => v === '' ? undefined : v)
```

**Error Messages:**
- Too long: "Description must be 150 characters or less"

**Default Value:** Load from draft: `draft?.giftDescription ?? ""`

**Accessibility:**
- `<label htmlFor="giftDescription">`
- `aria-describedby="giftDescription-count"` for character count
- Optional indicator: "(optional)" in label
- Screen reader: "Enter an optional description of the gift"

**Interactive Behaviors:**
- Real-time character count: "45/150 characters"
- Display helper text below: "Help your guests understand why this gift is special"
- Allow line breaks (Shift+Enter)
- Trim whitespace on save

---

### Field 3: Gift Image

**Label:** "Gift image"
**Input Type:** File upload or AI generation
**Generated Image:** AI-generated illustrated options (via Claude)
**Upload Max:** 5MB
**Upload Formats:** JPG, PNG, WebP

**Responsive Sizing:**
- Mobile (< 768px): 300x300px or 280x280px
- Tablet: 350x350px
- Desktop: 400x400px or 450x450px

**Tailwind Classes (Container):**
```
Image Container:
  rounded-2xl border-2 border-border bg-muted
  aspect-square object-cover overflow-hidden
  flex items-center justify-center
  transition-all duration-300

Placeholder (if no image):
  text-center text-text-muted
  "✨ Upload a gift image or generate one with AI"
  text-sm
```

#### Subfield 3a: Generate Gift Image Button

**Label:** "✨ Generate gift image"
**Button Type:** Secondary variant
**Size:** md (h-11)
**Border Radius:** rounded-xl
**Action:** Opens AI image generation modal

**States:**
- **Default:** Outlined secondary button, text gray
- **Hover:** bg-primary/10, border-primary
- **Loading:** Disabled, spinner icon, "Generating..."
- **Complete:** "✓ Generated" (momentary success state)

**AI Generation Process:**
1. User clicks "✨ Generate gift image"
2. Modal opens showing: "Generating beautiful gift illustrations..."
3. Uses existing gift name as prompt
4. Claude API generates 3-4 illustrated options
5. Display options in grid (mobile: 1 col, desktop: 2-3 cols)
6. Each option is clickable thumbnail
7. User selects one
8. Modal closes, image appears in field
9. Prompt saved for reference

**Error Handling:**
- If API rate limited: "We're generating a lot of images right now. Please try again in a moment."
- If API error: "Could not generate images. Please upload a photo instead."
- If prompt invalid: "Please enter a gift name to generate images."

#### Subfield 3b: Upload Gift Image Button

**Label:** "Upload image"
**Button Type:** Secondary variant
**Size:** md (h-11)
**Border Radius:** rounded-xl
**Action:** Opens file picker

**States:**
- **Default:** Outlined secondary button
- **Loading:** Disabled, spinner, "Uploading..."
- **Complete:** Show thumbnail, "Change image" button appears

**File Upload:**
1. User clicks "Upload image"
2. File picker opens (accept JPG, PNG, WebP)
3. User selects file
4. Client-side validation: size, type
5. Show progress: "Uploading... 45%"
6. Upload to blob storage
7. Show thumbnail in image field
8. Store URL in draft

**Error States:**
- File too large (> 5MB): "Image must be under 5MB"
- Wrong format: "Please upload JPG, PNG, or WebP"
- Upload failed: "Upload failed. Please try again."

---

### Field 4: Goal Amount (Currency)

**Label:** "Goal amount (R)"
**Input Type:** Currency number (`<input type="number">`)
**HTML Name Attribute:** `goalAmount`
**Currency:** South African Rand (ZAR / R)
**Min Value:** R 100 (1000 cents)
**Max Value:** R 50,000 (5,000,000 cents)
**Step:** 1 (whole rands)
**Placeholder:** `"599"`
**Default:** R 500 or from draft

**Responsive Sizing:**
- Mobile: w-full or w-2/3
- Desktop: w-1/3 or w-full in 2-col layout

**Tailwind Classes:**
```
Input: rounded-xl border-[#E7E5E4] focus:ring-primary/30 focus:border-primary
  h-11 px-4 py-2 bg-white text-text placeholder-text-muted
  transition-all duration-200
  text-right (for currency alignment)

Currency Prefix:
  Position: Absolute left inside input
  Text: "R "
  Color: text-muted
  Font-weight: semibold
```

**Validation Rules (Zod Schema):**
```typescript
goalAmount: z
  .coerce.number()
  .int("Amount must be a whole number")
  .min(100, "Goal must be at least R 100")
  .max(50000, "Goal cannot exceed R 50,000")
```

**Error Messages:**
- Required: "Goal amount is required"
- Below minimum: "Goal must be at least R 100"
- Above maximum: "Goal cannot exceed R 50,000"
- Not a number: "Please enter a valid amount"

**Default Value:** Load from draft: `draft?.goalAmount ? Math.round(draft.goalAmount / 100) : ""`

**Accessibility:**
- `<label htmlFor="goalAmount">`
- `aria-required="true"`
- `aria-describedby="goalAmount-help"` for helper text
- Screen reader: "Enter goal amount in South African Rand"

**Interactive Behaviors:**
- Format display: "R 599" with thousand separators (optional)
- Helper text below: "Tip: Set it slightly higher to account for smaller contributions. This covers fees and gives kids some spending money."
- Real-time validation feedback
- Spinner controls (+ and -) increment by 50 (optional)

**Payment Flow Integration:**
- This amount is stored in cents in database (`goalCents`)
- Used to calculate fee amounts in subsequent steps
- Passed to payment provider for collection
- Divided among contributors

---

## 5. INTERACTIVE BEHAVIORS

### Form Submission Flow

**Submit Handler:** `saveManualGiftAction` (server action)

**Pre-submission Validations:**
1. Validate gift name (required, 1-100 chars)
2. Validate description if provided (max 150 chars)
3. Check that image exists (either uploaded or generated)
4. Validate goal amount (100-50,000)
5. Show error banner if any validation fails
6. Disable submit button until all valid

**Submission Process:**
```typescript
async function saveManualGiftAction(formData: FormData) {
  'use server';

  // 1. Authenticate and validate auth
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);

  // 2. Check that child step completed
  if (!draft?.childPhotoUrl) {
    redirect('/create/child');
  }

  // 3. Extract form fields
  const giftName = formData.get('giftName');
  const giftDescription = formData.get('giftDescription');
  const giftImageUrl = formData.get('giftImageUrl');
  const giftImagePrompt = formData.get('giftImagePrompt');
  const goalAmount = formData.get('goalAmount');

  // 4. Check image exists (generated or uploaded)
  if (!giftImageUrl || !giftImagePrompt) {
    redirect('/create/gift?error=artwork');
  }

  // 5. Validate via Zod
  const result = manualGiftSchema.safeParse({
    giftName,
    giftDescription,
    giftImageUrl,
    giftImagePrompt,
    goalAmount,
  });

  if (!result.success) {
    redirect('/create/gift?error=invalid');
  }

  // 6. Convert goal to cents
  const goalCents = Math.round(result.data.goalAmount * 100);

  // 7. Save to draft
  await updateDreamBoardDraft(session.hostId, {
    giftName: result.data.giftName.trim(),
    giftDescription: result.data.giftDescription?.trim(),
    giftImageUrl: result.data.giftImageUrl,
    giftImagePrompt: result.data.giftImagePrompt,
    goalCents,
  });

  // 8. Redirect to next step
  redirect('/create/dates');
}
```

**Error Handling:**
- Parse error from URL searchParams
- Map error code to user-friendly message
- Show in red banner at top of card
- Clear error on focus in affected field

**Zod Schema:**
```typescript
const manualGiftSchema = z.object({
  giftName: z
    .string()
    .min(1, "Gift name is required")
    .max(100, "Gift name must be 100 characters or less")
    .trim(),
  giftDescription: z
    .string()
    .max(150, "Description must be 150 characters or less")
    .optional()
    .transform((v) => v === '' ? undefined : v),
  giftImageUrl: z
    .string()
    .url("Image URL must be valid"),
  giftImagePrompt: z
    .string()
    .min(1, "Image prompt is required"),
  goalAmount: z
    .coerce.number()
    .int("Amount must be a whole number")
    .min(100, "Goal must be at least R 100")
    .max(50000, "Goal cannot exceed R 50,000"),
});
```

### Button States

**Submit Button:**
- **Initial:** "Continue to dates" (enabled)
- **Loading:** "Continue to dates" (disabled, spinner, faded)
- **Error:** "Continue to dates" (enabled, error banner visible)
- **Hover:** Teal gradient, slight scale up
- **Active:** `active:scale-[0.97]` for press feedback

### AI Image Generation

**Trigger:** User clicks "✨ Generate gift image" button

**Process:**
1. Button shows loading spinner: "Generating..."
2. Open modal: "Generating beautiful gift illustrations..."
3. Send request to Claude API with gift name as prompt
4. Claude generates 3-4 illustrated gift images
5. Display options in modal (grid layout)
6. Each image clickable to select
7. On select: Modal closes, thumbnail appears in field
8. Store image URL and prompt in form state

**Prompt Template:**
```
"Generate a cheerful, colorful illustration of a [GIFT_NAME].
Style: cute, whimsical, suitable for children's birthday.
Format: Square, modern design with soft shadows.
Colors: Bright, warm, celebratory tones."
```

**Display of Generated Images:**
- Grid: 2-3 columns on desktop, 1 column on mobile
- Each image: 150x150px thumbnail, rounded-lg, clickable
- On hover: Border highlight, slight scale
- On select: Checkmark overlay, button becomes primary
- Download image and store blob URL

---

## 6. COMPONENT TREE

```
<CreateGiftPage> (Page Component)
├── Redirect handlers (requires auth, validates flow)
├── Data loading (getDreamBoardDraft, buildCreateFlowViewModel)
├── Error message resolution
│
└── <CreateFlowShell>
    ├── Header section (stepLabel, title, subtitle)
    │
    └── <Card>
        ├── <CardHeader>
        │   ├── <CardTitle> "Dream gift"
        │   └── <CardDescription> "Describe the dream gift and the goal amount."
        │
        └── <CardContent className="space-y-6">
            ├── {errorMessage && (
            │     <ErrorBanner message={errorMessage} />
            │   )}
            │
            └── <form action={saveManualGiftAction}>
                ├── <FormField>
                │   ├── <label htmlFor="giftName">
                │   └── <Input
                │       id="giftName"
                │       type="text"
                │       placeholder="Pink Electric Scooter"
                │       required
                │       defaultValue={draft?.giftName}
                │       maxLength={100}
                │     />
                │
                ├── <FormField>
                │   ├── <label htmlFor="giftDescription">
                │   ├── <Textarea
                │       id="giftDescription"
                │       placeholder="A fun way to..."
                │       defaultValue={draft?.giftDescription}
                │       maxLength={150}
                │     />
                │   └── <span className="text-xs text-text-muted">
                │       {charCount}/150 characters
                │     </span>
                │
                ├── <GiftArtworkGenerator>
                │   ├── Props:
                │   │   ├── defaultDescription: string
                │   │   ├── defaultImageUrl: string
                │   │   └── defaultPrompt: string
                │   │
                │   └── Internal:
                │       ├── <div className="image-preview">
                │       │   └── <Image src={imageUrl} />
                │       │
                │       ├── <Button onClick={openGenerateModal}>
                │       │   ✨ Generate gift image
                │       │ </Button>
                │       │
                │       ├── <Button onClick={openUploadModal}>
                │       │   Upload image
                │       │ </Button>
                │       │
                │       └── <GenerateImageModal>
                │           ├── Prompt input (pre-filled with giftName)
                │           ├── "Generate" button
                │           ├── Loading state
                │           └── Grid of generated images (clickable)
                │
                ├── <FormField>
                │   ├── <label htmlFor="goalAmount">
                │   ├── <Input
                │       id="goalAmount"
                │       type="number"
                │       min={100}
                │       max={50000}
                │       step={1}
                │       placeholder="599"
                │       required
                │       defaultValue={defaultGoal}
                │     />
                │   └── <p className="text-sm text-text-muted">
                │       Tip: Set it slightly higher...
                │     </p>
                │
                └── <Button type="submit">
                    Continue to dates
                  </Button>
```

---

## 7. TYPESCRIPT INTERFACES & SCHEMAS

### Props Interface

```typescript
interface CreateGiftPageProps {
  searchParams?: GiftSearchParams;
}

interface GiftSearchParams {
  error?: string;
}
```

### Form Data Types

```typescript
interface GiftFormData {
  giftName: string;
  giftDescription?: string;
  giftImageUrl: string;
  giftImagePrompt: string;
  goalAmount: number;
}

interface GiftDraft {
  giftName: string;
  giftDescription?: string;
  giftImageUrl: string;
  giftImagePrompt: string;
  goalCents: number;
  generatedAt?: Date;
  updatedAt: Date;
}

interface GeneratedImage {
  url: string;
  prompt: string;
  generatedAt: Date;
}
```

### Zod Schemas

```typescript
const manualGiftSchema = z.object({
  giftName: z
    .string()
    .min(1, "Gift name is required")
    .max(100, "Gift name must be 100 characters or less")
    .trim(),
  giftDescription: z
    .string()
    .max(150, "Description must be 150 characters or less")
    .optional()
    .transform((v) => v === '' ? undefined : v),
  giftImageUrl: z
    .string()
    .url("Image URL must be valid"),
  giftImagePrompt: z
    .string()
    .min(1, "Image prompt is required"),
  goalAmount: z
    .coerce.number()
    .int("Amount must be a whole number")
    .min(100, "Goal must be at least R 100")
    .max(50000, "Goal cannot exceed R 50,000"),
});

type ManualGiftPayload = z.infer<typeof manualGiftSchema>;

// Image generation validation
const generateImageSchema = z.object({
  prompt: z
    .string()
    .min(5, "Prompt must be at least 5 characters")
    .max(200, "Prompt must be 200 characters or less"),
});
```

### Error Message Mapping

```typescript
const giftErrorMessages: Record<string, string> = {
  invalid: 'Please complete all required fields.',
  artwork: 'Please generate or upload a gift image before continuing.',
  invalid_image_url: 'Image URL is invalid. Please try again.',
  no_image: 'Please provide a gift image.',
  generation_failed: 'Could not generate images. Please upload a photo instead.',
  upload_failed: 'Image upload failed. Please try again.',
  api_rate_limited: 'We\'re generating a lot of images. Please try again in a moment.',
};

const getGiftErrorMessage = (error?: string): string | null => {
  if (!error) return null;
  return giftErrorMessages[error] ?? null;
};
```

---

## 8. FILE STRUCTURE

```
src/
├── app/
│   └── (host)/
│       └── create/
│           └── gift/
│               ├── page.tsx (Main page component, server action)
│               ├── layout.tsx (Optional nested layout)
│               └── error.tsx (Optional error boundary)
│
├── components/
│   ├── layout/
│   │   ├── CreateFlowShell.tsx
│   │   └── WizardStepIndicator.tsx
│   ├── gift/
│   │   ├── GiftArtworkGenerator.tsx (Main AI/upload component)
│   │   ├── GenerateImageModal.tsx (Modal for AI generation)
│   │   ├── UploadImageModal.tsx (Modal for file upload, optional)
│   │   └── ImageGrid.tsx (Display generated image options)
│   └── ui/
│       ├── button.tsx
│       ├── card.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── modal.tsx
│       └── image.tsx (Next.js Image)
│
└── lib/
    ├── integrations/
    │   ├── ai-image-gen.ts (Claude image generation)
    │   └── blob.ts (Image upload to storage)
    ├── dream-boards/
    │   └── draft.ts (getDreamBoardDraft, updateDreamBoardDraft)
    ├── auth/
    │   └── clerk-wrappers.ts (requireHostAuth)
    └── observability/
        └── logger.ts (log function)
```

---

## 9. SERVER ACTIONS

### `saveManualGiftAction`

**Purpose:** Validate form data, verify image exists, save draft, and redirect

**Input:** FormData from form submission

**Process:**
1. Authenticate user
2. Load existing draft
3. Verify child step completed (childPhotoUrl exists)
4. Extract form fields
5. Verify image URL and prompt exist
6. Validate all fields via Zod
7. Convert goal amount to cents
8. Save draft to database
9. Redirect to next step or show error

**Validation:**
- Zod validation for all form fields
- Image URL validity check
- Image prompt existence check
- Auth check via `requireHostAuth()`
- Child step completion check

**Redirect Logic:**
```
Success:
  redirect('/create/dates')

Errors:
  redirect('/create/gift?error=invalid')           // Zod validation failed
  redirect('/create/gift?error=artwork')           // No image or prompt
  redirect('/create/gift?error=invalid_image_url') // Bad image URL
  redirect('/create/child')                        // Child step not completed
```

**Error Handling:**
- Log errors to observability service
- Capture in Sentry if critical
- Return user-friendly error messages
- Allow retry on transient errors

---

## 10. STATE MANAGEMENT

### Draft Persistence Strategy

**What's Stored:**
- `giftName` (string, 1-100 chars)
- `giftDescription` (string, optional, max 150 chars)
- `giftImageUrl` (string, full URL from storage or Claude)
- `giftImagePrompt` (string, for regeneration or reference)
- `goalCents` (number, in cents)
- `generatedImages` (array, for fallback if regenerate)
- `createdAt` (ISO timestamp)
- `updatedAt` (ISO timestamp)

**Where It's Stored:**
- Primary: Database (dream_boards table, `draft_data` JSONB)
- Generated images: Blob storage (Vercel Blob or S3)
- Session: Form state (React state or form fields)

**Loading Draft:**
```typescript
const draft = await getDreamBoardDraft(session.hostId);
const defaultGiftName = draft?.giftName ?? '';
const defaultDescription = draft?.giftDescription ?? '';
const defaultImageUrl = draft?.giftImageUrl ?? '';
const defaultGoal = draft?.goalCents ? Math.round(draft.goalCents / 100) : '';
```

**Saving Draft:**
```typescript
await updateDreamBoardDraft(session.hostId, {
  giftName: result.data.giftName.trim(),
  giftDescription: result.data.giftDescription?.trim(),
  giftImageUrl: result.data.giftImageUrl,
  giftImagePrompt: result.data.giftImagePrompt,
  goalCents,
});
```

### Hidden Form Fields

The component uses hidden input fields to persist generated/uploaded image data between form submission attempts:

```html
<input type="hidden" name="giftImageUrl" value={imageUrl} />
<input type="hidden" name="giftImagePrompt" value={prompt} />
```

### Back/Forward Navigation

**Back to Child Step:**
- User clicks back button or browser back
- Show confirmation: "Discard changes to gift details?"
- Options: "Keep Editing" or "Discard"
- On confirm: Navigate to `/create/child`
- Draft still saved in database

**Forward to Next Step (Success):**
- Save draft to database before redirect
- Redirect only after save completes
- If save fails, show error and allow retry

**Page Refresh:**
- Re-load draft from database
- Pre-populate all fields
- Show existing image thumbnail
- User can continue or modify

---

## 11. RESPONSIVE DESIGN

### Breakpoints

**Mobile (< 768px / < md):**
- Full-width input fields
- Image container: 300x300px or 280x280px
- Goal amount: full width
- Button: full width, h-11
- Modal: full screen or 90% width

**Tablet (768px - 1024px / md to lg):**
- Full-width form fields
- Image container: 350x350px
- Goal amount: full width or 1/3 width
- Layout: Image and goal amount side-by-side (optional)
- Button: auto width, centered

**Desktop (>= 1024px / >= lg):**
- Max-width card (600-700px)
- Image container: 400x400px
- 2-column layout: Image on left, Goal on right
- Goal amount: 1/3 width on right side
- Button: auto width

### Touch & Accessibility

**Minimum Touch Target:** 44x44px (WCAG 2.1 AA)
- Buttons: h-11 (44px) or h-14 (56px)
- Input fields: h-11 (44px)
- Modal close button: 44x44px
- Image gallery: 48x48px per thumbnail + gaps

**Spacing:**
- Field gaps: gap-6 (24px)
- Card padding: px-6 py-8 on mobile, px-8 py-10 on desktop
- Label to input: 2 (8px)

---

## 12. ANIMATIONS & TRANSITIONS

### Entry Animation

```css
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card {
  animation: fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both;
}
```

### AI Generation Loading

```css
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.image-loading::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shimmer 2s infinite;
}
```

### Image Transitions

**On Upload/Generate:**
```css
.image-thumbnail {
  animation: fadeUp 0.4s ease-out;
}
```

**Modal Appearance:**
```css
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Image Grid Selection

```css
.image-option {
  transition: all 200ms ease;
  border: 2px solid transparent;

  &:hover {
    transform: scale(1.05);
    border-color: #0D9488;
  }

  &.selected {
    border-color: #0D9488;
    box-shadow: 0 0 0 4px rgba(13, 148, 136, 0.1);
  }
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
<label for="giftName" class="text-sm font-medium text-text">
  Gift name
</label>
<input id="giftName" name="giftName" required />

<!-- Error association -->
<input aria-describedby="giftName-error" aria-invalid={hasError} />
{hasError && (
  <span id="giftName-error" role="alert">
    {errorMessage}
  </span>
)}
```

### ARIA Attributes

```html
<!-- Form fields -->
<input aria-required="true" aria-label="Gift name" />
<textarea aria-required="true" />
<input aria-required="true" aria-label="Goal amount in South African Rand" />

<!-- Optional indicator -->
<span aria-label="optional">(optional)</span>

<!-- Image generation -->
<button aria-busy={isGenerating} disabled={isGenerating}>
  ✨ Generate gift image
</button>

<!-- Modal -->
<dialog role="dialog" aria-label="Generate gift images">
  <h2 id="modal-title">Generating beautiful gift illustrations...</h2>
  <button aria-label="Close modal">×</button>
</dialog>

<!-- Image grid -->
<div role="group" aria-label="Select generated image">
  <button role="radio" aria-checked={selected}>
    <img alt="Generated gift image option 1" />
  </button>
</div>

<!-- Error messages -->
<div role="alert" aria-live="polite">
  {errorMessage}
</div>
```

### Keyboard Navigation

**Tab Order:**
1. Gift name input
2. Gift description input
3. Generate image button
4. Upload image button
5. Goal amount input
6. Continue button
7. Back link

**Keyboard Shortcuts (modal):**
- **Escape:** Close modal
- **Tab:** Navigate image options
- **Enter:** Select focused image
- **Arrow keys:** Navigate between image options (optional enhancement)

**Screen Reader Experience:**

**Page Load:**
"Page loaded: Create Dreamboard, Step 2 of 6, The Gift. Form requires gift name, image, and goal amount."

**Field Focus:**
"Gift name, edit text, required, 0 of 100 characters"
"Gift description, text area, optional, 0 of 150 characters"
"Goal amount in South African Rand, edit number, required"

**Image Generation:**
"Generating images... button loading"
"Dialog: Generating beautiful gift illustrations... Please wait."

**Image Selection:**
"Generated gift image option 1 of 4, button, not selected"
"Selected: Generated gift image option 2 of 4"

### Color Contrast

- Text on background: >= 4.5:1 (WCAG AA)
- Link text: >= 4.5:1 (WCAG AA)
- Primary button text on teal: >= 4.5:1 (WCAG AA)
- Error text on white: >= 4.5:1 (WCAG AA)

### Visual Indicators

- Required fields: `*` asterisk + `aria-required="true"`
- Errors: Icon + text message + border color
- Image selection: Border highlight + checkmark overlay
- Loading state: Spinner icon + "Loading..." text

---

## 14. ERROR HANDLING

### Validation Errors

**Client-Side (Real-Time):**
```typescript
const validateGiftName = (value: string): string | null => {
  if (!value) return "Gift name is required";
  if (value.length > 100) return "Gift name must be 100 characters or less";
  return null;
};

const validateGoalAmount = (value: number): string | null => {
  if (!value) return "Goal amount is required";
  if (value < 100) return "Goal must be at least R 100";
  if (value > 50000) return "Goal cannot exceed R 50,000";
  return null;
};
```

**Server-Side (Final):**
```typescript
const result = manualGiftSchema.safeParse({
  giftName,
  giftDescription,
  giftImageUrl,
  giftImagePrompt,
  goalAmount,
});

if (!result.success) {
  redirect('/create/gift?error=invalid');
}
```

### Image-Related Errors

**Generation API Errors:**
```
rate_limited    → "We're generating a lot of images right now. Please try again in a moment."
api_error       → "Could not generate images. Please try uploading a photo instead."
invalid_prompt  → "Please enter a gift name to generate images."
timeout         → "Generation took too long. Please try again."
```

**Upload Errors:**
```
file_too_large  → "Image must be under 5MB."
invalid_type    → "Please upload JPG, PNG, or WebP."
upload_failed   → "Upload failed. Please try again."
network_error   → "Connection lost. Please try again."
```

### Network & Session Errors

**Network Errors:**
- No internet: "Connection lost. Please check your internet and try again."
- Timeout: "Request timed out. Please try again."
- Server error (5xx): "Something went wrong. Please try again later."

**Session Errors:**
- Session expired: Redirect to login, return to `/create/gift` after auth
- Unauthorized: Redirect to login page

### Error Recovery

**Transient Errors (network, rate limit):**
1. Show error banner with description and retry button
2. Keep form data intact
3. Allow immediate retry
4. Progressive backoff: wait 3s, then 6s, then 12s before next retry

**Permanent Errors (validation):**
1. Show error banner with explanation
2. Highlight affected field(s) with red border
3. Clear error on field focus
4. Allow correction and resubmit

**Fatal Errors (auth, session):**
1. Clear sensitive data
2. Redirect to login
3. Show "Please log in again" message

---

## 15. EDGE CASES

### Case 1: Draft Already Exists

**Scenario:** User navigates back to `/create/gift` after completing step 2

**Behavior:**
- Load existing draft data
- Pre-populate all fields
- Show image thumbnail
- Allow user to:
  - Modify any field
  - Generate new images
  - Continue to next step
  - Navigate back

### Case 2: Image Generation Returns Empty

**Scenario:** Claude API returns empty or no images

**Behavior:**
- Show error: "Could not generate images. Please try uploading a photo instead."
- Keep generate button enabled for retry
- Suggest uploading as fallback
- Log error for debugging

### Case 3: Upload Fails Midway

**Scenario:** File uploading to storage times out or fails

**Behavior:**
- Show error: "Upload failed. Please try again."
- Keep upload button enabled
- Do not save partial image URL to draft
- Clear file input for retry

### Case 4: Multiple Generations Requested

**Scenario:** User clicks "Generate" button while already generating

**Behavior:**
- Disable button while generating
- Show loading state with spinner
- Ignore additional clicks
- Only one API call sent

### Case 5: Very Large Description

**Scenario:** User pastes 300-character description

**Behavior:**
- Client-side truncation at 150 characters
- Show error: "Description must be 150 characters or less"
- Allow user to trim and resubmit
- Don't save until valid

### Case 6: Goal Amount Just Above Maximum

**Scenario:** User enters R 50,001 or R 99,999

**Behavior:**
- Validation fails: "Goal cannot exceed R 50,000"
- Show error message
- Allow user to decrease and resubmit

### Case 7: Image URL Becomes Invalid

**Scenario:** Image stored in draft, but URL expires or becomes unreachable

**Behavior:**
- Show broken image icon with alt text
- Button: "Re-upload image" or "Generate new image"
- Don't block form submission if image URL is syntactically valid
- Log warning for debugging

### Case 8: User Rapid-Clicks Continue Button

**Scenario:** User clicks "Continue to dates" 3 times rapidly

**Behavior:**
- Button disabled on first click
- Show loading state
- Ignore subsequent clicks
- Only one submission sent to server

### Case 9: Character Encoding Issues

**Scenario:** User enters emoji or special characters: "🎸 Electric Guitar"

**Behavior:**
- Allow emoji in gift name
- Store and display properly
- No validation error (unless PM restricts)
- Display correctly in next steps

### Case 10: Session Expires During Generation

**Scenario:** AI generation in progress, session token expires

**Behavior:**
- API call fails with 401
- Show error: "Your session expired. Please log in again."
- Redirect to login
- After login, return to `/create/gift`
- Draft still saved with previous data

---

## 16. COMPONENT CODE REFERENCE

### Page Component Structure

```typescript
// src/app/(host)/create/gift/page.tsx

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { GiftArtworkGenerator } from '@/components/gift/GiftArtworkGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft, updateDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const manualGiftSchema = z.object({
  giftName: z
    .string()
    .min(1, "Gift name is required")
    .max(100, "Gift name must be 100 characters or less")
    .trim(),
  giftDescription: z
    .string()
    .max(150, "Description must be 150 characters or less")
    .optional()
    .transform((v) => v === '' ? undefined : v),
  giftImageUrl: z
    .string()
    .url("Image URL must be valid"),
  giftImagePrompt: z
    .string()
    .min(1, "Image prompt is required"),
  goalAmount: z
    .coerce.number()
    .int("Amount must be a whole number")
    .min(100, "Goal must be at least R 100")
    .max(50000, "Goal cannot exceed R 50,000"),
});

async function saveManualGiftAction(formData: FormData) {
  'use server';
  // Implementation as per spec
}

const giftErrorMessages: Record<string, string> = {
  invalid: 'Please complete all required fields.',
  artwork: 'Please generate or upload a gift image before continuing.',
  // ... more mappings
};

export default async function CreateGiftPage({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  // Implementation as per spec
}
```

### GiftArtworkGenerator Component

```typescript
// src/components/gift/GiftArtworkGenerator.tsx

interface GiftArtworkGeneratorProps {
  defaultDescription: string;
  defaultImageUrl: string;
  defaultPrompt: string;
}

export function GiftArtworkGenerator({
  defaultDescription,
  defaultImageUrl,
  defaultPrompt,
}: GiftArtworkGeneratorProps) {
  const [imageUrl, setImageUrl] = useState(defaultImageUrl);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [showModal, setShowModal] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const images = await generateGiftImages(defaultDescription);
      setGeneratedImages(images);
      setShowModal(true);
    } catch (error) {
      // Handle error
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectImage = (image: GeneratedImage) => {
    setImageUrl(image.url);
    setPrompt(image.prompt);
    setShowModal(false);
  };

  // Implementation continues...
}
```

---

## SUMMARY

This specification provides comprehensive details for implementing Step 2 of Gifta's Create Flow. Runtime implementation captures gift information with curated icon selection. Key highlights:

- **Warmth & Delight:** Emoji titles, curated icon visuals, celebratory tone
- **Enterprise-Grade:** Full accessibility, robust validation, error recovery
- **Mobile-First:** Responsive layouts, touch-friendly interactions
- **Deterministic Visuals:** Curated gift icon catalog with suggestion helper
- **Robust:** Comprehensive error handling, draft persistence, edge case coverage

Ready for implementation by an AI agent using Next.js, React, TypeScript, Tailwind CSS, Zod, and icon catalog helpers.
