import { notFound } from 'next/navigation';

import { isDemoMode } from '@/lib/demo';
import { DEMO_SEEDED_BOARD_SLUG } from '@/lib/db/seed-demo';

import { ResetClient } from './ResetClient';

export default function DemoResetPage() {
  if (!isDemoMode()) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-border bg-white p-8 shadow-soft">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-text">Reset demo state</h1>
        <p className="text-sm text-text-muted">
          This resets the demo to a clean, deterministic state. No external services are called.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-subtle p-4 text-sm text-text">
        <p className="font-semibold text-text">What gets reset</p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-text-muted">
          <li>Demo KV cache</li>
          <li>Demo database seed</li>
        </ul>
      </div>

      <ResetClient seededSlug={DEMO_SEEDED_BOARD_SLUG} />
    </div>
  );
}
