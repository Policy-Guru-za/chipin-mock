import { afterEach, describe, expect, it } from 'vitest';

import {
  isKarriWritePathEnabled,
  isBankWritePathEnabled,
  isCharityWritePathEnabled,
  resolveWritePathBlockReason,
} from '@/lib/ux-v2/write-path-gates';

const ORIGINAL_KARRI_WRITE_PATH = process.env.UX_V2_ENABLE_KARRI_WRITE_PATH;
const ORIGINAL_BANK_WRITE_PATH = process.env.UX_V2_ENABLE_BANK_WRITE_PATH;
const ORIGINAL_CHARITY_WRITE_PATH = process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH;

afterEach(() => {
  process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = ORIGINAL_KARRI_WRITE_PATH;
  process.env.UX_V2_ENABLE_BANK_WRITE_PATH = ORIGINAL_BANK_WRITE_PATH;
  process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = ORIGINAL_CHARITY_WRITE_PATH;
});

describe('ux v2 write path gates', () => {
  it('keeps bank and karri write paths enabled by default', () => {
    delete process.env.UX_V2_ENABLE_KARRI_WRITE_PATH;
    delete process.env.UX_V2_ENABLE_BANK_WRITE_PATH;
    delete process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH;

    expect(isKarriWritePathEnabled()).toBe(true);
    expect(isBankWritePathEnabled()).toBe(true);
    expect(isCharityWritePathEnabled()).toBe(false);
  });

  it('ignores legacy karri and bank env toggles', () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'false';
    process.env.UX_V2_ENABLE_BANK_WRITE_PATH = 'false';

    expect(isKarriWritePathEnabled()).toBe(true);
    expect(isBankWritePathEnabled()).toBe(true);
    expect(
      resolveWritePathBlockReason({
        karriRequested: true,
        bankRequested: true,
        charityRequested: false,
      })
    ).toBeNull();
  });

  it('keeps charity write path blocked even when the legacy flag is enabled', () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'true';
    process.env.UX_V2_ENABLE_BANK_WRITE_PATH = 'true';
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'true';

    expect(
      resolveWritePathBlockReason({
        karriRequested: false,
        bankRequested: false,
        charityRequested: true,
      })
    ).toBe('Charity configuration is not yet enabled');
  });

  it('allows write paths when requested paths are enabled', () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'true';
    process.env.UX_V2_ENABLE_BANK_WRITE_PATH = 'true';

    expect(
      resolveWritePathBlockReason({
        karriRequested: true,
        bankRequested: true,
        charityRequested: false,
      })
    ).toBeNull();
  });
});
