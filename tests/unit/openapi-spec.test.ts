import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { openApiSpec } from '@/lib/api/openapi';
import {
  LOCKED_PAYOUT_METHODS,
  LOCKED_PAYOUT_TYPES,
} from '@/lib/ux-v2/decision-locks';

const ORIGINAL_ENV = {
  UX_V2_ENABLE_KARRI_WRITE_PATH: process.env.UX_V2_ENABLE_KARRI_WRITE_PATH,
  UX_V2_ENABLE_BANK_WRITE_PATH: process.env.UX_V2_ENABLE_BANK_WRITE_PATH,
  UX_V2_ENABLE_CHARITY_WRITE_PATH: process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH,
  UX_V2_ENABLE_CHARITY_PRODUCT: process.env.UX_V2_ENABLE_CHARITY_PRODUCT,
};

const restoreEnvValue = (key: keyof typeof ORIGINAL_ENV, value: string | undefined) => {
  if (value === undefined) {
    delete process.env[key];
    return;
  }

  process.env[key] = value;
};

const loadOpenApiSpec = async () => {
  vi.resetModules();
  return (await import('@/lib/api/openapi')).openApiSpec;
};

afterEach(() => {
  restoreEnvValue('UX_V2_ENABLE_KARRI_WRITE_PATH', ORIGINAL_ENV.UX_V2_ENABLE_KARRI_WRITE_PATH);
  restoreEnvValue('UX_V2_ENABLE_BANK_WRITE_PATH', ORIGINAL_ENV.UX_V2_ENABLE_BANK_WRITE_PATH);
  restoreEnvValue('UX_V2_ENABLE_CHARITY_WRITE_PATH', ORIGINAL_ENV.UX_V2_ENABLE_CHARITY_WRITE_PATH);
  restoreEnvValue('UX_V2_ENABLE_CHARITY_PRODUCT', ORIGINAL_ENV.UX_V2_ENABLE_CHARITY_PRODUCT);
  vi.resetModules();
});

const getCreateRequestSchemas = () => ({
  createRequest: openApiSpec.components.schemas.DreamBoardCreateRequest,
  bankCreateRequest: openApiSpec.components.schemas.DreamBoardCreateRequestBank,
  karriCreateRequest: openApiSpec.components.schemas.DreamBoardCreateRequestKarri,
});

describe('openapi spec', () => {
  it('public spec matches the generated builder', () => {
    const content = readFileSync(resolve(process.cwd(), 'public', 'v1', 'openapi.json'), 'utf8');
    const json = JSON.parse(content);
    expect(json).toEqual(openApiSpec);
  });

  it('matches locked enum values for the public payout schemas', () => {
    expect(openApiSpec.components.schemas.PayoutMethod.enum).toEqual(LOCKED_PAYOUT_METHODS);
    expect(openApiSpec.components.schemas.PayoutType.enum).toEqual(LOCKED_PAYOUT_METHODS);
    expect(openApiSpec.components.schemas.PayoutType.enum).not.toEqual(LOCKED_PAYOUT_TYPES);
  });

  it('documents Dreamboard bank contract fields and omits charity fields', () => {
    const { createRequest, bankCreateRequest, karriCreateRequest } = getCreateRequestSchemas();
    const updateRequest = openApiSpec.components.schemas.DreamBoardUpdateRequest;

    expect(createRequest.oneOf).toEqual([
      { $ref: '#/components/schemas/DreamBoardCreateRequestBank' },
      { $ref: '#/components/schemas/DreamBoardCreateRequestKarri' },
    ]);
    expect(bankCreateRequest.properties).toHaveProperty('payout_method');
    expect(bankCreateRequest.properties).toHaveProperty('bank_account_number');
    expect(bankCreateRequest.properties).not.toHaveProperty('charity_enabled');
    expect(karriCreateRequest.properties).toHaveProperty('karri_card_number');
    expect(karriCreateRequest.properties).not.toHaveProperty('charity_enabled');
    expect(updateRequest.properties).toHaveProperty('payout_method');
    expect(updateRequest.properties).toHaveProperty('bank_account_number');
    expect(updateRequest.properties).not.toHaveProperty('charity_enabled');
    expect(openApiSpec.components.schemas.DreamBoard.properties).not.toHaveProperty('charity_enabled');
    expect(openApiSpec.components.schemas.Contribution.properties).not.toHaveProperty('charity_cents');
  });

  it('drops voucher fulfilment fields from payout recipient data', () => {
    const payoutRecipientData = openApiSpec.components.schemas.PayoutRecipientData;

    expect(payoutRecipientData.properties).not.toHaveProperty('host_whatsapp_number');
    expect(payoutRecipientData.properties).not.toHaveProperty('fulfilment_mode');
  });

  it('keeps create-request payout and gift icon constraints aligned with runtime', () => {
    const { bankCreateRequest, karriCreateRequest } = getCreateRequestSchemas();
    const bankRequiredFields = bankCreateRequest.required ?? [];
    const karriRequiredFields = karriCreateRequest.required ?? [];

    expect(bankRequiredFields).toEqual(
      expect.arrayContaining([
        'bank_name',
        'bank_account_number',
        'bank_branch_code',
        'bank_account_holder',
      ])
    );
    expect(bankRequiredFields).not.toContain('payout_method');
    expect(bankRequiredFields).not.toContain('gift_image_url');
    expect(karriRequiredFields).toEqual(
      expect.arrayContaining(['payout_method', 'karri_card_number', 'karri_card_holder_name'])
    );
    expect(bankCreateRequest.properties).toHaveProperty('gift_icon_id');
    expect(bankCreateRequest.properties.gift_description.maxLength).toBe(500);
  });

  it('documents bank-default active payout behavior', () => {
    const payoutMethod = openApiSpec.components.schemas.PayoutMethod;
    const { createRequest, bankCreateRequest } = getCreateRequestSchemas();
    const updateRequest = openApiSpec.components.schemas.DreamBoardUpdateRequest;

    expect(payoutMethod.description).toContain('Standard Dreamboard flows default to bank');
    expect(payoutMethod.description).toContain('Bank and Karri Card write paths are active');
    expect(createRequest.description).toContain('Omitted payout_method defaults to bank and still requires the bank payout fields');
    expect(bankCreateRequest.properties.payout_method.default).toBe('bank');
    expect(updateRequest.description).toContain('Bank and Karri Card payout mutations are accepted');
  });

  it('stays deterministic when write-path flags are enabled', async () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'true';
    process.env.UX_V2_ENABLE_BANK_WRITE_PATH = 'true';
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'true';
    process.env.UX_V2_ENABLE_CHARITY_PRODUCT = 'true';

    const content = readFileSync(resolve(process.cwd(), 'public', 'v1', 'openapi.json'), 'utf8');
    const json = JSON.parse(content);
    const flagEnabledSpec = await loadOpenApiSpec();

    expect(flagEnabledSpec).toEqual(json);
    expect(flagEnabledSpec.components.schemas.PayoutMethod.description).toContain(
      'Bank and Karri Card write paths are active'
    );
    expect(flagEnabledSpec.components.schemas.PayoutMethod.description).not.toContain(
      'UX_V2_ENABLE_KARRI_WRITE_PATH=true'
    );
    expect(flagEnabledSpec.components.schemas.DreamBoardCreateRequestBank.properties).not.toHaveProperty(
      'charity_enabled'
    );
  });
});
