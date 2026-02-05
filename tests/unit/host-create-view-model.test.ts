import { describe, expect, it } from 'vitest';

import type { DreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

const baseDraft: DreamBoardDraft = {
  childName: 'Maya',
  childAge: 7,
  partyDate: '2026-02-01',
  childPhotoUrl: 'https://example.com/child.jpg',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

describe('buildCreateFlowViewModel', () => {
  it('redirects to child step when prerequisites are missing', () => {
    const view = buildCreateFlowViewModel({ step: 'gift', draft: null });

    expect(view.redirectTo).toBe('/create/child');
    expect(view.title).toBe('What’s the dream gift?');
  });

  it('builds gift preview details', () => {
    const view = buildCreateFlowViewModel({
      step: 'gift',
      draft: {
        ...baseDraft,
        giftName: 'Scooter',
        giftDescription: 'A mint green scooter with streamers.',
        giftImageUrl: 'https://example.com/scooter.jpg',
        goalCents: 52000,
      },
    });

    expect(view.redirectTo).toBeUndefined();
    expect(view.giftPreview?.title).toBe('Scooter');
    expect(view.giftPreview?.subtitle).toBe('A mint green scooter with streamers.');
  });

  it('redirects review step when payout details are missing', () => {
    const view = buildCreateFlowViewModel({
      step: 'review',
      draft: {
        ...baseDraft,
        giftName: 'Playhouse',
        giftDescription: 'A little garden playhouse',
        giftImageUrl: 'https://example.com/playhouse.jpg',
        goalCents: 50000,
      },
    });

    expect(view.redirectTo).toBe('/create/details');
  });
});
