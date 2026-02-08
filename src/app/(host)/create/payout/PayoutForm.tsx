'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type PayoutMethod = 'karri_card' | 'bank';

type PayoutFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultPayoutMethod?: PayoutMethod;
  defaultEmail?: string;
  defaultWhatsApp?: string;
  defaultKarriCardHolderName?: string;
  defaultBankName?: string;
  defaultBankBranchCode?: string;
  defaultBankAccountHolder?: string;
  defaultBankAccountLast4?: string;
};

const SOUTH_AFRICAN_BANKS = [
  'ABSA',
  'Capitec',
  'Discovery Bank',
  'FNB',
  'Investec',
  'Nedbank',
  'Standard Bank',
  'TymeBank',
];

export function PayoutForm({
  action,
  defaultPayoutMethod = 'karri_card',
  defaultEmail,
  defaultWhatsApp,
  defaultKarriCardHolderName,
  defaultBankName,
  defaultBankBranchCode,
  defaultBankAccountHolder,
  defaultBankAccountLast4,
}: PayoutFormProps) {
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>(defaultPayoutMethod);

  return (
    <form action={action} className="space-y-6">
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium text-text">Payout method</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={[
              'card-interactive flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors',
              payoutMethod === 'karri_card'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-white hover:border-primary/50',
            ].join(' ')}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="payoutMethod"
                value="karri_card"
                checked={payoutMethod === 'karri_card'}
                onChange={() => setPayoutMethod('karri_card')}
              />
              <span className="text-sm font-semibold text-text">Karri Card</span>
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                Recommended
              </span>
            </div>
            <p className="text-xs text-text-muted">Fastest payout option after campaign close.</p>
          </label>
          <label
            className={[
              'card-interactive flex cursor-pointer flex-col gap-1 rounded-xl border p-4 transition-colors',
              payoutMethod === 'bank'
                ? 'border-primary bg-primary/5'
                : 'border-border bg-white hover:border-primary/50',
            ].join(' ')}
          >
            <div className="flex items-center gap-2">
              <input
                type="radio"
                name="payoutMethod"
                value="bank"
                checked={payoutMethod === 'bank'}
                onChange={() => setPayoutMethod('bank')}
              />
              <span className="text-sm font-semibold text-text">Bank Transfer</span>
            </div>
            <p className="text-xs text-text-muted">Direct payout into your South African bank account.</p>
          </label>
        </div>
      </fieldset>

      {payoutMethod === 'karri_card' ? (
        <div className="space-y-5 rounded-2xl border border-border p-4">
          <div className="space-y-2">
            <label htmlFor="karriCardNumber" className="text-sm font-medium text-text">
              Card Number
            </label>
            <Input
              id="karriCardNumber"
              name="karriCardNumber"
              placeholder="XXXX XXXX XXXX XXXX"
              autoComplete="off"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="karriCardHolderName" className="text-sm font-medium text-text">
              Card Holder Name
            </label>
            <Input
              id="karriCardHolderName"
              name="karriCardHolderName"
              placeholder="Name on card"
              defaultValue={defaultKarriCardHolderName ?? ''}
            />
          </div>
        </div>
      ) : (
        <div className="space-y-5 rounded-2xl border border-border p-4">
          <div className="space-y-2">
            <label htmlFor="bankName" className="text-sm font-medium text-text">
              Bank Name
            </label>
            <select
              id="bankName"
              name="bankName"
              defaultValue={defaultBankName ?? ''}
              className="h-10 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
            >
              <option value="">Select a bank</option>
              {SOUTH_AFRICAN_BANKS.map((bankName) => (
                <option key={bankName} value={bankName}>
                  {bankName}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="bankAccountNumber" className="text-sm font-medium text-text">
              Account Number
            </label>
            <Input
              id="bankAccountNumber"
              name="bankAccountNumber"
              placeholder="Account number"
              autoComplete="off"
            />
            {defaultBankAccountLast4 ? (
              <p className="text-xs text-text-muted">
                Existing account saved (•••• {defaultBankAccountLast4}). Re-enter to update.
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <label htmlFor="bankBranchCode" className="text-sm font-medium text-text">
              Branch Code
            </label>
            <Input
              id="bankBranchCode"
              name="bankBranchCode"
              placeholder="6-digit branch code"
              defaultValue={defaultBankBranchCode ?? ''}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="bankAccountHolder" className="text-sm font-medium text-text">
              Account Holder Name
            </label>
            <Input
              id="bankAccountHolder"
              name="bankAccountHolder"
              placeholder="Account holder name"
              defaultValue={defaultBankAccountHolder ?? ''}
            />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label htmlFor="payoutEmail" className="text-sm font-medium text-text">
          Payout Email
        </label>
        <Input
          id="payoutEmail"
          name="payoutEmail"
          type="email"
          placeholder="you@example.com"
          defaultValue={defaultEmail ?? ''}
          required
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="hostWhatsAppNumber" className="text-sm font-medium text-text">
          WhatsApp Number
        </label>
        <Input
          id="hostWhatsAppNumber"
          name="hostWhatsAppNumber"
          placeholder="e.g. +27821234567"
          defaultValue={defaultWhatsApp ?? ''}
          required
        />
      </div>

      <Button type="submit">Continue to review</Button>
    </form>
  );
}
