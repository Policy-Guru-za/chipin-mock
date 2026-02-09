import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildGuestViewModel } from '@/lib/dream-boards/view-model';
import { calculateFee } from '@/lib/payments/fees';
import { calculatePayoutTotals } from '@/lib/payouts/calculation';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('UAT data validation', () => {
  it('validates platform fee bounds and 3% nominal behavior', () => {
    expect(calculateFee(1000)).toBe(300);
    expect(calculateFee(10000)).toBe(300);
    expect(calculateFee(25000)).toBe(750);
    expect(calculateFee(10_000_000)).toBe(50000);
  });

  it('validates payout arithmetic and non-negative bounded totals', () => {
    const payout = calculatePayoutTotals({
      raisedCents: 100000,
      platformFeeCents: 3000,
      charityCents: 10000,
    });

    expect(payout.raisedCents).toBe(100000);
    expect(payout.platformFeeCents).toBe(3000);
    expect(payout.charityCents).toBe(10000);
    expect(payout.giftCents).toBe(87000);
    expect(payout.giftCents + payout.charityCents + payout.platformFeeCents).toBe(100000);
  });

  it('keeps funded and overfunded presentation logic stable on guest view model', () => {
    const board = {
      hostId: 'host-1',
      childName: 'Maya',
      childPhotoUrl: null,
      slug: 'maya-board',
      giftName: 'Scooter',
      giftImageUrl: null,
      charityEnabled: false,
      charityName: null,
      charityDescription: null,
      charityLogoUrl: null,
      charitySplitType: null,
      charityPercentageBps: null,
      charityThresholdCents: null,
      partyDate: null,
      campaignEndDate: null,
      status: 'funded',
      contributionCount: 5,
      raisedCents: 120000,
      goalCents: 100000,
      message: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const view = buildGuestViewModel(board as never, { now: new Date('2099-01-01T00:00:00.000Z') });
    expect(view.funded).toBe(true);
    expect(view.raisedCents).toBeGreaterThan(view.goalCents);
    expect(view.percentage).toBe(100);
    expect(view.isClosed).toBe(false);
  });

  it('keeps reminder window validation guards for campaign bounds', () => {
    const source = readSource('src/app/api/internal/contributions/reminders/route.ts');

    expect(source).toContain('.max(14)');
    expect(source).toContain('closeOfDay');
    expect(source).toContain('invalid_reminder_window');
  });
});
