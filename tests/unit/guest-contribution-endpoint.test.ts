import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('guest contribution endpoint', () => {
  it('remains allowlisted in middleware', () => {
    const middleware = readSource('src/middleware.ts');
    expect(middleware).toContain("'/api/internal/contributions/create'");
    expect(middleware).toContain("'/api/internal/contributions/reminders'");
  });

  it('is not gated by job-secret auth', () => {
    const handler = readSource('src/app/api/internal/contributions/create/route.ts');
    expect(handler).not.toContain('INTERNAL_JOB_SECRET');
    expect(handler).not.toContain('requireInternalJobAuth');

    const remindersHandler = readSource('src/app/api/internal/contributions/reminders/route.ts');
    expect(remindersHandler).not.toContain('INTERNAL_JOB_SECRET');
    expect(remindersHandler).not.toContain('requireInternalJobAuth');
  });

  it('persists the contribution before creating the payment intent', () => {
    const handler = readSource('src/app/api/internal/contributions/create/route.ts');
    const insertIndex = handler.indexOf('db.insert(contributions)');
    const createIntentIndex = handler.indexOf('await createPaymentIntent');

    expect(insertIndex).toBeGreaterThan(-1);
    expect(createIntentIndex).toBeGreaterThan(-1);
    expect(insertIndex).toBeLessThan(createIntentIndex);
  });
});
