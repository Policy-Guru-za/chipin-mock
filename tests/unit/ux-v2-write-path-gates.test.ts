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
  it('defaults all gated write paths to disabled', () => {
    delete process.env.UX_V2_ENABLE_KARRI_WRITE_PATH;
    delete process.env.UX_V2_ENABLE_BANK_WRITE_PATH;
    delete process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH;

    expect(isKarriWritePathEnabled()).toBe(false);
    expect(isBankWritePathEnabled()).toBe(false);
    expect(isCharityWritePathEnabled()).toBe(false);
  });

  it('returns explicit karri block reason when karri path is disabled', () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'false';
    process.env.UX_V2_ENABLE_BANK_WRITE_PATH = 'true';
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'true';

    expect(
      resolveWritePathBlockReason({
        karriRequested: true,
        bankRequested: false,
        charityRequested: false,
      })
    ).toBe('Karri payout method is not enabled');
  });

  it('returns explicit bank block reason when bank path is disabled', () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'true';
    process.env.UX_V2_ENABLE_BANK_WRITE_PATH = 'false';
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'true';

    expect(
      resolveWritePathBlockReason({
        karriRequested: false,
        bankRequested: true,
        charityRequested: false,
      })
    ).toBe('Bank payout method is not yet enabled');
  });

  it('returns explicit charity block reason when charity path is disabled', () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'true';
    process.env.UX_V2_ENABLE_BANK_WRITE_PATH = 'true';
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'false';

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
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'true';

    expect(
      resolveWritePathBlockReason({
        karriRequested: true,
        bankRequested: true,
        charityRequested: true,
      })
    ).toBeNull();
  });
});
