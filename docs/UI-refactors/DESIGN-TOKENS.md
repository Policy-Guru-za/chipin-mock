# Gifta Create-Wizard — Design Tokens & Pattern Reference

> **Purpose**: Single authoritative source for every visual token and reusable pattern
> used across the 6 wizard steps. An implementing agent should treat values here as
> canonical — if a guide HTML file disagrees with this document, this document wins.

---

## 1. CSS Custom Properties (`:root`)

### Colour palette

| Token            | Value       | Usage                                      |
|------------------|-------------|---------------------------------------------|
| `--bg`           | `#FBF8F3`   | Page background                            |
| `--card`         | `#FFFFFF`   | Card / panel surfaces                      |
| `--ink`          | `#2C2520`   | Primary text                               |
| `--ink-mid`      | `#5C544C`   | Secondary text (labels, descriptions)      |
| `--ink-soft`     | `#8A827A`   | Tertiary text (subtitles, hints)           |
| `--ink-faint`    | `#B5AEA5`   | Quaternary text (faint labels)             |
| `--ink-ghost`    | `#D1CBC3`   | Placeholders, disabled text, footer copy   |
| `--border`       | `#EDE7DE`   | Default border                             |
| `--border-soft`  | `#F5F1EA`   | Subtle border / upcoming-step backgrounds  |
| `--sage`         | `#4A7E66`   | Primary action, active states              |
| `--sage-deep`    | `#3B6B55`   | Hover on primary action                    |
| `--sage-light`   | `#E9F3ED`   | Focus ring, completed-step halo            |
| `--sage-wash`    | `#F1F7F4`   | Very faint sage tint (e.g. drop-zone hover)|
| `--amber`        | `#C49A5C`   | Accent — eyebrow text, tip icons           |
| `--amber-light`  | `#F7EFE2`   | Tip background                             |
| `--amber-glow`   | `#EBDCC8`   | Warm accent highlight                      |
| `--plum`         | `#7E6B9B`   | Secondary accent                           |
| `--plum-wash`    | `#F1EDF7`   | Plum tint background                       |
| `--plum-soft`    | `#E4DDF0`   | Plum soft highlight                        |

### Typography

| Token      | Value                                          |
|------------|------------------------------------------------|
| `--serif`  | `'Libre Baskerville', Georgia, serif`          |
| `--sans`   | `'DM Sans', -apple-system, sans-serif`         |

Google Fonts import:
```
https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap
```

### Radii

| Token          | Value  |
|----------------|--------|
| `--radius-lg`  | `28px` |
| `--radius-md`  | `20px` |
| `--radius-sm`  | `14px` |

### Shadows

| Token            | Value                                                                                                  |
|------------------|--------------------------------------------------------------------------------------------------------|
| `--shadow-card`  | `0 1px 2px rgba(44,37,32,0.03), 0 4px 12px rgba(44,37,32,0.04), 0 12px 36px rgba(44,37,32,0.04)`    |
| `--shadow-input` | `0 1px 3px rgba(44,37,32,0.04)`                                                                      |

### Animations

```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

---

## 2. Reusable Component Patterns

### 2.1 Stepper Bar (`.stepper-bar`)

Container:
```css
.stepper-bar {
  max-width: 940px;
  margin: 0 auto;
  padding: 0 48px;
  margin-top: 32px;
  margin-bottom: 36px;
  animation: fadeUp 0.35s ease-out both;
}
```

Track: `display: flex; align-items: center; gap: 0;`

#### Dot states

| State      | Class           | CSS                                                                 |
|------------|-----------------|---------------------------------------------------------------------|
| Active     | `.s-dot.active` | `bg: var(--sage); color: #fff; box-shadow: 0 0 0 3px var(--sage-light);` |
| Completed  | `.s-dot.done`   | `bg: var(--sage); color: #fff;` (SVG checkmark inside, no ring)    |
| Upcoming   | `.s-dot.upcoming`| `bg: var(--border-soft); color: var(--ink-ghost);`                 |

All dots:
```css
.s-dot {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 12px; font-weight: 600; flex-shrink: 0;
}
```

SVG checkmark for completed dots:
```html
<svg width="14" height="14" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="3" stroke-linecap="round"
  stroke-linejoin="round">
  <polyline points="20 6 9 17 4 12"/>
</svg>
```

#### Connector line

```css
.s-line {
  flex: 1;
  height: 2px;
  background: var(--border-soft);
  margin: 0 4px;
}
```

---

### 2.2 Split Layout (`.split`) — Steps 1–5

