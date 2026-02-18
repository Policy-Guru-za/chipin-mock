'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';

import { getGiftIconById } from '@/lib/icons/gift-icons';

export interface GiftIconPreviewProps {
  selectedIcon: string | null;
}

const SYNC_INTERVAL_MS = 180;

function normalizeIconId(value: string | null | undefined): string | null {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

export function GiftIconPreview({ selectedIcon }: GiftIconPreviewProps) {
  const [activeIconId, setActiveIconId] = useState<string | null>(normalizeIconId(selectedIcon));

  useEffect(() => {
    setActiveIconId(normalizeIconId(selectedIcon));
  }, [selectedIcon]);

  useEffect(() => {
    const syncSelectionFromForm = () => {
      const hiddenInput = document.querySelector<HTMLInputElement>('input[name="giftIconId"]');
      const nextIconId = normalizeIconId(hiddenInput?.value);

      setActiveIconId((currentIconId) => (currentIconId === nextIconId ? currentIconId : nextIconId));
    };

    syncSelectionFromForm();

    const intervalId = window.setInterval(syncSelectionFromForm, SYNC_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, []);

  const selectedIconMeta = useMemo(
    () => (activeIconId ? getGiftIconById(activeIconId) : undefined),
    [activeIconId],
  );

  if (!selectedIconMeta) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[20px] border-2 border-dashed border-border bg-border-soft px-6 py-8 text-center">
        <p className="text-sm font-medium text-ink-soft">Choose an icon below</p>
        <p className="mt-1 text-xs text-ink-ghost">
          Your selected gift icon will appear here on the Dreamboard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[220px] flex-col items-center justify-center rounded-[20px] border border-sage-light bg-sage-wash px-6 py-8 text-center">
      <div
        className="relative h-28 w-28 overflow-hidden rounded-[16px] border border-white/80 shadow-[0_4px_14px_rgba(44,37,32,0.08)]"
        style={{ backgroundColor: selectedIconMeta.bgColor }}
      >
        <Image
          src={selectedIconMeta.src}
          alt={selectedIconMeta.label}
          fill
          sizes="112px"
          className="object-contain p-3"
        />
      </div>
      <p className="mt-4 text-sm font-medium text-sage-deep">{selectedIconMeta.label} selected</p>
      <p className="mt-1 text-xs text-ink-soft">This icon will represent the dream gift.</p>
    </div>
  );
}
