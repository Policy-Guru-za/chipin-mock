import { redirect } from 'next/navigation';
import { z } from 'zod';

import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { requireSession } from '@/lib/auth/session';
import { isDemoMode } from '@/lib/demo';
import { getDreamBoardDraft, updateDreamBoardDraft } from '@/lib/dream-boards/draft';
import type { DreamBoardDraft } from '@/lib/dream-boards/draft';
import { isPartyDateWithinRange, SA_MOBILE_REGEX } from '@/lib/dream-boards/validation';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';
import { verifyKarriCard } from '@/lib/integrations/karri';
import { log } from '@/lib/observability/logger';
import { encryptSensitiveValue } from '@/lib/utils/encryption';
import * as Sentry from '@sentry/nextjs';

const detailsSchema = z.object({
  payoutEmail: z.string().email(),
  karriCardHolderName: z.string().min(2).max(100),
  hostWhatsAppNumber: z.string().regex(SA_MOBILE_REGEX, 'Must be a valid SA mobile number'),
  message: z.string().max(280).optional(),
  partyDate: z.string().min(1),
});

const detailsErrorMessages: Record<string, string> = {
  invalid: 'Please complete all required fields.',
  party_date: 'Party date must be within the next 6 months.',
  whatsapp: 'Enter a valid South African WhatsApp number.',
  karri: 'Enter a valid Karri Card number to continue.',
  karri_invalid: 'Karri Card number could not be verified. Please try again.',
  karri_unavailable: 'Karri verification is unavailable right now. Please try again later.',
  secure: 'Karri Card setup is unavailable right now. Please try again later.',
};

const getDetailsErrorMessage = (error?: string) =>
  error ? (detailsErrorMessages[error] ?? null) : null;

const getDefaultPartyDate = (draft: DreamBoardDraft) => {
  if (draft.partyDate) return draft.partyDate;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().split('T')[0];
};

const getRawKarriCardNumber = (formData: FormData) => {
  const rawCard = formData.get('karriCardNumber');
  const rawValue = typeof rawCard === 'string' ? rawCard : '';
  const sanitizedCard = rawValue.replace(/\s+/g, '').replace(/-/g, '');
  return sanitizedCard.length > 0 ? sanitizedCard : null;
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
    if (!isDemoMode()) {
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
  defaultPartyDate: string;
};

const DetailsForm = ({ draft, defaultPartyDate }: DetailsFormProps) => (
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
      <p className="text-xs text-text-muted">We’ll email the Karri Card credit confirmation.</p>
    </div>

    <div className="space-y-2">
      <label htmlFor="partyDate" className="text-sm font-medium text-text">
        Party date
      </label>
      <Input id="partyDate" name="partyDate" type="date" required defaultValue={defaultPartyDate} />
      <p className="text-xs text-text-muted">We’ll automatically close the pot on this date.</p>
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
      <p className="text-xs text-text-muted">We’ll send contribution and payout updates here.</p>
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
        required={!draft.karriCardNumberEncrypted}
      />
      <p className="text-xs text-text-muted">
        {draft.karriCardNumberEncrypted
          ? 'Card number saved. Re-enter to update.'
          : 'We only use this to load Karri top-ups.'}
      </p>
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
        required
      />
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

async function saveDetailsAction(formData: FormData) {
  'use server';

  const session = await requireSession();
  const draft = await getDreamBoardDraft(session.hostId);
  if (!draft?.giftName) {
    redirect('/create/gift');
  }

  const payoutEmail = formData.get('payoutEmail');
  const karriCardHolderName = formData.get('karriCardHolderName');
  const hostWhatsAppNumber = formData.get('hostWhatsAppNumber');
  const message = formData.get('message');
  const partyDate = formData.get('partyDate');

  const result = detailsSchema.safeParse({
    payoutEmail,
    karriCardHolderName,
    hostWhatsAppNumber,
    message,
    partyDate,
  });
  if (!result.success) {
    redirect('/create/details?error=invalid');
  }

  if (!isPartyDateWithinRange(result.data.partyDate)) {
    redirect('/create/details?error=party_date');
  }
  if (!SA_MOBILE_REGEX.test(result.data.hostWhatsAppNumber)) {
    redirect('/create/details?error=whatsapp');
  }

  const rawKarriCardNumber = getRawKarriCardNumber(formData);
  await verifyKarriCardIfNeeded({
    rawKarriCardNumber,
    hostId: session.hostId,
  });

  const karriCardNumberEncrypted = resolveKarriCardNumber(rawKarriCardNumber, draft);

  await updateDreamBoardDraft(session.hostId, {
    payoutEmail: result.data.payoutEmail,
    karriCardNumberEncrypted,
    karriCardHolderName: result.data.karriCardHolderName,
    hostWhatsAppNumber: result.data.hostWhatsAppNumber,
    message: result.data.message?.trim() || undefined,
    partyDate: result.data.partyDate,
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
  const session = await requireSession();
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
  const defaultPartyDate = getDefaultPartyDate(draft);

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
            defaultPartyDate={defaultPartyDate}
          />
        </CardContent>
      </Card>
    </CreateFlowShell>
  );
}
