'use client';

import { useEffect } from 'react';

import { ErrorFallback } from '@/components/ui/ErrorFallback';

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GuestError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorFallback
      heading="We couldn't load this Dreamboard"
      message="Something went wrong while loading this page. Please try again."
      reset={reset}
      homeHref="/"
      homeLabel="Go home"
    />
  );
}
