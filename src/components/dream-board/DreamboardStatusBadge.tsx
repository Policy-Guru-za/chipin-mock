import type { TimeRemainingUrgency } from '@/lib/dream-boards/view-model';

type DreamboardStatusBadgeProps = {
  contributionCount: number;
  isActive: boolean;
  isClosed: boolean;
  isExpired: boolean;
  timeRemainingMessage: string;
  timeRemainingUrgency: TimeRemainingUrgency;
  daysLeft: number;
};

const urgencyClass: Record<TimeRemainingUrgency, string> = {
  relaxed: 'text-gray-600',
  moderate: 'text-gray-700',
  urgent: 'text-[#C4785A]',
  critical: 'text-[#C4785A]',
  expired: 'text-gray-500',
};

export function DreamboardStatusBadge({
  contributionCount,
  isActive,
  isClosed,
  isExpired,
  timeRemainingMessage,
  timeRemainingUrgency,
  daysLeft,
}: DreamboardStatusBadgeProps) {
  const isFunded = !isActive && !isClosed && !isExpired;

  const headline = isClosed || isExpired
    ? 'This Dreamboard is closed to new contributions.'
    : isFunded
      ? 'Gift funded - thank you, everyone! 🎉'
      : contributionCount > 0
        ? 'Contributions are coming in! 🎁'
        : 'Be the first to chip in! 🎁';

  const emoji = isClosed || isExpired ? '🔒' : isFunded ? '🎉' : '🎁';
  const showTime = !isClosed && !isExpired;

  return (
    <section className="rounded-2xl border border-border bg-white p-5 text-center">
      <p className="text-2xl" aria-hidden="true">
        {emoji}
      </p>
      <h2 className="mt-2 font-display text-lg text-gray-900">{headline}</h2>
      {showTime ? (
        <p className={`mt-2 text-sm ${urgencyClass[timeRemainingUrgency]}`}>
          {timeRemainingMessage}
          {daysLeft > 0 && timeRemainingUrgency !== 'relaxed' ? ` (${daysLeft} day${daysLeft === 1 ? '' : 's'} left)` : ''}
        </p>
      ) : null}
    </section>
  );
}
