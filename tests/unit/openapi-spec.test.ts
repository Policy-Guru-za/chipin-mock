import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { openApiSpec } from '@/lib/api/openapi';
import {
  LOCKED_CHARITY_SPLIT_MODES,
  LOCKED_PAYOUT_METHODS,
  LOCKED_PAYOUT_TYPES,
} from '@/lib/ux-v2/decision-locks';

const ORIGINAL_ENV = {
  UX_V2_ENABLE_KARRI_WRITE_PATH: process.env.UX_V2_ENABLE_KARRI_WRITE_PATH,
  UX_V2_ENABLE_BANK_WRITE_PATH: process.env.UX_V2_ENABLE_BANK_WRITE_PATH,
  UX_V2_ENABLE_CHARITY_WRITE_PATH: process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH,
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
  vi.resetModules();
});

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

  it('documents voucher fulfilment contact fields on payout recipient data', () => {
    const payoutRecipientData = openApiSpec.components.schemas.PayoutRecipientData;

    expect(payoutRecipientData.properties).toHaveProperty('host_whatsapp_number');
    expect(payoutRecipientData.properties).toHaveProperty('fulfilment_mode');
  });

  it('keeps create-request payout and gift icon constraints aligned with runtime', () => {
    const createRequest = openApiSpec.components.schemas.DreamBoardCreateRequest;
    const requiredFields = createRequest.required ?? [];

    expect(requiredFields).not.toContain('karri_card_number');
    expect(requiredFields).not.toContain('karri_card_holder_name');
    expect(requiredFields).not.toContain('gift_image_url');
    expect(createRequest.properties).toHaveProperty('gift_icon_id');
    expect(createRequest.properties.gift_description.maxLength).toBe(500);
  });

  it('documents voucher-default and gated karri behavior', () => {
    const payoutMethod = openApiSpec.components.schemas.PayoutMethod;
    const createRequest = openApiSpec.components.schemas.DreamBoardCreateRequest;
    const updateRequest = openApiSpec.components.schemas.DreamBoardUpdateRequest;

    expect(payoutMethod.description).toContain('Standard Dreamboard flows default to takealot_voucher');
    expect(payoutMethod.description).toContain('UX_V2_ENABLE_KARRI_WRITE_PATH=true');
    expect(createRequest.description).toContain('Omitted payout_method defaults to takealot_voucher');
    expect(updateRequest.description).toContain('Karri Card mutation');
  });

  it('stays deterministic when write-path flags are enabled', async () => {
    process.env.UX_V2_ENABLE_KARRI_WRITE_PATH = 'true';
    process.env.UX_V2_ENABLE_BANK_WRITE_PATH = 'true';
    process.env.UX_V2_ENABLE_CHARITY_WRITE_PATH = 'true';

    const content = readFileSync(resolve(process.cwd(), 'public', 'v1', 'openapi.json'), 'utf8');
    const json = JSON.parse(content);
    const flagEnabledSpec = await loadOpenApiSpec();

    expect(flagEnabledSpec).toEqual(json);
    expect(flagEnabledSpec.components.schemas.PayoutMethod.description).toContain(
      'UX_V2_ENABLE_KARRI_WRITE_PATH=true'
    );
    expect(flagEnabledSpec.components.schemas.PayoutMethod.description).not.toContain(
      'enabled for this environment'
    );
  });
});
