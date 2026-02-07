# 20. COMMUNICATIONS — UI Specification
**Gifta UX v2 | Email & WhatsApp Templates**

---

## Table of Contents
1. [Email Template System](#email-template-system)
2. [Email Templates (Resend)](#email-templates-resend)
3. [WhatsApp Templates](#whatsapp-templates)
4. [Template Data Interfaces](#template-data-interfaces)
5. [Delivery & Idempotency Rules](#delivery--idempotency-rules)

---

## Email Template System

### Overview
- **Service**: Resend (email delivery API)
- **Base Design**: Minimal HTML email, responsive, Gifta branding (teal + orange accent)
- **Styling**: Inline CSS (email client compatibility), fallback web fonts
- **Language**: Friendly, warm tone; never technical or jargon-heavy
- **Design System Colors**:
  - Primary teal: `#0D9488`
  - Accent orange: `#F97316`
  - Text dark: `#1C1917`
  - Text secondary: `#57534E`
  - Background light: `#FEFDFB`
  - Border light: `#E7E5E4`

### Email Structure Template
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width">
    <title>[Subject]</title>
    <style>
      body { font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
      .container { max-width: 600px; margin: 0 auto; background-color: #FEFDFB; }
      .header { background-color: #FFFFFF; border-bottom: 1px solid #E7E5E4; padding: 24px; }
      .content { padding: 32px 24px; }
      .footer { background-color: #FAFAF9; padding: 24px; border-top: 1px solid #E7E5E4; }
      .button { background-color: #F97316; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; margin-top: 16px; }
      h1 { font-family: 'Fraunces', serif; color: #1C1917; margin: 0; }
      p { color: #57534E; line-height: 1.6; }
      .highlight { color: #0D9488; font-weight: 600; }
    </style>
  </head>
  <body>
    <table align="center" width="600" cellpadding="0" cellspacing="0">
      <tr>
        <td class="container">
          <!-- Header -->
          <div class="header">
            <h2 style="margin: 0; color: #0D9488; font-family: 'Nunito', sans-serif;">
              🎁 Gifta
            </h2>
          </div>

          <!-- Content -->
          <div class="content">
            <!-- Template-specific content -->
          </div>

          <!-- Footer -->
          <div class="footer">
            <p style="margin: 0; font-size: 12px; color: #A8A29E;">
              © 2024 Gifta. Birthday gifting, simplified.<br>
              <a href="[unsubscribe_link]" style="color: #0D9488; text-decoration: none;">Unsubscribe</a>
            </p>
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>
```

---

## Email Templates (Resend)

### 1. To Parent: Dreamboard Created
**Subject**: 🎁 [Child]'s Dreamboard is live!

**Send Trigger**: Immediately after parent completes Dreamboard creation

**Frequency Limit**: Once per Dreamboard

**Purpose**: Excitement and urgency to share the link; provide quick tips.

**Full Email Copy**:
```
Hi [Parent Name],

Great news! [Child]'s Dreamboard is now live and ready to share! 🎉

[Child] is turning [Age] and would love help from friends and family to get [Gift].

**Your Dreamboard Link:**
[Clickable URL with share link]

**Share on:**
- WhatsApp
- Facebook
- Email
- Copy link

**Pro Tips for Getting More Contributions:**
1. Share with 5-10 close friends or family members first (they're most likely to contribute)
2. Add a fun birthday message or photo to make it personal
3. Follow up after 2 weeks if still short on your goal
4. You can edit the gift description anytime

**Questions?** Check out our [FAQ] or [Contact Us].

Thanks for using Gifta!
[Child]'s Birthday Squad

P.S. No fees for parents—we keep it simple!
```

**Dynamic Variables**:
- `[Parent Name]` — Parent's first name (from profile)
- `[Child]` — Child's name
- `[Age]` — Child's age
- `[Gift]` — Gift description
- `[Clickable URL with share link]` — Button link to Dreamboard (unique per board)

**Design Notes**:
- CTA button: Full-width on mobile, auto on desktop, orange background
- Button text: "View & Share Dreamboard"
- Line break before tips section: Horizontal line (1px solid `#E7E5E4`)
- Tone: Encouraging, not pushy; emphasize "Help" not "Money"

**Reply-To Address**: support@gifta.co

---

### 2. To Parent: New Contribution Received
**Subject**: 💝 [Contributor] just chipped in!

**Send Trigger**: Within 1 minute after successful contribution

**Frequency Limit**: One per contribution; batch if > 3 contributions within 1 hour (send daily summary instead)

**Purpose**: Celebrate contribution, show progress, encourage sharing more.

**Full Email Copy**:
```
Yay, [Parent Name]! 🎉

[Contributor Name] just chipped in [Amount] toward [Child]'s Dreamboard!

[Contributor Message (optional)] — [Contributor Name]

**Progress Update:**
You're [Percentage]% of the way to the [Amount] goal.
[Progress visualization: Current / Target]

Next Milestone: [Next milestone amount] — [X more contributions needed]

**[Amount Raised] of [Target Amount] raised**

Keep the momentum going! Share [Child]'s Dreamboard with 3 more friends:
[Share Button: WhatsApp / Facebook / Email / Copy Link]

[Child]'s Birthday Squad
```

**Dynamic Variables**:
- `[Parent Name]` — Parent's first name
- `[Contributor Name]` — First name of person who contributed
- `[Amount]` — Contribution amount (e.g., "R50")
- `[Child]` — Child's name
- `[Contributor Message]` — Custom message from contributor (if provided), italicized, quoted
- `[Percentage]` — Progress percentage (0-100)
- `[Progress visualization]` — ASCII bar or inline text "R1,250 of R2,500"
- `[Next milestone amount]` — Amount at next 25% increment
- `[X more contributions needed]` — Calculated number
- `[Amount Raised]` — Total contributions to date
- `[Target Amount]` — Goal amount

**Design Notes**:
- Contributor message: Italicized, in quote block with left border (4px solid `#F97316`)
- Progress bar: Visual element, color teal to sage gradient
- Milestone section: Separate box with light background `#F0F9F7` (light teal)
- Tone: Celebration and social proof; highlight "next" milestone to encourage momentum

---

### 3. To Parent: Campaign Complete
**Subject**: 🎉 [Child]'s Dreamboard is complete!

**Send Trigger**: When total contributions reach or exceed goal amount

**Frequency Limit**: Once per Dreamboard (or on payout completion)

**Purpose**: Celebrate success, provide financial breakdown and payout info, offer next steps.

**Full Email Copy**:
```
Amazing, [Parent Name]! 🎊

[Child]'s Dreamboard reached its goal! We raised [Total Amount] from [Contributor Count] generous contributors.

**Your Campaign Summary:**
- Goal: [Target Amount]
- Raised: [Total Amount]
- Surplus: [Amount Over Goal] ← You can refund or donate this!
- Contributors: [Contributor Count]
- Average gift: [Average per contributor]

**What Happens Next:**
1. Gifta processes all payments (secured & verified)
2. Funds are deposited to your account within 3-5 business days
3. You'll receive a payout confirmation email
4. Download your contributor list and thank-you receipt

**Financial Breakdown:**
- Total Contributions: [Total Amount]
- Processing Fee (0%): Free!
- Amount to Parent: [Total Amount]

📥 [Download Contributor List] | 📄 [Download Receipt] | 💌 [Send Thank-You Messages]

**Next Steps:**
1. Thank your contributors (we've drafted thank-you messages you can send)
2. Get the gift! Here are some [Local Retailers for [Gift]]
3. Share the gift moment—tag [Child] and @GiftaApp for a chance to be featured!

Questions? [Contact Support] or check [FAQ].

Thanks for using Gifta!
The Gifta Team

P.S. Help another family! [Share Gifta with Friends] and earn [Referral Benefit].
```

**Dynamic Variables**:
- `[Parent Name]` — Parent's first name
- `[Child]` — Child's name
- `[Total Amount]` — Amount raised (including overage)
- `[Contributor Count]` — Number of unique contributors
- `[Target Amount]` — Original goal
- `[Amount Over Goal]` — If applicable (0 if goal exactly met)
- `[Average per contributor]` — Total / Count
- `[Download Contributor List]` — CSV/PDF link
- `[Download Receipt]` — PDF receipt with breakdown
- `[Send Thank-You Messages]` — Link to thank-you template editor
- `[Local Retailers for [Gift]]` — Search link for local gift sellers
- `[Referral Benefit]` — Optional: small discount or bonus for next Dreamboard
- `[Contact Support]` — Link to support page
- `[FAQ]` — FAQ link

**Design Notes**:
- Financial breakdown: Table format with 3 rows (Total, Fee, Net)
- Surplus section: Conditional (only show if `Amount Over Goal > 0`)
- Surplus options: Link to either "Refund Contributors" or "Donate to Charity"
- Next Steps: Numbered list with emoji icons (1️⃣, 2️⃣, 3️⃣)
- Tone: Proud, helpful, action-oriented; celebrate impact

**Reply-To**: support@gifta.co

---

### 4. To Contributor: Contribution Confirmation
**Subject**: 💝 Thanks for chipping in!

**Send Trigger**: Immediately after successful payment confirmation

**Frequency Limit**: Once per contribution

**Purpose**: Confirm donation, provide warmth, highlight charity info and social sharing.

**Full Email Copy**:
```
Thank you! 🙏

Your contribution of [Amount] to [Child]'s Dreamboard has been confirmed.

**Your Receipt:**
- Contributor: [Contributor Name]
- Gift: [Child] is turning [Age] and would love [Gift Name]
- Amount: [Amount]
- Date: [Date Contributed]
- Reference: [Transaction ID]

**What Happens Next:**
[Child]'s parents will receive your contribution and your message (if you added one). The gift will be purchased and [Child] will get it for their birthday!

**Charity Partnership:**
For every $10 contributed to Gifta, we donate 5% to a [Charity Partner]. Your contribution helps support [Charity Impact].
[Learn More about Giveback]

**Share the Joy:**
Help another family celebrate! Share [Child]'s Dreamboard:
[Share Buttons: WhatsApp / Facebook / Email]

Thanks for being part of [Child]'s birthday! 🎁
The Gifta Team

P.S. Your contribution is secure, and we'll never share your information with third parties.
```

**Dynamic Variables**:
- `[Amount]` — Contribution amount
- `[Child]` — Child's name
- `[Contributor Name]` — Contributor's name
- `[Child Age]` — Child's age
- `[Gift Name]` — Gift description
- `[Date Contributed]` — Date in format "15 Feb 2024"
- `[Transaction ID]` — Unique transaction reference
- `[Charity Partner]` — Organization name (if applicable)
- `[Charity Impact]` — Example: "meals for children in need"
- `[Learn More about Giveback]` — Link to charity page

**Design Notes**:
- Receipt section: Formatted as invoice-style box with light background
- Transaction ID: Monospace font, small, gray text
- Charity section: Conditional (only if using charity partner)
- Tone: Warm, appreciative, impact-focused; remove transactional feel

---

### 5. To Contributor: Reminder (Before Deadline)
**Subject**: 🔔 Reminder: Chip in for [Child]'s birthday gift

**Send Trigger**: 7 days before birthday (optional, configurable)

**Frequency Limit**: One reminder email per contributor per campaign

**Conditions**: Sent only if contributor viewed Dreamboard but didn't contribute

**Purpose**: Gentle reminder to increase conversion among warm leads.

**Full Email Copy**:
```
Hi [Contributor Name],

Just a gentle reminder: [Child]'s birthday is in [Days] days, and [Parent Name] is raising [Current Amount] toward [Child]'s dream gift: [Gift].

You viewed the Dreamboard a few days ago—now's the perfect time to chip in!

**Quick Stats:**
- [Days] days left
- [Percentage]% funded ([Amount] more needed)
- [Contributor Count] people have already contributed

**Contribute Now:** [CTA Button]
Amount: $10 / $25 / $50 / Other

Even a small gift makes a big difference. Help [Child] celebrate! 🎉

[Parent Name] will see your contribution and message—make it personal and fun.

The Gifta Team

P.S. Can't decide? $25 is the most popular contribution amount.
```

**Dynamic Variables**:
- `[Contributor Name]` — Recipient's first name
- `[Child]` — Child's name
- `[Days]` — Days until birthday
- `[Parent Name]` — Parent's first name
- `[Current Amount]` — Funds raised to date
- `[Gift]` — Gift description
- `[Amount]` — Amount still needed to reach goal
- `[Percentage]` — Remaining percentage (e.g., "40%")
- `[Contributor Count]` — Number of people who've already contributed

**Design Notes**:
- CTA button: Large, orange, full-width on mobile
- Preset amounts: Linked buttons (not form, for email)
- Tone: Casual, friendly reminder; not pushy or guilt-inducing
- P.S.: Social proof (highlight popular amount)

---

### 6. To Charity: Monthly Donation Report
**Subject**: Gifta Donation Report — [Month] [Year]

**Send Trigger**: 1st of each month (if any donations occurred)

**Frequency Limit**: Once per month

**Recipients**: Charity partner contact email

**Purpose**: Provide transparency and impact metrics for nonprofit partners.

**Full Email Copy**:
```
Dear [Charity Name] Team,

Here's your Gifta Monthly Donation Summary for [Month] [Year]:

**Donation Metrics:**
- Total Donated: [Total Amount]
- Transactions: [Number of Donations]
- Average Gift: [Average Amount]
- Families Helped: [Number of Dreamboards]
- Children Celebrated: [Total Children]

**Top Gifts By Category:**
1. [Category]: [Count] gifts, [Total Amount]
2. [Category]: [Count] gifts, [Total Amount]
3. [Category]: [Count] gifts, [Total Amount]

**Impact Statement:**
This month, [Number] families celebrated their children's birthdays with Gifta, and together, we donated [Total Amount] to support [Charity Mission].

[Detailed Donor List (with opt-in permission) - CSV download]

**Next Steps:**
- Thank you letters template: [Link]
- Impact report for your website: [Link]
- Schedule monthly call? [Book Calendar]

Thank you for partnering with Gifta to make birthdays special and meaningful.

Best regards,
The Gifta Team

---
Questions? Contact [Partnership Manager Email]
```

**Dynamic Variables**:
- `[Charity Name]` — Nonprofit organization name
- `[Month] [Year]` — Report period (e.g., "February 2024")
- `[Total Amount]` — Total donated that month
- `[Number of Donations]` — Count of individual gifts
- `[Average Amount]` — Mean donation amount
- `[Number of Dreamboards]` — Campaigns associated with donations
- `[Total Children]` — Children who received gifts
- `[Category]` — Gift category (e.g., "Educational Toys", "Sports Equipment")
- `[Count]` — Number of gifts in that category
- `[Charity Mission]` — Organization's mission statement
- `[Detailed Donor List]` — CSV file with anonymized donor names and amounts
- `[Partnership Manager Email]` — Gifta contact for nonprofit partner

**Design Notes**:
- Metrics section: Table format with clear rows
- Top gifts: List format with graphics or bars
- Confidentiality: Only include donor data if they've opted in (GDPR/POPIA compliant)
- Tone: Professional, impact-focused, partnership-oriented

---

### 7. To Parent: Daily Summary (If > 3 Contributions in 24 Hours)
**Subject**: 💝 [Child]'s Dreamboard: [Count] new contributions today!

**Send Trigger**: Daily digest at 9 AM (user's local timezone) if > 3 contributions

**Frequency Limit**: One per day

**Purpose**: Consolidate multiple contributions into single email (reduce inbox clutter).

**Full Email Copy**:
```
Wow, [Parent Name]! 🚀

[Child]'s Dreamboard had an amazing day! [Contribution Count] people chipped in today:

[List of Contributors (max 5 shown):]
- [Contributor 1]: [Amount] — "[Message excerpt]"
- [Contributor 2]: [Amount]
- [Contributor 3]: [Amount]
[+2 more contributions]

**Today's Total: [Daily Total Amount]**

**Overall Progress:**
[Progress bar visualization]
[Percentage]% funded ([Amount] more to go!)

You're doing great! Keep sharing to reach the goal. 💪

[View Dreamboard] | [Share with Friends]

The Gifta Team
```

**Dynamic Variables**:
- `[Parent Name]` — Parent's first name
- `[Child]` — Child's name
- `[Contribution Count]` — Number of contributions today
- `[Contributor names and amounts]` — List (truncated if > 5)
- `[Message excerpt]` — First 50 characters of contributor message (if provided)
- `[Daily Total Amount]` — Sum of today's contributions
- `[Percentage]` — Overall progress percentage
- `[Amount]` — Amount remaining to goal
- `[View Dreamboard]` — Link to dashboard
- `[Share with Friends]` — Link to share options

**Design Notes**:
- Contributor list: Compact, show top 5, summarize rest as "+N more"
- Messages: Excerpt in quotes, italicized
- Tone: Energetic, celebratory; emphasize momentum

---

### 8. To Parent: Milestone Reached
**Subject**: 🎊 [Count] people have chipped in!

**Send Trigger**: When contributor count reaches 10, 25, 50 (configurable milestones)

**Frequency Limit**: Once per milestone

**Purpose**: Celebrate community participation and encourage final push.

**Full Email Copy**:
```
Incredible, [Parent Name]! 🌟

[Milestone Count] amazing people have joined [Child]'s Dreamboard!

You've built an incredible community around [Child]'s birthday. Here's what that means:
- [Milestone Count] friends and family supporting you
- [Total Amount] raised so far
- [Percentage]% toward the goal

**The Momentum is Real:**
When a Dreamboard reaches this milestone, it's [Percentage]% more likely to reach its goal. You're doing amazing!

Keep it going! Share one more time with friends who haven't seen it yet:
[Share Buttons]

[Child]'s Birthday Squad
```

**Dynamic Variables**:
- `[Parent Name]` — Parent's first name
- `[Child]` — Child's name
- `[Milestone Count]` — Number at milestone (10, 25, 50)
- `[Total Amount]` — Funds raised to date
- `[Percentage]` — Progress to goal
- `[Likelihood Increase]` — Statistical note (e.g., "85% more likely")

**Design Notes**:
- Celebratory tone: Use emoji and exclamation marks
- Social proof: Highlight how far they've come
- Momentum section: Light background, visually distinct
- Tone: Celebratory, motivational; avoid "pushy"

---

### 9. To Parent: Campaign Ending Soon
**Subject**: 🕐 24 hours left for [Child]'s birthday!

**Send Trigger**: 24 hours before birthday

**Frequency Limit**: One reminder email

**Conditions**: Only sent if goal not yet reached

**Purpose**: Urgency to share one last time and close remaining gap.

**Full Email Copy**:
```
[Parent Name], time is running out! ⏰

[Child]'s birthday is tomorrow, and [Child]'s Dreamboard still needs [Amount Remaining] to reach the goal.

**Current Status:**
[Progress bar]
[Percentage]% funded — [Amount Remaining] to go!

**You're so close!** Share with just 1-2 more people and you'll likely hit your goal.

**Share Now:** [WhatsApp] [Facebook] [Email] [Copy Link]

If you don't reach the goal by tomorrow, no worries! Friends can still contribute after the birthday (we'll create a post-birthday wishlist option).

Let's make this birthday special! 🎁

[Parent Name]'s Birthday Squad

P.S. Still short? You can also make up the difference with a personal contribution (no pressure!).
```

**Dynamic Variables**:
- `[Parent Name]` — Parent's first name
- `[Child]` — Child's name
- `[Amount Remaining]` — Gap between current and goal
- `[Percentage]` — Progress percentage

**Design Notes**:
- Urgency: Time-sensitive language and visual countdown
- Hope: Emphasize they're "so close" and "likely to hit goal"
- Flexibility: Mention post-birthday contributions as fallback
- Tone: Urgent but warm; not guilt-inducing

---

## WhatsApp Templates

### Overview
- **Service**: Twilio WhatsApp Business API or equivalent
- **Template Approval**: Pre-approved templates submitted to WhatsApp Meta Business
- **Personalization**: Limited to `[variable]` placeholders (WhatsApp restrictions)
- **Frequency**: Transactional templates (no limit), marketing templates (user opt-in required)

---

### 1. To Parent: New Contribution Notification (WhatsApp)
**Template Name**: `new_contribution_parent`

**Type**: Transactional (no opt-in required)

**Message**:
```
Hi [Parent Name]! 🎉

Great news! [Contributor Name] just chipped in [Amount] toward [Child]'s Dreamboard!

You're now [Percentage]% of the way to the goal! Keep sharing to reach it.

[View Dreamboard Button] [Share With Friends Button]

— Gifta
```

**Variables**:
- `[Parent Name]` — Parent's first name
- `[Contributor Name]` — Contributor's first name
- `[Amount]` — Contribution amount (e.g., "R50")
- `[Child]` — Child's name
- `[Percentage]` — Progress percentage

**Button Actions**:
- "View Dreamboard" → Link to Dreamboard dashboard
- "Share With Friends" → Share via WhatsApp, Facebook, or SMS

**Trigger**: Within 1 minute of successful contribution (batch if 3+ in 1 hour)

**Rate Limit**: One per contribution, max 5 per day per parent

---

### 2. To Parent: Campaign Complete (WhatsApp)
**Template Name**: `campaign_complete_parent`

**Type**: Transactional

**Message**:
```
🎊 [Parent Name], [Child]'s Dreamboard reached the goal!

You raised [Total Amount] from [Contributor Count] contributors!

Next: Download your list, thank your supporters, and get the gift.

[View Summary Button] [Download List Button]

— Gifta
```

**Variables**:
- `[Parent Name]` — Parent's first name
- `[Child]` — Child's name
- `[Total Amount]` — Amount raised
- `[Contributor Count]` — Number of contributors

**Button Actions**:
- "View Summary" → Link to campaign completion page
- "Download List" → PDF/CSV download of contributors

**Trigger**: When campaign reaches goal

---

### 3. To Parent: Shareable Dreamboard Message (Pre-Composed)
**Template Name**: `share_dream_board_parent`

**Type**: Shareable message (parent copies/sends manually via WhatsApp)

**Message**:
```
Hey! I'm using Gifta to celebrate [Child]'s birthday! 🎁

[Child] would love [Gift], and I'm raising [Target Amount] with help from friends and family.

Would you like to contribute? [Dreamboard Link]

It takes 2 minutes, no hidden fees, and you can add a birthday message!

Thanks! ❤️

— [Parent Name]
```

**Variables**:
- `[Child]` — Child's name
- `[Gift]` — Gift description
- `[Target Amount]` — Goal amount
- `[Dreamboard Link]` — Unique shareable link
- `[Parent Name]` — Parent's first name

**Delivery**: Displayed in app as "Share via WhatsApp" with pre-filled template; parent customizes and sends.

---

## Template Data Interfaces

### TypeScript Interfaces for Template Data

```typescript
// Base email template interface
interface EmailTemplate {
  templateId: string;
  recipientEmail: string;
  subject: string;
  variables: Record<string, string | number>;
  priority?: 'high' | 'normal' | 'low';
  tags?: string[];
  replyTo?: string;
}

// Parent Dreamboard Created
interface DreamBoardCreatedEmailData extends EmailTemplate {
  templateId: 'dream_board_created_parent';
  variables: {
    parentName: string;
    childName: string;
    childAge: number;
    giftName: string;
    dreamBoardLink: string;
    faqLink: string;
    contactLink: string;
  };
}

// Parent New Contribution
interface ContributionReceivedEmailData extends EmailTemplate {
  templateId: 'contribution_received_parent';
  variables: {
    parentName: string;
    contributorName: string;
    amount: number;
    childName: string;
    contributorMessage?: string;
    percentage: number;
    currentAmount: number;
    targetAmount: number;
    nextMilestone: number;
    contributorCount: number;
    shareLink: string;
  };
}

// Parent Campaign Complete
interface CampaignCompleteEmailData extends EmailTemplate {
  templateId: 'campaign_complete_parent';
  variables: {
    parentName: string;
    childName: string;
    totalAmount: number;
    targetAmount: number;
    overageAmount: number;
    contributorCount: number;
    averageContribution: number;
    contributorListLink: string;
    receiptLink: string;
    thankYouTemplateLink: string;
    charityLink?: string;
    referralLink: string;
    faqLink: string;
    supportLink: string;
  };
}

// Contributor Confirmation
interface ContributionConfirmationEmailData extends EmailTemplate {
  templateId: 'contribution_confirmation_contributor';
  variables: {
    contributorName: string;
    amount: number;
    childName: string;
    childAge: number;
    giftName: string;
    dateContributed: string; // ISO format
    transactionId: string;
    charityPartner?: string;
    charityImpact?: string;
    charityLink?: string;
    shareLink: string;
  };
}

// Contributor Reminder
interface ContributionReminderEmailData extends EmailTemplate {
  templateId: 'contribution_reminder_contributor';
  variables: {
    contributorName: string;
    childName: string;
    parentName: string;
    daysLeft: number;
    currentAmount: number;
    targetAmount: number;
    giftName: string;
    percentage: number;
    amountNeeded: number;
    contributorCount: number;
    dreamBoardLink: string;
  };
}

// Charity Monthly Report
interface CharityReportEmailData extends EmailTemplate {
  templateId: 'monthly_report_charity';
  variables: {
    charityName: string;
    month: string;
    year: number;
    totalDonated: number;
    transactionCount: number;
    averageDonation: number;
    familiesHelpedCount: number;
    childrenCelebratedCount: number;
    topCategories: Array<{
      category: string;
      count: number;
      amount: number;
    }>;
    donorListCsv?: string; // File path or URL
    partnershipManagerEmail: string;
  };
}

// Parent Daily Summary
interface DailySummaryEmailData extends EmailTemplate {
  templateId: 'daily_summary_parent';
  variables: {
    parentName: string;
    childName: string;
    contributionCount: number;
    contributions: Array<{
      contributorName: string;
      amount: number;
      message?: string;
    }>;
    dailyTotal: number;
    percentage: number;
    amountRemaining: number;
    dreamBoardLink: string;
    shareLink: string;
  };
}

// Parent Milestone Reached
interface MilestoneReachedEmailData extends EmailTemplate {
  templateId: 'milestone_reached_parent';
  variables: {
    parentName: string;
    childName: string;
    milestoneCount: number;
    totalAmount: number;
    percentage: number;
    probabilityIncrease: number;
    shareLink: string;
  };
}

// Parent Campaign Ending Soon
interface CampaignEndingSoonEmailData extends EmailTemplate {
  templateId: 'campaign_ending_soon_parent';
  variables: {
    parentName: string;
    childName: string;
    percentage: number;
    amountRemaining: number;
    whatsappLink: string;
    facebookLink: string;
    emailLink: string;
    copyLinkButton: string;
  };
}

// WhatsApp Message Data
interface WhatsAppMessage {
  templateName: string;
  recipientPhoneNumber: string;
  variables: Record<string, string | number>;
  mediaUrl?: string;
}

interface NewContributionWhatsAppData extends WhatsAppMessage {
  templateName: 'new_contribution_parent';
  variables: {
    parentName: string;
    contributorName: string;
    amount: number;
    childName: string;
    percentage: number;
  };
}

interface CampaignCompleteWhatsAppData extends WhatsAppMessage {
  templateName: 'campaign_complete_parent';
  variables: {
    parentName: string;
    childName: string;
    totalAmount: number;
    contributorCount: number;
  };
}
```

---

## Delivery & Idempotency Rules

### Email Delivery Rules

**1. Deduplication (Idempotency)**
- Each email must have a unique `idempotencyKey` to prevent duplicate sends
- Format: `{templateId}-{recipientId}-{triggerTimestamp}-{entityId}`
- Example: `dream_board_created_parent-user_123-1707388800-board_456`
- Resend API supports idempotency natively; use `idempotencyKey` parameter

**2. Rate Limiting**
- Parent emails: Max 10 per day (prevents notification fatigue)
- Contributor emails: Max 3 per day
- Daily summaries: One per day at scheduled time (9 AM parent's timezone)
- Milestone emails: Only at exact threshold (10, 25, 50 contributors)

**3. Unsubscribe & Preference Management**
- Every email includes unsubscribe link (legal requirement)
- Parent can choose notification frequency: Real-time, Daily digest, Off
- Contributor emails: Sent only during active campaign (post-contribution)
- Charity emails: Opt-in during partnership setup

**4. Send Timing**
- Transactional emails (confirmation, contribution): Immediate (< 1 minute)
- Notification emails (new contribution): Within 1 minute, batch if 3+ in 1 hour
- Reminder emails (7 days before): Scheduled for 10 AM parent's timezone
- Daily summary: 9 AM parent's timezone (only if > 3 contributions)
- End-of-campaign: 24 hours before birthday

**5. Timezone Handling**
- Store parent's timezone in profile
- Use timezone when scheduling reminder, summary, and end-of-campaign emails
- Example: Parent in "Africa/Johannesburg" receives summary at 9 AM JST

**6. Error Handling & Retries**
- Failed send: Retry at 5 min, 15 min, 1 hour delays
- Max 3 retries per email
- After max retries: Log in error database, alert support team
- Do not retry unsubscribe/invalid email errors (permanent failures)

**7. Analytics Tracking**
- Track open rate, click rate, unsubscribe rate per template
- Webhook from Resend: `email_opened`, `email_clicked`, `unsubscribed`, `bounced`
- Store events in analytics database for dashboard reporting
- Update email health score (deliverability metric)

---

### WhatsApp Delivery Rules

**1. Session Management**
- WhatsApp templates are "notification messages" (24-hour window after customer initiates)
- Only send templated messages within 24 hours of customer's last message
- After 24 hours: Use WhatsApp Business API conversation-list feature to request opt-in

**2. Approval & Compliance**
- All templates must be pre-approved by Meta (WhatsApp)
- Include disclaimer: "This is an automated message from Gifta"
- Do not include call-to-action links in template (use button instead)
- Avoid spammy language: No all-caps, excessive exclamation marks, or emojis (max 1-2)

**3. Rate Limiting**
- Max 1 message per recipient per 24 hours (WhatsApp restriction)
- Queue messages if multiple triggers occur (send highest priority)
- Example: If contribution + milestone both triggered, send contribution only

**4. Opt-In Management**
- Obtain explicit opt-in for WhatsApp notifications (phone number + consent checkbox)
- Store opt-in timestamp and consent version
- Implement "Reply STOP" unsubscribe mechanism
- Honor opt-out immediately (remove from all WhatsApp lists)

**5. Idempotency**
- Format: `{templateName}-{recipientPhone}-{triggerTimestamp}-{entityId}`
- Example: `new_contribution_parent-+27123456789-1707388800-contrib_123`
- Prevent resends within 5 minutes of original send

**6. Fallback to Email**
- If WhatsApp send fails: Send equivalent email instead
- Log which channel was used for each notification
- Inform user of communication preference (email vs WhatsApp)

---

### Email Template Versioning

**A/B Testing Framework**:
```typescript
interface EmailVariant {
  id: string;
  templateId: string;
  version: number; // v1, v2, v3...
  subject: string;
  preheader?: string;
  bodyHtml: string;
  isControl: boolean;
  splitPercentage: number; // 0-100
  startDate: ISO8601;
  endDate?: ISO8601;
  metrics?: {
    sent: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
  };
}

// Route recipients to variants
function selectEmailVariant(templateId: string, userId: string): EmailVariant {
  // Deterministic bucketing: hash(templateId + userId) % 100
  // Return variant based on split percentage
}
```

**Change Log**:
- Document all template changes in version history
- Include: date, change description, reason, author
- Example: `dream_board_created_parent v1 → v2: Changed CTA button color to orange (150% increase in clicks)`

---

### Email Compliance & GDPR/POPIA

**1. Consent Management**
- Store consent type: `email_marketing`, `email_transactional`, `email_digest`
- Require explicit opt-in for marketing emails
- Transactional emails do not require opt-in
- Honor opt-out within 48 hours

**2. Data Privacy**
- Do not include sensitive data in email subject lines
- Mask personal data in previews (e.g., "Dreamboard → Campaign Update")
- Encrypt subscriber data in Resend (use API encryption)
- Implement data deletion: Delete all emails for user upon GDPR request

**3. Unsubscribe Management**
- One-click unsubscribe from email header (List-Unsubscribe)
- Provide unsubscribe preferences page (email frequency, not all-or-nothing)
- Honor unsubscribe within 48 hours
- Never re-add unsubscribed emails to list

**4. Charity Donor Reporting**
- Only include donor names if they explicitly opted in
- Anonymize donations in public reports
- Provide donors with download of their contribution receipt (tax purposes)

---

## File Summary

**Email Templates (Resend)**:
- `src/templates/emails/dream-board-created.tsx`
- `src/templates/emails/contribution-received.tsx`
- `src/templates/emails/campaign-complete.tsx`
- `src/templates/emails/contribution-confirmation.tsx`
- `src/templates/emails/contribution-reminder.tsx`
- `src/templates/emails/monthly-report-charity.tsx`
- `src/templates/emails/daily-summary.tsx`
- `src/templates/emails/milestone-reached.tsx`
- `src/templates/emails/campaign-ending-soon.tsx`

**WhatsApp Templates**:
- `src/templates/whatsapp/new-contribution-parent.ts`
- `src/templates/whatsapp/campaign-complete-parent.ts`
- `src/templates/whatsapp/share-dream-board.ts`

**Template Data & Types**:
- `src/types/email-templates.ts` (TypeScript interfaces)
- `src/lib/email-service.ts` (Resend client, send logic, idempotency)
- `src/lib/whatsapp-service.ts` (Twilio client, WhatsApp logic)

**Config & Constants**:
- `src/config/email-config.ts` (Rate limits, timing, timezone)
- `src/config/whatsapp-config.ts` (Template names, API settings)

---

## Reference
- See `00-DESIGN-SYSTEM.md` for color tokens and typography
- Resend API Docs: https://resend.com/docs
- WhatsApp Business API: https://www.whatsapp.com/business/

---

*Document Version: 1.0 | Last Updated: 2024 | Implementation-Ready for AI Coding Agents*
