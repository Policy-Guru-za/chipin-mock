# Charitable Giving Section — Homepage Variants

> **Context:** Gifta's new "Giving Back" feature lets hosts allocate a portion of contributions to a South African charity. The homepage currently has no mention of this. Below are three distinct approaches to showcasing it — each with a different emotional register, visual strategy, and placement within the existing page flow.

---

## Current Homepage Flow (for reference)

```
Nav
Hero  →  "One dream gift. Everyone chips in."
DreamBoard demo card  (interactive preview)
Stats line  →  "3,400+ gifts funded this year"
Testimonial carousel
Primary CTA  →  "Create Your Free Dreamboard"
How It Works  →  3-step cards + social proof
Closing CTA  →  "Ready to make gift-giving magic?"
Footer
```

---

## Variant A — *"Give a gift. Give back."*

### Concept
A dedicated **emotional storytelling section** placed between "How It Works" and the Closing CTA. This variant treats charitable giving as a warm, human moment — not a feature announcement. The tone is intimate: it speaks to the *feeling* of doing something bigger together.

### Placement
```
...How It Works section...
━━━ NEW: Giving Back section ━━━
...Closing CTA...
```

### Visual Design

**Layout:** Full-width warm background (`#FAF7F2`, matching the How It Works band) with a centered, narrow column (max ~520px, matching How It Works).

**Top:** A small eyebrow label in plum (`#7E6B9B`) — `GIVING BACK` — with the same uppercase tracking style used in How It Works.

**Headline:** Serif display type:
> *A birthday gift that gives twice.*

**Body copy (2 lines max):**
> When you create a Dreamboard, you can choose to share a portion of every contribution with a South African charity. Your child gets their dream gift — and together, you make a little more magic for someone else.

**Visual centrepiece:** A single, elegant card (white, rounded-[22px], soft shadow) that mirrors the "StoryCard" aesthetic from How It Works. Inside:

- A **split bar** (identical style to the Step 4 impact bar) showing an 85/15 split — sage green for "Gift" and plum for "Charity".
- Below the bar, two simple lines:
  - 🎁 `R85 → Mia's dream gift`
  - 💜 `R15 → Reach for a Dream`
- A subtle footer line in the card: *"For every R100 contributed"*

**Below the card:** A row of 5 small charity badges — just the initials circles (plum, amber, sage, orange, blue) with charity names beneath in `text-xs text-[#999]`. No logos, keeping it clean and consistent with Gifta's icon-driven aesthetic.

**Scroll-reveal animation:** Same IntersectionObserver pattern as How It Works — fade-up on entry.

### Why This Works
- Doesn't compete with the hero or DreamBoard demo for attention
- Uses existing visual language (StoryCard shape, impact bar, initials circles)
- Emotional headline → concrete example → trust (real charities) — a clean persuasion arc
- Feels like a natural extension of the "How It Works" story, not a bolt-on

---

## Variant B — *"Every gift, a little bigger."*

### Concept
Instead of a standalone section, this variant **weaves charity into the existing DreamBoard demo card** — making it feel like giving back is simply *part of how Gifta works*, not an optional add-on. A small, elegant detail on the demo card, supported by a new testimonial and a subtle stat update.

### Changes (3 touchpoints, no new section)

#### 1. DreamBoard Demo Card — Charity Badge
Below the existing "7 people have chipped in" contributors section and above the "Chip in for Mia" button, add a compact **charity callout strip**:

```
┌─────────────────────────────────────┐
│  💜  15% supports Reach for a Dream │
│      ━━━━━━━━  (thin plum bar)      │
└─────────────────────────────────────┘
```

- Background: `#F1EDF7` (plum-wash)
- Border: `1px solid #E4DDF0` (plum-soft)
- Rounded-[12px], padding 10px 14px
- Text: 12px, plum color, font-weight 500
- The thin bar is purely decorative — a 3px-tall plum line at ~15% width

This is small enough to not disrupt the demo card's flow, but visible enough that every visitor notices it.

#### 2. Testimonial Addition
Add a 4th testimonial to the rotation that speaks to the charity angle:

> *"I loved that part of everyone's contribution went to Cotlands. It turned a birthday party into something the kids will remember for a different reason."*
> — **Lindiwe M.** · Mom of Thandi, 5

