import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

type JobEndpoint = {
  path: string;
  file: string;
};

const readSource = (path: string) =>
  readFileSync(join(process.cwd(), path), 'utf8');

const jobEndpoints: JobEndpoint[] = [
  {
    path: '/api/internal/webhooks/process',
    file: 'src/app/api/internal/webhooks/process/route.ts',
  },
  {
    path: '/api/internal/retention/run',
    file: 'src/app/api/internal/retention/run/route.ts',
  },
  {
    path: '/api/internal/karri/batch',
    file: 'src/app/api/internal/karri/batch/route.ts',
  },
  {
    path: '/api/internal/payments/reconcile',
    file: 'src/app/api/internal/payments/reconcile/route.ts',
  },
  {
    path: '/api/internal/api-keys',
    file: 'src/app/api/internal/api-keys/route.ts',
  },
  {
    path: '/api/internal/api-keys',
    file: 'src/app/api/internal/api-keys/[id]/route.ts',
  },
  {
    path: '/api/internal/api-keys',
    file: 'src/app/api/internal/api-keys/[id]/rotate/route.ts',
  },
];

const hasJobSecretGuard = (content: string) =>
  content.includes('INTERNAL_JOB_SECRET') || content.includes('requireInternalJobAuth');

describe('internal job endpoints', () => {
  it('allowlists job-secret endpoints in middleware', () => {
    const middleware = readSource('middleware.ts');

    for (const endpoint of jobEndpoints) {
      expect(middleware).toContain(endpoint.path);
    }
  });

  it('enforces job-secret auth in handlers', () => {
    for (const endpoint of jobEndpoints) {
      const handler = readSource(endpoint.file);
      expect(hasJobSecretGuard(handler)).toBe(true);
    }
  });
});