```css
.split {
  max-width: 940px;
  margin: 0 auto;
  padding: 0 48px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: start;
  animation: fadeUp 0.45s ease-out 0.08s both;
}
```

### 2.3 Centered Layout — Step 6

Step 6 uses a single centered column instead of a split grid. The review card is centered within the 940px container with its own max-width (typically ~600–660px).

---

### 2.4 Card / Panel

```css
.form-panel, .photo-panel, .preview-panel {
  background: var(--card);
  border-radius: var(--radius-lg);  /* 28px */
  box-shadow: var(--shadow-card);
}

/* Form panels typically: */
padding: 36px 32px 32px;
```

---

### 2.5 Eyebrow

The small "STEP N OF 6" label above panel titles.

```css
.eyebrow {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--amber);
  margin-bottom: 8px;
}
```

---

### 2.6 Panel Title

```css
.panel-title {
  font-family: var(--serif);
  font-size: 22px;       /* left panels — some right panels use 19px */
  font-weight: 400;
  color: var(--ink);
  line-height: 1.3;
  margin-bottom: 4px;
}
```

Sub-heading below titles:
```css
font-size: 13px–13.5px;
color: var(--ink-soft);
font-weight: 300;
line-height: 1.5;
margin-bottom: 28px;    /* before first field */
```

---

### 2.7 Form Field (`.field`)

Container: `margin-bottom: 24px;`

#### Label
```css
.field-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-mid);
  margin-bottom: 8px;
}
```

#### Input
```css
.field-input {
  width: 100%;
  padding: 14px 18px;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  font-family: var(--sans);
  font-size: 15px;
  color: var(--ink);
  outline: none;
  transition: all 0.25s;
  box-shadow: var(--shadow-input);
}
```

| State       | CSS                                                                              |
|-------------|----------------------------------------------------------------------------------|
| Placeholder | `color: var(--ink-ghost); font-weight: 300;`                                     |
| Hover       | `border-color: var(--ink-ghost);`                                                |
| Focus       | `border-color: var(--sage); box-shadow: 0 0 0 3px var(--sage-light), var(--shadow-input); background: var(--card);` |

---

### 2.8 Field Tip (`.field-tip`)

Inline contextual tip beneath a field.

```css
.field-tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
  padding: 10px 14px;
  background: var(--amber-light);
  border-radius: 10px;
}
```

| Child             | CSS                                                    |
|-------------------|--------------------------------------------------------|
| Icon (SVG)        | `width: 16px; height: 16px; flex-shrink: 0; color: var(--amber); margin-top: 1px;` |
| Text (`<p>`)      | `font-size: 12px; color: var(--ink-mid); line-height: 1.5;` |

SVG for info icon:
```html
<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="1.8" stroke-linecap="round"
  stroke-linejoin="round">
  <circle cx="12" cy="12" r="10"/>
  <line x1="12" y1="16" x2="12" y2="12"/>
  <line x1="12" y1="8" x2="12.01" y2="8"/>
</svg>
```

---

### 2.9 Form CTA (`.form-cta`)

#### Step 1 (single button — no back button):
```css
.form-cta {
  margin-top: 32px;
}
```

#### Steps 2–6 (back + continue buttons):
```css
.form-cta {
  margin-top: 32px;
  display: flex;
  gap: 12px;
}
```

#### Button base (shared by back and continue):
```css
.back-btn, .cta-btn {
  flex: 1;
  padding: 14px 20px;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  font-family: var(--sans);
  cursor: pointer;
  transition: all 0.25s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
```

#### Back button:
```css
.back-btn {
  background: transparent;
  border: 1.5px solid var(--border);
  color: var(--ink);
}
.back-btn:hover {
  background: var(--border-soft);
}
```

#### Continue / primary CTA:
```css
.cta-btn {
  background: var(--sage);
  color: #fff;
  box-shadow: 0 1px 3px rgba(74,126,102,0.12), 0 4px 12px rgba(74,126,102,0.1);
}
.cta-btn:hover {
  background: var(--sage-deep);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(74,126,102,0.15), 0 8px 20px rgba(74,126,102,0.12);
}
.cta-btn svg {
  width: 16px; height: 16px;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.cta-btn:hover svg {
  transform: translateX(2px);
}
```

Arrow SVG for continue button:
```html
<svg width="16" height="16" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
  stroke-linejoin="round">
  <line x1="5" y1="12" x2="19" y2="12"/>
  <polyline points="12 5 19 12 12 19"/>
</svg>
```

