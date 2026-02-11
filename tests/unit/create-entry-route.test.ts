import { afterEach, describe, expect, it, vi } from 'vitest';

const loadPage = async () => {
  vi.resetModules();
  return import('@/app/(host)/create/page');
};

afterEach(() => {
  vi.unmock('next/navigation');
  vi.unmock('@/lib/auth/clerk-config');
  vi.unmock('@/lib/auth/clerk-wrappers');
  vi.unmock('@/lib/dream-boards/draft');
  vi.unmock('@/lib/integrations/blob');
  vi.unmock('@/lib/observability/logger');
  vi.clearAllMocks();
  vi.resetModules();
});

describe('CreateDreamBoardPage fresh-start routing (unauthenticated)', () => {
  it('redirects unauthenticated users to sign-in with redirect_url=/create', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ getHostAuth: vi.fn(async () => null) }));
    vi.doMock('@/lib/auth/clerk-config', () => ({
      getClerkUrls: () => ({ signInUrl: '/sign-in' }),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => null),
      clearDreamBoardDraft: vi.fn(async () => undefined),
    }));
    vi.doMock('@/lib/integrations/blob', () => ({ deleteChildPhoto: vi.fn(async () => undefined) }));
    vi.doMock('@/lib/observability/logger', () => ({ log: vi.fn() }));

    const { default: CreateDreamBoardPage } = await loadPage();

    await expect(CreateDreamBoardPage()).rejects.toThrow('REDIRECT:/sign-in?redirect_url=%2Fcreate');
  });

  it('appends redirect_url with & when sign-in URL already contains query params', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({ getHostAuth: vi.fn(async () => null) }));
    vi.doMock('@/lib/auth/clerk-config', () => ({
      getClerkUrls: () => ({ signInUrl: '/sign-in?flow=host' }),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => null),
      clearDreamBoardDraft: vi.fn(async () => undefined),
    }));
    vi.doMock('@/lib/integrations/blob', () => ({ deleteChildPhoto: vi.fn(async () => undefined) }));
    vi.doMock('@/lib/observability/logger', () => ({ log: vi.fn() }));

    const { default: CreateDreamBoardPage } = await loadPage();

    await expect(CreateDreamBoardPage()).rejects.toThrow(
      'REDIRECT:/sign-in?flow=host&redirect_url=%2Fcreate'
    );
  });
});

describe('CreateDreamBoardPage fresh-start routing (authenticated)', () => {
  it('clears draft and redirects to /create/child for authenticated hosts', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const getDreamBoardDraft = vi.fn(async () => null);
    const clearDreamBoardDraft = vi.fn(async () => undefined);
    const deleteChildPhoto = vi.fn(async () => undefined);

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      getHostAuth: vi.fn(async () => ({ hostId: 'host-1', email: 'host@example.com' })),
    }));
    vi.doMock('@/lib/auth/clerk-config', () => ({
      getClerkUrls: () => ({ signInUrl: '/sign-in' }),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft,
      clearDreamBoardDraft,
    }));
    vi.doMock('@/lib/integrations/blob', () => ({ deleteChildPhoto }));
    vi.doMock('@/lib/observability/logger', () => ({ log: vi.fn() }));

    const { default: CreateDreamBoardPage } = await loadPage();

    await expect(CreateDreamBoardPage()).rejects.toThrow('REDIRECT:/create/child');
    expect(getDreamBoardDraft).toHaveBeenCalledWith('host-1');
    expect(deleteChildPhoto).not.toHaveBeenCalled();
    expect(clearDreamBoardDraft).toHaveBeenCalledWith('host-1');
  });

  it('clears draft before photo cleanup when existing child photo is present', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const getDreamBoardDraft = vi.fn(async () => ({ childPhotoUrl: 'https://blob.example/child.jpg' }));
    const clearDreamBoardDraft = vi.fn(async () => undefined);
    const deleteChildPhoto = vi.fn(async () => undefined);

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      getHostAuth: vi.fn(async () => ({ hostId: 'host-1', email: 'host@example.com' })),
    }));
    vi.doMock('@/lib/auth/clerk-config', () => ({
      getClerkUrls: () => ({ signInUrl: '/sign-in' }),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft,
      clearDreamBoardDraft,
    }));
    vi.doMock('@/lib/integrations/blob', () => ({ deleteChildPhoto }));
    vi.doMock('@/lib/observability/logger', () => ({ log: vi.fn() }));

    const { default: CreateDreamBoardPage } = await loadPage();

    await expect(CreateDreamBoardPage()).rejects.toThrow('REDIRECT:/create/child');
    expect(deleteChildPhoto).toHaveBeenCalledWith('https://blob.example/child.jpg');
    expect(clearDreamBoardDraft).toHaveBeenCalledWith('host-1');
    expect(clearDreamBoardDraft.mock.invocationCallOrder[0]).toBeLessThan(
      deleteChildPhoto.mock.invocationCallOrder[0]
    );
  });

  it('continues to /create/child when draft read fails', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const getDreamBoardDraft = vi.fn(async () => {
      throw new Error('kv read failed');
    });
    const clearDreamBoardDraft = vi.fn(async () => undefined);
    const deleteChildPhoto = vi.fn(async () => undefined);
    const log = vi.fn();

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      getHostAuth: vi.fn(async () => ({ hostId: 'host-1', email: 'host@example.com' })),
    }));
    vi.doMock('@/lib/auth/clerk-config', () => ({
      getClerkUrls: () => ({ signInUrl: '/sign-in' }),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft,
      clearDreamBoardDraft,
    }));
    vi.doMock('@/lib/integrations/blob', () => ({ deleteChildPhoto }));
    vi.doMock('@/lib/observability/logger', () => ({ log }));

    const { default: CreateDreamBoardPage } = await loadPage();

    await expect(CreateDreamBoardPage()).rejects.toThrow('REDIRECT:/create/child');
    expect(clearDreamBoardDraft).toHaveBeenCalledWith('host-1');
    expect(deleteChildPhoto).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      'warn',
      'create_fresh_start_draft_read_failed',
      expect.objectContaining({
        hostId: 'host-1',
      })
    );
  });
});

