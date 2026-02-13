import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  requireAdminAuth: vi.fn(),
  createCharity: vi.fn(),
  updateCharity: vi.fn(),
  setCharityActiveState: vi.fn(),
  normalizeCharityUrlInput: vi.fn(),
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
  normalizeCharityUrlInput: mocks.normalizeCharityUrlInput,
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

import { CharityDraftGenerationError } from '@/lib/charities/claude';
import { CharityUrlIngestError } from '@/lib/charities/url-ingest';

import { createCharityAction, generateCharityDraftFromUrlAction, updateCharityAction } from '@/app/(admin)/admin/charities/actions';

describe('admin charity actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    mocks.requireAdminAuth.mockResolvedValue({ hostId: 'host-1', email: 'admin@gifta.co.za' });
    mocks.createCharity.mockResolvedValue({ id: 'charity-1' });
    mocks.updateCharity.mockResolvedValue({ id: 'charity-1' });
    mocks.maybeMirrorCharityLogoToBlob.mockResolvedValue(null);
    delete process.env.ANTHROPIC_API_KEY;
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

  it('returns a best-effort draft when ingest fails', async () => {
    mocks.normalizeCharityUrlInput.mockReturnValue({
      primary: new URL('https://example.org'),
      warnings: [],
    });
    mocks.ingestCharityWebsite.mockRejectedValue(new CharityUrlIngestError('fetch_failed', 'boom'));

    const result = await generateCharityDraftFromUrlAction('example.org');

    expect(result.success).toBe(true);
    expect(result.draft?.name.length).toBeGreaterThan(0);
    expect(result.draft?.description.length).toBeGreaterThan(0);
    expect(result.draft?.logoUrl).toMatch(/^https:\/\//);
    expect(result.warnings?.some((warning) => warning.code === 'ingest_failed_used_minimal')).toBe(true);
  });

  it('returns a best-effort draft when AI draft generation fails', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key';

    mocks.normalizeCharityUrlInput.mockReturnValue({
      primary: new URL('https://example.org'),
      warnings: [],
    });
    mocks.ingestCharityWebsite.mockResolvedValue({
      sourceUrl: 'https://example.org/',
      finalUrl: 'https://example.org/',
      domain: 'example.org',
      title: 'Reach for a Dream',
      description: 'Supporting children with chronic illnesses.',
      ogImageUrl: null,
      textSnippet: 'Reach for a Dream',
      ingest: {
        bytesRead: 123,
        truncated: false,
        contentType: 'text/html',
      },
    });
    mocks.generateCharityDraftWithClaude.mockRejectedValue(new CharityDraftGenerationError('provider_error', 'nope'));

    const result = await generateCharityDraftFromUrlAction('https://example.org');

    expect(result.success).toBe(true);
    expect(mocks.generateCharityDraftWithClaude).toHaveBeenCalled();
    expect(result.warnings?.some((warning) => warning.code === 'ai_failed_used_heuristic')).toBe(true);
    expect(result.draft?.name).toBe('Reach for a Dream');
  });

  it('fails when URL host is forbidden', async () => {
    mocks.normalizeCharityUrlInput.mockReturnValue({
      primary: new URL('https://localhost'),
      warnings: [],
    });
    mocks.ingestCharityWebsite.mockRejectedValue(new CharityUrlIngestError('forbidden_host', 'nope'));

    const result = await generateCharityDraftFromUrlAction('localhost');

    expect(result).toEqual({
      success: false,
      error: 'That URL host is not allowed for security reasons.',
    });
  });
});
