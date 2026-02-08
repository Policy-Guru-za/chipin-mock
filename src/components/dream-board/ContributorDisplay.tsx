'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';

const AVATAR_COLORS = [
  '#F5C6AA',
  '#A8D4E6',
  '#B8E0B8',
  '#E6B8B8',
  '#F0E68C',
  '#B8D4E0',
  '#D8B8E8',
] as const;

type ContributorItem = {
  name: string | null;
  isAnonymous: boolean;
  avatarColorIndex: number;
};

type ContributorDisplayProps = {
  contributors: ContributorItem[];
  totalCount: number;
};

const getInitials = (name: string | null) => {
  if (!name) return '??';
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  if (!parts.length) return '??';
  return parts.map((part) => part[0]?.toUpperCase() ?? '').join('');
};

const getContributorLabel = (contributor: ContributorItem) => {
  if (contributor.isAnonymous || !contributor.name) {
    return '💝 Anonymous contributor';
  }
  return contributor.name;
};

const getHeadingCopy = (count: number) => {
  const text = count === 1 ? '1 loved one has chipped in' : `${count} loved ones have chipped in`;

  if (count < 3) {
    return {
      emoji: '🎁',
      text,
    };
  }

  if (count <= 10) {
    return {
      emoji: '🎉',
      text: count >= 6 ? `${count} amazing people have chipped in` : text,
    };
  }

  return {
    emoji: '✨',
    text: `${count} amazing people have chipped in`,
  };
};

const ITEMS_PER_PAGE = 6;

export function ContributorDisplay({ contributors, totalCount }: ContributorDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const headingCopy = useMemo(() => getHeadingCopy(totalCount), [totalCount]);
  const displayContributors = contributors.slice(0, 5);
  const overflowCount = Math.max(totalCount - 5, 0);
  const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));
  const pageItems = contributors.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => {
    if (!isModalOpen) return;

    previousFocusRef.current = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    if (!dialog) return;

    const focusableSelector =
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      (element) => !element.hasAttribute('disabled')
    );
    focusable[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsModalOpen(false);
        return;
      }

      if (event.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      previousFocusRef.current?.focus();
    };
  }, [isModalOpen]);

  if (totalCount === 0) {
    return (
      <section className="rounded-2xl border border-border bg-white p-5">
        <p className="italic text-gray-400">Be the first to chip in... 🎁</p>
      </section>
    );
  }

  return (
    <section className="space-y-4 rounded-2xl border border-border bg-white p-5">
      <h2 className="font-display text-xl text-gray-900">
        <span aria-hidden="true" className="mr-2">
          {headingCopy.emoji}
        </span>
        {headingCopy.text}
      </h2>

      <div className="flex flex-wrap gap-3">
        {displayContributors.map((contributor, index) => {
          const color = AVATAR_COLORS[contributor.avatarColorIndex % AVATAR_COLORS.length];
          return (
            <div key={`${contributor.name ?? 'anonymous'}-${index}`} className="flex items-center gap-2">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-gray-900"
                style={{ backgroundColor: color }}
                aria-hidden="true"
              >
                {contributor.isAnonymous || !contributor.name ? '💝' : getInitials(contributor.name)}
              </div>
              <span className="text-sm text-gray-700">{getContributorLabel(contributor)}</span>
            </div>
          );
        })}
      </div>

      {overflowCount > 0 ? (
        <button
          ref={triggerRef}
          type="button"
          onClick={() => {
            setPage(1);
            setIsModalOpen(true);
          }}
          className="min-h-11 rounded-lg text-sm font-semibold text-[#0D9488] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          + {overflowCount} others ➜
        </button>
      ) : null}

      {isModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-4 sm:items-center">
          <div
            className="absolute inset-0"
            aria-hidden="true"
            onClick={() => setIsModalOpen(false)}
          />
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contributors-dialog-heading"
            className="relative w-full max-w-lg rounded-2xl border border-border bg-white p-5 shadow-lifted"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 id="contributors-dialog-heading" className="font-display text-xl text-gray-900">
                All contributors
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="min-h-11 min-w-11 rounded-lg border border-border px-3 text-sm font-medium text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
              >
                Close
              </button>
            </div>

            <ul className="space-y-3">
              {pageItems.map((contributor, index) => {
                const color = AVATAR_COLORS[contributor.avatarColorIndex % AVATAR_COLORS.length];
                return (
                  <li
                    key={`${contributor.name ?? 'anonymous'}-page-${page}-${index}`}
                    className="flex items-center gap-3 rounded-xl border border-border px-3 py-2"
                  >
                    <div
                      className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold text-gray-900"
                      style={{ backgroundColor: color }}
                      aria-hidden="true"
                    >
                      {contributor.isAnonymous || !contributor.name ? '💝' : getInitials(contributor.name)}
                    </div>
                    <span className="text-sm text-gray-700">{getContributorLabel(contributor)}</span>
                  </li>
                );
              })}
            </ul>

            {totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <p className="text-sm text-text-muted">
                  Page {page} of {totalPages}
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
