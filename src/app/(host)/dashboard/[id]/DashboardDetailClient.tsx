'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';

import { EditDreamBoardModal } from '@/components/host/EditDreamBoardModal';
import { CheckIcon, ChevronRightIcon, CopyIcon, WalletIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';
import type { DashboardDetailViewModel } from '@/lib/host/dashboard-view-model';
import type { HostBirthdayMessageRow, HostContributionRow } from '@/lib/host/queries';

type DashboardDetailClientProps = {
  view: DashboardDetailViewModel;
  contributions: HostContributionRow[];
  messages: HostBirthdayMessageRow[];
  updateAction: (formData: FormData) => Promise<{ success: boolean; error?: string }>;
};

const DAY_MS = 24 * 60 * 60 * 1000;

const badgeStyles: Record<string, string> = {
  active: 'border-teal-100 bg-teal-50 text-teal-700',
  draft: 'border-teal-100 bg-teal-50 text-teal-700',
  funded: 'border-green-100 bg-green-50 text-green-700',
  closed: 'border-gray-200 bg-gray-100 text-gray-600',
  paid_out: 'border-gray-200 bg-gray-100 text-gray-600',
  expired: 'border-amber-100 bg-amber-50 text-amber-700',
  cancelled: 'border-red-100 bg-red-50 text-red-700',
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

type QuickActionRowProps = {
  icon: ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
  href?: string;
};

const quickActionRowClasses =
  'group flex w-full items-center gap-3 rounded-xl px-1 py-3 text-left transition hover:bg-subtle/60';

const QuickActionRowContent = ({ icon, label, description }: Omit<QuickActionRowProps, 'onClick' | 'href'>) => (
  <>
    <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-border bg-subtle text-text-muted transition group-hover:border-primary/20 group-hover:bg-primary-50 group-hover:text-primary-700">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block text-sm font-semibold text-text transition group-hover:text-primary-700">
        {label}
      </span>
      <span className="block text-xs text-text-muted">{description}</span>
    </span>
    <ChevronRightIcon size="sm" className="text-border transition group-hover:translate-x-0.5 group-hover:text-primary-700" />
  </>
);

const QuickActionRow = ({ icon, label, description, onClick, href }: QuickActionRowProps) => {
  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={quickActionRowClasses}>
        <QuickActionRowContent icon={icon} label={label} description={description} />
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={quickActionRowClasses}>
      <QuickActionRowContent icon={icon} label={label} description={description} />
    </button>
  );
};

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
  const payoutMethodNote = view.payoutMethod === 'bank' ? 'via Bank Transfer' : 'via Karri Card';
  const birthdayLabel = view.partyDate
    ? view.partyDate.toLocaleDateString('en-ZA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

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

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-10">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:underline">
        ← Back to Dreamboards
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <article className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-primary-600 bg-primary-100">
                  {view.childPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={view.childPhotoUrl}
                      alt={`${view.childName} avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-primary-700">
                      {view.childName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-4xl font-bold text-text [overflow-wrap:anywhere]">
                      {view.childName}&apos;s Dreamboard
                    </h1>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${statusClass}`}>
                      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                      {view.statusLabel}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-text-secondary [overflow-wrap:anywhere]">{view.giftName}</p>
                  {birthdayLabel ? <p className="mt-1 text-sm text-text-secondary">Birthday: {birthdayLabel}</p> : null}
                </div>
              </div>
              <p className="text-sm font-medium text-text-secondary">{view.timeLabel}</p>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-3xl font-bold text-text">Contributions ({view.contributionCount})</h2>
            {visibleContributions.length === 0 ? (
              <p className="mt-4 text-sm text-text-muted">No contributions yet</p>
            ) : (
              <ul className="mt-4 divide-y divide-border-soft">
                {visibleContributions.map((contribution) => (
                  <li key={contribution.id} className="py-3">
                    <p className="text-sm font-semibold text-text [overflow-wrap:anywhere]">
                      {contribution.isAnonymous ? 'Anonymous' : contribution.contributorName || 'Anonymous'}
                      {contribution.message ? <span className="ml-2 text-primary-700">💬</span> : null}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">{formatRelativeDate(contribution.createdAt)}</p>
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
                {showAllContributions ? 'Show fewer' : `Show all ${contributions.length} contributions`}
              </button>
            ) : null}
          </article>

          <article className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-3xl font-bold text-text">Birthday Messages ({view.messageCount})</h2>
            {visibleMessages.length === 0 ? (
              <p className="mt-4 text-sm text-text-muted">No birthday messages yet</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {visibleMessages.map((item) => (
                  <li key={item.id} className="rounded-xl border border-border bg-subtle/40 p-4">
                    <p className="text-sm font-semibold text-text">
                      {item.isAnonymous ? 'Anonymous' : item.contributorName || 'Anonymous'}
                    </p>
                    <p className="mt-2 text-sm text-text-secondary [overflow-wrap:anywhere]">
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
                <Button type="button" variant="outline" width="full" onClick={downloadMessages} loading={downloadBusy}>
                  Download Birthday Messages
                </Button>
              </div>
            ) : null}
          </article>
        </div>

        <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
          <article className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <p className="font-display text-5xl font-bold text-primary-700">{view.raisedLabel}</p>
            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted">Total raised</p>
            <div className="mt-4 h-px bg-gradient-to-r from-accent-500/50 to-transparent" />
            <div className="mt-4 space-y-4">
              <div>
                <p className="font-display text-3xl font-bold text-text">{view.contributionCount}</p>
                <p className="text-xs text-text-muted">Contributors</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-text">
                  {view.daysRemaining === null ? (view.timeLabel.startsWith('Ended') ? 'Ended' : '—') : view.daysRemaining}
                </p>
                <p className="text-xs text-text-muted">Days remaining</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-text">{view.messageCount}</p>
                <p className="text-xs text-text-muted">Messages</p>
              </div>
            </div>
          </article>

          <article className="rounded-2xl border border-border bg-white p-6 shadow-soft">
            <h2 className="font-display text-2xl font-bold text-text">Quick Actions</h2>
            <div className="mt-3 divide-y divide-border-soft">
              <QuickActionRow
                icon={<CopyIcon size="sm" />}
                label="Share Dreamboard"
                description="Copy link to share via WhatsApp"
                onClick={handleShare}
              />
              {view.isEditable ? (
                <QuickActionRow
                  icon={<span className="text-base leading-none">✎</span>}
                  label="Edit Dreamboard"
                  description="Update details or dates"
                  onClick={() => setShowEditModal(true)}
                />
              ) : null}
              <QuickActionRow
                icon={<span className="text-base leading-none">↗</span>}
                label="View Public Page"
                description="See what guests see"
                href={view.publicUrl}
              />
            </div>
            {copyToast ? (
              <p aria-live="polite" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-subtle px-3 py-2 text-sm text-text">
                {copyToast === 'Link copied!' ? <CheckIcon size="sm" className="text-primary-700" /> : null}
                {copyToast}
              </p>
            ) : null}
          </article>

          <article className="rounded-2xl border border-border-warmth bg-gradient-to-br from-subtle to-[#f5f1ea] p-6 shadow-soft">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-white text-primary-700">
                <WalletIcon size="sm" />
              </span>
              <h2 className="font-display text-2xl font-bold text-text">Payout Details</h2>
            </div>
            <p className="mt-4 text-sm text-text-secondary">
              Method: <span className="font-semibold text-text">{view.payoutMethodLabel}</span>
            </p>
            <p className="mt-1 text-sm text-text-secondary [overflow-wrap:anywhere]">
              Recipient: <span className="font-semibold text-text">{view.payoutRecipientDisplay}</span>
            </p>
            {view.payouts.length === 0 ? (
              <p className="mt-4 text-sm text-text-secondary">Payout will be processed when the Dreamboard is closed.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {view.payouts.map((payout) => (
                  <li key={payout.id} className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-text">{payout.typeLabel}</p>
                      <p className="text-sm font-semibold text-text">{payout.amountLabel}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${payoutDot[payout.statusVariant]}`} />
                      <span>{payout.statusLabel}</span>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">{payoutMethodNote}</p>
                    {payout.externalRef ? <p className="mt-1 text-xs text-text-muted">Ref: {payout.externalRef}</p> : null}
                    {payout.completedLabel ? <p className="mt-1 text-xs text-text-muted">Sent {payout.completedLabel}</p> : null}
                  </li>
                ))}
              </ul>
            )}
          </article>
        </aside>
      </div>

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
