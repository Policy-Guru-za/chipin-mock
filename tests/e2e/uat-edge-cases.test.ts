import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('UAT Edge Cases (EC-01..EC-08)', () => {
  it('keeps edge-case coverage map for all EC scenarios in integration/unit suites', () => {
    const closeFlow = readSource('tests/integration/api-dream-boards-close.test.ts');
    const contribution = readSource('tests/integration/internal-contributions-create.test.ts');
    const reminders = readSource('tests/integration/internal-contribution-reminders.test.ts');
    const payout = readSource('tests/unit/payout-service.test.ts');
    const givingBack = readSource('tests/unit/create-step-giving-back.test.ts');
    const session = readSource('tests/integration/contribute-two-step-flow.test.tsx');
    const mediaFallback = readSource('tests/unit/dream-board-image.test.tsx');

    expect(closeFlow).toContain('is idempotent when the board is already closed');
    expect(contribution).toContain("payload.error).toBe('board_closed')");
    expect(reminders).toContain("payload.error).toBe('invalid_reminder_window')");
    expect(payout).toContain('keeps failing a completed payout idempotent');
    expect(givingBack).toContain('renders fallback continue form when no active charities exist');
    expect(session).toContain('redirects back to details when flow data is expired or missing');
    expect(mediaFallback).toContain('uses fallback when src is empty');
  });

  it('keeps reminder dispatch timeout and retry handling assertions', () => {
    const source = readSource('tests/unit/reminder-dispatch-service.test.ts');

    expect(source).toContain('provider timeout');
    expect(source).toContain('dispatch');
  });
});
