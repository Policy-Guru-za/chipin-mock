'use client';

import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import type { DashboardDetailViewModel } from '@/lib/host/dashboard-view-model';
import type { HostBirthdayMessageRow, HostContributionRow } from '@/lib/host/queries';

type DashboardPostCampaignClientProps = {
  view: DashboardDetailViewModel;
  contributions: HostContributionRow[];
  messages: HostBirthdayMessageRow[];
};

const DAY_MS = 24 * 60 * 60 * 1000;

const payoutDot: Record<string, { dotClass: string; textClass: string }> = {
  amber: { dotClass: 'bg-amber-500', textClass: 'text-amber-700' },
  blue: { dotClass: 'bg-blue-500', textClass: 'text-blue-700' },
  green: { dotClass: 'bg-green-500', textClass: 'text-green-700' },
  red: { dotClass: 'bg-red-500', textClass: 'text-red-700' },
};

const formatRelativeDate = (value: Date) => {
  const diffDays = Math.floor((Date.now() - value.getTime()) / DAY_MS);
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  return value.toLocaleDateString('en-ZA');
};

const escapeFileName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const triggerDownload = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

export function DashboardPostCampaignClient({
  view,
  contributions,
  messages,
}: DashboardPostCampaignClientProps) {
  const [downloadState, setDownloadState] = useState<{ messages: boolean; contributors: boolean }>({
    messages: false,
    contributors: false,
  });
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const downloadMessages = async () => {
    setDownloadState((state) => ({ ...state, messages: true }));
    setErrorToast(null);
    try {
      const response = await fetch(
        `/api/internal/downloads/birthday-messages?dreamBoardId=${encodeURIComponent(view.boardId)}`
      );
      if (!response.ok) throw new Error('failed');
      const blob = await response.blob();
      triggerDownload(blob, `${escapeFileName(view.childName)}-birthday-messages.pdf`);
    } catch {
      setErrorToast('Download failed. Please try again.');
    } finally {
      setDownloadState((state) => ({ ...state, messages: false }));
    }
  };

  const downloadContributors = async () => {
    setDownloadState((state) => ({ ...state, contributors: true }));
    setErrorToast(null);
    try {
      const response = await fetch(
        `/api/internal/downloads/contributor-list?dreamBoardId=${encodeURIComponent(view.boardId)}`
      );
      if (!response.ok) throw new Error('failed');
      const blob = await response.blob();
      triggerDownload(blob, `${escapeFileName(view.childName)}-contributors.csv`);
    } catch {
      setErrorToast('Download failed. Please try again.');
    } finally {
      setDownloadState((state) => ({ ...state, contributors: false }));
    }
  };

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <Link href="/dashboard" className="text-sm font-medium text-primary-700 hover:underline">
        ← Back to Dreamboards
      </Link>

      <article className="rounded-xl bg-white p-8 text-center shadow-sm">
        <p className="text-[40px] leading-none">🎉</p>
        <h1 className="mt-3 font-display text-3xl font-bold text-text">
          {view.childName}&apos;s Dreamboard is complete!
        </h1>
        <p className="mt-2 text-base text-gray-500">Campaign complete</p>
      </article>

      <article className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Financial Summary</h2>
        <div className="mt-4 space-y-3 text-base">
          <div className="flex items-center justify-between">
            <span>Total Raised</span>
            <span className="font-semibold">{view.raisedLabel}</span>
          </div>
          <div className="flex items-center justify-between text-gray-500">
            <span>Gifta Fee (3%)</span>
            <span>-{view.feeLabel}</span>
          </div>
          {view.charityEnabled ? (
            <div className="flex items-center justify-between text-gray-500">
              <span>Charity contribution</span>
              <span>-{view.charityLabel}</span>
            </div>
          ) : null}
          <hr className="border-gray-200" />
          <div className="rounded-lg bg-teal-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-lg font-bold text-text">Your Payout</span>
              <span className="font-display text-2xl font-bold text-teal-600">{view.payoutLabel}</span>
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Payout Status</h2>
        {view.payouts.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">Payout processing has not started yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {view.payouts.map((payout) => {
              const payoutColor = payoutDot[payout.statusVariant] ?? payoutDot.amber;
              return (
                <li key={payout.id} className="rounded-lg border border-gray-100 p-4">
                  <p className="text-base font-semibold text-text">{payout.typeLabel}</p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 rounded-full ${payoutColor.dotClass}`}
                    />
                    <span className={payoutColor.textClass}>{payout.statusLabel}</span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {payout.type === 'charity' ? 'via Charity' : `via ${view.payoutMethodLabel}`}
                  </p>
                  {payout.externalRef ? <p className="text-xs text-gray-400">Ref: {payout.externalRef}</p> : null}
                  {payout.completedLabel ? (
                    <p className="text-xs text-gray-400">Sent {payout.completedLabel}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>
        )}
      </article>

      <div className="flex flex-wrap gap-3">
        {view.messageCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={downloadMessages}
            loading={downloadState.messages}
            aria-label="Download birthday messages as PDF"
          >
            Download Birthday Messages
          </Button>
        ) : null}
        {view.contributionCount > 0 ? (
          <Button
            type="button"
            variant="outline"
            onClick={downloadContributors}
            loading={downloadState.contributors}
            aria-label="Download contributor list as CSV"
          >
            Download Contributor List
          </Button>
        ) : null}
      </div>
      {errorToast ? (
        <p aria-live="polite" className="rounded-md bg-subtle px-3 py-2 text-sm text-text">
          {errorToast}
        </p>
      ) : null}

      <article className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Contributions ({view.contributionCount})</h2>
        {contributions.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">No contributions yet</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {contributions.map((contribution) => (
              <li key={contribution.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-text">
                    {contribution.isAnonymous ? 'Anonymous' : contribution.contributorName || 'Anonymous'}
                  </p>
                  <p className="text-xs text-gray-400">{formatRelativeDate(contribution.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </article>

      <article className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Birthday Messages ({view.messageCount})</h2>
        {messages.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">No birthday messages yet</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {messages.map((item) => (
              <li key={item.id} className="rounded-lg border border-gray-100 p-4">
                <p className="text-sm font-semibold text-text">
                  {item.isAnonymous ? 'Anonymous' : item.contributorName || 'Anonymous'}
                </p>
                <p className="mt-2 text-sm text-gray-600">{item.message}</p>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