This naturally surfaces the feature every ~20 seconds without any dedicated section.

#### 3. Stats Line Update
Update the stats badge from:
> 🎂 **3,400+** gifts funded this year

To a dual-stat format:
> 🎂 **3,400+** gifts funded  ·  💜 **R240k+** shared with charities

Same white pill shape, just wider. Two stats separated by a centered dot.

### Why This Works
- Zero new scroll depth — the page doesn't get longer
- Makes charity feel native, not promotional
- The DreamBoard demo is the most-viewed element on the page; putting charity there maximizes impressions
- Subtle but unmissable: guests who visit a real Dreamboard will recognise the pattern
- The testimonial adds social proof without a dedicated section

---

## Variant C — *"Celebrate. Share. Give back."*

### Concept
A **bold, visually distinct impact showcase** — a full-width section with its own colour identity (plum tones) that breaks from the sage/warm palette to signal "this is something special." Data-driven and confidence-building, aimed at parents who want to feel good about the platform's values.

### Placement
Between the Hero/DreamBoard area and "How It Works" — making it the second thing visitors see after the product intro. This is an aggressive placement that signals charitable giving is a core differentiator, not an afterthought.

```
Nav
Hero + DreamBoard demo
━━━ NEW: Impact Showcase ━━━
How It Works
Closing CTA
Footer
```

### Visual Design

**Background:** A soft gradient band — `linear-gradient(180deg, #F7F3FA 0%, #F1EDF7 50%, #FAF7F2 100%)` — transitioning from light plum to the warm tone of How It Works. This creates a distinct "moment" on the page.

**Layout:** Centered, max-width ~760px (wider than How It Works, matching the Closing CTA card width).

**Eyebrow:** `GIVING BACK` in plum, same tracking as elsewhere.

**Headline (serif, large):**
> *Celebrate a birthday.*
> *Change a life.*

**Subheading:**
> Every Dreamboard can support a cause. Hosts choose a charity, set a split — and every contribution does double duty.

**Three metric cards** in a horizontal row (stacked on mobile):

| Card 1 | Card 2 | Card 3 |
|--------|--------|--------|
| 💜 | 🤝 | 🇿🇦 |
| **R240,000+** | **5 partner charities** | **100% South African** |
| shared with charities | vetted & verified | supporting local causes |

Each card: white background, rounded-[18px], soft shadow, plum accent on the icon/number. On mobile, these stack vertically as compact rows.

**Below the metrics:** A horizontal scrollable strip of charity "cards" — each showing the initials circle, charity name, and one-line tag (e.g., "Reach for a Dream · Supporting children with chronic illnesses"). This mirrors the charity selector from Step 4 but in a read-only, showcase format.

**Closing line (centered, subtle):**
> *It's optional. It's transparent. And it makes every gift mean more.*

**Animation:** The three metric cards animate in with staggered fade-up (same pattern as How It Works steps). The charity strip has a gentle auto-scroll on desktop, static on mobile.

### Why This Works
- High visual impact — the plum palette break signals something new and important
- Metric cards build trust and scale ("R240k+ isn't nothing")
- Showing real charity names and descriptions builds credibility
- Placement before "How It Works" means it's seen early, while attention is highest
- The "optional, transparent" closing line preempts any concern about forced charity

---

## Quick Comparison

| | Variant A | Variant B | Variant C |
|---|---|---|---|
| **Approach** | Storytelling section | Woven into existing elements | Bold impact showcase |
| **New scroll depth** | ~300px | None | ~450px |
| **Tone** | Warm, intimate | Subtle, native | Confident, data-driven |
| **Placement** | After How It Works | Within DreamBoard + testimonials + stats | Before How It Works |
| **Visual identity** | Matches existing palette | Invisible integration | Distinct plum palette |
| **Complexity to build** | Medium (1 new component) | Low (3 small edits) | Higher (new component + metrics + charity strip) |
| **Best for** | Emotional resonance | Minimal disruption | Making charity a headline feature |

---

## Recommendation

If forced to choose one: **start with Variant A**. It strikes the right balance — emotionally resonant without being heavy, visually harmonious with the existing page, and moderate to build. It tells the story clearly and lets the feature speak for itself.

However, elements of Variant B (the testimonial addition and dual-stat line) could be combined with either A or C at low cost.

*Awaiting your review, Ryan.*
