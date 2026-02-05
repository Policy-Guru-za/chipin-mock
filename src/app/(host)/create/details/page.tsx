import { redirect } from 'next/navigation';
import { z } from 'zod';

import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { isMockSentry } from '@/lib/config/feature-flags';
import { getDreamBoardDraft, updateDreamBoardDraft } from '@/lib/dream-boards/draft';
import type { DreamBoardDraft } from '@/lib/dream-boards/draft';
import {
  isBankAccountNumberValid,
  isBirthdayDateValid,
  isCampaignEndDateValid,
  isPartyDateWithinRange,
  SA_MOBILE_REGEX,
} from '@/lib/dream-boards/validation';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';
import { verifyKarriCard } from '@/lib/integrations/karri';
import { log } from '@/lib/observability/logger';
import { encryptSensitiveValue } from '@/lib/utils/encryption';
import { parseDateOnly } from '@/lib/utils/date';
import * as Sentry from '@sentry/nextjs';

type PayoutMethod = 'karri_card' | 'bank';
type CharitySplitType = 'percentage' | 'threshold';

const detailsSchema = z
  .object({
    payoutEmail: z.string().email(),
    payoutMethod: z.enum(['karri_card', 'bank']),
    karriCardHolderName: z.string().min(2).max(100).optional(),
    hostWhatsAppNumber: z.string().regex(SA_MOBILE_REGEX, 'Must be a valid SA mobile number'),
    message: z.string().max(280).optional(),
    birthdayDate: z.string().min(1),
    partyDate: z.string().min(1),
    campaignEndDate: z.string().min(1),
    bankName: z.string().min(2).max(120).optional(),
    bankBranchCode: z.string().min(2).max(20).optional(),
    bankAccountHolder: z.string().min(2).max(120).optional(),
    charityEnabled: z.boolean().optional().default(false),
    charityId: z.string().uuid().optional(),
    charitySplitType: z.enum(['percentage', 'threshold']).optional(),
    charityPercentage: z.number().int().min(5).max(50).optional(),
    charityThresholdAmount: z.number().int().min(50).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.payoutMethod === 'karri_card' && !value.karriCardHolderName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['karriCardHolderName'],
        message: 'Karri card holder is required',
      });
    }

    if (value.payoutMethod === 'bank') {
      if (!value.bankName) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankName'],
          message: 'Bank name is required',
        });
      }
      if (!value.bankBranchCode) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankBranchCode'],
          message: 'Bank branch code is required',
        });
      }
      if (!value.bankAccountHolder) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['bankAccountHolder'],
          message: 'Bank account holder is required',
        });
      }
    }

    if (!value.charityEnabled) {
      return;
    }

    if (!value.charityId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['charityId'],
        message: 'Charity is required when giving back is enabled',
      });
    }

    if (!value.charitySplitType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['charitySplitType'],
        message: 'Choose a charity split type',
      });
      return;
    }

    if (value.charitySplitType === 'percentage' && value.charityPercentage === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['charityPercentage'],
        message: 'Enter a charity percentage between 5 and 50',
      });
    }

    if (value.charitySplitType === 'threshold' && value.charityThresholdAmount === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['charityThresholdAmount'],
        message: 'Enter a charity threshold amount',
      });
    }
  });

const detailsErrorMessages: Record<string, string> = {
  invalid: 'Please complete all required fields.',
  birthday_date: 'Birthday date must be in the future.',
  birthday_order: 'Party date must be on or after birthday date.',
  party_date: 'Party date must be within the next 6 months.',
  campaign_end: 'Campaign end date must be on/before party date and in the future.',
  whatsapp: 'Enter a valid South African WhatsApp number.',
  karri: 'Enter a valid Karri Card number to continue.',
  karri_invalid: 'Karri Card number could not be verified. Please try again.',
  karri_unavailable: 'Karri verification is unavailable right now. Please try again later.',
  bank: 'Enter valid bank payout details to continue.',
  bank_account: 'Enter a valid bank account number.',
  secure: 'Card or bank encryption is unavailable right now. Please try again later.',
};

