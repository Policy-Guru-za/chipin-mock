'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

type ReturnVisitBannerProps = {
  slug: string;
  childName: string;
  href: string;
  isExpired: boolean;
};

type StoredContribution = {
  name?: string;
  timestamp?: number;
};

const isStoredContribution = (value: unknown): value is StoredContribution => {
  if (typeof value !== 'object' || value === null) return false;

  const candidate = value as { name?: unknown; timestamp?: unknown };
  const validName = typeof candidate.name === 'undefined' || typeof candidate.name === 'string';
  const validTimestamp =
    typeof candidate.timestamp === 'undefined' || typeof candidate.timestamp === 'number';

  return validName && validTimestamp;
};

const parseStoredContribution = (value: string | null): StoredContribution | null => {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    return isStoredContribution(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export function ReturnVisitBanner({ slug, childName, href, isExpired }: ReturnVisitBannerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [returningData] = useState<StoredContribution | null>(() => {
    if (typeof window === 'undefined') return null;
    return parseStoredContribution(localStorage.getItem(`gifta_contributed_${slug}`));
  });
  const [copied, setCopied] = useState(false);

  const shareUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/${slug}`;
  }, [slug]);

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleShare = async () => {
    const text = `Help make ${childName}'s birthday extra special! 💝`;
    if (navigator.share) {
      await navigator.share({ title: `${childName}'s Dream Board`, text, url: shareUrl });
      return;
    }
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
  };

  const handleCtaClick = () => {
    if (isExpired) return;
    setLoading(true);
    window.setTimeout(() => {
      router.push(href);
    }, 1000);
  };

  if (returningData) {
    const name = returningData.name && returningData.name.trim() ? returningData.name : 'Friend';
    return (
      <section className="rounded-2xl border border-[#0D9488] bg-[#F0F7F4] p-5">
        <p className="text-sm font-medium text-gray-800">Thanks for chipping in, {name}! 💝</p>
        <Button
          type="button"
          variant="ghost"
          onClick={handleShare}
          className="mt-3 min-h-11 border border-primary-700 bg-white text-primary-700"
        >
          {copied ? 'Link copied ✓' : 'Share this Dream Board'}
        </Button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-border bg-white p-5 text-center">
      <Button
        type="button"
        variant="ghost"
        onClick={handleCtaClick}
        disabled={isExpired || loading}
        title={isExpired ? 'This Dream Board is closed to new contributions.' : undefined}
        className="min-h-11 w-full border-2 border-primary-700 bg-white text-text hover:bg-[#F0F7F4]"
      >
        {loading ? 'Loading...' : `Chip in for ${childName} 💝`}
      </Button>
      <p className="mt-3 text-xs text-text-muted">Secure payments powered by PayFast.</p>
    </section>
  );
}
