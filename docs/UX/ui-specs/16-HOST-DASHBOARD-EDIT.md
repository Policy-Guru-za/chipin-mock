# Gifta UX v2: Host Dashboard - Dreamboard Edit Modal
## Comprehensive UI Specification

**Document Version:** 1.0
**Status:** Implementation-Ready
**Route:** `/dashboard/[id]` (modal overlay, no separate route)
**Last Updated:** February 2025
**Target Audience:** AI coding agents, UI developers

---

## Table of Contents

1. [Screen Overview](#screen-overview)
2. [Visual Layout](#visual-layout)
3. [Form Specifications](#form-specifications)
4. [Editable vs Locked Fields](#editable-vs-locked-fields)
5. [Validation Rules](#validation-rules)
6. [Component Tree](#component-tree)
7. [TypeScript Interfaces](#typescript-interfaces)
8. [File Structure](#file-structure)
9. [Form State Management](#form-state-management)
10. [Change Confirmation Flow](#change-confirmation-flow)
11. [Responsive Behavior](#responsive-behavior)
12. [Animations](#animations)
13. [Accessibility](#accessibility)
14. [Error Handling](#error-handling)
15. [Edge Cases](#edge-cases)

---

## Screen Overview

### Purpose
The Edit Modal allows parents to modify certain aspects of their Dreamboard after creation. The modal emphasizes which fields can be edited vs which are locked, with clear explanations for restrictions.

### Trigger
- Opened from Detail View via "✏️ Edit Dreamboard" button
- Modal overlay blocks main content
- Accessible via keyboard (Escape to close)

### Key Principles
- **Limited Editability:** Most fields are locked to maintain consistency
- **Clear Transparency:** Explain why fields can't be changed
- **Confirmation:** Show changes before saving with diff display
- **Validation:** Real-time feedback on field constraints

---

## Visual Layout

### Mobile Modal (320px - 767px)

```
┌─────────────────────────────────────┐
│  Edit Emma's Dreamboard      [×]   │ ← Header
├─────────────────────────────────────┤
│                                     │
│  Some fields can't be changed       │
│  after creation. Here's why.        │ ← Info banner
│                                     │
├─────────────────────────────────────┤
│                                     │
│  EDITABLE FIELDS                    │
│                                     │
│  Child's Name                       │
│  [Emma________________] [ⓘ]         │ ← Editable field
│                                     │
│  Child's Photo                      │
│  [Current photo]                    │
│  [Replace photo]                    │ ← Upload button
│                                     │
│  Party Date                         │
│  [Jan 15, 2025] →                   │ ← Date picker
│  Can only extend, not shorten       │
│                                     │
│  Contribution Deadline              │
│  [Jan 8, 2025] →                    │ ← Date picker
│  Can only extend                    │
│                                     │
│  Payout Method                      │
│  [Karri Card ••••5678] → Change     │ ← Link (separate flow)
│                                     │
├─────────────────────────────────────┤
│                                     │
│  LOCKED FIELDS                      │
│  (Can't be changed)                 │
│                                     │
│  Birthday Date                      │
│  [Jan 15, 2001]                     │ ← Disabled/gray
│  Birthday is permanent              │
│                                     │
│  Age                                │
│  [7]                                │ ← Disabled/gray
│  Automatically calculated            │
│                                     │
│  [Gift name, description, image]    │
│  [shown as gray/disabled]           │
│                                     │
├─────────────────────────────────────┤
│                                     │
│  [Cancel] [Save Changes]            │ ← Actions
│                                     │
└─────────────────────────────────────┘
```

### Desktop Modal (1024px+)

```
┌────────────────────────────────────────────────────────────┐
│  Edit Emma's Dreamboard                          [×]      │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Some fields can't be changed after creation.            │
│  Here's why. [Learn more ↗]                              │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  EDITABLE FIELDS                                          │
│                                                            │
│  Child's Name                                            │
│  ┌──────────────────────────────────────────┐           │
│  │ Emma                                     │            │
│  └──────────────────────────────────────────┘           │
│  Max 30 characters                                       │
│                                                            │
│  Child's Photo                                           │
│  [Current photo: Emma.jpg]                              │
│  ┌──────────────────────────────────────────┐           │
│  │ Replace photo                            │           │
│  └──────────────────────────────────────────┘           │
│                                                            │
│  Party Date          │  Contribution Deadline             │
│  ┌─────────────────┐ │  ┌────────────────────────┐       │
│  │ Jan 15, 2025 → │ │  │ Jan 8, 2025 →        │       │
│  └─────────────────┘ │  └────────────────────────┘       │
│                       │  Note: Can only extend deadline    │
│                                                            │
│  Payout Method                                           │
│  Karri Card ••••5678                                     │
│  [Change payout method →]                               │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  LOCKED FIELDS (Can't be changed)                        │
│                                                            │
│  Birthday Date       │  Age                              │
│  Jan 15, 2001       │  7                                 │
│  (Permanent)        │  (Auto-calculated)                 │
│                                                            │
│  Gift Name: Bicycle                                      │
│  Gift Description: Red 10-speed...                       │
│  Gift Image: bicycle.jpg                                 │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                  [Cancel]  [Save Changes]                │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Form Specifications

### Modal Container

```html
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent className="max-w-2xl">
    <DialogHeader>
      <DialogTitle className="text-2xl font-display font-bold">
        Edit {childName}'s Dreamboard
      </DialogTitle>
      <DialogDescription>
        Some fields can't be changed after creation. Here's why.
      </DialogDescription>
    </DialogHeader>

    <ScrollArea className="h-[60vh]">
      <EditForm board={board} onSubmit={handleSubmit} />
    </ScrollArea>

    <DialogFooter>
      <Button variant="outline" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" type="submit" loading={isSubmitting}>
        Save Changes
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Modal Specifications:**
- Max width: `max-w-2xl` (672px)
- Scrollable content: `h-[60vh]` (60% of viewport)
- Overlay: Dark semi-transparent backdrop
- Animation: Fade in + scale up
- Close: Escape key, [×] button, Cancel button

---

### Section 1: Info Banner

```html
<Card variant="minimal" padding="md" className="mb-6 bg-blue-50 border-blue-200">
  <div className="flex gap-3">
    <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-text font-semibold mb-1">
        Some fields can't be changed after creation
      </p>
      <p className="text-sm text-text-secondary">
        This helps keep your Dreamboard secure and consistent. Birthday dates,
        gift information, and charity settings are permanent to prevent fraud.
      </p>
    </div>
  </div>
</Card>
```

**Specifications:**
- Background: Light blue (`bg-blue-50`)
- Border: Blue (`border-blue-200`)
- Icon: Info icon, 20px
- Text: Small and secondary
- Purpose: Educational, not alarming

---

### Section 2: Editable Fields

#### 2.1 Child's Name

```html
<FormGroup>
  <Label htmlFor="childName" className="text-base font-semibold">
    Child's Name
    <span className="text-red-600 ml-1">*</span>
  </Label>

  <InputWithCounter
    id="childName"
    type="text"
    value={childName}
    onChange={handleChildNameChange}
    maxLength={30}
    placeholder="Emma"
    error={errors.childName}
  />

  <div className="flex items-center justify-between mt-2">
    <span className="text-xs text-text-muted">
      {childName.length} / 30 characters
    </span>
    {childName === originalName ? (
      <span className="text-xs text-text-muted">No changes</span>
    ) : (
      <span className="text-xs text-primary font-semibold">Changed ●</span>
    )}
  </div>

  {errors.childName && (
    <span className="text-sm text-error mt-2 flex items-center gap-1">
      <AlertIcon size="sm" />
      {errors.childName}
    </span>
  )}
</FormGroup>
```

**Specifications:**
- Input type: `text`
- Max length: 30 characters
- Required: Yes (red asterisk)
- Counter: Live character count (e.g., "15 / 30")
- Change indicator: Shows "Changed ●" if modified
- Validation: Min 1 char, max 30 chars
- Error: Inline error message with icon

#### 2.2 Child's Photo

```html
<FormGroup>
  <Label htmlFor="childPhoto" className="text-base font-semibold">
    Child's Photo
  </Label>

  <div className="space-y-3">
    <!-- Current Photo Display -->
    <div className="relative w-24 h-24">
      <Image
        src={currentPhotoUrl}
        alt={childName}
        width={96}
        height={96}
        className="rounded-full object-cover border-2 border-primary"
      />
      <p className="text-xs text-text-muted mt-2">
        Current photo
      </p>
    </div>

    <!-- Upload Button -->
    <div>
      <Input
        id="childPhoto"
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      <Button
        variant="outline"
        size="md"
        onClick={() => document.getElementById('childPhoto')?.click()}
      >
        <UploadIcon size="sm" />
        Replace photo
      </Button>

      {newPhoto && (
        <div className="mt-3">
          <Image
            src={URL.createObjectURL(newPhoto)}
            alt="New photo preview"
            width={96}
            height={96}
            className="rounded-full object-cover border-2 border-success"
          />
          <p className="text-xs text-success mt-2">New photo preview</p>
        </div>
      )}
    </div>

    <!-- Help Text -->
    <p className="text-xs text-text-muted">
      Max 5MB. Formats: PNG, JPG, WebP
    </p>
  </div>

  {errors.childPhoto && (
    <span className="text-sm text-error mt-2">
      {errors.childPhoto}
    </span>
  )}
</FormGroup>
```

**Specifications:**
- Current photo: 96px × 96px, rounded full, border-2 border-primary
- Upload: File input (hidden), triggered by button
- Accepted formats: PNG, JPG, WebP
- Max size: 5MB
- Preview: Show new photo with "New photo preview" label
- Icon: Upload icon on button
- Help text: Max size and formats

#### 2.3 Party Date

```html
<FormGroup>
  <Label htmlFor="partyDate" className="text-base font-semibold">
    Party Date
    <span className="text-red-600 ml-1">*</span>
  </Label>

  <DatePicker
    id="partyDate"
    value={partyDate}
    onChange={handlePartyDateChange}
    minDate={today}
    maxDate={null}
    disabled={false}
    format="MMM DD, YYYY"
  />

  <p className="text-xs text-text-muted mt-2">
    Can only extend party date, not shorten
  </p>

  {errors.partyDate && (
    <span className="text-sm text-error mt-2">
      {errors.partyDate}
    </span>
  )}
</FormGroup>
```

**Specifications:**
- Input type: Date picker
- Min date: Today (can't set in past)
- Max date: None (unlimited future)
- Current value: Original party date
- Format display: "MMM DD, YYYY" (Jan 15, 2025)
- Constraint: Can only move forward, not backward
- Help text: Explain constraint clearly

#### 2.4 Contribution Deadline

```html
<FormGroup>
  <Label htmlFor="deadline" className="text-base font-semibold">
    Contribution Deadline
    <span className="text-red-600 ml-1">*</span>
  </Label>

  <DatePicker
    id="deadline"
    value={deadline}
    onChange={handleDeadlineChange}
    minDate={today}
    maxDate={partyDate}
    disabled={false}
    format="MMM DD, YYYY"
  />

  <p className="text-xs text-text-muted mt-2">
    Can only extend deadline, not shorten
  </p>

  {errors.deadline && (
    <span className="text-sm text-error mt-2">
      {errors.deadline}
    </span>
  )}
</FormGroup>
```

**Specifications:**
- Input type: Date picker
- Min date: Today (not in past)
- Max date: Party date (can't exceed party date)
- Current value: Original deadline
- Format: "MMM DD, YYYY"
- Constraint: Can only extend, not reduce
- Help text: Explain constraint

#### 2.5 Payout Method

```html
<FormGroup>
  <Label className="text-base font-semibold mb-3">
    Payout Method
  </Label>

  <div className="p-4 rounded-xl border border-border bg-surface">
    <div className="flex items-center justify-between">
      <div>
        <p className="font-semibold text-text">{payoutMethod}</p>
        <p className="text-sm text-text-muted mt-1">
          Card ending in {cardLast4}
        </p>
      </div>
      <Button
        variant="link"
        size="sm"
        onClick={openPayoutFlow}
        className="text-primary"
      >
        Change
      </Button>
    </div>
  </div>

  <p className="text-xs text-text-muted mt-2">
    Payout method is managed separately in account settings.
  </p>
</FormGroup>
```

**Specifications:**
- Display current method and last 4 digits
- "Change" button opens separate flow (don't edit in modal)
- Read-only display (not editable inline)
- Info text explains it's managed elsewhere

---

### Section 3: Locked Fields

```html
<Separator className="my-6" />

<h3 className="text-lg font-semibold text-text mb-4">
  Locked Fields
  <span className="text-xs text-text-muted font-normal ml-2">
    Can't be changed
  </span>
</h3>

<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <!-- Birthday Date (Locked) -->
  <FormGroup>
    <Label className="text-sm font-semibold text-text-muted">
      Birthday Date
    </Label>
    <Input
      type="text"
      value={birthdayDateFormatted}
      disabled={true}
      className="bg-background-muted opacity-50 cursor-not-allowed"
    />
    <p className="text-xs text-text-muted mt-2">
      Permanent to prevent fraud
    </p>
  </FormGroup>

  <!-- Age (Locked) -->
  <FormGroup>
    <Label className="text-sm font-semibold text-text-muted">
      Age
    </Label>
    <Input
      type="text"
      value={age}
      disabled={true}
      className="bg-background-muted opacity-50 cursor-not-allowed"
    />
    <p className="text-xs text-text-muted mt-2">
      Auto-calculated from birthday
    </p>
  </FormGroup>

  <!-- Gift Name (Locked) -->
  <FormGroup>
    <Label className="text-sm font-semibold text-text-muted">
      Gift Name
    </Label>
    <Input
      type="text"
      value={giftName}
      disabled={true}
      className="bg-background-muted opacity-50 cursor-not-allowed"
    />
    <p className="text-xs text-text-muted mt-2">
      Permanently locked
    </p>
  </FormGroup>

  <!-- Gift Description (Locked) -->
  <FormGroup>
    <Label className="text-sm font-semibold text-text-muted">
      Gift Description
    </Label>
    <textarea
      value={giftDescription}
      disabled={true}
      className="bg-background-muted opacity-50 cursor-not-allowed min-h-24"
    />
    <p className="text-xs text-text-muted mt-2">
      Permanently locked
    </p>
  </FormGroup>
</div>

<!-- Gift Image (Locked) -->
<FormGroup className="mt-6">
  <Label className="text-sm font-semibold text-text-muted">
    Gift Image
  </Label>
  <div className="p-4 rounded-xl border border-border bg-surface">
    <Image
      src={giftImageUrl}
      alt={giftName}
      width={120}
      height={120}
      className="rounded-lg"
    />
    <p className="text-xs text-text-muted mt-2">
      Permanently locked
    </p>
  </div>
</FormGroup>
```

**Specifications:**
- Inputs: `disabled={true}`
- Background: `bg-background-muted` (#FAF9F7)
- Opacity: `opacity-50`
- Cursor: `cursor-not-allowed`
- Text color: `text-text-muted` (slightly grayed)
- Help text: Explain why locked (1 line each)
- No interaction: Can't focus, can't edit

---

## Validation Rules

### Client-Side Validation

```typescript
interface EditFormErrors {
  childName?: string;
  childPhoto?: string;
  partyDate?: string;
  deadline?: string;
}

function validateForm(data: EditFormData): EditFormErrors {
  const errors: EditFormErrors = {};

  // Child Name validation
  if (!data.childName || data.childName.trim().length === 0) {
    errors.childName = 'Child name is required';
  } else if (data.childName.length > 30) {
    errors.childName = 'Name must be 30 characters or less';
  }

  // Child Photo validation
  if (data.childPhoto) {
    if (data.childPhoto.size > 5 * 1024 * 1024) {
      errors.childPhoto = 'Photo must be smaller than 5MB';
    }
    const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
    if (!validTypes.includes(data.childPhoto.type)) {
      errors.childPhoto = 'Only PNG, JPG, and WebP images are allowed';
    }
  }

  // Party Date validation
  const today = new Date();
  const partyDate = new Date(data.partyDate);
  const originalPartyDate = new Date(originalBoard.partyDate);

  if (partyDate < today) {
    errors.partyDate = 'Party date cannot be in the past';
  }

  if (partyDate < originalPartyDate) {
    errors.partyDate = 'Party date can only be extended, not shortened';
  }

  // Contribution Deadline validation
  const deadline = new Date(data.deadline);
  const originalDeadline = new Date(originalBoard.deadline);

  if (deadline < today) {
    errors.deadline = 'Deadline cannot be in the past';
  }

  if (deadline > partyDate) {
    errors.deadline = 'Deadline cannot be after party date';
  }

  if (deadline < originalDeadline) {
    errors.deadline = 'Deadline can only be extended, not shortened';
  }

  return errors;
}
```

### Server-Side Validation

```typescript
// In API endpoint
function validateEditRequest(
  boardId: string,
  currentBoard: DreamBoardDetail,
  updateData: EditFormData
): ValidationError[] {
  const errors: ValidationError[] = [];

  // Re-validate all fields server-side
  // Catch any tampering or edge cases

  // Party date constraint
  if (new Date(updateData.partyDate) < new Date(currentBoard.partyDate)) {
    errors.push({
      field: 'partyDate',
      message: 'Party date cannot be changed to an earlier date',
    });
  }

  // Deadline constraint
  if (new Date(updateData.deadline) < new Date(currentBoard.deadline)) {
    errors.push({
      field: 'deadline',
      message: 'Contribution deadline cannot be shortened',
    });
  }

  return errors;
}
```

---

## Editable vs Locked Fields

### Editable Fields

| Field | Constraints | Why Editable |
|-------|-------------|--------------|
| **Child's Name** | Min 1, Max 30 chars | Parent may correct spelling or prefer alternate name |
| **Child's Photo** | 5MB max, PNG/JPG/WebP | Better photo may become available |
| **Party Date** | Can only extend forward, not reduce | Gives flexibility for scheduling |
| **Contribution Deadline** | Can only extend, must be ≤ party date | Allows more time if needed |
| **Payout Method** | Managed separately | Should use dedicated account settings |

### Locked Fields

| Field | Why Locked |
|-------|-----------|
| **Birthday Date** | Fraud prevention; age-appropriate validation |
| **Age** | Calculated from birthday; never changes |
| **Gift Name** | Prevents changing what children are receiving |
| **Gift Description** | Prevents fraud (high-value item → low-value) |
| **Gift Image** | Prevents misleading contributors |
| **Charity Settings** | Once chosen, locked to maintain commitment |

---

## Change Confirmation Flow

### After User Clicks "Save Changes"

1. **Validate locally** → Show errors if any
2. **Send API request** with changed fields only
3. **Wait for API response**
4. **If success:** Show confirmation modal with diff
5. **If error:** Show error message, keep modal open

#### Confirmation Modal

```html
<Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
  <DialogContent className="max-w-xl">
    <DialogHeader>
      <DialogTitle>Confirm Changes</DialogTitle>
      <DialogDescription>
        Your changes will be visible to all contributors immediately.
      </DialogDescription>
    </DialogHeader>

    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-text mb-2">What's changing:</h4>
        <ul className="space-y-2 text-sm">
          {changes.map((change) => (
            <li key={change.field} className="flex items-start gap-2">
              <span className="text-blue-600 mt-0.5">→</span>
              <div>
                <p className="font-semibold text-text">{change.label}</p>
                <p className="text-text-muted">
                  {change.oldValue} <span className="text-primary">→</span> {change.newValue}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>

    <DialogFooter>
      <Button variant="outline" onClick={() => setShowConfirmation(false)}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleConfirmSave} loading={isSaving}>
        Yes, save these changes
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Changes Display:**
- Old value → New value format
- Only show changed fields
- Blue highlight to draw attention
- Clear confirmation language

---

## Component Tree

```
EditDreamBoardModal
├── DialogOverlay
├── DialogContent
│   ├── DialogHeader
│   │   ├── DialogTitle
│   │   └── DialogDescription
│   │
│   ├── ScrollArea
│   │   └── EditForm
│   │       ├── InfoBanner
│   │       │   ├── InfoIcon
│   │       │   └── Description text
│   │       │
│   │       ├── EditableFieldsSection
│   │       │   ├── ChildNameField
│   │       │   │   ├── Label
│   │       │   │   ├── Input
│   │       │   │   ├── CharacterCounter
│   │       │   │   └── ErrorMessage
│   │       │   ├── ChildPhotoField
│   │       │   │   ├── Label
│   │       │   │   ├── CurrentPhoto
│   │       │   │   ├── UploadButton
│   │       │   │   ├── PreviewPhoto
│   │       │   │   └── HelpText
│   │       │   ├── PartyDateField
│   │       │   │   ├── Label
│   │       │   │   ├── DatePicker
│   │       │   │   ├── ConstraintText
│   │       │   │   └── ErrorMessage
│   │       │   ├── DeadlineField
│   │       │   │   ├── Label
│   │       │   │   ├── DatePicker
│   │       │   │   └── ErrorMessage
│   │       │   └── PayoutMethodField
│   │       │       ├── Label
│   │       │       ├── ReadOnlyDisplay
│   │       │       ├── ChangeButton
│   │       │       └── InfoText
│   │       │
│   │       ├── Separator
│   │       │
│   │       └── LockedFieldsSection
│   │           ├── BirthdayDateField (disabled)
│   │           ├── AgeField (disabled)
│   │           ├── GiftNameField (disabled)
│   │           ├── GiftDescriptionField (disabled)
│   │           └── GiftImageField (disabled)
│   │
│   └── DialogFooter
│       ├── CancelButton
│       └── SaveButton
│
└── ConfirmationModal (conditional)
    ├── DialogHeader
    ├── ChangesList
    │   └── ChangeItem (for each changed field)
    └── DialogFooter
        ├── BackButton
        └── ConfirmButton
```

---

## TypeScript Interfaces

### Form Data

```typescript
interface EditFormData {
  childName: string;
  childPhoto?: File;
  partyDate: string; // ISO 8601 date
  deadline: string; // ISO 8601 date
  payoutMethod: 'karri_card' | 'bank_transfer'; // Read-only, for display only
}

interface EditFormErrors {
  childName?: string;
  childPhoto?: string;
  partyDate?: string;
  deadline?: string;
}

interface ChangeItem {
  field: 'childName' | 'childPhoto' | 'partyDate' | 'deadline';
  label: string;
  oldValue: string;
  newValue: string;
}
```

### API Request/Response

```typescript
interface EditDreamBoardRequest {
  child_name?: string;
  child_photo?: File; // Send as multipart/form-data
  party_date?: string; // ISO 8601
  contribution_deadline?: string; // ISO 8601
}

interface EditDreamBoardResponse {
  success: boolean;
  data?: {
    board: DreamBoardDetail;
    changes: ChangeItem[];
  };
  error?: {
    code: string;
    message: string;
    validationErrors?: Record<string, string>;
  };
}
```

### Component Props

```typescript
interface EditDreamBoardModalProps {
  boardId: string;
  board: DreamBoardDetail;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (updatedBoard: DreamBoardDetail) => void;
}
```

---

## File Structure

```
src/
├── app/
│   ├── (host)/
│   │   └── dashboard/
│   │       ├── [id]/
│   │       │   └── _modals/
│   │       │       ├── EditDreamBoardModal.tsx    # Main modal component
│   │       │       ├── EditDreamBoardModal.types.ts
│   │       │       ├── EditForm.tsx               # Form content
│   │       │       ├── ConfirmationModal.tsx      # Change confirmation
│   │       │       └── index.ts
│   │       │
│   │       └── [id]/page.tsx                      # Uses modal
│
├── components/
│   ├── ui/
│   │   ├── dialog.tsx                             # Modal component
│   │   ├── input.tsx
│   │   ├── button.tsx
│   │   └── date-picker.tsx
│   ├── forms/
│   │   ├── FormGroup.tsx
│   │   ├── FormLabel.tsx
│   │   └── FormError.tsx
│   └── icons/
│       ├── InfoIcon.tsx
│       ├── UploadIcon.tsx
│       └── AlertIcon.tsx
│
└── lib/
    ├── api/
    │   └── dream-boards.ts                        # Edit API function
    └── utils/
        ├── validation.ts                           # Validation functions
        └── date-utils.ts
```

---

## Form State Management

### React Hook Form Implementation

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const editFormSchema = z.object({
  childName: z.string().min(1).max(30),
  childPhoto: z.instanceof(File).optional(),
  partyDate: z.string().refine((date) => new Date(date) >= today),
  deadline: z.string(),
});

export function EditForm({ board, onSuccess }: EditFormProps) {
  const form = useForm<EditFormData>({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      childName: board.child_name,
      partyDate: board.party_date,
      deadline: board.contribution_deadline,
    },
  });

  const onSubmit = async (data: EditFormData) => {
    const changes = calculateChanges(board, data);

    if (changes.length === 0) {
      setError('No changes made');
      return;
    }

    const result = await editDreamBoard(board.id, data);

    if (result.success) {
      setShowConfirmation(true);
      // Later: onSuccess(result.data.board)
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Responsive Behavior

### Modal Width

```css
/* Mobile: Full width with padding */
@media (max-width: 768px) {
  .modal-content {
    width: 100%;
    max-width: calc(100% - 2rem);
  }
}

/* Tablet+: Centered, max-width */
@media (min-width: 769px) {
  .modal-content {
    width: 672px; /* max-w-2xl */
    margin: auto;
  }
}
```

### Form Layout

**Mobile (1 column):**
- Fields stack vertically
- Full-width inputs
- Single-line date pickers

**Desktop (2 columns for some):**
- Party Date + Deadline side-by-side
- Locked fields in 2-column grid
- Full-width editable sections

---

## Animations

### Modal Entrance

```css
@keyframes modalFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes modalScaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-overlay {
  animation: modalFadeIn 300ms ease-out;
}

.modal-content {
  animation: modalScaleIn 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Error Animation

```css
@keyframes errorShake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}

.form-error {
  animation: errorShake 300ms ease-out;
  color: #DC2626;
}
```

### Change Indicator

```css
.change-indicator {
  animation: fadeIn 200ms ease-out;
  color: #0D9488;
  font-weight: 600;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

---

## Accessibility

### WCAG 2.1 AA Compliance

**Dialog Semantics:**
```html
<div
  role="dialog"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
  aria-modal="true"
>
  <h2 id="modal-title">Edit Emma's Dreamboard</h2>
  <p id="modal-description">Some fields can't be changed...</p>
</div>
```

**Focus Management:**
- Initial focus: First editable field (childName)
- Trap focus within modal
- Restore focus to trigger button on close
- Escape key closes modal

**Form Labels:**
```html
<label htmlFor="childName">Child's Name</label>
<input id="childName" />

<label htmlFor="childPhoto">Child's Photo</label>
<input id="childPhoto" type="file" />
```

**Error Handling:**
```html
<input
  aria-invalid={errors.childName ? 'true' : 'false'}
  aria-describedby={errors.childName ? 'childName-error' : undefined}
/>
{errors.childName && (
  <span id="childName-error" role="alert">
    {errors.childName}
  </span>
)}
```

**Touch Targets:**
- All inputs: minimum 44px height
- Buttons: 44×44px minimum
- Date picker controls: 44px targets

---

## Error Handling

### Validation Errors

```typescript
{errors.childName && (
  <div className="flex gap-2 items-start mt-2">
    <AlertIcon className="w-5 h-5 text-error flex-shrink-0 mt-0.5" />
    <span className="text-sm text-error">
      {errors.childName}
    </span>
  </div>
)}
```

### API Errors

```typescript
const result = await editDreamBoard(boardId, data);

if (!result.success) {
  if (result.error.code === 'VALIDATION_ERROR') {
    // Show validation errors for each field
    Object.entries(result.error.validationErrors).forEach(([field, msg]) => {
      setFieldError(field, msg);
    });
  } else {
    // Show general error toast
    showErrorToast(result.error.message);
  }
}
```

### Photo Upload Errors

```typescript
const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];

  if (!file) return;

  // Size validation
  if (file.size > 5 * 1024 * 1024) {
    setPhotoError('Photo must be smaller than 5MB');
    return;
  }

  // Type validation
  const validTypes = ['image/png', 'image/jpeg', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    setPhotoError('Only PNG, JPG, and WebP images are allowed');
    return;
  }

  setNewPhoto(file);
  setPhotoError(null);
};
```

---

## Edge Cases

### 1. No Changes Made

**Behavior:** User opens modal, doesn't change anything, clicks Save
**Response:** Show message "No changes made. Modal closes without API call"
**Copy:** "Everything looks the same. Make a change to update."

### 2. Dates in Far Future

**Party Date:** Allow any date in the future (1 year, 10 years, 100 years)
**Deadline:** Constrained to ≤ party date

### 3. Same Child Name (Case Difference)

**Behavior:** "emma" → "Emma" is technically a change
**Validation:** Allow and send to API; API normalizes case

### 4. Photo Upload Fails

**Handling:** Show error message, keep modal open
**Retry:** User can try different photo or cancel

### 5. Network Error During Save

**Behavior:** Show error message and retry button
**Copy:** "Connection error. Please try again."
**Retry:** User can click Save again

### 6. API Returns Validation Error

**Behavior:** Show field-level error messages
**Example:** "Deadline cannot be after party date"

### 7. Concurrent Edit Attempt

**Scenario:** Two tabs open, both editing same board
**Handling:** Show error: "This Dreamboard was recently modified. Refresh and try again."

### 8. Long Child Name (30 chars)

**Behavior:** Input maxlength enforces 30 chars
**Copy:** "30 / 30 characters"
**Color:** Change indicator turns warning (orange)

---

## Testing Considerations

### Unit Tests
- Form validation (all field types)
- Date constraint logic
- Change detection algorithm
- Error message generation

### Integration Tests
- Modal opens/closes correctly
- Form submission with valid data
- API call with correct payload
- Error handling and display
- Confirmation modal shows correct changes

### E2E Tests
- Open edit modal from detail page
- Edit child's name
- Upload new photo
- Extend party date
- Save and see confirmation
- Verify changes reflected on detail page

---

## Implementation Checklist

- [ ] Create EditDreamBoardModal component
- [ ] Create EditForm component with all fields
- [ ] Create ConfirmationModal component
- [ ] Implement form validation (client + server)
- [ ] Implement date picker with constraints
- [ ] Implement photo upload and preview
- [ ] Add API function for edit request
- [ ] Test responsive layouts
- [ ] Test keyboard navigation (Escape, Tab)
- [ ] Test focus management
- [ ] Test error states
- [ ] Test with slow network
- [ ] Test with large images
- [ ] Verify WCAG AA compliance

---

**Document Version:** 1.0
**Status:** Implementation-Ready
**Last Updated:** February 2025

