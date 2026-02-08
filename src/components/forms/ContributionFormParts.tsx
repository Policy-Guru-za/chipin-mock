'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { CheckIcon, CopyIcon } from '@/components/icons';
import { trackSnapscanQrShown, trackSnapscanReferenceCopied } from '@/lib/analytics/metrics';
import { formatZarWithCents } from '@/lib/utils/money';

export type SnapScanQr = {
  qrUrl: string;
  qrImageUrl: string;
  reference: string;
};

type SnapScanPanelProps = {
  qr: SnapScanQr;
  slug: string;
  dreamBoardId?: string;
  onBack: () => void;
};

export const SnapScanPanel = ({ qr, slug, dreamBoardId, onBack }: SnapScanPanelProps) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    trackSnapscanQrShown(dreamBoardId);
  }, [dreamBoardId]);

  useEffect(() => {
    if (!copied) return;
    const timeout = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timeout);
  }, [copied]);

  const handleCopyReference = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(qr.reference);
      setCopied(true);
      trackSnapscanReferenceCopied(qr.reference);
    } catch {
      // Clipboard API may fail on some browsers.
    }
  }, [qr.reference]);

  return (
    <div className="rounded-3xl border border-border bg-white p-6 text-center">
      <p className="text-sm font-semibold text-text">Scan to pay with SnapScan</p>
      <p className="mt-2 text-sm text-text-muted">
        Open your SnapScan app and scan the QR code to complete the payment.
      </p>

      <div className="mt-4 flex flex-col items-center gap-4">
        <Image
          src={qr.qrImageUrl}
          alt="SnapScan QR code"
          width={256}
          height={256}
          className="h-64 w-64"
        />

        <div className="flex items-center gap-2">
          <span className="text-xs text-text-muted">Reference:</span>
          <code className="rounded bg-subtle px-2 py-1 text-xs font-mono text-text">{qr.reference}</code>
          <button
            type="button"
            onClick={handleCopyReference}
            className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-primary hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Copy reference"
          >
            {copied ? (
              <>
                <CheckIcon size="sm" className="text-success" />
                <span className="text-success">Copied</span>
              </>
            ) : (
              <>
                <CopyIcon size="sm" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <a href={qr.qrUrl} className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
          Open SnapScan app
        </a>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href={`/${slug}/thanks?ref=${qr.reference}&provider=snapscan`}>
          <Button>Check payment status</Button>
        </Link>
        <Button type="button" variant="outline" onClick={onBack}>
          Choose another method
        </Button>
      </div>
    </div>
  );
};

type PaymentSummaryProps = {
  contributionCents: number;
  feeCents: number;
  totalCents: number;
};

export const PaymentSummary = ({ contributionCents, feeCents, totalCents }: PaymentSummaryProps) => (
  <div className="rounded-2xl border border-border bg-white p-4 text-sm text-text">
    <div className="flex items-center justify-between">
      <span>Contribution</span>
      <span>{formatZarWithCents(contributionCents)}</span>
    </div>
    <div className="mt-2 flex items-center justify-between text-text-muted">
      <span>Gifta fee (3%)</span>
      <span>{formatZarWithCents(feeCents)}</span>
    </div>
    <div className="mt-3 flex items-center justify-between border-t border-border pt-3 font-semibold">
      <span>Total</span>
      <span>{formatZarWithCents(totalCents)}</span>
    </div>
  </div>
);
