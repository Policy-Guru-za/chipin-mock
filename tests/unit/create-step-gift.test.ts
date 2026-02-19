import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

const loadActionsModule = async () => {
  vi.resetModules();
  return import('@/app/(host)/create/gift/actions');
};

const baseDraft = (overrides: Record<string, unknown> = {}) => ({
  childName: 'Maya',
  childAge: 7,
  childPhotoUrl: 'https://example.com/child.jpg',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

afterEach(() => {
  vi.unmock('next/navigation');
  vi.unmock('@/lib/auth/clerk-wrappers');
  vi.unmock('@/lib/dream-boards/draft');
  vi.clearAllMocks();
  vi.resetModules();
});

describe('saveManualGiftAction', () => {
  it('saves gift fields + trimmed message and redirects to dates', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const updateDreamBoardDraft = vi.fn(async () => undefined);

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => baseDraft()),
      updateDreamBoardDraft,
    }));

    const { saveManualGiftAction } = await loadActionsModule();
    const formData = new FormData();
    formData.set('giftName', '  PlayStation II  ');
    formData.set('message', '  Thanks for helping make this happen.  ');

    await expect(saveManualGiftAction(formData)).rejects.toThrow('REDIRECT:/create/dates');
    expect(updateDreamBoardDraft).toHaveBeenCalledWith('host-1', {
      giftName: 'PlayStation II',
      giftDescription: undefined,
      giftIconId: undefined,
      giftImageUrl: '/icons/gifts/gifta-logo.png',
      giftImagePrompt: undefined,
      goalCents: 0,
      message: 'Thanks for helping make this happen.',
    });
  });

  it('returns invalid when message exceeds 280 characters', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const updateDreamBoardDraft = vi.fn(async () => undefined);

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => baseDraft()),
      updateDreamBoardDraft,
    }));

    const { saveManualGiftAction } = await loadActionsModule();
    const formData = new FormData();
    formData.set('giftName', 'PlayStation II');
    formData.set('message', 'a'.repeat(281));

    await expect(saveManualGiftAction(formData)).rejects.toThrow('REDIRECT:/create/gift?error=invalid');
    expect(updateDreamBoardDraft).not.toHaveBeenCalled();
  });

  it('normalizes blank message to undefined', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const updateDreamBoardDraft = vi.fn(async () => undefined);

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => baseDraft()),
      updateDreamBoardDraft,
    }));

    const { saveManualGiftAction } = await loadActionsModule();
    const formData = new FormData();
    formData.set('giftName', 'PlayStation II');
    formData.set('message', '    ');

    await expect(saveManualGiftAction(formData)).rejects.toThrow('REDIRECT:/create/dates');
    expect(updateDreamBoardDraft).toHaveBeenCalledWith('host-1', {
      giftName: 'PlayStation II',
      giftDescription: undefined,
      giftIconId: undefined,
      giftImageUrl: '/icons/gifts/gifta-logo.png',
      giftImagePrompt: undefined,
      goalCents: 0,
      message: undefined,
    });
  });

  it('redirects to child when prerequisite child step is incomplete', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const updateDreamBoardDraft = vi.fn(async () => undefined);

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => ({ updatedAt: '2026-01-01T00:00:00.000Z' })),
      updateDreamBoardDraft,
    }));

    const { saveManualGiftAction } = await loadActionsModule();
    const formData = new FormData();
    formData.set('giftName', 'PlayStation II');

    await expect(saveManualGiftAction(formData)).rejects.toThrow('REDIRECT:/create/child');
    expect(updateDreamBoardDraft).not.toHaveBeenCalled();
  });
});

describe('CreateGiftPage', () => {
  it('renders existing draft message as default field value', async () => {
    vi.doMock('next/navigation', () => ({
      redirect: (url: string) => {
        throw new Error(`REDIRECT:${url}`);
      },
    }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      requireHostAuth: vi.fn(async () => ({ hostId: 'host-1' })),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () =>
        baseDraft({
          giftName: 'Scooter',
          message: 'Thanks everyone!',
        })
      ),
    }));

    const giftPageModule = await import('@/app/(host)/create/gift/page');
    const element = await giftPageModule.default({ searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(element);

    expect(html).toContain('A message from Maya');
    expect(html).toContain('name="message"');
    expect(html).toContain('Thanks everyone!');
  });
});