---

### 2.10 Footer

```css
footer {
  max-width: 940px;
  margin: 56px auto 0;
  padding: 0 48px 40px;
  text-align: center;
}
footer p {
  font-size: 11.5px;
  color: var(--ink-ghost);
}
```

No `border-top`.

---

## 3. Responsive Rules

Breakpoint: `@media (max-width: 800px)`

| Element          | Desktop                         | Mobile (≤ 800px)                          |
|------------------|---------------------------------|-------------------------------------------|
| Stepper bar      | `padding: 0 48px; margin-top: 32px; margin-bottom: 36px;` | `padding: 0 20px; margin-top: 24px; margin-bottom: 28px;` |
| Split layout     | `grid-template-columns: 1fr 1fr; padding: 0 48px;` | `grid-template-columns: 1fr; padding: 0 20px;` |
| Form panel       | `padding: 36px 32px 32px;`      | `padding: 28px 24px 24px;`                |
| Form CTA         | `flex-direction: row;`          | `flex-direction: column-reverse;` (continue on top) |
| Footer           | `padding: 0 48px 40px;`        | `padding: 0 20px 32px;` (or `0 20px 24px;`)   |
| Nav              | `padding: 18px 48px;`          | `padding: 14px 20px;`                     |
| Nav links        | Visible                         | Hidden (except CTA + avatar)              |

---

## 4. Step-by-Step Layout Summary

| Step | Layout        | Left Panel                    | Right Panel                    |
|------|---------------|-------------------------------|--------------------------------|
| 1    | Split 1fr 1fr | Photo drop-zone (camera icon) | Child details form             |
| 2    | Split 1fr 1fr | Gift icon grid picker         | Gift details form              |
| 3    | Split 1fr 1fr | Dates form                    | Timeline preview               |
| 4    | Split 1fr 1fr | Giving-back config form       | Impact preview                 |
| 5    | Split 1fr 1fr | Payout form                   | Security/trust preview         |
| 6    | Centered      | —                             | — (single review card, ~600px) |

---

## 5. Tailwind Mapping Notes

The existing `tailwind.config.ts` already defines `sage`, `amber`, `plum`, and `ink` colour tokens. When implementing as React/Tailwind components, map CSS custom properties to Tailwind utilities where possible:

| CSS Property                       | Tailwind Equivalent                          |
|------------------------------------|----------------------------------------------|
| `background: var(--bg)`            | `bg-background` (if configured) or inline    |
| `color: var(--ink)`                | `text-text` (if configured) or `text-[#2C2520]` |
| `color: var(--sage)`               | `text-primary`                               |
| `background: var(--sage)`          | `bg-primary`                                 |
| `border-radius: var(--radius-lg)`  | `rounded-[28px]` or custom utility           |
| `box-shadow: var(--shadow-card)`   | Custom `shadow-card` in config or inline     |
| `font-family: var(--serif)`        | `font-display`                               |
| `font-family: var(--sans)`         | `font-sans`                                  |

For any token not already in the Tailwind config, use arbitrary value syntax (`bg-[#FBF8F3]`, `text-[13px]`, etc.) or add to the config's `extend` section if used in 3+ places.

---

## 6. Fidelity Checklist (Quick Reference)

When verifying a completed step, check every item:

- [ ] Stepper: 32px dots, SVG checkmark for done, 3px sage-light ring on active, flex:1 lines, fadeUp animation
- [ ] Eyebrow: 11px / 600 / uppercase / 0.12em / amber / 8px bottom margin
- [ ] Panel title: serif / 22px (or 19px for form panel) / 400 / ink / 1.3 line-height
- [ ] Field: 24px margin-bottom, 13px label, 14px 18px input padding, 1.5px border, 12px radius, shadow-input
- [ ] Field focus: sage border + 3px sage-light ring + card background
- [ ] Field tip: amber-light bg / 10px radius / 10px 14px padding / 8px gap / 16px amber icon / 12px text
- [ ] CTA: 32px margin-top / 12px gap / flex / 14px 20px padding / 14px radius / 14px size / 600 weight
- [ ] Back button: transparent bg / 1.5px border / border-soft hover
- [ ] Continue button: sage bg / sage-deep hover / translateY(-1px) hover / arrow SVG
- [ ] Footer: 940px / 56px auto 0 / 48px 40px / 11.5px ink-ghost / no border-top
- [ ] Responsive ≤ 800px: 1fr grid, 20px padding, column-reverse CTA, reduced margins
- [ ] Animations: fadeUp on stepper (0.35s) and split layout (0.45s, 0.08s delay)

