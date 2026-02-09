'use client';

import Image from 'next/image';
import { type KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

import {
  GIFT_ICON_CATEGORIES,
  getGiftIconById,
  getIconsByCategory,
  isValidGiftIconId,
} from '@/lib/icons/gift-icons';
import { suggestGiftIcon } from '@/lib/icons/suggest-icon';

const SUGGESTION_DEBOUNCE_MS = 300;
const MOBILE_COLUMN_COUNT = 5;
const SM_COLUMN_COUNT = 6;
const MD_COLUMN_COUNT = 8;

type GiftIconPickerProps = {
  selectedIconId: string;
  giftNameInputId: string;
  giftDescriptionInputId: string;
  defaultGiftName?: string;
  defaultGiftDescription?: string;
  childAge?: number;
};

/* eslint-disable-next-line max-lines-per-function -- Keyboard roving and grouped rendering stay together for a11y consistency. */
export function GiftIconPicker({
  selectedIconId,
  giftNameInputId,
  giftDescriptionInputId,
  defaultGiftName,
  defaultGiftDescription,
  childAge,
}: GiftIconPickerProps) {
  const initialSuggestion = useMemo(() => {
    if (isValidGiftIconId(selectedIconId)) {
      return selectedIconId;
    }

    return suggestGiftIcon({
      giftName: defaultGiftName ?? '',
      giftDescription: defaultGiftDescription,
      childAge,
    }).id;
  }, [childAge, defaultGiftDescription, defaultGiftName, selectedIconId]);

  const [currentSelection, setCurrentSelection] = useState(initialSuggestion);
  const manualSelectionRef = useRef(false);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const getColumnCount = () => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      return MOBILE_COLUMN_COUNT;
    }

    if (window.matchMedia('(min-width: 768px)').matches) {
      return MD_COLUMN_COUNT;
    }

    if (window.matchMedia('(min-width: 640px)').matches) {
      return SM_COLUMN_COUNT;
    }

    return MOBILE_COLUMN_COUNT;
  };

  const icons = useMemo(
    () => GIFT_ICON_CATEGORIES.flatMap((category) => getIconsByCategory(category.id)),
    []
  );

  useEffect(() => {
    const giftNameInput = document.getElementById(giftNameInputId) as HTMLInputElement | null;
    const giftDescriptionInput = document.getElementById(giftDescriptionInputId) as HTMLTextAreaElement | null;

    if (!giftNameInput && !giftDescriptionInput) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const queueSuggestion = () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        if (manualSelectionRef.current) {
          return;
        }

        const suggested = suggestGiftIcon({
          giftName: giftNameInput?.value ?? '',
          giftDescription: giftDescriptionInput?.value ?? '',
          childAge,
        }).id;

        setCurrentSelection(suggested);
      }, SUGGESTION_DEBOUNCE_MS);
    };

    giftNameInput?.addEventListener('input', queueSuggestion);
    giftDescriptionInput?.addEventListener('input', queueSuggestion);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      giftNameInput?.removeEventListener('input', queueSuggestion);
      giftDescriptionInput?.removeEventListener('input', queueSuggestion);
    };
  }, [childAge, giftDescriptionInputId, giftNameInputId]);

  const handleSelect = (iconId: string) => {
    manualSelectionRef.current = true;
    setCurrentSelection(iconId);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, iconId: string) => {
    const currentIndex = icons.findIndex((icon) => icon.id === iconId);
    if (currentIndex === -1) return;

    const focusByIndex = (index: number) => {
      const nextIndex = (index + icons.length) % icons.length;
      const nextIcon = icons[nextIndex];
      if (!nextIcon) return;
      buttonRefs.current[nextIcon.id]?.focus();
    };

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      focusByIndex(currentIndex + 1);
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      focusByIndex(currentIndex - 1);
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusByIndex(currentIndex + getColumnCount());
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusByIndex(currentIndex - getColumnCount());
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleSelect(iconId);
    }
  };

  const selectedIcon = getGiftIconById(currentSelection);

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text">Choose a gift icon</p>

      <div
        role="radiogroup"
        aria-label="Choose a gift icon"
        className="max-h-[400px] space-y-4 overflow-y-auto rounded-2xl border border-border bg-white p-4 shadow-inner"
      >
        {GIFT_ICON_CATEGORIES.map((category) => {
          const categoryIcons = getIconsByCategory(category.id);
          return (
            <section key={category.id} className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-text-muted">
                {category.label}
              </p>

              <div className="grid grid-cols-5 gap-2 sm:grid-cols-6 md:grid-cols-8">
                {categoryIcons.map((icon) => {
                  const selected = currentSelection === icon.id;

                  return (
                    <button
                      key={icon.id}
                      type="button"
                      ref={(element) => {
                        buttonRefs.current[icon.id] = element;
                      }}
                      role="radio"
                      aria-checked={selected}
                      aria-label={icon.label}
                      onClick={() => handleSelect(icon.id)}
                      onKeyDown={(event) => onKeyDown(event, icon.id)}
                      className={[
                        'group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-border transition-all duration-150 sm:h-16 sm:w-16',
                        selected
                          ? 'ring-2 ring-primary ring-offset-2 scale-105 opacity-100'
                          : 'opacity-70 hover:opacity-100',
                      ].join(' ')}
                      style={{ backgroundColor: icon.bgColor }}
                    >
                      <Image
                        src={icon.src}
                        alt={icon.label}
                        width={64}
                        height={64}
                        sizes="64px"
                        className="h-full w-full object-contain p-1"
                      />
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <p className="text-sm text-text-muted">Selected: {selectedIcon?.label ?? 'None'}</p>
      <input type="hidden" name="giftIconId" value={currentSelection} />
    </div>
  );
}
