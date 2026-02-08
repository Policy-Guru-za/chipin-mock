import { redirect } from 'next/navigation';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';

import { PayoutForm } from '@/app/(host)/create/payout/PayoutForm';
import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { isMockSentry } from '@/lib/config/feature-flags';
import { getDreamBoardDraft, updateDreamBoardDraft } from '@/lib/dream-boards/draft';
import { SA_MOBILE_REGEX, isBankAccountNumberValid } from '@/lib/dream-boards/validation';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';
import { verifyKarriCard } from '@/lib/integrations/karri';
import { log } from '@/lib/observability/logger';
import { LOCKED_PAYOUT_METHODS } from '@/lib/ux-v2/decision-locks';
import { encryptSensitiveValue } from '@/lib/utils/encryption';

const payoutSchema = z
  .object({
    payoutEmail: z.string().email(),
    payoutMethod: z.enum(LOCKED_PAYOUT_METHODS),
    hostWhatsAppNumber: z.string(),
    karriCardHolderName: z.string().min(2).max(100).optional(),
    bankName: z.string().min(2).max(120).optional(),
    bankBranchCode: z.string().min(2).max(20).optional(),
    bankAccountHolder: z.string().min(2).max(120).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.payoutMethod === 'karri_card' && !data.karriCardHolderName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['karriCardHolderName'],
        message: 'Karri card holder is required',
      });
    }

    if (data.payoutMethod === 'bank') {
      if (!data.bankName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankName'],
          message: 'Bank name is required',
        });
      }
      if (!data.bankBranchCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankBranchCode'],
          message: 'Bank branch code is required',
        });
      }
      if (!data.bankAccountHolder) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankAccountHolder'],
          message: 'Bank account holder is required',
        });
      }
    }
  });

const payoutErrorMessages: Record<string, string> = {
  invalid: 'Please complete all required payout fields.',
  whatsapp: 'Enter a valid South African WhatsApp number.',
  karri: 'Enter a valid Karri Card number to continue.',
  karri_invalid: 'Karri Card number could not be verified. Please try again.',
  karri_unavailable: 'Karri verification is unavailable right now. Please try again later.',
  bank: 'Enter valid bank payout details to continue.',
  bank_account: 'Enter a valid bank account number.',
  secure: 'Card or bank encryption is unavailable right now. Please try again later.',
};

const getPayoutErrorMessage = (error?: string) => (error ? (payoutErrorMessages[error] ?? null) : null);

const toOptionalString = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const getRawKarriCardNumber = (formData: FormData) => {
  const rawCard = formData.get('karriCardNumber');
  const rawValue = typeof rawCard === 'string' ? rawCard : '';
  const sanitizedCard = rawValue.replace(/\D+/g, '');
  return sanitizedCard.length > 0 ? sanitizedCard : null;
};

const getRawBankAccountNumber = (formData: FormData) => {
  const rawAccount = formData.get('bankAccountNumber');
  const rawValue = typeof rawAccount === 'string' ? rawAccount : '';
  const sanitizedAccount = rawValue.replace(/\D+/g, '');
  return sanitizedAccount.length > 0 ? sanitizedAccount : null;
};

const resolveKarriCardNumber = (rawCardNumber: string | null, encryptedFromDraft?: string) => {
  if (!process.env.CARD_DATA_ENCRYPTION_KEY) {
    redirect('/create/payout?error=secure');
  }
  const encrypted = rawCardNumber ? encryptSensitiveValue(rawCardNumber) : undefined;
  if (!encrypted && !encryptedFromDraft) {
    redirect('/create/payout?error=karri');
  }
  return encrypted ?? encryptedFromDraft;
};

const resolveBankAccountData = (rawBankAccountNumber: string | null, params: {
  encryptedFromDraft?: string;
  last4FromDraft?: string;
}) => {
  if (!process.env.CARD_DATA_ENCRYPTION_KEY) {
    redirect('/create/payout?error=secure');
  }
  if (rawBankAccountNumber && !isBankAccountNumberValid(rawBankAccountNumber)) {
    redirect('/create/payout?error=bank_account');
  }

  const encrypted = rawBankAccountNumber ? encryptSensitiveValue(rawBankAccountNumber) : undefined;
  const bankAccountNumberEncrypted = encrypted ?? params.encryptedFromDraft;
  const bankAccountLast4 = rawBankAccountNumber ? rawBankAccountNumber.slice(-4) : params.last4FromDraft;

  if (!bankAccountNumberEncrypted || !bankAccountLast4 || !/^\d{4}$/.test(bankAccountLast4)) {
    redirect('/create/payout?error=bank_account');
  }

  return {
    bankAccountNumberEncrypted,
    bankAccountLast4,
  };
};

const verifyKarriCardIfNeeded = async (params: {
  rawKarriCardNumber: string | null;
  hostId: string;
}) => {
  if (!params.rawKarriCardNumber || process.env.KARRI_AUTOMATION_ENABLED !== 'true') {
    return 'skipped' as const;
  }

  try {
    const verification = await verifyKarriCard(params.rawKarriCardNumber);
    return verification.valid ? ('valid' as const) : ('invalid' as const);
  } catch (error) {
    log('error', 'karri_card_verify_failed', {
      hostId: params.hostId,
      error: error instanceof Error ? error.message : 'unknown',
    });
    if (!isMockSentry()) {
      Sentry.captureException(error, {
        tags: { area: 'karri', step: 'payout' },
        extra: { hostId: params.hostId },
      });
    }
    return 'unavailable' as const;
  }
};

