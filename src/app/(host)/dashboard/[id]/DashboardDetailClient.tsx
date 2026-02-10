'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { EditDreamBoardModal } from '@/components/host/EditDreamBoardModal';
import { CheckIcon, CopyIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import type { DashboardDetailViewModel } from '@/lib/host/dashboard-view-model';
import type { HostBirthdayMessageRow, HostContributionRow } from '@/lib/host/queries';
import { formatZar } from '@/lib/utils/money';

type DashboardDetailClientProps = {
  view: DashboardDetailViewModel;
  contributions: HostContributionRow[];
  messages: HostBirthdayMessageRow[];
  updateAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const badgeStyles: Record<string, string> = {
  active: 'bg-teal-50 text-teal-700',
  draft: 'bg-teal-50 text-teal-700',
  funded: 'bg-green-50 text-green-700',
  closed: 'bg-gray-100 text-gray-600',
  paid_out: 'bg-gray-100 text-gray-600',
  expired: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
};

const payoutDot: Record<string, string> = {
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
};

const formatRelativeDate = (value: Date) => {
  const diffDays = Math.floor((Date.now() - value.getTime()) / DAY_MS);
  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;
  return value.toLocaleDateString('en-ZA');
};

const fallbackCopyText = async (value: string) => {
  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'absolute';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
};

const escapeFileName = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

export function DashboardDetailClient({
  view,
  contributions,
  messages,
  updateAction,
}: DashboardDetailClientProps) {
  const router = useRouter();
  const [showAllContributions, setShowAllContributions] = useState(false);
  const [showAllMessages, setShowAllMessages] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [downloadBusy, setDownloadBusy] = useState(false);
  const statusClass = badgeStyles[view.statusVariant] ?? badgeStyles.active;
  const visibleContributions = showAllContributions ? contributions : contributions.slice(0, 5);
  const visibleMessages = showAllMessages ? messages : messages.slice(0, 2);

  useEffect(() => {
    if (!copyToast) return;
    const timeout = setTimeout(() => setCopyToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [copyToast]);

  const downloadMessages = async () => {
    setDownloadBusy(true);
    try {
      const response = await fetch(
        `/api/internal/downloads/birthday-messages?dreamBoardId=${encodeURIComponent(view.boardId)}`
      );
      if (!response.ok) throw new Error('download_failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${escapeFileName(view.childName)}-birthday-messages.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch {
      setCopyToast('Download failed. Please try again.');
    } finally {
      setDownloadBusy(false);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(view.shareUrl);
      setCopyToast('Link copied!');
    } catch {
      await fallbackCopyText(view.shareUrl);
      setCopyToast('Link copied!');
    }
  };

  const payoutMethodNote = useMemo(() => {
    if (view.payoutMethod === 'bank') {
      return 'via Bank Transfer';
    }
    return 'via Karri Card';
  }, [view.payoutMethod]);

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
      <Link href="/dashboard" className="text-sm font-medium text-primary-700 hover:underline">
        ← Back to Dreamboards
      </Link>

      <article className="rounded-xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full border-2 border-teal-500 bg-teal-100">
              {view.childPhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={view.childPhotoUrl}
                  alt={`${view.childName} avatar`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-semibold text-teal-700">
                  {view.childName.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold text-text [overflow-wrap:anywhere]">
                {view.childName}&apos;s Dreamboard
              </h1>
              <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>
                {view.statusLabel}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500">{view.timeLabel}</p>
        </div>
        <p className="mt-5 text-sm text-gray-500">Total raised: {view.raisedLabel}</p>
      </article>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <article aria-label={`Total Raised: ${view.raisedLabel}`} className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="font-display text-3xl font-bold text-teal-600">{view.raisedLabel}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-gray-500">Total Raised</p>
        </article>
        <article
          aria-label={`Contributors: ${view.contributionCount}`}
          className="rounded-xl bg-white p-6 text-center shadow-sm"
        >
          <p className="font-display text-3xl font-bold text-text">{view.contributionCount}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-gray-500">Contributors</p>
        </article>
        <article aria-label={`Time Remaining: ${view.timeLabel}`} className="rounded-xl bg-white p-6 text-center shadow-sm">
          <p className="font-display text-3xl font-bold text-text">
            {view.daysRemaining === null ? (view.timeLabel.startsWith('Ended') ? 'Ended' : '—') : view.daysRemaining}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.12em] text-gray-500">Time Remaining</p>
        </article>
      </div>

      <article className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Contributions ({view.contributionCount})</h2>
        {visibleContributions.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">No contributions yet</p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-100">
            {visibleContributions.map((contribution) => (
              <li key={contribution.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-semibold text-text [overflow-wrap:anywhere]">
                    {contribution.isAnonymous ? 'Anonymous' : contribution.contributorName || 'Anonymous'}
                    {contribution.message ? <span className="ml-2">💬</span> : null}
                  </p>
                  <p className="text-xs text-gray-400">{formatRelativeDate(contribution.createdAt)}</p>
                </div>
                <p className="text-sm font-semibold text-teal-600">{formatZar(contribution.amountCents)}</p>
              </li>
            ))}
          </ul>
        )}
        {contributions.length > 5 ? (
          <button
            type="button"
            aria-expanded={showAllContributions}
            className="mt-4 text-sm font-semibold text-primary-700 hover:underline"
            onClick={() => setShowAllContributions((current) => !current)}
          >
            {showAllContributions
              ? 'Show fewer'
              : `Show all ${contributions.length} contributions`}
          </button>
        ) : null}
      </article>

      <article className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Birthday Messages ({view.messageCount})</h2>
        {visibleMessages.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">No birthday messages yet</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {visibleMessages.map((item) => (
              <li key={item.id} className="rounded-lg border border-gray-100 p-4">
                <p className="text-sm font-semibold text-text">
                  {item.isAnonymous ? 'Anonymous' : item.contributorName || 'Anonymous'}
                </p>
                <p className="mt-2 text-sm text-gray-600 [overflow-wrap:anywhere]">
                  {/* Active view intentionally previews only a short message snippet. */}
                  {item.message.length > 120 ? `${item.message.slice(0, 120)}...` : item.message}
                </p>
              </li>
            ))}
          </ul>
        )}
        {messages.length > 2 ? (
          <button
            type="button"
            aria-expanded={showAllMessages}
            className="mt-4 text-sm font-semibold text-primary-700 hover:underline"
            onClick={() => setShowAllMessages((current) => !current)}
          >
            {showAllMessages ? 'Show fewer' : `View all ${messages.length} messages`}
          </button>
        ) : null}
        {view.messageCount > 0 ? (
          <div className="mt-4">
            <Button type="button" variant="outline" onClick={downloadMessages} loading={downloadBusy}>
              Download Birthday Messages
            </Button>
          </div>
        ) : null}
      </article>

      <article className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Quick Actions</h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button type="button" variant="outline" onClick={handleShare} aria-label="Share Dreamboard">
            <CopyIcon size="sm" />
            Share Dreamboard
          </Button>
          {view.isEditable ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEditModal(true)}
              aria-label="Edit Dreamboard"
            >
              Edit Dreamboard
            </Button>
          ) : null}
          <a href={view.publicUrl} target="_blank" rel="noopener noreferrer">
            <Button type="button" variant="outline" aria-label="View Public Page">
              View Public Page
            </Button>
          </a>
        </div>
        {copyToast ? (
          <p aria-live="polite" className="mt-3 rounded-md bg-subtle px-3 py-2 text-sm text-text">
            {copyToast}
          </p>
        ) : null}
      </article>

      <article className="rounded-xl bg-white p-6 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Payout Details</h2>
        <p className="mt-3 text-sm text-text">
          Payout Method: <span className="font-semibold">{view.payoutMethodLabel}</span>
        </p>
        <p className="mt-1 text-sm text-gray-600 [overflow-wrap:anywhere]">
          Recipient: {view.payoutRecipientDisplay}
        </p>
        {view.payouts.length === 0 ? (
          <p className="mt-4 text-sm text-gray-500">Payout will be processed when the Dreamboard is closed.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {view.payouts.map((payout) => (
              <li key={payout.id} className="rounded-lg border border-gray-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-text">{payout.typeLabel}</p>
                  <p className="text-sm font-semibold text-text">{payout.amountLabel}</p>
                </div>
                <div className="mt-2 flex items-center gap-2 text-sm">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${payoutDot[payout.statusVariant]}`} />
                  <span>{payout.statusLabel}</span>
                </div>
                <p className="mt-1 text-xs text-gray-500">{payoutMethodNote}</p>
                {payout.externalRef ? <p className="mt-1 text-xs text-gray-500">Ref: {payout.externalRef}</p> : null}
                {payout.completedLabel ? (
                  <p className="mt-1 text-xs text-gray-500">Sent {payout.completedLabel}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </article>

      <EditDreamBoardModal
        board={{
          id: view.boardId,
          childName: view.childName,
          childPhotoUrl: view.childPhotoUrl,
          partyDate: view.partyDate,
          campaignEndDate: view.campaignEndDate,
        }}
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSuccess={() => {
          setShowEditModal(false);
          router.refresh();
        }}
        updateAction={updateAction}
      />
    </section>
  );
}