const getDetailsErrorMessage = (error?: string) =>
  error ? (detailsErrorMessages[error] ?? null) : null;

const getDateAfterDays = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};

const getDefaultBirthdayDate = (draft: DreamBoardDraft) => draft.birthdayDate ?? getDateAfterDays(1);

const getDefaultPartyDate = (draft: DreamBoardDraft, birthdayDate: string) =>
  draft.partyDate ?? birthdayDate;

const getDefaultCampaignEndDate = (draft: DreamBoardDraft, partyDate: string) =>
  draft.campaignEndDate ?? partyDate;

const getDefaultPayoutMethod = (draft: DreamBoardDraft): PayoutMethod =>
  draft.payoutMethod ?? 'karri_card';

const toOptionalString = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const toOptionalNumber = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
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

const resolveKarriCardNumber = (rawCardNumber: string | null, draft: DreamBoardDraft) => {
  if (!process.env.CARD_DATA_ENCRYPTION_KEY) {
    redirect('/create/details?error=secure');
  }
  const encrypted = rawCardNumber ? encryptSensitiveValue(rawCardNumber) : undefined;
  if (!encrypted && !draft.karriCardNumberEncrypted) {
    redirect('/create/details?error=karri');
  }
  return encrypted ?? draft.karriCardNumberEncrypted;
};

const resolveBankAccountData = (rawBankAccountNumber: string | null, draft: DreamBoardDraft) => {
  if (!process.env.CARD_DATA_ENCRYPTION_KEY) {
    redirect('/create/details?error=secure');
  }
  if (rawBankAccountNumber && !isBankAccountNumberValid(rawBankAccountNumber)) {
    redirect('/create/details?error=bank_account');
  }

  const encrypted = rawBankAccountNumber ? encryptSensitiveValue(rawBankAccountNumber) : undefined;
  const accountEncrypted = encrypted ?? draft.bankAccountNumberEncrypted;
  const accountLast4 = rawBankAccountNumber
    ? rawBankAccountNumber.slice(-4)
    : draft.bankAccountLast4;

  if (!accountEncrypted || !accountLast4 || !/^\d{4}$/.test(accountLast4)) {
    redirect('/create/details?error=bank_account');
  }

  return {
    bankAccountNumberEncrypted: accountEncrypted,
    bankAccountLast4: accountLast4,
  };
};

const verifyKarriCardIfNeeded = async (params: {
  rawKarriCardNumber: string | null;
  hostId: string;
}) => {
  if (!params.rawKarriCardNumber || process.env.KARRI_AUTOMATION_ENABLED !== 'true') {
    return;
  }

  try {
    const verification = await verifyKarriCard(params.rawKarriCardNumber);
    if (!verification.valid) {
      redirect('/create/details?error=karri_invalid');
    }
  } catch (error) {
    log('error', 'karri_card_verify_failed', {
      hostId: params.hostId,
      error: error instanceof Error ? error.message : 'unknown',
    });
    if (!isMockSentry()) {
      Sentry.captureException(error, {
        tags: { area: 'karri', step: 'details' },
        extra: { hostId: params.hostId },
      });
    }
    redirect('/create/details?error=karri_unavailable');
  }
};

type DetailsFormProps = {
  draft: DreamBoardDraft;
  defaultBirthdayDate: string;
  defaultPartyDate: string;
  defaultCampaignEndDate: string;
  defaultPayoutMethod: PayoutMethod;
};