export async function savePayoutAction(formData: FormData) {
  'use server';

  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'payout', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }
  if (!draft?.giftName) {
    redirect('/create/gift');
  }

  const payload = {
    payoutEmail: formData.get('payoutEmail'),
    payoutMethod: formData.get('payoutMethod'),
    hostWhatsAppNumber: formData.get('hostWhatsAppNumber'),
    karriCardHolderName: toOptionalString(formData.get('karriCardHolderName')),
    bankName: toOptionalString(formData.get('bankName')),
    bankBranchCode: toOptionalString(formData.get('bankBranchCode')),
    bankAccountHolder: toOptionalString(formData.get('bankAccountHolder')),
  };

  const parsed = payoutSchema.safeParse(payload);
  if (!parsed.success) {
    redirect('/create/payout?error=invalid');
  }

  if (!SA_MOBILE_REGEX.test(parsed.data.hostWhatsAppNumber)) {
    redirect('/create/payout?error=whatsapp');
  }

  const payoutMethod = parsed.data.payoutMethod;
  const rawKarriCardNumber = getRawKarriCardNumber(formData);
  const rawBankAccountNumber = getRawBankAccountNumber(formData);

  if (payoutMethod === 'karri_card') {
    const karriVerification = await verifyKarriCardIfNeeded({
      rawKarriCardNumber,
      hostId: session.hostId,
    });
    if (karriVerification === 'invalid') {
      redirect('/create/payout?error=karri_invalid');
    }
    if (karriVerification === 'unavailable') {
      redirect('/create/payout?error=karri_unavailable');
    }

    const karriCardNumberEncrypted = resolveKarriCardNumber(
      rawKarriCardNumber,
      draft.karriCardNumberEncrypted
    );

    await updateDreamBoardDraft(session.hostId, {
      payoutMethod,
      payoutEmail: parsed.data.payoutEmail,
      hostWhatsAppNumber: parsed.data.hostWhatsAppNumber,
      karriCardNumberEncrypted,
      karriCardHolderName: parsed.data.karriCardHolderName?.trim(),
      bankName: undefined,
      bankAccountNumberEncrypted: undefined,
      bankAccountLast4: undefined,
      bankBranchCode: undefined,
      bankAccountHolder: undefined,
    });

    redirect('/create/review');
  }

  const bankAccountData = resolveBankAccountData(rawBankAccountNumber, {
    encryptedFromDraft: draft.bankAccountNumberEncrypted,
    last4FromDraft: draft.bankAccountLast4,
  });

  if (!parsed.data.bankName || !parsed.data.bankBranchCode || !parsed.data.bankAccountHolder) {
    redirect('/create/payout?error=bank');
  }

  await updateDreamBoardDraft(session.hostId, {
    payoutMethod,
    payoutEmail: parsed.data.payoutEmail,
    hostWhatsAppNumber: parsed.data.hostWhatsAppNumber,
    bankName: parsed.data.bankName.trim(),
    bankAccountNumberEncrypted: bankAccountData.bankAccountNumberEncrypted,
    bankAccountLast4: bankAccountData.bankAccountLast4,
    bankBranchCode: parsed.data.bankBranchCode.trim(),
    bankAccountHolder: parsed.data.bankAccountHolder.trim(),
    karriCardNumberEncrypted: undefined,
    karriCardHolderName: undefined,
  });

  redirect('/create/review');
}

type PayoutSearchParams = {
  error?: string;
};

export default async function CreatePayoutPage({
  searchParams,
}: {
  searchParams?: PayoutSearchParams;
}) {
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'payout', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }
  if (!draft) {
    redirect('/create/child');
  }

  const errorMessage = getPayoutErrorMessage(searchParams?.error);
  const payoutMethod = draft.payoutMethod === 'bank' ? 'bank' : 'karri_card';

  return (
    <CreateFlowShell
      currentStep={5}
      totalSteps={6}
      stepLabel={view.stepLabel}
      title={view.title}
      subtitle={view.subtitle}
    >
      <Card>
        <CardHeader>
          <CardTitle>Payout setup</CardTitle>
          <CardDescription>Tell us where to send the payout when the campaign closes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}
          <PayoutForm
            action={savePayoutAction}
            defaultPayoutMethod={payoutMethod}
            defaultEmail={draft.payoutEmail}
            defaultWhatsApp={draft.hostWhatsAppNumber}
            defaultKarriCardHolderName={draft.karriCardHolderName}
            defaultBankName={draft.bankName}
            defaultBankBranchCode={draft.bankBranchCode}
            defaultBankAccountHolder={draft.bankAccountHolder}
            defaultBankAccountLast4={draft.bankAccountLast4}
          />
        </CardContent>
      </Card>
    </CreateFlowShell>
  );
}
