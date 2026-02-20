import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { PDFDocument } from 'pdf-lib';

const authMocks = vi.hoisted(() => ({
  getInternalHostAuth: vi.fn(),
}));

const queryMocks = vi.hoisted(() => ({
  getDreamBoardHostAccessById: vi.fn(),
  listBirthdayMessages: vi.fn(),
  listCompletedContributionsForDreamBoard: vi.fn(),
}));

vi.mock('@/lib/auth/clerk-wrappers', () => authMocks);
vi.mock('@/lib/host/queries', () => queryMocks);

const loadBirthdayRoute = async () => {
  vi.resetModules();
  return import('@/app/api/internal/downloads/birthday-messages/route');
};

const loadContributorRoute = async () => {
  vi.resetModules();
  return import('@/app/api/internal/downloads/contributor-list/route');
};

const request = (path: string) => new NextRequest(`http://localhost${path}`);

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('internal download routes', () => {
  it('returns 401 when host auth is missing', async () => {
    authMocks.getInternalHostAuth.mockResolvedValue(null);

    const { GET } = await loadBirthdayRoute();
    const response = await GET(
      request('/api/internal/downloads/birthday-messages?dreamBoardId=00000000-0000-4000-8000-000000000001')
    );

    expect(response.status).toBe(401);
  });

  it('returns 404 when dream board is missing', async () => {
    authMocks.getInternalHostAuth.mockResolvedValue({ hostId: 'host-1', email: 'host@example.com' });
    queryMocks.getDreamBoardHostAccessById.mockResolvedValue(null);

    const { GET } = await loadBirthdayRoute();
    const response = await GET(
      request('/api/internal/downloads/birthday-messages?dreamBoardId=00000000-0000-4000-8000-000000000001')
    );

    expect(response.status).toBe(404);
  });

  it('returns 403 when board belongs to another host', async () => {
    authMocks.getInternalHostAuth.mockResolvedValue({ hostId: 'host-1', email: 'host@example.com' });
    queryMocks.getDreamBoardHostAccessById.mockResolvedValue({
      id: 'board-1',
      hostId: 'host-2',
      childName: 'Maya',
    });

    const { GET } = await loadContributorRoute();
    const response = await GET(
      request('/api/internal/downloads/contributor-list?dreamBoardId=00000000-0000-4000-8000-000000000001')
    );

    expect(response.status).toBe(403);
  });

  it('returns PDF download with expected headers', async () => {
    authMocks.getInternalHostAuth.mockResolvedValue({ hostId: 'host-1', email: 'host@example.com' });
    queryMocks.getDreamBoardHostAccessById.mockResolvedValue({
      id: 'board-1',
      hostId: 'host-1',
      childName: 'Maya Jane',
    });
    queryMocks.listBirthdayMessages.mockResolvedValue([
      {
        id: 'msg-1',
        contributorName: 'Ava',
        isAnonymous: false,
        message: 'Happy birthday!',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    const { GET } = await loadBirthdayRoute();
    const response = await GET(
      request('/api/internal/downloads/birthday-messages?dreamBoardId=00000000-0000-4000-8000-000000000001')
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
    expect(response.headers.get('Content-Disposition')).toContain(
      'maya-jane-birthday-messages.pdf'
    );
    const bytes = await response.arrayBuffer();
    expect(bytes.byteLength).toBeGreaterThan(0);
  });

  it('returns PDF download for unicode message content', async () => {
    authMocks.getInternalHostAuth.mockResolvedValue({ hostId: 'host-1', email: 'host@example.com' });
    queryMocks.getDreamBoardHostAccessById.mockResolvedValue({
      id: 'board-1',
      hostId: 'host-1',
      childName: 'Maya Jane',
    });
    queryMocks.listBirthdayMessages.mockResolvedValue([
      {
        id: 'msg-1',
        contributorName: 'Ava',
        isAnonymous: false,
        message: 'Happy birthday 🎉 Привет مرحبا',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    const { GET } = await loadBirthdayRoute();
    const response = await GET(
      request('/api/internal/downloads/birthday-messages?dreamBoardId=00000000-0000-4000-8000-000000000001')
    );

    expect(response.status).toBe(200);
    const bytes = await response.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBe(1);
  });

  it('paginates birthday message PDFs when content exceeds one page', async () => {
    authMocks.getInternalHostAuth.mockResolvedValue({ hostId: 'host-1', email: 'host@example.com' });
    queryMocks.getDreamBoardHostAccessById.mockResolvedValue({
      id: 'board-1',
      hostId: 'host-1',
      childName: 'Maya Jane',
    });
    queryMocks.listBirthdayMessages.mockResolvedValue(
      Array.from({ length: 30 }, (_, index) => ({
        id: `msg-${index + 1}`,
        contributorName: `Guest ${index + 1}`,
        isAnonymous: false,
        message:
          'Wishing you the happiest birthday with many joyful memories and lots of laughter for every celebration.',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      }))
    );

    const { GET } = await loadBirthdayRoute();
    const response = await GET(
      request('/api/internal/downloads/birthday-messages?dreamBoardId=00000000-0000-4000-8000-000000000001')
    );

    expect(response.status).toBe(200);
    const bytes = await response.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getPageCount()).toBeGreaterThan(1);
  });

  it('returns escaped CSV rows and download headers', async () => {
    authMocks.getInternalHostAuth.mockResolvedValue({ hostId: 'host-1', email: 'host@example.com' });
    queryMocks.getDreamBoardHostAccessById.mockResolvedValue({
      id: 'board-1',
      hostId: 'host-1',
      childName: 'Maya Jane',
    });
    queryMocks.listCompletedContributionsForDreamBoard.mockResolvedValue([
      {
        id: 'contrib-1',
        contributorName: 'Ava, Mom',
        isAnonymous: false,
        message: 'He said "hi", and smiled\nBest day',
        paymentStatus: 'completed',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
      },
    ]);

    const { GET } = await loadContributorRoute();
    const response = await GET(
      request('/api/internal/downloads/contributor-list?dreamBoardId=00000000-0000-4000-8000-000000000001')
    );

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('text/csv; charset=utf-8');
    expect(response.headers.get('Content-Disposition')).toContain('maya-jane-contributors.csv');
    const csv = await response.text();
    expect(csv).toContain('"Name","Date","Message","Anonymous"');
    expect(csv).toContain('"Ava, Mom"');
    expect(csv).toContain('"He said ""hi"", and smiled\nBest day"');
  });
});
