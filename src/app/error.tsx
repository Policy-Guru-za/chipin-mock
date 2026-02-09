'use client';

import { useEffect } from 'react';

import { ErrorFallback } from '@/components/ui/ErrorFallback';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main-content">
      <ErrorFallback reset={reset} />
    </main>
  );
}
