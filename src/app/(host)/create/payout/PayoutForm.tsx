'use client';

import { useState } from 'react';

import {
  WizardCTA,
  WizardEyebrow,
  WizardFieldTip,
  WizardFieldWrapper,
  WizardFormCard,
  WizardPanelTitle,
  WizardPreviewPanel,
  WizardSelect,
  WizardSplitLayout,
  WizardTextInput,
} from '@/components/create-wizard';
import { PayoutPreview } from '@/components/create-wizard/PayoutPreview';
import { cn } from '@/lib/utils';

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
  error: string | null;
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

const methodTabClassName =
  'wizard-interactive flex flex-1 items-center justify-center gap-2 rounded-[14px] border-[1.5px] px-5 py-4 text-sm font-semibold transition-all duration-200';

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
  error,
}: PayoutFormProps) {
  const [payoutMethod, setPayoutMethod] = useState<PayoutMethod>(defaultPayoutMethod);
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [whatsApp, setWhatsApp] = useState(defaultWhatsApp ?? '');
  const [karriCardHolderName, setKarriCardHolderName] = useState(defaultKarriCardHolderName ?? '');
  const [hasKarriCardNumber, setHasKarriCardNumber] = useState(false);
  const [bankName, setBankName] = useState(defaultBankName ?? '');
  const [bankBranchCode, setBankBranchCode] = useState(defaultBankBranchCode ?? '');
  const [bankAccountHolder, setBankAccountHolder] = useState(defaultBankAccountHolder ?? '');
  const [hasBankAccountNumber, setHasBankAccountNumber] = useState(
    Boolean(defaultBankAccountLast4?.trim())
  );

  const hasMethodDetails =
    payoutMethod === 'karri_card'
      ? hasKarriCardNumber && karriCardHolderName.trim().length > 0
      : bankName.trim().length > 0 &&
        hasBankAccountNumber &&
        bankBranchCode.trim().length > 0 &&
        bankAccountHolder.trim().length > 0;
  const hasEmail = email.trim().length > 0;
  const hasWhatsApp = whatsApp.trim().length > 0;

  return (
    <form action={action}>
      <WizardSplitLayout
        mobileOrder="right-first"
        left={
          <WizardFormCard>
            <WizardEyebrow>Step 5</WizardEyebrow>
            <WizardPanelTitle variant="form">How should we send your payout?</WizardPanelTitle>
            <p className="mb-7 text-[13px] font-light leading-relaxed text-ink-soft">
              Tell us where to send the pooled funds when the campaign closes.
            </p>

            <fieldset>
              <legend className="sr-only">Payout method</legend>
              <div className="mb-7 grid gap-3 sm:grid-cols-2">
                <label
                  className={cn(
                    methodTabClassName,
                    'cursor-pointer',
                    payoutMethod === 'karri_card'
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-background text-ink-soft hover:border-primary',
                  )}
                >
                  <input
                    type="radio"
                    name="payoutMethod"
                    value="karri_card"
                    checked={payoutMethod === 'karri_card'}
                    onChange={() => setPayoutMethod('karri_card')}
                    className="sr-only"
                  />
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                    aria-hidden="true"
                  >
                    <rect x="3" y="6" width="18" height="12" rx="2" />
                    <path d="M3 10h18" />
                  </svg>
                  <span>Karri Card</span>
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
                      payoutMethod === 'karri_card'
                        ? 'bg-white/20 text-white'
                        : 'bg-sage/10 text-sage',
                    )}
                  >
                    Recommended
                  </span>
                </label>

                <label
                  className={cn(
                    methodTabClassName,
                    'cursor-pointer',
                    payoutMethod === 'bank'
                      ? 'border-primary bg-primary text-white'
                      : 'border-border bg-background text-ink-soft hover:border-primary',
                  )}
                >
                  <input
                    type="radio"
                    name="payoutMethod"
                    value="bank"
                    checked={payoutMethod === 'bank'}
                    onChange={() => setPayoutMethod('bank')}
                    className="sr-only"
                  />
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                    aria-hidden="true"
                  >
                    <path d="M3 6h18M3 10h18M7 14h10M3 18h18" />
                  </svg>
                  <span>Bank Transfer</span>
                </label>
              </div>
            </fieldset>

            {payoutMethod === 'karri_card' ? (
              <div className="mb-6 rounded-[20px] border border-border bg-background p-4">
                <WizardFieldWrapper label="Card number" htmlFor="karriCardNumber">
                  <WizardTextInput
                    id="karriCardNumber"
                    name="karriCardNumber"
                    placeholder="XXXX XXXX XXXX XXXX"
                    autoComplete="off"
                    inputMode="numeric"
                    enterKeyHint="next"
                    onChange={(event) =>
                      setHasKarriCardNumber(event.currentTarget.value.trim().length > 0)
                    }
                  />
                </WizardFieldWrapper>

                <WizardFieldWrapper label="Card holder name" htmlFor="karriCardHolderName">
                  <WizardTextInput
                    id="karriCardHolderName"
                    name="karriCardHolderName"
                    placeholder="Name on card"
                    autoCapitalize="words"
                    autoComplete="name"
                    enterKeyHint="next"
                    value={karriCardHolderName}
                    onChange={(event) => setKarriCardHolderName(event.currentTarget.value)}
                  />
                </WizardFieldWrapper>
              </div>
            ) : (
              <div className="mb-6 rounded-[20px] border border-border bg-background p-4">
                <WizardFieldWrapper label="Bank name" htmlFor="bankName">
                  <WizardSelect
                    id="bankName"
                    name="bankName"
                    value={bankName}
                    onChange={(event) => setBankName(event.currentTarget.value)}
                  >
                    <option value="">Select a bank</option>
                    {SOUTH_AFRICAN_BANKS.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </WizardSelect>
                </WizardFieldWrapper>

                <div className="grid gap-3 md:grid-cols-2">
                  <WizardFieldWrapper label="Account number" htmlFor="bankAccountNumber">
                    <WizardTextInput
                      id="bankAccountNumber"
                      name="bankAccountNumber"
                      placeholder="Account number"
                      autoComplete="off"
                      inputMode="numeric"
                      enterKeyHint="next"
                      onChange={(event) =>
                        setHasBankAccountNumber(
                          event.currentTarget.value.trim().length > 0 ||
                            Boolean(defaultBankAccountLast4?.trim())
                        )
                      }
                    />
                    {defaultBankAccountLast4 ? (
                      <p className="mt-1.5 text-[11px] text-ink-soft">
                        Existing account saved (•••• {defaultBankAccountLast4}). Re-enter to update.
                      </p>
                    ) : null}
                  </WizardFieldWrapper>

                  <WizardFieldWrapper label="Branch code" htmlFor="bankBranchCode">
                    <WizardTextInput
                      id="bankBranchCode"
                      name="bankBranchCode"
                      placeholder="6-digit branch code"
                      inputMode="numeric"
                      enterKeyHint="next"
                      value={bankBranchCode}
                      onChange={(event) => setBankBranchCode(event.currentTarget.value)}
                    />
                  </WizardFieldWrapper>
                </div>

                <WizardFieldWrapper label="Account holder name" htmlFor="bankAccountHolder">
                  <WizardTextInput
                    id="bankAccountHolder"
                    name="bankAccountHolder"
                    placeholder="Account holder name"
                    autoCapitalize="words"
                    autoComplete="name"
                    enterKeyHint="next"
                    value={bankAccountHolder}
                    onChange={(event) => setBankAccountHolder(event.currentTarget.value)}
                  />
                </WizardFieldWrapper>
              </div>
            )}

            {payoutMethod === 'karri_card' ? (
              <>
                <input type="hidden" name="bankName" value="" />
                <input type="hidden" name="bankAccountNumber" value="" />
                <input type="hidden" name="bankBranchCode" value="" />
                <input type="hidden" name="bankAccountHolder" value="" />
              </>
            ) : (
              <>
                <input type="hidden" name="karriCardNumber" value="" />
                <input type="hidden" name="karriCardHolderName" value="" />
              </>
            )}

            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-ink-mid">
              Contact details
            </p>

            <WizardFieldWrapper label="Payout email" htmlFor="payoutEmail">
              <WizardTextInput
                id="payoutEmail"
                name="payoutEmail"
                type="email"
                placeholder="you@example.com"
                required
                inputMode="email"
                autoComplete="email"
                enterKeyHint="next"
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
              />
            </WizardFieldWrapper>

            <WizardFieldWrapper label="WhatsApp number" htmlFor="hostWhatsAppNumber">
              <WizardTextInput
                id="hostWhatsAppNumber"
                name="hostWhatsAppNumber"
                placeholder="e.g. +27821234567"
                required
                inputMode="tel"
                autoComplete="tel"
                enterKeyHint="done"
                value={whatsApp}
                onChange={(event) => setWhatsApp(event.currentTarget.value)}
              />
            </WizardFieldWrapper>

            <WizardFieldTip>
              Your financial details are encrypted end-to-end and stored securely.
            </WizardFieldTip>

            <WizardCTA
              backHref="/create/giving-back"
              submitLabel="Continue to review"
              pending={false}
              error={error}
            />
          </WizardFormCard>
        }
        right={
          <WizardPreviewPanel
            eyebrow="Preview"
            title="Payout summary"
            summaryLabel="Payout preview —"
          >
            <PayoutPreview
              payoutMethod={payoutMethod}
              hasMethodDetails={hasMethodDetails}
              hasEmail={hasEmail}
              hasWhatsApp={hasWhatsApp}
            />
          </WizardPreviewPanel>
        }
      />
    </form>
  );
}