const DetailsForm = ({
  draft,
  defaultBirthdayDate,
  defaultPartyDate,
  defaultCampaignEndDate,
  defaultPayoutMethod,
}: DetailsFormProps) => {
  const defaultCharitySplitType: CharitySplitType = draft.charitySplitType ?? 'percentage';

  return (
    <form action={saveDetailsAction} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="payoutEmail" className="text-sm font-medium text-text">
          Payout email
        </label>
        <Input
          id="payoutEmail"
          name="payoutEmail"
          type="email"
          placeholder="you@example.com"
          required
          defaultValue={draft.payoutEmail ?? ''}
        />
        <p className="text-xs text-text-muted">We’ll email payout confirmations to this address.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="birthdayDate" className="text-sm font-medium text-text">
          Birthday date
        </label>
        <Input
          id="birthdayDate"
          name="birthdayDate"
          type="date"
          required
          defaultValue={defaultBirthdayDate}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="partyDate" className="text-sm font-medium text-text">
          Party date
        </label>
        <Input id="partyDate" name="partyDate" type="date" required defaultValue={defaultPartyDate} />
      </div>

      <div className="space-y-2">
        <label htmlFor="campaignEndDate" className="text-sm font-medium text-text">
          Contribution deadline
        </label>
        <Input
          id="campaignEndDate"
          name="campaignEndDate"
          type="date"
          required
          defaultValue={defaultCampaignEndDate}
        />
        <p className="text-xs text-text-muted">Guests can chip in until this date.</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="hostWhatsAppNumber" className="text-sm font-medium text-text">
          Host WhatsApp number
        </label>
        <Input
          id="hostWhatsAppNumber"
          name="hostWhatsAppNumber"
          placeholder="e.g. +27821234567"
          defaultValue={draft.hostWhatsAppNumber ?? ''}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="payoutMethod" className="text-sm font-medium text-text">
          Payout method
        </label>
        <select
          id="payoutMethod"
          name="payoutMethod"
          defaultValue={defaultPayoutMethod}
          className="h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
        >
          <option value="karri_card">Karri Card</option>
          <option value="bank">Bank transfer</option>
        </select>
      </div>

      <div className="space-y-2">
        <label htmlFor="karriCardNumber" className="text-sm font-medium text-text">
          Karri Card number
        </label>
        <Input
          id="karriCardNumber"
          name="karriCardNumber"
          placeholder="16-digit card number"
          autoComplete="off"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="karriCardHolderName" className="text-sm font-medium text-text">
          Karri Card holder name
        </label>
        <Input
          id="karriCardHolderName"
          name="karriCardHolderName"
          placeholder="Name on the Karri Card"
          defaultValue={draft.karriCardHolderName ?? ''}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bankName" className="text-sm font-medium text-text">
          Bank name
        </label>
        <Input
          id="bankName"
          name="bankName"
          placeholder="e.g. Standard Bank"
          defaultValue={draft.bankName ?? ''}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bankAccountNumber" className="text-sm font-medium text-text">
          Bank account number
        </label>
        <Input
          id="bankAccountNumber"
          name="bankAccountNumber"
          placeholder="Account number"
          autoComplete="off"
        />
        <p className="text-xs text-text-muted">
          {draft.bankAccountNumberEncrypted
            ? `Bank account saved (•••• ${draft.bankAccountLast4 ?? '----'}). Re-enter to update.`
            : 'Only required when payout method is bank transfer.'}
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="bankBranchCode" className="text-sm font-medium text-text">
          Bank branch code
        </label>
        <Input
          id="bankBranchCode"
          name="bankBranchCode"
          placeholder="e.g. 051001"
          defaultValue={draft.bankBranchCode ?? ''}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="bankAccountHolder" className="text-sm font-medium text-text">
          Bank account holder
        </label>
        <Input
          id="bankAccountHolder"
          name="bankAccountHolder"
          placeholder="Account holder name"
          defaultValue={draft.bankAccountHolder ?? ''}
        />
      </div>

      <div className="space-y-3 rounded-xl border border-border p-4">
        <label className="flex items-center gap-2 text-sm font-medium text-text" htmlFor="charityEnabled">
          <input
            id="charityEnabled"
            name="charityEnabled"
            type="checkbox"
            defaultChecked={draft.charityEnabled ?? false}
          />
          Enable giving back (optional)
        </label>

        <div className="space-y-2">
          <label htmlFor="charityId" className="text-sm font-medium text-text">
            Charity ID (UUID)
          </label>
          <Input
            id="charityId"
            name="charityId"
            placeholder="Charity UUID"
            defaultValue={draft.charityId ?? ''}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="charitySplitType" className="text-sm font-medium text-text">
            Charity split type
          </label>
          <select
            id="charitySplitType"
            name="charitySplitType"
            defaultValue={defaultCharitySplitType}
            className="h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm"
          >
            <option value="percentage">Percentage split</option>
            <option value="threshold">Threshold split</option>
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="charityPercentage" className="text-sm font-medium text-text">
            Charity percentage (5–50)
          </label>
          <Input
            id="charityPercentage"
            name="charityPercentage"
            type="number"
            min={5}
            max={50}
            step={1}
            defaultValue={draft.charityPercentageBps ? Math.round(draft.charityPercentageBps / 100) : 10}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="charityThresholdAmount" className="text-sm font-medium text-text">
            Charity threshold amount (R)
          </label>
          <Input
            id="charityThresholdAmount"
            name="charityThresholdAmount"
            type="number"
            min={50}
            step={1}
            defaultValue={draft.charityThresholdCents ? Math.round(draft.charityThresholdCents / 100) : 100}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium text-text">
          Personal message (optional)
        </label>
        <Input
          id="message"
          name="message"
          placeholder="E.g., Maya would love your contribution toward her dream bike!"
          defaultValue={draft.message ?? ''}
        />
      </div>

      <Button type="submit">Review & create</Button>
    </form>
  );
};

