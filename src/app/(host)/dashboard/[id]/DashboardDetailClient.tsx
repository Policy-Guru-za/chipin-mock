'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useState } from 'react';

import { EditDreamBoardModal } from '@/components/host/EditDreamBoardModal';
import { CheckIcon, WalletIcon } from '@/components/icons';
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
  active: 'border-primary-200 bg-primary-50 text-primary-700',
  draft: 'border-primary-200 bg-primary-50 text-primary-700',
  funded: 'border-sage-light bg-sage-light text-sage-deep',
  closed: 'border-border bg-muted text-text-secondary',
  paid_out: 'border-border bg-muted text-text-secondary',
  expired: 'border-amber-light bg-amber-light text-warning',
  cancelled: 'border-red-100 bg-red-50 text-red-700',
};

const payoutDot: Record<string, string> = {
  amber: 'bg-amber-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  red: 'bg-red-500',
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

const formatHeroDate = (
  value: Date | null,
  options: Intl.DateTimeFormatOptions
) => (value ? value.toLocaleDateString('en-ZA', options) : null);

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

type QuickActionRowProps = {
  icon: ReactNode;
  label: string;
  description: string;
  onClick?: () => void;
  href?: string;
};

const quickActionRowClasses =
  'group flex w-full items-center gap-3 py-3 text-left transition-all duration-200 hover:pl-1 first:pt-0 last:pb-0';

const ShareActionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M12 2v13" />
    <path d="m7 7 5-5 5 5" />
  </svg>
);

const EditActionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.12 2.12 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
  </svg>
);

const ExternalActionIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="h-4 w-4">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const QuickActionRowContent = ({ icon, label, description }: Omit<QuickActionRowProps, 'onClick' | 'href'>) => (
  <>
    <span className="inline-flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center rounded-[10px] border border-border bg-muted text-text-secondary transition group-hover:border-primary/20 group-hover:bg-primary-50 group-hover:text-primary-700">
      {icon}
    </span>
    <span className="min-w-0 flex-1">
      <span className="block font-warmth-sans text-sm font-semibold text-text transition group-hover:text-primary-700">
        {label}
      </span>
      <span className="block font-warmth-sans text-xs text-text-muted">{description}</span>
    </span>
    <span
      aria-hidden="true"
      className="text-[20px] leading-none text-ink-ghost transition group-hover:translate-x-0.5 group-hover:text-primary-700"
    >
      ›
    </span>
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
  const birthdayLabel = formatHeroDate(view.birthdayDate, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const partyLabel = view.hasBirthdayParty
    ? formatHeroDate(view.partyDate, {
        day: 'numeric',
        month: 'long',
      })
    : null;
  const daysLeftValue =
    view.daysRemaining === null
      ? view.timeLabel.startsWith('Ended')
        ? 'Ended'
        : '—'
      : String(view.daysRemaining);

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
    <section className="mx-auto w-full max-w-6xl px-6 py-10 font-warmth-sans">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 transition hover:underline">
        ← Back to Dreamboards
      </Link>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <article className="relative overflow-hidden rounded-[14px] border border-border/60 bg-white p-6 shadow-card">
            <div className="pointer-events-none absolute right-0 top-0 h-52 w-52 bg-[radial-gradient(circle,rgba(74,126,102,0.05)_0%,transparent_70%)]" />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <div className="h-[72px] w-[72px] flex-shrink-0 overflow-hidden rounded-full border-[3px] border-sage bg-sage-light shadow-[0_4px_12px_rgba(74,126,102,0.15)]">
                  {view.childPhotoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={view.childPhotoUrl}
                      alt={`${view.childName} avatar`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-[30px] font-bold text-sage-deep">
                      {view.childName.slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <h1 className="font-display text-[28px] font-bold leading-[1.12] tracking-[-0.02em] text-text [overflow-wrap:anywhere]">
                    {view.childName}&apos;s Dreamboard
                  </h1>
                  <p className="mt-2 flex items-center gap-2.5 font-warmth-sans text-[15px] font-medium text-text-secondary">
                    <Image
                      src="/icons/gifts/gifta-logo.png"
                      alt="Gifta gift icon"
                      width={20}
                      height={20}
                      className="h-5 w-5 flex-shrink-0"
                    />
                    <span className="[overflow-wrap:anywhere]">{view.giftName}</span>
                  </p>
                  {birthdayLabel || partyLabel ? (
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 font-warmth-sans text-[13px] text-text-muted">
                      {birthdayLabel ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden="true" className="text-[13px]">🎂</span>
                          {birthdayLabel}
                        </span>
                      ) : null}
                      {partyLabel ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span aria-hidden="true" className="text-[13px]">🎈</span>
                          Party: {partyLabel}
                        </span>
                      ) : null}
                    </div>
                  ) : null}
                  {view.givingBackLabel ? (
                    <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-plum-soft bg-plum-wash px-4 py-1 font-warmth-sans text-[13px] font-semibold text-plum">
                      <span aria-hidden="true">💜</span>
                      {view.givingBackLabel}
                    </p>
                  ) : null}
                </div>
              </div>
              <span
                className={`inline-flex items-center gap-1.5 self-start rounded-full border px-3 py-1.5 font-warmth-sans text-[12px] font-semibold tracking-[0.04em] ${statusClass}`}
              >
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
                {view.statusLabel}
              </span>
            </div>
          </article>

          <article className="rounded-[14px] border border-border/60 bg-white p-6 shadow-card">
            <h2 className="flex items-center gap-3 font-display text-[30px] font-bold leading-tight tracking-[-0.01em] text-text">
              Contributors
              <span className="inline-flex items-center rounded-full bg-sage-light px-3 py-0.5 font-warmth-sans text-[13px] font-semibold text-sage">
                {view.contributionCount}
              </span>
            </h2>
            {visibleContributions.length === 0 ? (
              <p className="mt-4 font-warmth-sans text-sm text-text-muted">No contributors yet</p>
            ) : (
              <ul className="mt-4">
                {visibleContributions.map((contribution, index) => {
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
            {contributions.length > 5 ? (
              <button
                type="button"
                aria-expanded={showAllContributions}
                className="mt-4 inline-flex items-center gap-1 font-warmth-sans text-sm font-semibold text-primary-700 hover:underline"
                onClick={() => setShowAllContributions((current) => !current)}
              >
                {showAllContributions ? 'Show fewer' : `View all ${contributions.length} contributors`}
                {!showAllContributions ? <span aria-hidden="true">→</span> : null}
              </button>
            ) : null}
          </article>

          <article className="rounded-[14px] border border-border/60 bg-white p-6 shadow-card">
            <h2 className="flex items-center gap-3 font-display text-[30px] font-bold leading-tight tracking-[-0.01em] text-text">
              Birthday Messages
              <span className="inline-flex items-center rounded-full bg-sage-light px-3 py-0.5 font-warmth-sans text-[13px] font-semibold text-sage">
                {view.messageCount}
              </span>
            </h2>
            {visibleMessages.length === 0 ? (
              <p className="mt-4 font-warmth-sans text-sm text-text-muted">No birthday messages yet</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {visibleMessages.map((item) => (
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
            {messages.length > 2 ? (
              <button
                type="button"
                aria-expanded={showAllMessages}
                className="mt-4 inline-flex items-center gap-1 font-warmth-sans text-sm font-semibold text-primary-700 hover:underline"
                onClick={() => setShowAllMessages((current) => !current)}
              >
                {showAllMessages ? 'Show fewer' : `View all ${messages.length} messages`}
                {!showAllMessages ? <span aria-hidden="true">→</span> : null}
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
          <article className="relative overflow-hidden rounded-[14px] border border-border/60 bg-gradient-to-b from-white to-subtle p-7 text-center shadow-card">
            <div className="pointer-events-none absolute -top-10 left-1/2 h-44 w-44 -translate-x-1/2 bg-[radial-gradient(circle,rgba(74,126,102,0.08)_0%,transparent_72%)]" />
            <p className="relative inline-block font-display text-[42px] font-bold leading-none tracking-[-0.02em] text-sage">
              {view.raisedLabel}
            </p>
            <p className="mt-3 font-warmth-sans text-[12px] font-semibold uppercase tracking-[0.14em] text-text-muted">
              Total raised
            </p>
            <div className="mb-1 mt-5 h-[2px] bg-gradient-to-r from-transparent via-amber-glow to-transparent" />
            <div className="grid grid-cols-3 gap-1 pt-2">
              <div className="px-1 py-2 text-center">
                <p className="font-display text-[24px] font-bold leading-none text-text">{view.contributionCount}</p>
                <p className="mt-1 font-warmth-sans text-[11px] font-medium text-text-muted">Contributors</p>
              </div>
              <div className="px-1 py-2 text-center">
                <p className="font-display text-[24px] font-bold leading-none text-text">{view.messageCount}</p>
                <p className="mt-1 font-warmth-sans text-[11px] font-medium text-text-muted">Messages</p>
              </div>
              <div className="px-1 py-2 text-center">
                <p className="font-display text-[24px] font-bold leading-none text-text">{daysLeftValue}</p>
                <p className="mt-1 font-warmth-sans text-[11px] font-medium text-text-muted">Days left</p>
              </div>
            </div>
          </article>

          <article className="rounded-[14px] border border-border/60 bg-white p-6 shadow-card">
            <h2 className="font-display text-[28px] font-bold tracking-[-0.01em] text-text">Quick Actions</h2>
            <div className="mt-3 divide-y divide-border-soft">
              <QuickActionRow
                icon={<ShareActionIcon />}
                label="Share Dreamboard"
                description="Copy link to share via WhatsApp"
                onClick={handleShare}
              />
              {view.isEditable ? (
                <QuickActionRow
                  icon={<EditActionIcon />}
                  label="Edit Dreamboard"
                  description="Update details or dates"
                  onClick={() => setShowEditModal(true)}
                />
              ) : null}
              <QuickActionRow
                icon={<ExternalActionIcon />}
                label="View Public Page"
                description="See what guests see"
                href={view.publicUrl}
              />
            </div>
            {copyToast ? (
              <p aria-live="polite" className="mt-4 inline-flex items-center gap-2 rounded-lg bg-subtle px-3 py-2 font-warmth-sans text-sm text-text">
                {copyToast === 'Link copied!' ? <CheckIcon size="sm" className="text-primary-700" /> : null}
                {copyToast}
              </p>
            ) : null}
          </article>

          <article className="rounded-[14px] border border-border-warmth bg-gradient-to-br from-muted to-subtle p-6 shadow-card">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-border bg-white text-primary-700 shadow-input">
                <WalletIcon size="sm" />
              </span>
              <h2 className="font-display text-[24px] font-bold tracking-[-0.01em] text-text">Payout Details</h2>
            </div>
            <p className="mt-4 font-warmth-sans text-sm text-text-secondary">
              Method: <span className="font-semibold text-text">{view.payoutMethodLabel}</span>
            </p>
            <p className="mt-1 font-warmth-sans text-sm text-text-secondary [overflow-wrap:anywhere]">
              Recipient: <span className="font-semibold text-text">{view.payoutRecipientDisplay}</span>
            </p>
            {view.payouts.length === 0 ? (
              <p className="mt-4 font-warmth-sans text-sm text-text-secondary">
                Payout will be processed when the Dreamboard is closed.
              </p>
            ) : (
              <ul className="mt-4 space-y-3">
                {view.payouts.map((payout) => (
                  <li key={payout.id} className="rounded-xl border border-border bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-warmth-sans text-sm font-semibold text-text">{payout.typeLabel}</p>
                      <p className="font-warmth-sans text-sm font-semibold text-text">{payout.amountLabel}</p>
                    </div>
                    <div className="mt-2 flex items-center gap-2 font-warmth-sans text-sm">
                      <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${payoutDot[payout.statusVariant]}`} />
                      <span>{payout.statusLabel}</span>
                    </div>
                    <p className="mt-1 font-warmth-sans text-xs text-text-muted">{payoutMethodNote}</p>
                    {payout.externalRef ? <p className="mt-1 font-warmth-sans text-xs text-text-muted">Ref: {payout.externalRef}</p> : null}
                    {payout.completedLabel ? (
                      <p className="mt-1 font-warmth-sans text-xs text-text-muted">Sent {payout.completedLabel}</p>
                    ) : null}
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
