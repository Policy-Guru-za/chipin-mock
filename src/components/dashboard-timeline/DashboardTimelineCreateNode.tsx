import Link from 'next/link';

import { TimelinePlusIcon } from '@/components/dashboard-timeline/dashboard-timeline-icons';

export function DashboardTimelineCreateNode() {
  return (
    <div className="relative mb-6">
      <div
        aria-hidden="true"
        className="absolute -left-10 top-5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-dashed border-border bg-bg-warmth text-ink-ghost"
      >
        <TimelinePlusIcon />
      </div>

      <Link
        href="/create"
        prefetch={false}
        className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-border px-6 py-5 text-ink-ghost transition hover:border-sage hover:bg-sage-wash hover:text-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-700"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-inherit shadow-sm">
          <TimelinePlusIcon />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold">Create another Dreamboard</span>
          <span className="block text-xs">Start a new gift campaign for an upcoming celebration</span>
        </span>
      </Link>
    </div>
  );
}
