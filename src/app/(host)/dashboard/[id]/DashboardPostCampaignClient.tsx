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

const contributorAvatarTones = [
  'bg-sage-light text-sage',
  'bg-amber-light text-amber',
  'bg-primary-50 text-primary-700',
  'bg-plum-wash text-plum',
  'bg-[#FBE9E1] text-[#C4785A]',
];

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

const getContributorName = (name: string | null, isAnonymous: boolean) =>
  isAnonymous ? 'Anonymous' : name || 'Anonymous';

const getContributorInitials = (name: string) => {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  return initials || 'A';
};

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
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10 font-warmth-sans">
      <Link href="/dashboard" className="text-sm font-medium text-primary-700 hover:underline">
        ← Back to Dreamboards
      </Link>

      <article className="rounded-[14px] border border-border/60 bg-gradient-to-b from-white to-subtle p-8 text-center shadow-card">
        <p className="text-[40px] leading-none">🎉</p>
        <h1 className="mt-3 font-display text-[34px] font-bold leading-[1.12] tracking-[-0.02em] text-text">
          {view.childName}&apos;s Dreamboard is complete!
        </h1>
        <p className="mt-2 font-warmth-sans text-sm text-text-muted">Campaign complete</p>
      </article>

      <article className="rounded-[14px] border border-border/60 bg-white p-6 shadow-card">
        <h2 className="font-display text-[28px] font-bold tracking-[-0.01em] text-text">Financial Summary</h2>
        <div className="mt-4 space-y-3 font-warmth-sans text-[15px]">
          <div className="flex items-center justify-between">
            <span>Total Raised</span>
            <span className="font-semibold">{view.raisedLabel}</span>
          </div>
          <div className="flex items-center justify-between text-text-muted">
            <span>Gifta Fee (3%)</span>
            <span>-{view.feeLabel}</span>
          </div>
          {view.charityEnabled ? (
            <div className="flex items-center justify-between text-text-muted">
              <span>Charity contribution</span>
              <span>-{view.charityLabel}</span>
            </div>
          ) : null}
          <hr className="border-border" />
          <div className="rounded-lg bg-primary-50 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="font-display text-xl font-bold text-text">Your Payout</span>
              <span className="font-display text-[28px] font-bold text-sage">{view.payoutLabel}</span>
            </div>
          </div>
        </div>
      </article>

      <article className="rounded-[14px] border border-border/60 bg-white p-6 shadow-card">
        <h2 className="font-display text-[28px] font-bold tracking-[-0.01em] text-text">Payout Status</h2>
        {view.payouts.length === 0 ? (
          <p className="mt-4 font-warmth-sans text-sm text-text-muted">Payout processing has not started yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {view.payouts.map((payout) => {
              const payoutColor = payoutDot[payout.statusVariant] ?? payoutDot.amber;
              return (
                <li key={payout.id} className="rounded-xl border border-border p-4">
                  <p className="font-warmth-sans text-sm font-semibold text-text">{payout.typeLabel}</p>
                  <div className="mt-2 flex items-center gap-2 font-warmth-sans text-sm">
                    <span
                      aria-hidden="true"
                      className={`h-2.5 w-2.5 rounded-full ${payoutColor.dotClass}`}
                    />
                    <span className={payoutColor.textClass}>{payout.statusLabel}</span>
                  </div>
                  <p className="mt-2 font-warmth-sans text-sm text-text-muted">
                    {payout.type === 'charity' ? 'via Charity' : `via ${view.payoutMethodLabel}`}
                  </p>
                  {payout.externalRef ? (
                    <p className="font-warmth-sans text-xs text-text-muted">Ref: {payout.externalRef}</p>
                  ) : null}
                  {payout.completedLabel ? (
                    <p className="font-warmth-sans text-xs text-text-muted">Sent {payout.completedLabel}</p>
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
        <p aria-live="polite" className="rounded-md bg-subtle px-3 py-2 font-warmth-sans text-sm text-text">
          {errorToast}
        </p>
      ) : null}

      <article className="rounded-[14px] border border-border/60 bg-white p-6 shadow-card">
        <h2 className="flex items-center gap-3 font-display text-[28px] font-bold tracking-[-0.01em] text-text">
          Contributors
          <span className="inline-flex items-center rounded-full bg-sage-light px-3 py-0.5 font-warmth-sans text-[13px] font-semibold text-sage">
            {view.contributionCount}
          </span>
        </h2>
        {contributions.length === 0 ? (
          <p className="mt-4 font-warmth-sans text-sm text-text-muted">No contributors yet</p>
        ) : (
          <ul className="mt-4">
            {contributions.map((contribution, index) => {
              const contributorName = getContributorName(
                contribution.contributorName,
                contribution.isAnonymous
              );
              return (
                <li key={contribution.id} className="flex items-center justify-between gap-3 border-b border-border-soft py-3 last:border-b-0">
                  <div className="min-w-0 flex items-center gap-3">
                    <span
                      aria-hidden="true"
                      className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full font-warmth-sans text-[13px] font-bold ${contributorAvatarTones[index % contributorAvatarTones.length]}`}
                    >
                      {getContributorInitials(contributorName)}
                    </span>
                    <p className="font-warmth-sans text-sm font-semibold text-text [overflow-wrap:anywhere]">
                      {contributorName}
                      {contribution.message ? <span className="ml-1.5 text-[13px] text-primary-600">💬</span> : null}
                    </p>
                  </div>
                  <p className="shrink-0 font-warmth-sans text-xs text-text-muted">
                    {formatRelativeDate(contribution.createdAt)}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </article>

      <article className="rounded-[14px] border border-border/60 bg-white p-6 shadow-card">
        <h2 className="flex items-center gap-3 font-display text-[28px] font-bold tracking-[-0.01em] text-text">
          Birthday Messages
          <span className="inline-flex items-center rounded-full bg-sage-light px-3 py-0.5 font-warmth-sans text-[13px] font-semibold text-sage">
            {view.messageCount}
          </span>
        </h2>
        {messages.length === 0 ? (
          <p className="mt-4 font-warmth-sans text-sm text-text-muted">No birthday messages yet</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {messages.map((item) => (
              <li key={item.id} className="relative rounded-xl border border-border bg-muted px-4 pb-4 pt-5">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3 top-2 font-display text-[42px] leading-none text-sage-light"
                >
                  &ldquo;
                </span>
                <p className="pl-5 font-warmth-sans text-sm font-semibold text-text">
                  {item.isAnonymous ? 'Anonymous' : item.contributorName || 'Anonymous'}
                </p>
                <p className="mt-2 pl-5 font-warmth-sans text-sm leading-[1.6] text-text-secondary [overflow-wrap:anywhere]">
                  {item.message}
                </p>
              </li>
            ))}
          </ul>
        )}
      </article>
    </section>
  );
}
