import { afterEach, describe, expect, it, vi } from 'vitest';

const loadModule = async () => {
  vi.resetModules();
  return import('@/app/(host)/create/review/actions');
};

const validDraft = {
  childName: 'Maya',
  childAge: 7,
  childPhotoUrl: 'https://example.com/child.jpg',
  birthdayDate: '2026-06-10',
  partyDate: '2026-06-12',
  partyDateTime: null,
  campaignEndDate: '2026-06-12',
  giftName: 'PlayStation II',
  giftDescription: 'Console bundle with two controllers.',
  giftIconId: 'scooter',
  giftImageUrl: '/icons/gifts/scooter.png',
  giftImagePrompt: undefined,
  goalCents: 0,
  payoutMethod: 'karri_card' as const,
  payoutEmail: 'parent@example.com',
  karriCardNumberEncrypted: 'enc-card',
  karriCardHolderName: 'Maya Parent',
  charityEnabled: false,
  hostWhatsAppNumber: '+27821234567',
  message: 'Thanks for helping make this happen.',
};

afterEach(() => {
  vi.unmock('@/lib/auth/clerk-wrappers');
  vi.unmock('@/lib/dream-boards/draft');
  vi.unmock('@/lib/db');
  vi.unmock('@/lib/integrations/whatsapp');
  vi.unmock('@/lib/utils/slug');
  vi.unmock('@/lib/observability/logger');
  vi.clearAllMocks();
  vi.resetModules();
});

describe('publishDreamBoardAction', () => {
  it('persists draft message to the published dream board payload', async () => {
    const returning = vi.fn(async () => [{ id: 'board-1' }]);
    const values = vi.fn(() => ({ returning }));
    const insert = vi.fn(() => ({ values }));
    const clearDreamBoardDraft = vi.fn(async () => undefined);
    const sendDreamBoardLink = vi.fn(async () => undefined);

    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => validDraft),
      clearDreamBoardDraft,
    }));
    vi.doMock('@/lib/db', () => ({
      db: { insert },
    }));
    vi.doMock('@/lib/integrations/whatsapp', () => ({
      sendDreamBoardLink,
    }));
    vi.doMock('@/lib/utils/slug', () => ({
      generateSlug: vi.fn(() => 'maya-birthday-abc123'),
    }));
    vi.doMock('@/lib/observability/logger', () => ({
      log: vi.fn(),
    }));

    const { publishDreamBoardAction } = await loadModule();
    const result = await publishDreamBoardAction({ status: 'preview' }, new FormData());

    expect(insert).toHaveBeenCalled();
    expect(values).toHaveBeenCalledWith(
      expect.objectContaining({
        hostId: 'host-1',
        childName: 'Maya',
        giftName: 'PlayStation II',
        message: 'Thanks for helping make this happen.',
      })
    );
    expect(clearDreamBoardDraft).toHaveBeenCalledWith('host-1');
    expect(sendDreamBoardLink).toHaveBeenCalledWith(
      '+27821234567',
      'https://gifta.co/maya-birthday-abc123',
      'Maya'
    );

    expect(result).toEqual({
      status: 'published',
      boardId: 'board-1',
      slug: 'maya-birthday-abc123',
      shareUrl: 'https://gifta.co/maya-birthday-abc123',
    });
  });
});
