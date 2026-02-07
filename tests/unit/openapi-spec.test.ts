import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { openApiSpec } from '@/lib/api/openapi';
import {
  LOCKED_CHARITY_SPLIT_MODES,
  LOCKED_PAYOUT_METHODS,
  LOCKED_PAYOUT_TYPES,
} from '@/lib/ux-v2/decision-locks';

describe('openapi spec', () => {
  it('public spec matches the generated builder', () => {
    const content = readFileSync(resolve(process.cwd(), 'public', 'v1', 'openapi.json'), 'utf8');
    const json = JSON.parse(content);
    expect(json).toEqual(openApiSpec);
  });

  it('matches locked enum values for payout and charity schemas', () => {
    expect(openApiSpec.components.schemas.PayoutMethod.enum).toEqual(LOCKED_PAYOUT_METHODS);
    expect(openApiSpec.components.schemas.PayoutType.enum).toEqual(LOCKED_PAYOUT_TYPES);
    expect(openApiSpec.components.schemas.CharitySplitType.enum).toEqual(
      LOCKED_CHARITY_SPLIT_MODES
    );
  });

  it('documents dream board bank and charity contract fields', () => {
    const createRequest = openApiSpec.components.schemas.DreamBoardCreateRequest;
    const updateRequest = openApiSpec.components.schemas.DreamBoardUpdateRequest;

    expect(createRequest.properties).toHaveProperty('payout_method');
    expect(createRequest.properties).toHaveProperty('bank_account_number');
    expect(createRequest.properties).toHaveProperty('charity_enabled');
    expect(updateRequest.properties).toHaveProperty('payout_method');
    expect(updateRequest.properties).toHaveProperty('bank_account_number');
    expect(updateRequest.properties).toHaveProperty('charity_enabled');
  });

  it('keeps create-request payout and gift description constraints aligned with runtime', () => {
    const createRequest = openApiSpec.components.schemas.DreamBoardCreateRequest;
    const requiredFields = createRequest.required ?? [];

    expect(requiredFields).not.toContain('karri_card_number');
    expect(requiredFields).not.toContain('karri_card_holder_name');
    expect(createRequest.properties.gift_description.minLength).toBe(10);
  });
});
