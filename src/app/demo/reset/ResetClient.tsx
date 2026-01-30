'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

type ResetClientProps = {
  seededSlug: string;
};

type ResetStatus = 'idle' | 'submitting' | 'success' | 'error';

export function ResetClient({ seededSlug }: ResetClientProps) {
  const [status, setStatus] = useState<ResetStatus>('idle');
  const [message, setMessage] = useState<string | null>(null);

  const handleReset = async () => {
    setStatus('submitting');
    setMessage(null);

    try {
      const response = await fetch('/api/demo/reset', { method: 'POST' });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setStatus('error');
        setMessage(payload?.error ?? 'Failed to reset demo state.');
        return;
      }

      setStatus('success');
      setMessage('Demo reset complete.');
    } catch {
      setStatus('error');
      setMessage('Failed to reset demo state.');
    }
  };

  const seededHref = `/${seededSlug}`;

  return (
    <div className="space-y-4">
      {message ? (
        <p className={status === 'error' ? 'text-sm text-red-600' : 'text-sm text-emerald-700'}>
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Button type="button" onClick={handleReset} loading={status === 'submitting'}>
          {status === 'success' ? 'Reset again' : 'Reset demo'}
        </Button>

        {status === 'success' ? (
          <>
            <Button type="button" variant="outline" asChild>
              <Link href="/create">Go to create</Link>
            </Button>
            <Button type="button" variant="ghost" asChild>
              <Link href={seededHref}>View seeded board</Link>
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
