import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('UAT Guest Contribute (UAT-05..UAT-08)', () => {
  it('keeps public Stitch-placeholder coverage on the contribute surface', () => {
    const source = readSource('tests/integration/contribute-two-step-flow.test.tsx');

    expect(source).toContain('renders a Stitch-coming-soon placeholder instead of a live payment form');
    expect(source).toContain('redirecting back to the placeholder page');
  });

  it('keeps source-level placeholder contract checks', () => {
    const source = readSource('tests/integration/contribute-two-step-flow.test.tsx');

    expect(source).toContain('Stitch payments coming soon');
    expect(source).toContain("redirect(`/${slug}/contribute`)");
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
    expect(source).toContain('contribution_completed');
    expect(source).toContain('contribution_failed');
    expect(source).toContain('reminder_requested');
  });
});
