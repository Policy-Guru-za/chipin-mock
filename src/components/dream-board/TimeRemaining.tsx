'use client';

import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { TimeRemainingUrgency } from '@/lib/dream-boards/view-model';

type TimeRemainingProps = {
  message: string;
  urgency: TimeRemainingUrgency;
  daysLeft?: number;
};

export function TimeRemaining({ message, urgency, daysLeft }: TimeRemainingProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseClass = 'rounded-2xl px-4 py-3 font-display';
  const urgencyClass = {
    relaxed: 'text-[18px] font-bold text-gray-900',
    moderate: 'text-[18px] font-bold text-gray-900',
    urgent: cn('text-[16px] font-semibold text-[#C4785A]', daysLeft && daysLeft <= 3 && 'bg-orange-50'),
    critical: cn(
      'bg-orange-50 text-[20px] font-bold text-[#C4785A]',
      !prefersReducedMotion && 'animate-pulse'
    ),
    expired: 'text-base italic text-gray-500',
  } satisfies Record<TimeRemainingUrgency, string>;

  return (
    <section aria-live="polite" className={cn(baseClass, urgencyClass[urgency])}>
      <h2 className="sr-only">Time remaining</h2>
      <p>{message}</p>
    </section>
  );
}
