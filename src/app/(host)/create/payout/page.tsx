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
import { getHostCreateDreamBoardDraft } from '@/lib/dream-boards/draft';
import {
  CREATE_FLOW_TOTAL_STEPS,
  buildCreateFlowViewModel,
} from '@/lib/host/create-view-model';

const payoutErrorMessages: Record<string, string> = {
  invalid: 'Please complete the required payout details.',
  whatsapp: 'Enter a valid South African WhatsApp number.',
  karri: 'Enter a valid Karri Card number to continue.',
  karri_invalid: 'That Karri Card could not be verified. Please try again.',
  karri_unavailable: 'Karri verification is unavailable right now. Please try again shortly.',
  bank: 'Enter valid bank payout details to continue.',
  bank_account: 'Enter a valid bank account number.',
  secure: 'Secure payout encryption is unavailable right now. Please try again shortly.',
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
  const draft = await getHostCreateDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'payout', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }
  if (!draft) {
    redirect('/create/dates');
  }

  const resolvedSearchParams = await searchParams;
  const errorMessage = resolveWizardError(resolvedSearchParams?.error, payoutErrorMessages);
  const payoutMethod = draft.payoutMethod === 'karri_card' ? 'karri_card' : 'bank';

  return (
    <>
      <WizardStepper
        currentStep={4}
        totalSteps={CREATE_FLOW_TOTAL_STEPS}
        stepLabel="Payout details"
      />

      <Suspense fallback={<WizardSkeletonLoader variant="split" />}>
        <PayoutForm
          action={savePayoutAction}
          defaultPayoutMethod={payoutMethod}
          defaultEmail={draft.payoutEmail}
          defaultWhatsApp={draft.hostWhatsAppNumber}
          defaultKarriCardHolderName={draft.karriCardHolderName}
          defaultHasKarriCard={Boolean(draft.karriCardNumberEncrypted)}
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
