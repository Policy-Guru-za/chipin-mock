import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main id="main-content" className="flex min-h-screen items-center justify-center bg-surface px-6 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-8 text-center shadow-soft">
        <p className="text-2xl" aria-hidden="true">
          🎁
        </p>
        <p className="mt-1 text-sm font-semibold uppercase tracking-[0.12em] text-text-secondary">Gifta</p>
        <h1 className="mt-3 font-display text-3xl text-text">Page not found</h1>
        <p className="mt-3 text-sm text-text-secondary">
          We couldn&apos;t find the page you&apos;re looking for.
        </p>
        <div className="mt-6">
          <Link href="/" className={buttonVariants({ variant: 'primary', size: 'md' })}>
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}
