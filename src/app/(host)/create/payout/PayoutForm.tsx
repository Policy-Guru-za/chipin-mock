'use client';

import { useState } from 'react';

import { PayoutPreview } from '@/app/(host)/create/payout/PayoutPreview';
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
import { cn } from '@/lib/utils';

type PayoutMethod = 'karri_card' | 'bank';

type PayoutFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultPayoutMethod?: PayoutMethod;
  defaultEmail?: string;
  defaultWhatsApp?: string;
  defaultKarriCardHolderName?: string;
  defaultHasKarriCard?: boolean;
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

const payoutMethodCardClassName =
  'wizard-interactive relative flex flex-1 cursor-pointer flex-col gap-3 rounded-[20px] border-[1.5px] px-5 py-4 text-left transition-all duration-200';

function MethodIcon({ payoutMethod }: { payoutMethod: PayoutMethod }) {
  if (payoutMethod === 'karri_card') {
    return (
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
    );
  }

  return (
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
  );
}

export function PayoutForm({
  action,
  defaultPayoutMethod = 'bank',
  defaultEmail,
  defaultWhatsApp,
  defaultKarriCardHolderName,
  defaultHasKarriCard = false,
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
  const [hasKarriCardNumber, setHasKarriCardNumber] = useState(defaultHasKarriCard);
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
            <WizardEyebrow>Step 4</WizardEyebrow>
            <WizardPanelTitle variant="form">Choose your payout destination</WizardPanelTitle>
            <p className="mb-7 text-[13px] font-light leading-relaxed text-ink-soft">
              Pick the route that feels best for you. We&apos;ll only keep the details for the
              option you select when this Dreamboard closes.
            </p>

            <fieldset className="mb-6">
              <legend className="sr-only">Payout method</legend>

              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={cn(
                    payoutMethodCardClassName,
                    payoutMethod === 'bank'
                      ? 'border-primary bg-sage-wash text-text shadow-[0_12px_32px_rgba(74,126,102,0.08)]'
                      : 'border-border bg-background text-ink-soft hover:border-primary/50 hover:bg-bg-warmth',
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

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-primary">
                      <MethodIcon payoutMethod="bank" />
                      <span className="text-sm font-semibold text-text">Bank account</span>
                    </div>
                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sage-deep">
                      Default
                    </span>
                  </div>

                  <p className="text-[12px] leading-relaxed text-ink-soft">
                    A calm, familiar payout route for hosts who want funds settled into their main
                    account.
                  </p>
                </label>

                <label
                  className={cn(
                    payoutMethodCardClassName,
                    payoutMethod === 'karri_card'
                      ? 'border-primary bg-sage-wash text-text shadow-[0_12px_32px_rgba(74,126,102,0.08)]'
                      : 'border-border bg-background text-ink-soft hover:border-primary/50 hover:bg-bg-warmth',
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

                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-primary">
                      <MethodIcon payoutMethod="karri_card" />
                      <span className="text-sm font-semibold text-text">Karri Card</span>
                    </div>
                    <span className="rounded-full bg-white/80 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-sage-deep">
                      Fast payout
                    </span>
                  </div>

                  <p className="text-[12px] leading-relaxed text-ink-soft">
                    Use your Karri Card if you&apos;d like the payout routed straight to a card instead
                    of a bank account.
                  </p>
                </label>
              </div>
            </fieldset>

            {payoutMethod === 'karri_card' ? (
              <div className="mb-6 rounded-[22px] border border-border bg-background p-5">
                <div className="mb-4 space-y-1">
                  <p className="text-sm font-semibold text-text">Karri Card details</p>
                  <p className="text-[12px] leading-relaxed text-ink-soft">
                    We&apos;ll use this card for your payout when the Dreamboard closes.
                  </p>
                </div>

                <WizardFieldWrapper label="Card number" htmlFor="karriCardNumber">
                  <WizardTextInput
                    id="karriCardNumber"
                    name="karriCardNumber"
                    placeholder="XXXX XXXX XXXX XXXX"
                    autoComplete="off"
                    inputMode="numeric"
                    onChange={(event) =>
                      setHasKarriCardNumber(
                        event.currentTarget.value.trim().length > 0 || defaultHasKarriCard
                      )
                    }
                  />
                  {defaultHasKarriCard ? (
                    <p className="mt-1.5 text-[11px] text-ink-soft">
                      A saved Karri Card is already on file. Re-enter it only if you want to
                      change cards.
                    </p>
                  ) : null}
                </WizardFieldWrapper>

                <WizardFieldWrapper label="Card holder name" htmlFor="karriCardHolderName">
                  <WizardTextInput
                    id="karriCardHolderName"
                    name="karriCardHolderName"
                    placeholder="Name on card"
                    autoCapitalize="words"
                    value={karriCardHolderName}
                    onChange={(event) => setKarriCardHolderName(event.currentTarget.value)}
                  />
                </WizardFieldWrapper>
              </div>
            ) : (
              <div className="mb-6 rounded-[22px] border border-border bg-background p-5">
                <div className="mb-4 space-y-1">
                  <p className="text-sm font-semibold text-text">Bank payout details</p>
                  <p className="text-[12px] leading-relaxed text-ink-soft">
                    Add the account that should receive the funds after the campaign ends.
                  </p>
                </div>

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
                      onChange={(event) =>
                        setHasBankAccountNumber(
                          event.currentTarget.value.trim().length > 0 ||
                            Boolean(defaultBankAccountLast4?.trim())
                        )
                      }
                    />
                    {defaultBankAccountLast4 ? (
                      <p className="mt-1.5 text-[11px] text-ink-soft">
                        Existing account saved (•••• {defaultBankAccountLast4}). Re-enter it only
                        if you want to update the account.
                      </p>
                    ) : null}
                  </WizardFieldWrapper>

                  <WizardFieldWrapper label="Branch code" htmlFor="bankBranchCode">
                    <WizardTextInput
                      id="bankBranchCode"
                      name="bankBranchCode"
                      placeholder="6-digit branch code"
                      inputMode="numeric"
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

            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-mid">
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
              Sensitive payout details are encrypted before they are saved, and switching routes
              clears the inactive option from this draft.
            </WizardFieldTip>

            <WizardCTA
              backHref="/create/dates"
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
            summaryLabel={payoutMethod === 'bank' ? 'Bank payout preview —' : 'Karri payout preview —'}
          >
            <PayoutPreview
              payoutMethod={payoutMethod}
              hasMethodDetails={hasMethodDetails}
              hasEmail={hasEmail}
              hasWhatsApp={hasWhatsApp}
              karriCardHolderName={karriCardHolderName}
              hasSavedKarriCard={defaultHasKarriCard}
              bankName={bankName}
              bankAccountHolder={bankAccountHolder}
              bankAccountLast4={defaultBankAccountLast4}
            />
          </WizardPreviewPanel>
        }
      />
    </form>
  );
}
