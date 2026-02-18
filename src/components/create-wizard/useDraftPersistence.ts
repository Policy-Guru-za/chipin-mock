'use client';

import { useCallback, useEffect, useRef } from 'react';

const DRAFT_PERSIST_DEBOUNCE_MS = 500;

function isQuotaExceededError(error: unknown): boolean {
  return (
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  );
}

function coerceFieldValues(
  values: Record<string, unknown>,
  fieldNames: string[],
): Record<string, string> {
  const draftValues: Record<string, string> = {};

  for (const fieldName of fieldNames) {
    const value = values[fieldName];
    if (typeof value === 'string') {
      draftValues[fieldName] = value;
    }
  }

  return draftValues;
}

export function useDraftPersistence(stepKey: string, fieldNames: string[]): {
  restoreValues: () => Record<string, string>;
  persistValues: (values: Record<string, string>) => void;
  clearDraft: () => void;
} {
  const storageKey = `gifta-wizard-draft-${stepKey}`;
  const debounceTimerRef = useRef<number | null>(null);
  const latestValuesRef = useRef<Record<string, string>>({});

  const persistNow = useCallback(
    (values: Record<string, string>) => {
      const normalizedValues = coerceFieldValues(values, fieldNames);
      latestValuesRef.current = normalizedValues;

      if (typeof window === 'undefined') {
        return;
      }

      try {
        window.sessionStorage.setItem(storageKey, JSON.stringify(normalizedValues));
      } catch (error) {
        if (isQuotaExceededError(error)) {
          console.warn('[wizard-draft] sessionStorage quota exceeded', {
            stepKey,
            storageKey,
          });
        }
      }
    },
    [fieldNames, stepKey, storageKey],
  );

  const restoreValues = useCallback((): Record<string, string> => {
    if (typeof window === 'undefined') {
      return {};
    }

    const rawDraft = window.sessionStorage.getItem(storageKey);
    if (!rawDraft) {
      latestValuesRef.current = {};
      return {};
    }

    try {
      const parsedDraft = JSON.parse(rawDraft);
      if (!parsedDraft || typeof parsedDraft !== 'object') {
        latestValuesRef.current = {};
        return {};
      }

      const restoredValues = coerceFieldValues(
        parsedDraft as Record<string, unknown>,
        fieldNames,
      );
      latestValuesRef.current = restoredValues;
      return restoredValues;
    } catch {
      latestValuesRef.current = {};
      return {};
    }
  }, [fieldNames, storageKey]);

  const persistValues = useCallback(
    (values: Record<string, string>) => {
      const normalizedValues = coerceFieldValues(values, fieldNames);
      latestValuesRef.current = normalizedValues;

      if (typeof window === 'undefined') {
        return;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = window.setTimeout(() => {
        persistNow(normalizedValues);
        debounceTimerRef.current = null;
      }, DRAFT_PERSIST_DEBOUNCE_MS);
    },
    [fieldNames, persistNow],
  );

  const clearDraft = useCallback(() => {
    latestValuesRef.current = {};

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(storageKey);
    }
  }, [storageKey]);

  useEffect(() => {
    if (typeof document === 'undefined') {
      return;
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'hidden') {
        return;
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      persistNow(latestValuesRef.current);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
        persistNow(latestValuesRef.current);
      }
    };
  }, [persistNow]);

  return {
    restoreValues,
    persistValues,
    clearDraft,
  };
}
