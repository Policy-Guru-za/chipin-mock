# Gifta UX v2 Copy and Content Matrix

## Purpose

Canonical copy source for UX v2 UI and communication surfaces.

## Brand and Tone Rules

- Brand name: `Gifta`
- Tone: warm, celebratory, clear, non-technical
- Avoid legacy naming (`ChipIn`) in all user-facing text

## Global Terminology

| Term | Canonical Copy |
|---|---|
| Dream Board | Dream Board |
| Host/Parent | Parent |
| Contribution | Chip in |
| Payout | Payout |
| Giving Back | Gift That Gives Twice |

## Host Create Flow Copy

| Location | Copy |
|---|---|
| Step intro | "Who’s the birthday star?" |
| Gift step intro | "What’s the dream gift?" |
| Giving back toggle | "Enable giving back (optional)" |
| Payout method label | "How should we send your payout?" |
| Review CTA | "Create Dream Board" |

## Public Dream Board Copy

| Location | Copy |
|---|---|
| Hero title | "Help make this gift happen" |
| Progress support text | "[percentage]% funded" |
| Closed state | "This Dream Board is closed to new contributions." |
| Funded state banner | "Goal reached! Extra contributions still help." |

## Contribution Flow Copy

| Location | Copy |
|---|---|
| Contribution CTA | "Continue to payment" |
| Optional name | "Your name (optional)" |
| Optional message | "Message (optional)" |
| Reminder prompt | "Remind me later" |
| Reminder confirmation | "We’ll send one reminder before this Dream Board closes." |

## Host Dashboard Copy

| Location | Copy |
|---|---|
| Dashboard title | "Your Dream Boards" |
| Empty state | "You haven’t created a Dream Board yet." |
| Payout section | "Payout details" |
| Post-campaign | "Campaign complete" |

## Admin Copy Baseline

| Area | Copy |
|---|---|
| Queue title | "Payout queue" |
| Charity section | "Charity management" |
| Reports section | "Financial reports" |

## Error Copy Rules

- state what failed
- state what user can do next
- avoid internal jargon

Examples:

- "We couldn’t start your payment. Please try again."
- "Please enter a valid bank account number."
- "Reminder must be scheduled before the campaign closes."

## Communication Subject Lines

| Template | Subject |
|---|---|
| Parent new contribution | "🎉 New contribution for [Child]!" |
| Parent campaign complete | "🎉 [Child]’s Dream Board is complete" |
| Contributor confirmation | "💝 Thanks for chipping in for [Child]!" |
| Contributor reminder | "🔔 Reminder: chip in for [Child]’s gift" |

## Acceptance Criteria

- `P0`: no legacy brand strings in active routes/templates
- `P1`: all key surfaces mapped to matrix and implemented
- `P2`: non-critical text refinements tracked with IDs