---

## 7. Mobile-Specific Patterns

> **Cross-reference**: Full mobile UX rationale in `docs/UI-refactors/Create-wizard/MOBILE-UX-ASSESSMENT.md`. Interaction behaviour (draft model, error/retry, back-button, analytics) in `docs/UI-refactors/Create-wizard/MOBILE-INTERACTION-SPEC.md`.

### 7.1 Sticky CTA Footer (Mobile ≤ 800px)

```css
.wizard-sticky-footer {
  position: sticky;
  bottom: 0;
  z-index: 10;
  background: var(--card);
  border-top: 1px solid var(--border);
  padding: 12px 20px;
  padding-bottom: max(12px, env(safe-area-inset-bottom));
  box-shadow: 0 -2px 8px rgba(0,0,0,0.04);
}
.wizard-sticky-footer .button-row {
  display: flex;
  flex-direction: column-reverse;
  gap: 8px;
}
```

Hidden on desktop (`flex md:hidden`). Desktop CTA remains in-flow (`hidden md:flex`).

### 7.2 Mobile Progress Bar (Stepper, ≤ 800px)

```css
.wizard-progress-bar {
  height: 4px;
  border-radius: 2px;
  background: var(--border-soft);
  overflow: hidden;
}
.wizard-progress-bar-fill {
  height: 100%;
  background: var(--sage);
  transition: width 0.3s ease;
  /* width set dynamically: (currentStep / totalSteps) * 100% */
}
```

Label above bar: uses `WizardEyebrow` styling — `11px / 600 / amber / uppercase / 0.12em`.
Text: `"Step N of 6 — {stepLabel}"`

### 7.3 Skeleton Shimmer

```css
.wizard-skeleton {
  background: linear-gradient(90deg, var(--border-soft) 25%, var(--bg) 50%, var(--border-soft) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

Reduced motion: `@media (prefers-reduced-motion: reduce) { .wizard-skeleton { animation: none; } }`

### 7.4 Error Banner in Sticky Footer

```css
.wizard-footer-error {
  background: #FEE2E2;
  color: #991B1B;
  border: 1px solid #FECACA;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 8px;
}
.wizard-footer-error .retry-link {
  font-size: 12px;
  font-weight: 600;
  color: inherit;
  text-decoration: underline;
  margin-left: 8px;
  cursor: pointer;
}
```

### 7.5 Preview Panel Accordion (Mobile ≤ 800px)

```css
.wizard-preview-summary {
  background: var(--border-soft);
  border-radius: var(--radius-sm);  /* 14px */
  padding: 12px 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-soft);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  list-style: none;
}
.wizard-preview-summary::-webkit-details-marker { display: none; }
details[open] .wizard-chevron { transform: rotate(90deg); }
.wizard-chevron {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}
```

Desktop: `<details>` wrapper uses `md:contents` to become transparent.

### 7.6 CTA Loading Spinner

```css
.wizard-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--sage-light);
  border-top-color: var(--sage);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
```

### 7.7 Inline Field Error

```css
.wizard-inline-error {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 6px;
}
.wizard-inline-error svg { width: 12px; height: 12px; color: #B91C1C; }
.wizard-inline-error span { font-size: 12px; color: #B91C1C; font-weight: 400; }
```

### 7.8 Tap Target Minimums

| Element | Minimum Size | Implementation |
|---------|-------------|----------------|
| Buttons (all) | `min-height: 48px` | Already set in CTA spec |
| Toggle switch | `48×28px` outer, `24×24px` knob | Custom CSS |
| Split-mode tabs | `min-height: 48px; padding: 14px 16px;` | Class override |
| Charity items | `min-height: 52px; padding: 14px 16px;` | Class override |
| Checkbox wrapper | `min-height: 44px;` on `<label>` | Padding + flexbox |
| Method tabs | `min-height: 48px; padding: 14px 16px;` | Class override |

Global touch optimisation: `touch-action: manipulation` on all interactive elements (eliminates 300ms tap delay).

### 7.9 Publish Loading Overlay (Step 6)

```css
.wizard-publish-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  background: rgba(251,248,243,0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  animation: fadeIn 0.2s ease-out;
}
.wizard-publish-overlay .spinner {
  width: 24px;
  height: 24px;
  /* same spin animation as CTA spinner, but larger */
}
.wizard-publish-overlay .text {
  font-family: var(--serif);
  font-size: 18px;
  color: var(--ink);
}
```
