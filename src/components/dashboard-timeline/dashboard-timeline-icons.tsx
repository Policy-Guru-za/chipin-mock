import { cn } from '@/lib/utils';

type TimelineIconProps = {
  className?: string;
};

export function TimelineBoltIcon({ className }: TimelineIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-3.5 w-3.5', className)}
    >
      <path d="M13 2 4 14h7l-1 8 10-12h-7l0-8z" />
    </svg>
  );
}

export function TimelineCheckIcon({ className }: TimelineIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-3.5 w-3.5', className)}
    >
      <path d="m20 6-11 11-5-5" />
    </svg>
  );
}

export function TimelinePlusIcon({ className }: TimelineIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      className={cn('h-3.5 w-3.5', className)}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function TimelineChevronRightIcon({ className }: TimelineIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-4 w-4', className)}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export function TimelineShareIcon({ className }: TimelineIconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-3.5 w-3.5', className)}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4" />
      <path d="m15.4 6.5-6.8 4" />
    </svg>
  );
}
