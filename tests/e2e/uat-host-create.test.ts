import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('UAT Host Create (UAT-01..UAT-04)', () => {
  it('covers karri + bank + charity split host create journeys in integration flow tests', () => {
    const source = readSource('tests/integration/create-flow-steps.test.ts');

    expect(source).toContain('full happy path: karri payout with no charity');
    expect(source).toContain('full happy path: bank payout with charity percentage split');
    expect(source).toContain('full happy path: bank payout with charity threshold split');
  });

  it('enforces 6-step create prerequisites via redirect rules', () => {
    const emptyGiftStep = buildCreateFlowViewModel({ step: 'gift', draft: null });
    const emptyDatesStep = buildCreateFlowViewModel({ step: 'dates', draft: null });
    expect(emptyGiftStep.redirectTo).toBe('/create/child');
    expect(emptyDatesStep.redirectTo).toBe('/create/gift');

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
      charityEnabled: false,
      payoutMethod: 'karri_card',
      payoutEmail: 'host@example.com',
      hostWhatsAppNumber: '+27820000000',
      karriCardNumberEncrypted: 'enc:123',
      karriCardHolderName: 'Maya Parent',
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
