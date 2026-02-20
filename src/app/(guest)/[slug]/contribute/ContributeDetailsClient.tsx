'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

import { ReminderModal } from '@/components/contribute/ReminderModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { saveFlowData } from '@/lib/contributions/flow-storage';
import { formatZar } from '@/lib/utils/money';

type ContributeDetailsClientProps = {
  slug: string;
  dreamBoardId: string;
  childName: string;
  hasAvailableProviders: boolean;
  unavailableMessage: string;
};

const PRESET_AMOUNTS = [15000, 25000, 50000] as const;
const MIN_CONTRIBUTION_CENTS = 2000;
const MAX_CONTRIBUTION_CENTS = 1000000;
const MAX_MESSAGE_LENGTH = 500;

const sanitizeAmountDigits = (value: string) => value.replace(/[^0-9]/g, '');
// iPadOS Safari can report a desktop-like Macintosh UA, so include touchpoint detection.
const isIosNavigationDeferralTarget = (): boolean => {
  if (typeof navigator === 'undefined') return false;

  const isClassicIos = /iP(hone|ad|od)/i.test(navigator.userAgent);
  const isIpadDesktopMode = /Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
  return isClassicIos || isIpadDesktopMode;
};

export function ContributeDetailsClient({
  slug,
  dreamBoardId,
  childName,
  hasAvailableProviders,
  unavailableMessage,
}: ContributeDetailsClientProps) {
  const router = useRouter();
  const [selectedAmount, setSelectedAmount] = useState<number>(PRESET_AMOUNTS[1]);
  const [showCustomAmount, setShowCustomAmount] = useState(false);
  const [customAmountRand, setCustomAmountRand] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contributorName, setContributorName] = useState('');
  const [messageOpen, setMessageOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderSuccessToast, setReminderSuccessToast] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);
  const previousNameRef = useRef('');

  const customAmountCents = useMemo(() => {
    if (!showCustomAmount) return null;
    if (!customAmountRand.trim()) return null;
    const parsed = Number(customAmountRand);
    if (!Number.isFinite(parsed)) return null;
    return parsed * 100;
  }, [customAmountRand, showCustomAmount]);

  const amountCents = showCustomAmount ? customAmountCents ?? 0 : selectedAmount;
  const isAmountValid =
    amountCents >= MIN_CONTRIBUTION_CENTS && amountCents <= MAX_CONTRIBUTION_CENTS;
  const trimmedName = contributorName.trim();
  const isNameValid = isAnonymous || (trimmedName.length >= 2 && trimmedName.length <= 50);
  const canContinue = hasAvailableProviders && isAmountValid && isNameValid && !isSaving;
  const charsLeft = MAX_MESSAGE_LENGTH - message.length;

  useEffect(() => {
    if (!reminderSuccessToast) return;
    const timeout = setTimeout(() => setReminderSuccessToast(null), 3000);
    return () => clearTimeout(timeout);
  }, [reminderSuccessToast]);

  const handleAnonymousChange = (checked: boolean) => {
    setIsAnonymous(checked);
    if (checked) {
      previousNameRef.current = contributorName;
      setContributorName('');
      return;
    }
    const restored = previousNameRef.current;
    if (restored) setContributorName(restored);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleContinue = () => {
    if (!canContinue) return;
    setSaveError(null);
    setIsSaving(true);
    const didSave = saveFlowData({
      amountCents,
      contributorName: isAnonymous ? '' : trimmedName,
      isAnonymous,
      message,
      slug,
      childName,
      dreamBoardId,
      timestamp: Date.now(),
    });
    if (!didSave) {
      setSaveError("We couldn't save your details. Please try again or use a different browser.");
      setIsSaving(false);
      return;
    }
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
    if (isIosNavigationDeferralTarget() && typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function') {
      window.requestAnimationFrame(() => {
        router.push(`/${slug}/contribute/payment`);
      });
      return;
    }
    router.push(`/${slug}/contribute/payment`);
  };

  return (
    <section className="mx-auto w-full max-w-3xl space-y-6">
      <header className="space-y-2">
        <Link href={`/${slug}`} className="inline-flex min-h-11 items-center text-sm text-primary-700 hover:underline">
          ← Back
        </Link>
        <h1 className="font-display text-3xl text-text">Chip in for {childName}</h1>
      </header>

      <section className="rounded-2xl bg-[#FDF8F3] px-6 py-5 text-center">
        <p className="text-base font-semibold text-gray-700">Most people chip in R250 💝</p>
      </section>

      <section className="space-y-3">
        <fieldset className="space-y-3">
          <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            How much would you like to chip in?
          </legend>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {PRESET_AMOUNTS.map((amount) => {
              const isSelected = !showCustomAmount && selectedAmount === amount;
              return (
                <button
                  key={amount}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setShowCustomAmount(false);
                    setCustomAmountRand('');
                    setSelectedAmount(amount);
                  }}
                  className={`min-h-16 rounded-lg border px-4 py-3 font-display text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                    isSelected
                      ? 'border-2 border-[#0D9488] bg-[#E8F5F0] text-[#0D9488]'
                      : 'border-gray-200 bg-white text-gray-900'
                  }`}
                >
                  {formatZar(amount)}
                  {amount === PRESET_AMOUNTS[1] ? ' ⭐' : ''}
                </button>
              );
            })}
            <button
              type="button"
              aria-pressed={showCustomAmount}
              onClick={() => setShowCustomAmount(true)}
              className={`min-h-16 rounded-lg border px-4 py-3 font-display text-xl font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                showCustomAmount
                  ? 'border-2 border-[#0D9488] bg-[#E8F5F0] text-[#0D9488]'
                  : 'border-gray-200 bg-white text-gray-900'
              }`}
            >
              Other
            </button>
          </div>
        </fieldset>

        {showCustomAmount ? (
          <Input
            value={customAmountRand}
            onChange={(event) => setCustomAmountRand(sanitizeAmountDigits(event.target.value))}
            inputMode="numeric"
            placeholder="Enter amount (R20 - R10,000)"
            className="h-16 text-base"
          />
        ) : null}
        {!isAmountValid ? (
          <p className="text-sm text-red-600">
            Please select or enter an amount between R20 and R10,000.
          </p>
        ) : null}
      </section>

      <section className="space-y-3">
        {!isAnonymous ? (
          <div className="space-y-2 transition-all duration-200">
            <label htmlFor="contributorName" className="text-xs font-bold uppercase tracking-[0.12em] text-gray-500">
              Your name
            </label>
            <Input
              ref={nameInputRef}
              id="contributorName"
              value={contributorName}
              onChange={(event) => setContributorName(event.target.value)}
              placeholder="The Mason Family"
              maxLength={50}
              className="text-base"
            />
            {!isNameValid ? <p className="text-sm text-red-600">Please enter a name (2-50 characters).</p> : null}
          </div>
        ) : null}

        <label className="inline-flex min-h-11 items-center gap-3 text-sm text-gray-900">
          <input
            type="checkbox"
            aria-label="Keep my name private"
            aria-checked={isAnonymous}
            checked={isAnonymous}
            onChange={(event) => handleAnonymousChange(event.target.checked)}
            className="h-5 w-5 rounded border-gray-300 accent-[#6B9E88] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          Keep my name private (Anonymous)
        </label>
      </section>

      <section className="space-y-2">
        {!messageOpen ? (
          <button
            type="button"
            onClick={() => setMessageOpen(true)}
            className="min-h-11 text-left text-xs font-semibold uppercase tracking-[0.12em] text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            Message (optional)
          </button>
        ) : null}
        {messageOpen ? (
          <div className="space-y-2">
            <label htmlFor="birthdayMessage" className="sr-only">
              Birthday message
            </label>
            <textarea
              id="birthdayMessage"
              value={message}
              onChange={(event) => setMessage(event.target.value.slice(0, MAX_MESSAGE_LENGTH))}
              placeholder={`Write a message for ${childName}! (e.g., 'Dear ${childName}, we're so excited for your birthday...')`}
              rows={5}
              className="min-h-[120px] w-full max-w-full rounded-xl border border-border bg-white p-3 text-base text-text shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />
            <p
              aria-live="polite"
              className={`text-right text-xs ${
                message.length >= 490 ? 'text-red-600' : message.length >= 400 ? 'text-orange-600' : 'text-gray-500'
              }`}
            >
              {message.length}/{MAX_MESSAGE_LENGTH}
              {message.length >= 490 ? ` · You have ${charsLeft} characters left` : ''}
            </p>
            <button
              type="button"
              onClick={() => setMessageOpen(false)}
              className="text-xs text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              ↑ Collapse
            </button>
          </div>
        ) : null}
      </section>

      <section className="space-y-3">
        <button
          type="button"
          onClick={() => setShowReminderModal(true)}
          className="min-h-11 text-xs text-primary-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          Remind me later
        </button>
        {reminderSuccessToast ? (
          <p className="rounded-lg border border-[#0D9488] bg-[#F0F7F4] px-3 py-2 text-sm text-[#0D9488]">
            {reminderSuccessToast}
          </p>
        ) : null}
      </section>

      {!hasAvailableProviders ? (
        <p className="rounded-xl border border-border bg-subtle px-4 py-3 text-sm text-text-muted">
          {unavailableMessage}
        </p>
      ) : null}

      <section className="space-y-3">
        {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
        <Button
          type="button"
          loading={isSaving}
          disabled={!canContinue}
          onClick={handleContinue}
          className="min-h-11 w-full rounded-lg bg-primary-700 text-base font-semibold text-white hover:bg-primary-800 sm:max-w-[400px]"
        >
          {isSaving ? 'Processing...' : 'Continue to payment'}
        </Button>
        <p className="text-center text-xs text-text-muted">🔒 Payments secured by PayFast</p>
      </section>

      <ReminderModal
        dreamBoardId={dreamBoardId}
        isOpen={showReminderModal}
        onClose={() => setShowReminderModal(false)}
        onSuccess={(messageText) => setReminderSuccessToast(messageText)}
      />
    </section>
  );
}
