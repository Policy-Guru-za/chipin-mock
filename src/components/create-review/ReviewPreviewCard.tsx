import Image from 'next/image';

import { CopyIcon } from '@/components/icons';
import { ReviewDetailRows } from '@/components/create-review/ReviewDetailRows';

type ReviewPreviewCardProps = {
  childName: string;
  childAge: number;
  childPhotoUrl: string;
  birthdayLabel: string;
  giftName: string;
  giftImageUrl: string;
  partyDateTimeLabel?: string | null;
  campaignCloseLabel: string;
  payoutSummary: string;
  charitySummary: string;
  shareUrl?: string;
  copied?: boolean;
  onCopyShareUrl?: () => void;
};

const REVIEW_GIFT_ICON_SRC = '/Logos/Original.png';

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className={className}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}

export function ReviewPreviewCard({
  childName,
  childAge,
  childPhotoUrl,
  birthdayLabel,
  giftName,
  giftImageUrl: _giftImageUrl,
  partyDateTimeLabel,
  campaignCloseLabel,
  payoutSummary,
  charitySummary,
  shareUrl,
  copied = false,
  onCopyShareUrl,
}: ReviewPreviewCardProps) {
  const showShareRow = Boolean(shareUrl && onCopyShareUrl);

  return (
    <article className="overflow-hidden rounded-[28px] border border-border-warmth bg-white shadow-lifted">
      <div className="border-b border-border-soft bg-[linear-gradient(135deg,#F1F7F4_0%,#FBF8F3_52%,#F7EFE2_100%)] px-6 py-7 sm:px-9">
        <div className="flex items-center gap-4 sm:gap-5">
          <div className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-full shadow-[0_0_0_3px_white,0_2px_12px_rgba(74,126,102,0.15)]">
            <Image
              src={childPhotoUrl}
              alt={`${childName}'s photo`}
              width={72}
              height={72}
              className="h-full w-full object-cover object-[center_15%]"
            />
          </div>

          <div className="min-w-0">
            <h2 className="font-warmth-serif text-2xl leading-tight text-ink sm:text-[28px]">
              {childName} turns {childAge}!
            </h2>
            <p className="mt-1 text-sm text-ink-soft">Birthday: {birthdayLabel}</p>
          </div>
        </div>
      </div>

      <div className="px-6 py-5 sm:px-9 sm:py-6">
        <div className="mb-5 flex items-center gap-4 rounded-2xl border border-border-soft bg-bg-warmth px-4 py-3">
          <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-sage-light">
            <Image
              src={REVIEW_GIFT_ICON_SRC}
              alt={giftName}
              fill
              sizes="64px"
              className="object-contain p-[4px]"
            />
          </div>
          <p className="text-lg font-semibold text-ink">{giftName}</p>
        </div>

        <ReviewDetailRows
          giftName={giftName}
          partyDateTimeLabel={partyDateTimeLabel}
          campaignCloseLabel={campaignCloseLabel}
          payoutSummary={payoutSummary}
          charitySummary={charitySummary}
        />
      </div>

      {showShareRow ? (
        <div className="mx-6 mb-6 flex items-center gap-3 rounded-[14px] border border-border-soft bg-muted px-3 py-3 sm:mx-9">
          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-[7px] bg-white text-sage">
            <LinkIcon className="h-3.5 w-3.5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-ink-faint">
              Shareable link
            </p>
            <p className="truncate font-mono text-xs text-ink-mid sm:text-sm">{shareUrl}</p>
          </div>
          <button
            type="button"
            onClick={onCopyShareUrl}
            className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-3 py-1.5 text-xs font-medium text-ink-mid transition hover:border-sage hover:text-sage"
          >
            <CopyIcon className="h-3.5 w-3.5" />
            {copied ? 'Copied! ✓' : 'Copy'}
          </button>
        </div>
      ) : null}
    </article>
  );
}
