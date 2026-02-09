import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('middleware public routes', () => {
  it('allowlists legacy auth redirects', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain("'/auth(.*)'");
  });

  it('allowlists create entry page', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain("'/create'");
  });

  it('defines dev preview route and env guard', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain("'/dev/icon-picker(.*)'");
    expect(middleware).toContain('DEV_PREVIEW');
  });

  it('allowlists guest contribution create endpoint', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain("'/api/internal/contributions/create'");
  });

  it('allowlists guest contribution reminder endpoint', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain("'/api/internal/contributions/reminders'");
  });

  it('allowlists guest analytics endpoint', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain("'/api/internal/analytics'");
  });

  it('allowlists guest metrics endpoint', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain("'/api/internal/metrics'");
  });

  it('allowlists og image endpoint for crawler access', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain("'/api/og(.*)'");
  });

  it('allowlists internal download endpoints for explicit route auth', () => {
    const middleware = readSource('middleware.ts');
    expect(middleware).toContain("'/api/internal/downloads(.*)'");
  });
});
