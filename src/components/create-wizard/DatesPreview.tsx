'use client';

import { memo } from 'react';

import { formatBirthdayPartyLine } from '@/lib/dream-boards/party-visibility';
import { parseDateOnly } from '@/lib/utils/date';

export interface DatesPreviewProps {
  childName: string;
  childAge: number;
  birthdayDate: string;
  partyDate: string;
  partyDateTimeDate: string;
  partyDateTimeTime: string;
  campaignEndDate: string;
  campaignDays: number;
}

const formatDate = (dateString: string) => {
  const parsedDate = parseDateOnly(dateString);
  if (!parsedDate) {
    return 'Date to be confirmed';
  }

  const parsed = new Date(
    Date.UTC(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate())
  );

  return parsed.toLocaleDateString('en-ZA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
};

const toPartyDateTimeIso = (dateValue: string, timeValue: string) => {
  if (!dateValue) {
    return null;
  }

  const resolvedTime = timeValue || '12:00';
  const parsed = new Date(`${dateValue}T${resolvedTime}:00+02:00`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed.toISOString();
};

const getCountdownLabel = (campaignDays: number) => {
  const safeDays = Number.isFinite(campaignDays) ? Math.max(0, Math.round(campaignDays)) : 0;

  if (safeDays === 0) {
    return 'Campaign closes today';
  }

  if (safeDays === 1) {
    return 'Campaign closes in 1 day';
  }

  return `Campaign closes in ${safeDays} days`;
};

function DatesPreviewComponent({
  childName,
  childAge,
  birthdayDate,
  partyDate,
  partyDateTimeDate,
  partyDateTimeTime,
  campaignEndDate,
  campaignDays,
}: DatesPreviewProps) {
  const displayName = childName.trim() || 'Your child';
  const ageText = childAge > 0 ? `${childAge}` : '?';
  const birthdayLabel = formatDate(birthdayDate);
  const partyDateTime = toPartyDateTimeIso(partyDateTimeDate, partyDateTimeTime);
  const partyLine = formatBirthdayPartyLine({
    birthdayDate,
    partyDate,
    partyDateTime,
  });
  const campaignEndDateLabel = formatDate(campaignEndDate);
  const countdownLabel = getCountdownLabel(campaignDays);

  return (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--bg)] p-7 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-5xl shadow-[0_2px_8px_rgba(44,37,32,0.06)]"
        aria-hidden="true"
      >
        🎂
      </div>

      <h4 className="font-serif text-[22px] font-bold text-ink">{`${displayName} turns ${ageText}!`}</h4>
      <p className="text-sm text-ink-soft">{birthdayLabel}</p>
      <div className="h-px w-full bg-border" />

      {partyLine ? (
        <p className="text-[13px] font-medium text-ink-mid">{`🎈 Party day · ${partyLine}`}</p>
      ) : null}

      <div className="mt-1 inline-flex items-center gap-1.5 rounded-[20px] bg-sage-wash px-3 py-2 text-xs font-medium text-sage-deep">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{countdownLabel}</span>
      </div>

      <div className="mt-2 flex w-full items-center justify-between border-t border-border pt-5">
        <div className="flex flex-1 flex-col items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-[11px] font-medium text-ink-soft">Today</span>
        </div>

        <span className="mt-[-16px] h-px flex-1 bg-border-soft" aria-hidden="true" />

        <div className="flex flex-1 flex-col items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-[11px] font-medium text-ink-soft">Birthday</span>
        </div>

        <span className="mt-[-16px] h-px flex-1 bg-border-soft" aria-hidden="true" />

        <div className="flex flex-1 flex-col items-center gap-2" aria-label={`Closes on ${campaignEndDateLabel}`}>
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-[11px] font-medium text-ink-soft">Closes</span>
        </div>
      </div>
    </div>
  );
}

export const DatesPreview = memo(DatesPreviewComponent);
DatesPreview.displayName = 'DatesPreview';