describe('CreateDreamBoardPage fresh-start routing (authenticated failures)', () => {
  it('continues fresh start when photo cleanup fails', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const clearDreamBoardDraft = vi.fn(async () => undefined);
    const deleteChildPhoto = vi.fn(async () => {
      throw new Error('blob delete failed');
    });
    const log = vi.fn();

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      getHostAuth: vi.fn(async () => ({ hostId: 'host-1', email: 'host@example.com' })),
    }));
    vi.doMock('@/lib/auth/clerk-config', () => ({
      getClerkUrls: () => ({ signInUrl: '/sign-in' }),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => ({ childPhotoUrl: 'https://blob.example/child.jpg' })),
      clearDreamBoardDraft,
    }));
    vi.doMock('@/lib/integrations/blob', () => ({ deleteChildPhoto }));
    vi.doMock('@/lib/observability/logger', () => ({ log }));

    const { default: CreateDreamBoardPage } = await loadPage();

    await expect(CreateDreamBoardPage()).rejects.toThrow('REDIRECT:/create/child');
    expect(clearDreamBoardDraft).toHaveBeenCalledWith('host-1');
    expect(log).toHaveBeenCalledWith(
      'warn',
      'create_fresh_start_photo_delete_failed',
      expect.objectContaining({
        hostId: 'host-1',
      })
    );
  });

  it('throws and does not redirect when draft clear fails', async () => {
    const redirectMock = vi.fn((url: string) => {
      throw new Error(`REDIRECT:${url}`);
    });
    const deleteChildPhoto = vi.fn(async () => undefined);
    const clearDreamBoardDraft = vi.fn(async () => {
      throw new Error('kv unavailable');
    });
    const log = vi.fn();

    vi.doMock('next/navigation', () => ({ redirect: redirectMock }));
    vi.doMock('@/lib/auth/clerk-wrappers', () => ({
      getHostAuth: vi.fn(async () => ({ hostId: 'host-1', email: 'host@example.com' })),
    }));
    vi.doMock('@/lib/auth/clerk-config', () => ({
      getClerkUrls: () => ({ signInUrl: '/sign-in' }),
    }));
    vi.doMock('@/lib/dream-boards/draft', () => ({
      getDreamBoardDraft: vi.fn(async () => ({ childPhotoUrl: 'https://blob.example/child.jpg' })),
      clearDreamBoardDraft,
    }));
    vi.doMock('@/lib/integrations/blob', () => ({ deleteChildPhoto }));
    vi.doMock('@/lib/observability/logger', () => ({ log }));

    const { default: CreateDreamBoardPage } = await loadPage();

    await expect(CreateDreamBoardPage()).rejects.toThrow('kv unavailable');
    expect(redirectMock).not.toHaveBeenCalled();
    expect(deleteChildPhoto).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith(
      'error',
      'create_fresh_start_clear_failed',
      expect.objectContaining({
        hostId: 'host-1',
      })
    );
  });
});
