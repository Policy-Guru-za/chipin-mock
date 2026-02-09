'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { XIcon } from '@/components/icons';

interface ReminderModalProps {
  dreamBoardId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (message: string) => void;
}

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export function ReminderModal({ dreamBoardId, isOpen, onClose, onSuccess }: ReminderModalProps) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    setEmail('');
    setErrorMessage(null);
    setIsSubmitting(false);
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
        return;
      }

      if (event.key !== 'Tab' || !modalRef.current) return;
      const focusables = modalRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleClose, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    const normalizedEmail = email.trim();
    if (!isValidEmail(normalizedEmail)) {
      setErrorMessage('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/internal/contributions/reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dreamBoardId,
          email: normalizedEmail,
          remindInDays: 3,
        }),
      });

      if (response.status === 200 || response.status === 201) {
        onSuccess?.('Reminder set! Check your email.');
        handleClose();
        return;
      }

      setErrorMessage('Something went wrong. Please try again.');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) handleClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminder-modal-title"
        className="w-full max-w-[500px] rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-2">
            <h2 id="reminder-modal-title" className="font-display text-2xl text-text">
              Get a reminder 🔔
            </h2>
            <p className="text-sm text-text-muted">
              We&apos;ll send one reminder before this Dream Board closes.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close reminder modal"
            onClick={handleClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-muted hover:bg-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <XIcon />
          </button>
        </div>

        <div className="space-y-3">
          <label htmlFor="reminderEmail" className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
            Email
          </label>
          <Input
            id="reminderEmail"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Your email address"
            type="email"
            className="min-h-11"
            autoFocus
          />
          {errorMessage ? <p role="alert" className="text-sm text-red-600">{errorMessage}</p> : null}
          <Button type="button" onClick={handleSubmit} loading={isSubmitting} className="min-h-11 w-full">
            Send Reminder
          </Button>
        </div>
      </div>
    </div>
  );
}
