import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { savePayoutAction } from '@/app/(host)/create/payout/actions';
import { PayoutForm } from '@/app/(host)/create/payout/PayoutForm';
import {
  WizardSkeletonLoader,
  WizardStepper,
  resolveWizardError,
} from '@/components/create-wizard';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft } from '@/lib/dream-boards/draft';
import { buildCreateFlowViewModel } from '@/lib/host/create-view-model';

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

type PayoutSearchParams = {
  error?: string;
};

export default async function CreatePayoutPage({
  searchParams,
}: {
  searchParams?: Promise<PayoutSearchParams>;
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

  const resolvedSearchParams = await searchParams;
  const errorMessage = resolveWizardError(resolvedSearchParams?.error, payoutErrorMessages);
  const payoutMethod = draft.payoutMethod === 'bank' ? 'bank' : 'karri_card';

  return (
    <>
      <WizardStepper currentStep={5} totalSteps={6} stepLabel="Payout setup" />

      <Suspense fallback={<WizardSkeletonLoader variant="split" />}>
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
          error={errorMessage}
        />
      </Suspense>
    </>
  );
}
