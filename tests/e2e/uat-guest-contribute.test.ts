import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('UAT Guest Contribute (UAT-05..UAT-08)', () => {
  it('keeps provider journey coverage for payfast, ozow, and snapscan webhook completion', () => {
    const payfast = readSource('tests/integration/payfast-webhook.test.ts');
    const ozow = readSource('tests/integration/ozow-webhook.test.ts');
    const snapscan = readSource('tests/integration/snapscan-webhook.test.ts');

    expect(payfast).toContain('accepts a valid ITN payload and updates contribution state');
    expect(ozow).toContain('accepts a valid webhook payload');
    expect(snapscan).toContain('accepts a valid webhook payload');
  });

  it('keeps two-step contribution flow persistence and create intent handoff checks', () => {
    const source = readSource('tests/integration/contribute-two-step-flow.test.tsx');

    expect(source).toContain('persists step-1 details and navigates to payment step');
    expect(source).toContain('/api/internal/contributions/create');
    expect(source).toContain('omits contributor name in payload for anonymous contributions');
  });

  it('keeps reminder scheduling + idempotency coverage', () => {
    const source = readSource('tests/integration/internal-contribution-reminders.test.ts');

    expect(source).toContain('schedules a reminder for an active dream board');
    expect(source).toContain('idempotent success response when an existing pending reminder exists');
    expect(source).toContain("payload.error).toBe('invalid_reminder_window'");
  });

  it('keeps guest contribution telemetry contract names in source', () => {
    const source = readSource('src/lib/analytics/metrics.ts');

    expect(source).toContain('guest_view_loaded');
    expect(source).toContain('contribution_started');
    expect(source).toContain('contribution_redirect_started');
    expect(source).toContain('contribution_completed');
    expect(source).toContain('contribution_failed');
    expect(source).toContain('reminder_requested');
  });
});
