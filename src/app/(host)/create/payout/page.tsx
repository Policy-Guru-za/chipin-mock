import { redirect } from 'next/navigation';

import { savePayoutAction } from '@/app/(host)/create/payout/actions';
import { PayoutForm } from '@/app/(host)/create/payout/PayoutForm';
import { CreateFlowShell } from '@/components/layout/CreateFlowShell';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const getPayoutErrorMessage = (error?: string) => (error ? (payoutErrorMessages[error] ?? null) : null);

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
  const errorMessage = getPayoutErrorMessage(resolvedSearchParams?.error);
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
