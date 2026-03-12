import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import { saveVoucherAction } from '@/app/(host)/create/voucher/actions';
import { VoucherForm } from '@/app/(host)/create/voucher/VoucherForm';
import {
  WizardSkeletonLoader,
  WizardStepper,
  resolveWizardError,
} from '@/components/create-wizard';
import { requireHostAuth } from '@/lib/auth/clerk-wrappers';
import { getDreamBoardDraft } from '@/lib/dream-boards/draft';
import {
  buildCreateFlowViewModel,
  CREATE_FLOW_TOTAL_STEPS,
} from '@/lib/host/create-view-model';

const voucherErrorMessages: Record<string, string> = {
  invalid: 'Please complete the voucher contact details.',
  whatsapp: 'Enter a valid South African WhatsApp number.',
};

type VoucherSearchParams = {
  error?: string;
};

export default async function CreateVoucherPage({
  searchParams,
}: {
  searchParams?: Promise<VoucherSearchParams>;
}) {
  const session = await requireHostAuth();
  const draft = await getDreamBoardDraft(session.hostId);
  const view = buildCreateFlowViewModel({ step: 'voucher', draft });
  if (view.redirectTo) {
    redirect(view.redirectTo);
  }
  if (!draft) {
    redirect('/create/dates');
  }

  const resolvedSearchParams = await searchParams;
  const errorMessage = resolveWizardError(resolvedSearchParams?.error, voucherErrorMessages);

  return (
    <>
      <WizardStepper
        currentStep={4}
        totalSteps={CREATE_FLOW_TOTAL_STEPS}
        stepLabel="Voucher details"
      />

      <Suspense fallback={<WizardSkeletonLoader variant="split" />}>
        <VoucherForm
          action={saveVoucherAction}
          defaultEmail={draft.payoutEmail}
          defaultWhatsApp={draft.hostWhatsAppNumber}
          error={errorMessage}
        />
      </Suspense>
    </>
  );
}