async function saveDetailsAction(formData: FormData) {
  'use server';

  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  if (!draft?.giftName) {
    redirect('/create/gift');
  }

  const payload = {
    payoutEmail: formData.get('payoutEmail'),
    payoutMethod: formData.get('payoutMethod'),
    karriCardHolderName: toOptionalString(formData.get('karriCardHolderName')),
    hostWhatsAppNumber: formData.get('hostWhatsAppNumber'),
    message: toOptionalString(formData.get('message')),
    birthdayDate: formData.get('birthdayDate'),
    partyDate: formData.get('partyDate'),
    campaignEndDate: formData.get('campaignEndDate'),
    bankName: toOptionalString(formData.get('bankName')),
    bankBranchCode: toOptionalString(formData.get('bankBranchCode')),
    bankAccountHolder: toOptionalString(formData.get('bankAccountHolder')),
    charityEnabled: formData.get('charityEnabled') === 'on',
    charityId: toOptionalString(formData.get('charityId')),
    charitySplitType: toOptionalString(formData.get('charitySplitType')),
    charityPercentage: toOptionalNumber(formData.get('charityPercentage')),
    charityThresholdAmount: toOptionalNumber(formData.get('charityThresholdAmount')),
  };

  const result = detailsSchema.safeParse(payload);
  if (!result.success) {
    redirect('/create/details?error=invalid');
  }

  if (!isBirthdayDateValid(result.data.birthdayDate)) {
    redirect('/create/details?error=birthday_date');
  }
  if (!isPartyDateWithinRange(result.data.partyDate)) {
    redirect('/create/details?error=party_date');
  }
  if (!isCampaignEndDateValid({
    campaignEndDate: result.data.campaignEndDate,
    partyDate: result.data.partyDate,
  })) {
    redirect('/create/details?error=campaign_end');
  }
  if (!SA_MOBILE_REGEX.test(result.data.hostWhatsAppNumber)) {
    redirect('/create/details?error=whatsapp');
  }

  const birthdayDate = parseDateOnly(result.data.birthdayDate);
  const partyDate = parseDateOnly(result.data.partyDate);
  if (!birthdayDate || !partyDate || partyDate < birthdayDate) {
    redirect('/create/details?error=birthday_order');
  }

  const payoutMethod = result.data.payoutMethod as PayoutMethod;
  const rawKarriCardNumber = getRawKarriCardNumber(formData);
  const rawBankAccountNumber = getRawBankAccountNumber(formData);

  let karriCardNumberEncrypted = draft.karriCardNumberEncrypted;
  let bankAccountNumberEncrypted = draft.bankAccountNumberEncrypted;
  let bankAccountLast4 = draft.bankAccountLast4;

  if (payoutMethod === 'karri_card') {
    await verifyKarriCardIfNeeded({
      rawKarriCardNumber,
      hostId: session.hostId,
    });
    karriCardNumberEncrypted = resolveKarriCardNumber(rawKarriCardNumber, draft);
  }

  if (payoutMethod === 'bank') {
    const bankAccountData = resolveBankAccountData(rawBankAccountNumber, draft);
    bankAccountNumberEncrypted = bankAccountData.bankAccountNumberEncrypted;
    bankAccountLast4 = bankAccountData.bankAccountLast4;
  }

  const charityEnabled = result.data.charityEnabled === true;
  const charitySplitType = charityEnabled
    ? (result.data.charitySplitType as CharitySplitType)
    : undefined;
  const charityPercentageBps =
    charityEnabled && charitySplitType === 'percentage' && result.data.charityPercentage !== undefined
      ? result.data.charityPercentage * 100
      : undefined;
  const charityThresholdCents =
    charityEnabled &&
    charitySplitType === 'threshold' &&
    result.data.charityThresholdAmount !== undefined
      ? result.data.charityThresholdAmount * 100
      : undefined;

  await updateDreamBoardDraft(session.hostId, {
    payoutMethod,
    payoutEmail: result.data.payoutEmail,
    birthdayDate: result.data.birthdayDate,
    partyDate: result.data.partyDate,
    campaignEndDate: result.data.campaignEndDate,
    karriCardNumberEncrypted,
    karriCardHolderName: result.data.karriCardHolderName?.trim(),
    bankName: result.data.bankName?.trim(),
    bankAccountNumberEncrypted,
    bankAccountLast4,
    bankBranchCode: result.data.bankBranchCode?.trim(),
    bankAccountHolder: result.data.bankAccountHolder?.trim(),
    charityEnabled,
    charityId: charityEnabled ? result.data.charityId : undefined,
    charitySplitType,
    charityPercentageBps,
    charityThresholdCents,
    hostWhatsAppNumber: result.data.hostWhatsAppNumber,
    message: result.data.message?.trim() || undefined,
  });

  redirect('/create/review');
}

