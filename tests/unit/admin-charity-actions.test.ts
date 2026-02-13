import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  requireAdminAuth: vi.fn(),
  createCharity: vi.fn(),
  updateCharity: vi.fn(),
  setCharityActiveState: vi.fn(),
  ingestCharityWebsite: vi.fn(),
  generateCharityDraftWithClaude: vi.fn(),
  maybeMirrorCharityLogoToBlob: vi.fn(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: mocks.revalidatePath,
}));

vi.mock('@/lib/auth/clerk-wrappers', () => ({
  requireAdminAuth: mocks.requireAdminAuth,
}));

vi.mock('@/lib/charities/service', () => ({
  createCharity: mocks.createCharity,
  updateCharity: mocks.updateCharity,
  setCharityActiveState: mocks.setCharityActiveState,
}));

vi.mock('@/lib/charities/url-ingest', () => ({
  CharityUrlIngestError: class CharityUrlIngestError extends Error {
    code: string;

    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
  ingestCharityWebsite: mocks.ingestCharityWebsite,
}));

vi.mock('@/lib/charities/claude', () => ({
  CharityDraftGenerationError: class CharityDraftGenerationError extends Error {
    code: string;

    constructor(code: string, message: string) {
      super(message);
      this.code = code;
    }
  },
  generateCharityDraftWithClaude: mocks.generateCharityDraftWithClaude,
}));

vi.mock('@/lib/charities/logo', () => ({
  maybeMirrorCharityLogoToBlob: mocks.maybeMirrorCharityLogoToBlob,
}));

import { createCharityAction, updateCharityAction } from '@/app/(admin)/admin/charities/actions';

describe('admin charity actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requireAdminAuth.mockResolvedValue({ hostId: 'host-1', email: 'admin@gifta.co.za' });
    mocks.createCharity.mockResolvedValue({ id: 'charity-1' });
    mocks.updateCharity.mockResolvedValue({ id: 'charity-1' });
  });

  it('creates a charity without bank/contact/website fields', async () => {
    const formData = new FormData();
    formData.set('name', 'Reach for a Dream');
    formData.set('description', 'Supporting children with chronic illnesses.');
    formData.set('category', 'Health');
    formData.set('logoUrl', 'https://assets.blob.vercel-storage.com/reach-logo.png');

    const result = await createCharityAction(formData);

    expect(result).toEqual({ success: true });
    expect(mocks.createCharity).toHaveBeenCalledWith({
      name: 'Reach for a Dream',
      description: 'Supporting children with chronic illnesses.',
      category: 'Health',
      logoUrl: 'https://assets.blob.vercel-storage.com/reach-logo.png',
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith('/admin/charities');
  });

  it('rejects update when bank details JSON is invalid', async () => {
    const formData = new FormData();
    formData.set('name', 'Reach for a Dream');
    formData.set('description', 'Supporting children with chronic illnesses.');
    formData.set('category', 'Health');
    formData.set('logoUrl', 'https://assets.blob.vercel-storage.com/reach-logo.png');
    formData.set('website', '');
    formData.set('contactName', '');
    formData.set('contactEmail', '');
    formData.set('bankDetailsEncrypted', '{invalid-json');

    const result = await updateCharityAction('00000000-0000-4000-8000-000000000001', formData);

    expect(result).toEqual({
      success: false,
      error: 'Bank details must be valid JSON.',
    });
    expect(mocks.updateCharity).not.toHaveBeenCalled();
  });
});
