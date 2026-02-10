'use client';

import { useEffect } from 'react';

import { ErrorFallback } from '@/components/ui/ErrorFallback';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function HostError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorFallback
      heading="We couldn't load your dashboard"
      message="Something failed while loading your Dreamboard data. Please try again."
      reset={reset}
      homeHref="/dashboard"
      homeLabel="Go to dashboard"
    />
  );
}
