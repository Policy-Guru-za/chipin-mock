'use client';

type PayoutPreviewProps = {
  payoutMethod: 'karri_card' | 'bank';
  hasMethodDetails: boolean;
  hasEmail: boolean;
  hasWhatsApp: boolean;
};

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={done ? 'flex h-5 w-5 items-center justify-center rounded-full bg-sage-light text-primary' : 'flex h-5 w-5 items-center justify-center rounded-full bg-border-soft text-ink-faint'}
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

export function PayoutPreview({
  payoutMethod,
  hasMethodDetails,
  hasEmail,
  hasWhatsApp,
}: PayoutPreviewProps) {
  const isKarri = payoutMethod === 'karri_card';

  return (
    <div className="flex flex-col gap-6 rounded-[20px] border border-border bg-background p-7">
      <section className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-ghost">
          Selected method
        </p>
        <div className="rounded-xl bg-sage-wash p-[14px]">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-primary" aria-hidden="true">
              {isKarri ? (
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
                  <rect x="3" y="6" width="18" height="12" rx="2" />
                  <path d="M3 10h18" />
                </svg>
              ) : (
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
                  <path d="M3 6h18M3 10h18M7 14h10M3 18h18" />
                </svg>
              )}
            </span>
            <div>
              <p className="text-[14px] font-semibold text-text">
                {isKarri ? 'Karri Card' : 'Bank Transfer'}
              </p>
              <p className="text-[11px] text-ink-soft">
                {isKarri ? 'Instant payout to your card' : 'Transfer to your bank account'}
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
          <ChecklistItem label="Payout method selected" done />
          <ChecklistItem
            label={isKarri ? 'Card details entered' : 'Bank details entered'}
            done={hasMethodDetails}
          />
          <ChecklistItem label="Contact email provided" done={hasEmail} />
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
            <p className="text-[13px] font-semibold text-sage-deep">256-bit encrypted</p>
            <p className="text-[11px] text-ink-soft">Your details are protected</p>
          </div>
        </div>
      </section>
    </div>
  );
}
