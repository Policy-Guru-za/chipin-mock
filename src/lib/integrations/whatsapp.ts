import { log } from '@/lib/observability/logger';
import { SA_MOBILE_REGEX } from '@/lib/dream-boards/validation';

const amountFormatter = new Intl.NumberFormat('en-ZA');

const normalizePhoneNumber = (value: string) => {
  const normalized = value.replace(/\s+/g, '').replace(/-/g, '');
  if (!SA_MOBILE_REGEX.test(normalized)) return null;
  if (normalized.startsWith('+27')) return normalized;
  if (normalized.startsWith('0')) return `+27${normalized.slice(1)}`;
  return null;
};

const formatAmount = (amountCents: number) =>
  amountFormatter.format(Math.round(amountCents / 100));

const getWhatsAppConfig = () => {
  const apiUrl = process.env.WHATSAPP_BUSINESS_API_URL ?? '';
  const apiToken = process.env.WHATSAPP_BUSINESS_API_TOKEN ?? '';
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID ?? '';
  if (!apiUrl || !apiToken || !phoneNumberId) {
    throw new Error('WhatsApp Business API credentials are missing');
  }

  return { apiUrl, apiToken, phoneNumberId };
};

const sendTemplateMessage = async (params: {
  phoneNumber: string;
  template: string;
  bodyParams: string[];
}) => {
  const normalized = normalizePhoneNumber(params.phoneNumber);
  if (!normalized) {
    log('warn', 'whatsapp.invalid_number', { phoneNumber: params.phoneNumber });
    return;
  }

  const config = getWhatsAppConfig();
  const response = await fetch(`${config.apiUrl}/${config.phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: normalized,
      type: 'template',
      template: {
        name: params.template,
        language: { code: 'en' },
        components: [
          {
            type: 'body',
            parameters: params.bodyParams.map((text) => ({ type: 'text', text })),
          },
        ],
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`WhatsApp API failed (${response.status}): ${errorBody}`);
  }
};

export const sendDreamBoardLink = async (
  phoneNumber: string,
  dreamBoardUrl: string,
  childName: string
) =>
  sendTemplateMessage({
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
  sendTemplateMessage({
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
  sendTemplateMessage({
    phoneNumber,
    template: 'funding_complete',
    bodyParams: [childName, formatAmount(totalRaisedCents), cardLast4],
  });

export const sendPayoutConfirmation = async (
  phoneNumber: string,
  amountCents: number,
  cardLast4: string
) =>
  sendTemplateMessage({
    phoneNumber,
    template: 'payout_confirmed',
    bodyParams: [formatAmount(amountCents), cardLast4],
  });
