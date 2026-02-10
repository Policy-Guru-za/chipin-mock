import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { APP_NAME } from '@/lib/constants';
import { buildContributionViewModel, buildGuestViewModel } from '@/lib/dream-boards/view-model';
import { buildReminderEmailPayload } from '@/lib/reminders/templates';

type BoardRecord = Parameters<typeof buildGuestViewModel>[0];

const readSource = (path: string) => readFileSync(resolve(process.cwd(), path), 'utf8');

const makeBoard = (overrides: Partial<BoardRecord> = {}) =>
  ({
    id: 'board-1',
    slug: 'maya-birthday',
    hostId: 'host-1',
    childName: 'Maya',
    childPhotoUrl: null,
    childAge: 7,
    birthdayDate: '2026-02-15',
    partyDate: '2026-02-15',
    partyDateTime: null,
    campaignEndDate: '2026-02-12',
    giftName: 'Scooter',
    giftDescription: 'Mint scooter',
    giftImageUrl: null,
    giftImagePrompt: null,
    goalCents: 50000,
    payoutMethod: 'karri_card',
    payoutEmail: 'parent@example.com',
    charityEnabled: false,
    charityId: null,
    charitySplitType: null,
    charityPercentageBps: null,
    charityThresholdCents: null,
    charityName: null,
    charityDescription: null,
    charityLogoUrl: null,
    charityCategory: null,
    message: null,
    status: 'active',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    raisedCents: 10000,
    contributionCount: 2,
    ...overrides,
  }) as BoardRecord;

describe('copy matrix compliance', () => {
  it('uses Gifta branding in header and footer source', () => {
    const header = readSource('src/components/layout/Header.tsx');
    const footer = readSource('src/components/layout/Footer.tsx');

    expect(header).toContain('Gifta');
    expect(header).not.toContain('ChipIn');
    expect(footer).toContain('Gifta');
    expect(footer).not.toContain('ChipIn');
  });

  it('sets APP_NAME to Gifta', () => {
    expect(APP_NAME).toBe('Gifta');
  });

  it('uses Gifta fallback sender name and domain', () => {
    const emailIntegration = readSource('src/lib/integrations/email.ts');

    expect(emailIntegration).toContain("process.env.RESEND_FROM_NAME ?? 'Gifta'");
    expect(emailIntegration).toContain("process.env.RESEND_FROM_EMAIL ?? 'noreply@gifta.co.za'");
  });

  it('uses Dreamboard closed-state copy exactly in view model', () => {
    const view = buildGuestViewModel(makeBoard({ campaignEndDate: '2026-01-15' }), {
      now: new Date('2026-02-01T12:00:00.000Z'),
    });

    expect(view.timeRemainingMessage).toBe('This Dreamboard is closed to new contributions.');
  });

  it('uses chip-in wording for contribution headline', () => {
    const view = buildContributionViewModel(makeBoard());
    expect(view.headline).toBe("Chip in for Maya's dream gift");
  });

  it('uses reminder email subject from matrix', () => {
    const payload = buildReminderEmailPayload({
      toEmail: 'friend@example.com',
      variables: {
        childName: 'Maya',
        giftName: 'Scooter',
        dreamBoardUrl: 'https://gifta.example/maya',
        campaignCloseDate: '2099-01-30',
      },
    });

    expect(payload.subject).toBe("🔔 Reminder: chip in for Maya's gift");
  });

  it('uses reminder email body and CTA from matrix', () => {
    const payload = buildReminderEmailPayload({
      toEmail: 'friend@example.com',
      variables: {
        childName: 'Maya',
        giftName: 'Scooter',
        dreamBoardUrl: 'https://gifta.example/maya',
        campaignCloseDate: '2099-01-30',
      },
    });

    expect(payload.html).toContain('Please chip in before');
    expect(payload.html).toContain('Chip in now');
    expect(payload.text).toContain('Chip in now: https://gifta.example/maya');
  });

  it('uses Dreamboard terminology on landing CTAs', () => {
    const cta = readSource('src/components/landing/LandingCTA.tsx');
    const nav = readSource('src/components/landing/LandingNav.tsx');
    const page = readSource('src/components/landing/LandingPage.tsx');

    expect(cta).toContain('Create Your Free Dreamboard');
    expect(nav).toContain('Create a Free Dreamboard');
    expect(page).toContain('Create Your Free Dreamboard');
    expect(cta).not.toContain('Create your free Dreamboard');
    expect(nav).not.toContain('Create a free Dreamboard');
    expect(page).not.toContain('Create your free Dreamboard');
  });

  it('uses Create Dreamboard CTA in host review', () => {
    const review = readSource('src/app/(host)/create/review/ReviewClient.tsx');

    expect(review).toContain('Create Dreamboard');
    expect(review).not.toContain('Publish Dreamboard');
  });

  it('uses Phase D status-badge funded copy', () => {
    const statusBadge = readSource('src/components/dream-board/DreamboardStatusBadge.tsx');
    expect(statusBadge).toContain('Gift funded - thank you, everyone! 🎉');
  });

  it('uses remind-me copy from matrix', () => {
    const details = readSource('src/app/(guest)/[slug]/contribute/ContributeDetailsClient.tsx');
    const reminderModal = readSource('src/components/contribute/ReminderModal.tsx');

    expect(details).toContain('Remind me later');
    expect(reminderModal).toContain("We&apos;ll send one reminder before this Dreamboard closes.");
  });
});
