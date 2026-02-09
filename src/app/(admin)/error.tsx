'use client';

import { useEffect } from 'react';

import { ErrorFallback } from '@/components/ui/ErrorFallback';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorFallback
      heading="Admin page failed to load"
      message="Something went wrong while loading this admin view."
      reset={reset}
      homeHref="/admin"
      homeLabel="Go to admin dashboard"
    />
  );
}
