import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const loadHandler = async () => {
  vi.resetModules();
  return import('@/app/api/internal/reminders/dispatch/route');
};

const originalSecret = process.env.INTERNAL_JOB_SECRET;

beforeEach(() => {
  process.env.INTERNAL_JOB_SECRET = 'test-secret';
});

afterEach(() => {
  process.env.INTERNAL_JOB_SECRET = originalSecret;
  vi.unmock('@/lib/reminders/service');
  vi.unmock('@/lib/observability/logger');
  vi.resetModules();
});

describe('POST /api/internal/reminders/dispatch', () => {
  it('rejects unauthorized requests', async () => {
    vi.doMock('@/lib/reminders/service', () => ({
      dispatchDueReminders: vi.fn(async () => ({
        scanned: 0,
        sent: 0,
        failed: 0,
        expired: 0,
        skipped: 0,
      })),
    }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/reminders/dispatch', {
        method: 'POST',
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe('unauthorized');
  });

  it('dispatches reminders and returns summary stats', async () => {
    const dispatchDueReminders = vi.fn(async () => ({
      scanned: 3,
      sent: 2,
      failed: 1,
      expired: 0,
      skipped: 0,
    }));
    vi.doMock('@/lib/reminders/service', () => ({ dispatchDueReminders }));

    const { POST } = await loadHandler();
    const response = await POST(
      new Request('http://localhost/api/internal/reminders/dispatch', {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-secret',
          'x-request-id': 'req-123',
        },
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual({
      ok: true,
      scanned: 3,
      sent: 2,
      failed: 1,
      expired: 0,
      skipped: 0,
    });
    expect(dispatchDueReminders).toHaveBeenCalledWith({ requestId: 'req-123' });
  });
});
