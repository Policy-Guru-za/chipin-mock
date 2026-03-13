'use client';

import { VoucherForm } from '@/app/(host)/create/voucher/VoucherForm';

type PayoutFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultEmail?: string;
  defaultWhatsApp?: string;
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
