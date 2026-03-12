'use client';

import { useState } from 'react';

import {
  WizardCTA,
  WizardFieldTip,
  WizardFieldWrapper,
  WizardFormCard,
  WizardPanelTitle,
  WizardPreviewPanel,
  WizardSplitLayout,
  WizardTextInput,
} from '@/components/create-wizard';

type VoucherFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  defaultEmail?: string;
  defaultWhatsApp?: string;
  error: string | null;
};

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={
          done
            ? 'flex h-5 w-5 items-center justify-center rounded-full bg-sage-light text-primary'
            : 'flex h-5 w-5 items-center justify-center rounded-full bg-border-soft text-ink-faint'
        }
        aria-hidden="true"
      >
        {done ? (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="4" />
          </svg>
        )}
      </span>
      <span className="text-[13px] text-ink-mid">{label}</span>
    </div>
  );
}

function VoucherPreview({
  hasEmail,
  hasWhatsApp,
}: {
  hasEmail: boolean;
  hasWhatsApp: boolean;
}) {
  return (
    <div className="flex flex-col gap-6 rounded-[20px] border border-border bg-background p-7">
      <section className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-ghost">
          Delivery plan
        </p>
        <div className="rounded-xl bg-sage-wash p-[14px]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-primary" aria-hidden="true">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 8a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8" />
                <path d="m3 8 7.89 5.26a2 2 0 0 0 2.22 0L21 8" />
                <path d="M19 16v6" />
                <path d="M16 19h6" />
              </svg>
            </span>
            <div>
              <p className="text-[14px] font-semibold text-text">Takealot voucher</p>
              <p className="text-[11px] text-ink-soft">
                Placeholder only for now. We&apos;ll use your contact details when delivery goes
                live.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-ghost">
          Setup progress
        </p>
        <div className="space-y-2.5">
          <ChecklistItem label="Takealot voucher placeholder selected" done />
          <ChecklistItem label="Payout email provided" done={hasEmail} />
          <ChecklistItem label="WhatsApp number added" done={hasWhatsApp} />
        </div>
      </section>

      <section className="rounded-xl bg-sage-light p-4">
        <div className="flex items-start gap-3">
          <span className="text-primary" aria-hidden="true">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3l7 4v5c0 4.5-2.9 7.7-7 9-4.1-1.3-7-4.5-7-9V7l7-4z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </span>
          <div>
            <p className="text-[13px] font-semibold text-sage-deep">No banking setup here</p>
            <p className="text-[11px] text-ink-soft">
              Email and WhatsApp only. Voucher fulfilment stays manual until the delivery flow
              exists.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export function VoucherForm({
  action,
  defaultEmail,
  defaultWhatsApp,
  error,
}: VoucherFormProps) {
  const [email, setEmail] = useState(defaultEmail ?? '');
  const [whatsApp, setWhatsApp] = useState(defaultWhatsApp ?? '');

  return (
    <form action={action}>
      <WizardSplitLayout
        mobileOrder="right-first"
        left={
          <WizardFormCard>
            <WizardPanelTitle variant="form">Voucher contact details</WizardPanelTitle>
            <p className="mb-7 text-[13px] font-light leading-relaxed text-ink-soft">
              Takealot voucher delivery isn&apos;t live yet. Share the best email and WhatsApp
              number so we can reach you when this Dreamboard closes.
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
              This step is a placeholder. No bank account or card details are needed in the default
              Dreamboard flow.
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
            title="Voucher placeholder"
            summaryLabel="Voucher plan —"
          >
            <VoucherPreview
              hasEmail={email.trim().length > 0}
              hasWhatsApp={whatsApp.trim().length > 0}
            />
          </WizardPreviewPanel>
        }
      />
    </form>
  );
}
