import { readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, expect, it } from 'vitest';

const migrationSql = readFileSync(
  resolve(process.cwd(), 'drizzle', 'migrations', '0021_remove_takealot_voucher_payout.sql'),
  'utf8'
);

describe('0021_remove_takealot_voucher_payout migration', () => {
  it('hard-stops instead of deleting voucher-era rows', () => {
    expect(migrationSql).toContain('RAISE EXCEPTION');
    expect(migrationSql).toContain("payout_method::text = 'takealot_voucher'");
    expect(migrationSql).toContain("type::text = 'takealot_voucher'");
    expect(migrationSql).not.toContain('DELETE FROM dream_boards');
    expect(migrationSql).not.toContain('DELETE FROM payouts');
  });

  it('does not reference karri_credit_queue directly', () => {
    expect(migrationSql).not.toContain('karri_credit_queue');
    expect(migrationSql).toContain("CREATE TYPE payout_method AS ENUM ('karri_card', 'bank')");
    expect(migrationSql).toContain("CREATE TYPE payout_type AS ENUM ('karri_card', 'bank', 'charity')");
  });

  it('drops and recreates the dependent totals view around the enum cast', () => {
    const dropViewIndex = migrationSql.indexOf('DROP VIEW IF EXISTS dream_boards_with_totals;');
    const alterTypeIndex = migrationSql.indexOf(
      'ALTER TABLE dream_boards ALTER COLUMN payout_method TYPE payout_method'
    );
    const recreateViewIndex = migrationSql.indexOf('CREATE OR REPLACE VIEW dream_boards_with_totals AS');

    expect(dropViewIndex).toBeGreaterThanOrEqual(0);
    expect(alterTypeIndex).toBeGreaterThan(dropViewIndex);
    expect(recreateViewIndex).toBeGreaterThan(alterTypeIndex);
  });

  it('recreates the payout constraint only after the new payout_method type is applied', () => {
    const dropConstraintIndex = migrationSql.indexOf(
      'ALTER TABLE dream_boards DROP CONSTRAINT IF EXISTS valid_dream_board_payout_data;'
    );
    const alterTypeIndex = migrationSql.indexOf(
      'ALTER TABLE dream_boards ALTER COLUMN payout_method TYPE payout_method'
    );
    const addConstraintIndex = migrationSql.indexOf(
      'ADD CONSTRAINT valid_dream_board_payout_data'
    );

    expect(dropConstraintIndex).toBeGreaterThanOrEqual(0);
    expect(alterTypeIndex).toBeGreaterThan(dropConstraintIndex);
    expect(addConstraintIndex).toBeGreaterThan(alterTypeIndex);
    expect(migrationSql).toContain('USING (payout_method::text)::payout_method;');
    expect(migrationSql).toContain('USING (type::text)::payout_type;');
  });
});
