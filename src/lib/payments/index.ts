import { isMockPayments } from '@/lib/config/feature-flags';

import { createOzowPayment, isOzowConfigured } from './ozow';
import { createPayfastPayment } from './payfast';
import { createSnapScanPayment, isSnapScanConfigured } from './snapscan';

export const PAYMENT_PROVIDERS = ['payfast', 'ozow', 'snapscan'] as const;
export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export type CreatePaymentParams = {
  amountCents: number;
  reference: string;
  contributionId?: string;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  customerEmail?: string;
  expiresAt?: string;
};

export type PaymentIntent =
  | {
      provider: 'payfast';
      mode: 'form';
      reference: string;
      redirectUrl: string;
      fields: Array<[string, string]>;
    }
  | {
      provider: 'ozow';
      mode: 'redirect';
      reference: string;
      redirectUrl: string;
      providerReference?: string;
    }
  | {
      provider: 'snapscan';
      mode: 'qr';
      reference: string;
      qrUrl: string;
      qrImageUrl: string;
    }
  | {
      provider: PaymentProvider;
      mode: 'redirect';
      reference: string;
      redirectUrl: string;
      demo: true;
    };

const buildDemoRedirectUrl = (params: CreatePaymentParams) => {
  const contributionId = params.contributionId;
  if (!contributionId) {
    throw new Error('Contribution id is required for demo payments');
  }

  const normalizeReturnTo = (value: string | undefined) => {
    if (!value) return '/';
    if (value.startsWith('/')) return value;
    try {
      const url = new URL(value);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return '/';
    }
  };

  const searchParams = new URLSearchParams({ contributionId });
  searchParams.set('returnTo', normalizeReturnTo(params.returnUrl));
  return `/demo/payment-simulator?${searchParams.toString()}`;
};

const isPayfastConfigured = () =>
  Boolean(process.env.PAYFAST_MERCHANT_ID && process.env.PAYFAST_MERCHANT_KEY);

export const isPaymentProviderAvailable = (provider: PaymentProvider) => {
  if (isMockPayments()) {
    return true;
  }

  switch (provider) {
    case 'payfast':
      return isPayfastConfigured();
    case 'ozow':
      return isOzowConfigured();
    case 'snapscan':
      return isSnapScanConfigured();
    default:
      return false;
  }
};

export const getAvailablePaymentProviders = () =>
  PAYMENT_PROVIDERS.filter((provider) => isPaymentProviderAvailable(provider));

export const createPaymentIntent = async (
  provider: PaymentProvider,
  params: CreatePaymentParams
): Promise<PaymentIntent> => {
  if (isMockPayments()) {
    return {
      provider,
      mode: 'redirect',
      reference: `DEMO-${params.contributionId ?? params.reference}`,
      redirectUrl: buildDemoRedirectUrl(params),
      demo: true,
    };
  }

  switch (provider) {
    case 'payfast': {
      const payment = createPayfastPayment({
        amountCents: params.amountCents,
        reference: params.reference,
        itemName: params.description,
        returnUrl: params.returnUrl,
        cancelUrl: params.cancelUrl,
        notifyUrl: params.notifyUrl,
        emailAddress: params.customerEmail,
      });

      return {
        provider: 'payfast',
        mode: 'form',
        reference: params.reference,
        redirectUrl: payment.redirectUrl,
        fields: payment.fields,
      };
    }
    case 'ozow': {
      const payment = await createOzowPayment({
        amountCents: params.amountCents,
        reference: params.reference,
        returnUrl: params.returnUrl,
        expiresAt: params.expiresAt,
      });

      return {
        provider: 'ozow',
        mode: 'redirect',
        reference: params.reference,
        redirectUrl: payment.redirectUrl,
        providerReference: payment.providerReference,
      };
    }
    case 'snapscan': {
      const payment = createSnapScanPayment({
        amountCents: params.amountCents,
        reference: params.reference,
      });

      return {
        provider: 'snapscan',
        mode: 'qr',
        reference: params.reference,
        qrUrl: payment.qrUrl,
        qrImageUrl: payment.qrImageUrl,
      };
    }
    default:
      throw new Error('Unsupported payment provider');
  }
};
