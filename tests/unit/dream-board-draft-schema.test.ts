import { describe, expect, it } from 'vitest';

import { hostCreateDreamBoardDraftSchema } from '@/lib/dream-boards/schema';

const validDraft = {
  childName: 'Maya',
  childAge: 7,
  birthdayDate: '2026-06-10',
  partyDate: '2026-06-12',
  partyDateTime: '2026-06-12T10:00:00.000Z',
  campaignEndDate: '2026-06-12',
  childPhotoUrl: 'https://images.example/child.jpg',
  giftName: 'Ballet shoes',
  giftDescription: '',
  giftIconId: 'ballet',
  giftImageUrl: '/icons/gifts/ballet.png',
  giftImagePrompt: undefined,
  goalCents: 25000,
  payoutMethod: 'takealot_voucher' as const,
  payoutEmail: 'parent@example.com',
  hostWhatsAppNumber: '+27821234567',
};

describe('hostCreateDreamBoardDraftSchema', () => {
  it('accepts icon paths and optional short descriptions', () => {
    const parsed = hostCreateDreamBoardDraftSchema.safeParse(validDraft);
    expect(parsed.success).toBe(true);
  });

  it('rejects non-icon gift image paths', () => {
    const parsed = hostCreateDreamBoardDraftSchema.safeParse({
      ...validDraft,
      giftImageUrl: 'https://images.example/gift.jpg',
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts null partyDateTime when omitted from dates step', () => {
    const parsed = hostCreateDreamBoardDraftSchema.safeParse({
      ...validDraft,
      partyDateTime: null,
    });
    expect(parsed.success).toBe(true);
  });

  it('rejects legacy payout residue in the active host-create schema', () => {
    const parsed = hostCreateDreamBoardDraftSchema.safeParse({
      ...validDraft,
      karriCardNumberEncrypted: 'enc-card',
    });

    expect(parsed.success).toBe(false);
  });
});
