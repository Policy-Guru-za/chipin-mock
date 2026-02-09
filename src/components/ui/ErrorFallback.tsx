'use client';

import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

interface ErrorFallbackProps {
  heading?: string;
  message?: string;
  reset: () => void;
  homeHref?: string;
  homeLabel?: string;
}

export function ErrorFallback({
  heading = 'Something went wrong',
  message = "We hit a snag loading this page. Please try again.",
  reset,
  homeHref = '/',
  homeLabel = 'Go home',
}: ErrorFallbackProps) {
  return (
    <section className="flex min-h-[60vh] items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 text-center shadow-soft sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-secondary">Gifta</p>
        <h1 className="mt-2 font-display text-3xl text-text">{heading}</h1>
        <p className="mt-3 text-sm text-text-secondary">{message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={reset}
            className={buttonVariants({ variant: 'primary', size: 'md' })}
          >
            Try again
          </button>
          <Link href={homeHref} className={buttonVariants({ variant: 'outline', size: 'md' })}>
            {homeLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
