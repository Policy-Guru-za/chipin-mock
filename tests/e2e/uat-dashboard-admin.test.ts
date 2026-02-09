import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

const readSource = (path: string) => readFileSync(join(process.cwd(), path), 'utf8');

describe('UAT Dashboard + Admin (UAT-09..UAT-11)', () => {
  it('keeps host dashboard coverage for progress and post-campaign states', () => {
    const source = readSource('tests/integration/dashboard-host-flow.test.tsx');

    expect(source).toContain('host dashboard flow');
    expect(source).toContain('post-campaign');
  });

  it('keeps payout review flow coverage for confirm and fail transitions', () => {
    const source = readSource('tests/integration/api-payouts.test.ts');

    expect(source).toContain('POST /api/v1/payouts/[id]/confirm');
    expect(source).toContain('confirms a payout');
    expect(source).toContain('POST /api/v1/payouts/[id]/fail');
    expect(source).toContain('fails a payout');
  });

  it('keeps admin charity/report data workflows and CSV behavior coverage', () => {
    const adminDataset = readSource('tests/integration/admin-datasets.test.ts');
    const csvExports = readSource('tests/unit/admin-csv-exports.test.ts');

    expect(adminDataset).toContain('admin datasets');
    expect(csvExports).toContain('header');
  });

  it('keeps payout telemetry contract names in source', () => {
    const source = readSource('src/lib/analytics/metrics.ts');

    expect(source).toContain('payout_created');
    expect(source).toContain('payout_processing_started');
    expect(source).toContain('payout_completed');
    expect(source).toContain('payout_failed');
    expect(source).toContain('charity_payout_created');
  });
});
