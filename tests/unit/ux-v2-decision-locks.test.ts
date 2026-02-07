import { describe, expect, it } from 'vitest';

import {
  charitySplitTypeEnum,
  payoutMethodEnum,
  payoutTypeEnum,
} from '@/lib/db/schema';
import {
  LOCK_STATUS,
  LOCKED_CHARITY_SPLIT_MODES,
  LOCKED_PAYOUT_METHODS,
  LOCKED_PAYOUT_TYPES,
  UX_V2_DECISION_LOCKS,
} from '@/lib/ux-v2/decision-locks';

describe('ux v2 decision locks', () => {
  it('keeps all decisions in LOCKED status', () => {
    const statuses = Object.values(UX_V2_DECISION_LOCKS).map((decision) => decision.status);
    expect(statuses.every((status) => status === LOCK_STATUS)).toBe(true);
  });

  it('matches payout method lock values to schema enum values', () => {
    expect([...LOCKED_PAYOUT_METHODS]).toEqual([...payoutMethodEnum.enumValues]);
  });

  it('matches payout type lock values to schema enum values', () => {
    expect([...LOCKED_PAYOUT_TYPES]).toEqual([...payoutTypeEnum.enumValues]);
  });

  it('matches charity split lock values to schema enum values', () => {
    expect([...LOCKED_CHARITY_SPLIT_MODES]).toEqual([...charitySplitTypeEnum.enumValues]);
  });
});

