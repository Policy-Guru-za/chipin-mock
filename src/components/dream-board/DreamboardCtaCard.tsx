import Link from 'next/link';

import { LockIcon } from '@/components/icons/dreamboard-icons';
import { STITCH_COMING_SOON_COPY } from '@/lib/payments/copy';

type DreamboardCtaCardProps = {
  slug: string;
  childName: string;
  stateMessage: string;
  disabled: boolean;
};

type CtaStateMessageInput = {
  contributionCount: number;
  isFunded: boolean;
  isExpired: boolean;
  isClosed: boolean;
  timeRemainingMessage: string;
};

export const buildDreamboardCtaStateMessage = ({
  isFunded,
  isExpired,
  isClosed,
}: CtaStateMessageInput) => {
  if (isExpired || isClosed) {
    return 'This Dreamboard is closed to new contributions.';
  }

  if (isFunded) {
    return 'This Dreamboard has already hit its goal.';
  }

  return STITCH_COMING_SOON_COPY.body;
};

export function DreamboardCtaCard({ slug, childName, stateMessage, disabled }: DreamboardCtaCardProps) {
  return (
    <section className="rounded-[20px] border border-border-soft bg-white p-5 shadow-card sm:p-6">
      <h2 className="font-warmth-serif text-[1.45rem] leading-tight text-ink">
        {disabled ? 'This Dreamboard is closed' : STITCH_COMING_SOON_COPY.badge}
      </h2>
      <p className="mt-2 font-warmth-sans text-sm leading-relaxed text-ink-soft">{stateMessage}</p>
      {disabled ? (
        <p className="mt-4 rounded-xl bg-ink/5 px-4 py-3 font-warmth-sans text-sm text-ink-soft">
          Contributions are no longer being accepted.
        </p>
      ) : (
        <Link
          href={`/${slug}/contribute?source=dream-board`}
          className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-sage px-4 py-3 text-center font-warmth-sans text-sm font-semibold text-white transition hover:bg-sage-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage focus-visible:ring-offset-2"
        >
          View {childName}&apos;s contribution update
        </Link>
      )}
      <p className="mt-3 inline-flex items-center gap-1.5 font-warmth-sans text-xs text-ink-faint">
        <LockIcon className="h-3.5 w-3.5" />
        {STITCH_COMING_SOON_COPY.trust}
      </p>
    </section>
  );
}
