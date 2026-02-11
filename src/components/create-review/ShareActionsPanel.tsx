import Link from 'next/link';

import { ArrowRightIcon, CopyIcon } from '@/components/icons';

type ShareActionsPanelProps = {
  whatsappHref: string;
  emailHref: string;
  copied: boolean;
  onCopyLink: () => void;
};

export function ShareActionsPanel({
  whatsappHref,
  emailHref,
  copied,
  onCopyLink,
}: ShareActionsPanelProps) {
  return (
    <section className="mx-auto w-full max-w-[580px]">
      <p className="mb-4 text-center text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
        Share with friends &amp; family
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-[14px] bg-sage px-4 py-3 text-sm font-semibold text-white shadow-[0_1px_3px_rgba(74,126,102,0.12),0_4px_12px_rgba(74,126,102,0.1)] transition hover:-translate-y-px hover:bg-sage-deep sm:col-span-2"
        >
          WhatsApp
        </a>

        <a
          href={emailHref}
          className="inline-flex items-center justify-center rounded-[14px] border border-border bg-white px-4 py-3 text-sm font-semibold text-ink-mid shadow-[0_1px_3px_rgba(44,37,32,0.03)] transition hover:-translate-y-px hover:bg-border-soft"
        >
          Email
        </a>

        <button
          type="button"
          onClick={onCopyLink}
          className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-border bg-white px-4 py-3 text-sm font-semibold text-ink-mid shadow-[0_1px_3px_rgba(44,37,32,0.03)] transition hover:-translate-y-px hover:bg-border-soft"
        >
          <CopyIcon className="h-4 w-4" />
          {copied ? 'Copied! ✓' : 'Copy Link'}
        </button>

        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-[14px] border border-border bg-white px-4 py-3 text-sm font-semibold text-ink-mid shadow-[0_1px_3px_rgba(44,37,32,0.03)] transition hover:-translate-y-px hover:bg-border-soft sm:col-span-2"
        >
          Go to Dashboard
          <ArrowRightIcon className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
