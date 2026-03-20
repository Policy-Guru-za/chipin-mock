import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('UAT Host Create (UAT-01..UAT-04)', () => {
  it('covers bank-default host create plus legacy compatibility journeys in integration flow tests', () => {
    const source = readSource('tests/integration/create-flow-steps.test.ts');

    expect(source).toContain('full happy path: bank payout with no charity');
    expect(source).toContain('prevents skipping payout setup and redirects back to dates');
    expect(source).toContain('clears charity fields when legacy giving-back submits into the new flow');
  });

  it('enforces 5-step create prerequisites via redirect rules', () => {
    const emptyGiftStep = buildCreateFlowViewModel({ step: 'gift', draft: null });
    const emptyDatesStep = buildCreateFlowViewModel({ step: 'dates', draft: null });
    const emptyPayoutStep = buildCreateFlowViewModel({ step: 'payout', draft: null });
    expect(emptyGiftStep.redirectTo).toBe('/create/child');
    expect(emptyDatesStep.redirectTo).toBe('/create/gift');
    expect(emptyPayoutStep.redirectTo).toBe('/create/dates');

    const completeDraft = {
      childName: 'Maya',
      childAge: 7,
      childPhotoUrl: 'https://images.example/maya.jpg',
      giftName: 'Scooter',
      giftImageUrl: 'https://images.example/scooter.jpg',
      goalCents: 60000,
      birthdayDate: '2099-01-01',
      partyDate: '2099-01-01',
      campaignEndDate: '2099-01-01',
      payoutMethod: 'bank',
      payoutEmail: 'host@example.com',
      hostWhatsAppNumber: '+27820000000',
      bankName: 'FNB',
      bankAccountNumberEncrypted: 'enc:bank',
      bankAccountLast4: '1234',
      bankBranchCode: '250655',
      bankAccountHolder: 'Maya Parent',
    };
    const reviewStep = buildCreateFlowViewModel({ step: 'review', draft: completeDraft as never });
    expect(reviewStep.redirectTo).toBeUndefined();
  });

  it('keeps host create telemetry contract names in source', () => {
    const source = readSource('src/lib/analytics/metrics.ts');

    expect(source).toContain('host_create_started');
    expect(source).toContain('host_create_step_completed');
    expect(source).toContain('host_create_failed');
    expect(source).toContain('host_create_published');
  });
});
