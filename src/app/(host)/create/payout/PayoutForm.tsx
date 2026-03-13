'use client';

import { VoucherForm } from '@/app/(host)/create/voucher/VoucherForm';

type LegacyPayoutMethod = 'karri_card' | 'bank';

type PayoutFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultPayoutMethod?: LegacyPayoutMethod;
  defaultEmail?: string;
  defaultWhatsApp?: string;
  defaultKarriCardHolderName?: string;
  defaultBankName?: string;
  defaultBankBranchCode?: string;
  defaultBankAccountHolder?: string;
  defaultBankAccountLast4?: string;
  error: string | null;
};

// Legacy compatibility wrapper for the retired /create/payout step.
export function PayoutForm({ action, defaultEmail, defaultWhatsApp, error }: PayoutFormProps) {
  return (
    <VoucherForm
      action={action}
      defaultEmail={defaultEmail}
      defaultWhatsApp={defaultWhatsApp}
      error={error}
    />
  );
}
