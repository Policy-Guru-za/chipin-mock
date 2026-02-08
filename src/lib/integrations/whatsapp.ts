import { SA_MOBILE_REGEX } from '@/lib/dream-boards/validation';
import { log } from '@/lib/observability/logger';

const amountFormatter = new Intl.NumberFormat('en-ZA');
const DEFAULT_GRAPH_API_BASE_URL = 'https://graph.facebook.com';
const DEFAULT_GRAPH_API_VERSION = 'v23.0';
const DEFAULT_TEMPLATE_LANGUAGE = 'en_US';

type WhatsAppTemplateSendParams = {
  phoneNumber: string;
  template: string;
  bodyParams: string[];
  languageCode?: string;
};

type WhatsAppSendResult = {
  messageId: string | null;
  skipped: boolean;
};

type WhatsAppApiResponse = {
  messages?: Array<{ id?: string }>;
  error?: unknown;
};

type WhatsAppConfig = {
  messagesUrl: string;
  accessToken: string;
  defaultTemplateLanguage: string;
};

const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

const resolveLegacyMessagesUrl = () => {
  const legacyBaseUrl = process.env.WHATSAPP_BUSINESS_API_URL;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? '';
  if (!legacyBaseUrl || !phoneNumberId) return null;
  return `${trimTrailingSlash(legacyBaseUrl)}/${phoneNumberId}/messages`;
};

const resolveModernMessagesUrl = () => {
  const accessToken = process.env.WA_ACCESS_TOKEN ?? '';
  const phoneNumberId = process.env.WA_PHONE_NUMBER_ID ?? '';
  if (!accessToken || !phoneNumberId) return null;

  const apiBaseUrl = process.env.WA_API_BASE_URL ?? DEFAULT_GRAPH_API_BASE_URL;
  const apiVersion = process.env.WA_API_VERSION ?? DEFAULT_GRAPH_API_VERSION;
  return `${trimTrailingSlash(apiBaseUrl)}/${apiVersion}/${phoneNumberId}/messages`;
};

const getWhatsAppConfig = (): WhatsAppConfig => {
  const modernMessagesUrl = resolveModernMessagesUrl();
  const modernToken = process.env.WA_ACCESS_TOKEN ?? '';
  if (modernMessagesUrl && modernToken) {
    return {
      messagesUrl: modernMessagesUrl,
      accessToken: modernToken,
      defaultTemplateLanguage: process.env.WA_TEMPLATE_LANGUAGE ?? DEFAULT_TEMPLATE_LANGUAGE,
    };
  }

  const legacyMessagesUrl = resolveLegacyMessagesUrl();
  const legacyToken = process.env.WHATSAPP_BUSINESS_API_TOKEN ?? '';
  if (legacyMessagesUrl && legacyToken) {
    return {
      messagesUrl: legacyMessagesUrl,
      accessToken: legacyToken,
      defaultTemplateLanguage:
        process.env.WA_TEMPLATE_LANGUAGE ??
        process.env.WHATSAPP_TEMPLATE_LANGUAGE ??
        DEFAULT_TEMPLATE_LANGUAGE,
    };
  }

  throw new Error('WhatsApp Cloud API credentials are missing');
};

export const normalizeWhatsAppPhoneNumber = (value: string) => {
  const normalized = value.replace(/\s+/g, '').replace(/-/g, '');
  if (!SA_MOBILE_REGEX.test(normalized)) return null;
  if (normalized.startsWith('+27')) return normalized;
  if (normalized.startsWith('0')) return `+27${normalized.slice(1)}`;
  return null;
};

const formatAmount = (amountCents: number) =>
  amountFormatter.format(Math.round(amountCents / 100));

export const sendWhatsAppTemplateMessage = async (
  params: WhatsAppTemplateSendParams
): Promise<WhatsAppSendResult> => {
  const normalized = normalizeWhatsAppPhoneNumber(params.phoneNumber);
  if (!normalized) {
    log('warn', 'whatsapp.invalid_number', { phoneNumber: params.phoneNumber });
    return { messageId: null, skipped: true };
  }

  const config = getWhatsAppConfig();
  const response = await fetch(config.messagesUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalized,
      type: 'template',
      template: {
        name: params.template,
        language: { code: params.languageCode ?? config.defaultTemplateLanguage },
        components: [
          {
            type: 'body',
            parameters: params.bodyParams.map((text) => ({ type: 'text', text })),
          },
        ],
      },
    }),
  });

  const responseText = await response.text();
  let parsed: WhatsAppApiResponse | null = null;
  try {
    parsed = responseText ? (JSON.parse(responseText) as WhatsAppApiResponse) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok) {
    const errorDetail = parsed?.error ? JSON.stringify(parsed.error) : responseText || 'unknown_error';
    throw new Error(`WhatsApp API failed (${response.status}): ${errorDetail}`);
  }

  return {
    messageId: parsed?.messages?.[0]?.id ?? null,
    skipped: false,
  };
};

export const sendDreamBoardLink = async (
  phoneNumber: string,
  dreamBoardUrl: string,
  childName: string
) =>
  sendWhatsAppTemplateMessage({
    phoneNumber,
    template: 'dream_board_created',
    bodyParams: [childName, dreamBoardUrl],
  });

export const sendContributionNotification = async (
  phoneNumber: string,
  contributorName: string,
  childName: string,
  percentage: number
) =>
  sendWhatsAppTemplateMessage({
    phoneNumber,
    template: 'contribution_received',
    bodyParams: [contributorName, childName, `${percentage}`],
  });

export const sendFundingCompleteNotification = async (
  phoneNumber: string,
  childName: string,
  totalRaisedCents: number,
  cardLast4: string
) =>
  sendWhatsAppTemplateMessage({
    phoneNumber,
    template: 'funding_complete',
    bodyParams: [childName, formatAmount(totalRaisedCents), cardLast4],
  });

export const sendPayoutConfirmation = async (
  phoneNumber: string,
  amountCents: number,
  cardLast4: string
) =>
  sendWhatsAppTemplateMessage({
    phoneNumber,
    template: 'payout_confirmed',
    bodyParams: [formatAmount(amountCents), cardLast4],
  });
