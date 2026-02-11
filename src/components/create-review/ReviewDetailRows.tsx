import type { ReactNode } from 'react';

import { GiftIcon, HeartIcon, WalletIcon } from '@/components/icons';
import { CalendarIcon } from '@/components/icons/dreamboard-icons';

type ReviewDetailRowsProps = {
  giftName: string;
  partyDateTimeLabel?: string | null;
  campaignCloseLabel: string;
  payoutSummary: string;
  charitySummary: string;
};

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5v5l3 1.8" />
    </svg>
  );
}

function Row({
  icon,
  iconContainerClassName,
  label,
  value,
}: {
  icon: ReactNode;
  iconContainerClassName: string;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
      <div
        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] ${iconContainerClassName}`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
          {label}
        </p>
        <p className="text-sm text-ink-mid">{value}</p>
      </div>
    </div>
  );
}

export function ReviewDetailRows({
  giftName,
  partyDateTimeLabel,
  campaignCloseLabel,
  payoutSummary,
  charitySummary,
}: ReviewDetailRowsProps) {
  return (
    <div>
      <div className="border-b border-border-soft">
        <Row
          icon={<GiftIcon className="h-4 w-4 text-plum" />}
          iconContainerClassName="bg-plum-wash"
          label="Dream gift"
          value={giftName}
        />
      </div>

      {partyDateTimeLabel ? (
        <div className="border-b border-border-soft">
          <Row
            icon={<CalendarIcon className="h-4 w-4 text-amber" />}
            iconContainerClassName="bg-amber-light"
            label="Birthday party"
            value={partyDateTimeLabel}
          />
        </div>
      ) : null}

      <div className="border-b border-border-soft">
        <Row
          icon={<ClockIcon className="h-4 w-4 text-sage" />}
          iconContainerClassName="bg-sage-light"
          label="Campaign closes"
          value={campaignCloseLabel}
        />
      </div>

      <div className="border-b border-border-soft">
        <Row
          icon={<WalletIcon className="h-4 w-4 text-ink-faint" />}
          iconContainerClassName="bg-border-soft"
          label="Payout"
          value={payoutSummary}
        />
      </div>

      <Row
        icon={<HeartIcon className="h-4 w-4 text-sage" />}
        iconContainerClassName="bg-sage-light"
        label="Giving back"
        value={charitySummary}
      />
    </div>
  );
}
