'use client';

import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { STITCH_COMING_SOON_COPY } from '@/lib/payments/copy';

type ContributeDetailsClientProps = {
  slug: string;
  childName: string;
};

export function ContributeDetailsClient({ slug, childName }: ContributeDetailsClientProps) {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <div className="rounded-[28px] border border-border bg-white p-6 shadow-soft sm:p-8">
        <Link
          href={`/${slug}`}
          className="inline-flex min-h-11 items-center text-sm text-primary-700 hover:underline"
        >
          ← Back to Dreamboard
        </Link>

        <div className="mt-5 space-y-4">
          <p className="inline-flex rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">
            {STITCH_COMING_SOON_COPY.badge}
          </p>

          <div className="space-y-3">
            <h1 className="font-display text-3xl text-text sm:text-4xl">
              {STITCH_COMING_SOON_COPY.title}
            </h1>
            <p className="text-base text-gray-700">
              We&apos;re getting Stitch-powered contributions ready for {childName}&apos;s Dreamboard.
              Online payments are not available yet.
            </p>
            <p className="text-sm text-gray-600">{STITCH_COMING_SOON_COPY.detail}</p>
          </div>

          <Button asChild className="min-h-11 w-full sm:w-auto">
            <Link href={`/${slug}`}>Return to Dreamboard</Link>
          </Button>

          <p className="text-xs text-text-muted">{STITCH_COMING_SOON_COPY.trust}</p>
        </div>
      </div>
    </section>
  );
}