type DetailsSearchParams = {
  error?: string;
};

export default async function CreateDetailsPage({
  searchParams,
}: {
  searchParams?: DetailsSearchParams;
}) {
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'details', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }
  if (!draft) {
    redirect('/create/gift');
  }

  const error = searchParams?.error;
  const errorMessage = getDetailsErrorMessage(error);
  const defaultBirthdayDate = getDefaultBirthdayDate(draft);
  const defaultPartyDate = getDefaultPartyDate(draft, defaultBirthdayDate);
  const defaultCampaignEndDate = getDefaultCampaignEndDate(draft, defaultPartyDate);
  const defaultPayoutMethod = getDefaultPayoutMethod(draft);

  return (
    <CreateFlowShell stepLabel={view.stepLabel} title={view.title} subtitle={view.subtitle}>
      <Card>
        <CardHeader>
          <CardTitle>Payout & final details</CardTitle>
          <CardDescription>
            We’ll send the payout to this email when the pot closes.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {errorMessage ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {errorMessage}
            </div>
          ) : null}

          <DetailsForm
            draft={draft}
            defaultBirthdayDate={defaultBirthdayDate}
            defaultPartyDate={defaultPartyDate}
            defaultCampaignEndDate={defaultCampaignEndDate}
            defaultPayoutMethod={defaultPayoutMethod}
          />
        </CardContent>
      </Card>
    </CreateFlowShell>
  );
}
