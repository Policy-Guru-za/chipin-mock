/**
 * @vitest-environment jsdom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, renderHook } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { useDraftPersistence } from '@/components/create-wizard/useDraftPersistence';

afterEach(() => cleanup());

describe('useDraftPersistence', () => {
  let storage: Record<string, string>;
  let setItemCalls: Array<{ key: string; value: string }>;
  let removeItemCalls: string[];
  let visibilityState: DocumentVisibilityState;

  const setDocumentVisibilityState = (nextState: DocumentVisibilityState) => {
    visibilityState = nextState;
  };

  beforeEach(() => {
    vi.useFakeTimers();
    storage = {};
    setItemCalls = [];
    removeItemCalls = [];
    visibilityState = 'visible';

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      get: () => visibilityState,
    });

    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key: string) => storage[key] ?? null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string, value: string) => {
      setItemCalls.push({ key, value });
      storage[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key: string) => {
      removeItemCalls.push(key);
      delete storage[key];
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('returns empty object when no stored values exist', () => {
    const { result } = renderHook(() => useDraftPersistence('child', ['childName']));

    expect(result.current.restoreValues()).toEqual({});
  });

  it('writes to sessionStorage with the correct key after debounce', () => {
    const { result } = renderHook(() =>
      useDraftPersistence('child', ['childName', 'childAge']),
    );

    act(() => {
      result.current.persistValues({ childName: 'Maya', childAge: '7' });
    });

    expect(setItemCalls).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(setItemCalls).toHaveLength(1);
    expect(setItemCalls[0].key).toBe('gifta-wizard-draft-child');
    expect(setItemCalls[0].value).toBe(JSON.stringify({ childName: 'Maya', childAge: '7' }));
  });

  it('restores stored values from sessionStorage', () => {
    storage['gifta-wizard-draft-child'] = JSON.stringify({
      childName: 'Maya',
      childAge: '7',
    });

    const { result } = renderHook(() =>
      useDraftPersistence('child', ['childName', 'childAge']),
    );

    expect(result.current.restoreValues()).toEqual({ childName: 'Maya', childAge: '7' });
  });

  it('clears draft from sessionStorage', () => {
    const { result } = renderHook(() =>
      useDraftPersistence('child', ['childName', 'childAge']),
    );

    act(() => {
      result.current.clearDraft();
    });

    expect(removeItemCalls).toContain('gifta-wizard-draft-child');
  });

  it('stores only fields listed in fieldNames', () => {
    const { result } = renderHook(() =>
      useDraftPersistence('child', ['childName', 'childAge']),
    );

    act(() => {
      result.current.persistValues({
        childName: 'Maya',
        childAge: '7',
        ignoredField: 'ignore-me',
      } as Record<string, string>);
      vi.advanceTimersByTime(500);
    });

    expect(storage['gifta-wizard-draft-child']).toBe(
      JSON.stringify({ childName: 'Maya', childAge: '7' }),
    );
  });

  it('persists immediately on visibilitychange hidden', () => {
    const { result } = renderHook(() =>
      useDraftPersistence('child', ['childName', 'childAge']),
    );

    act(() => {
      result.current.persistValues({ childName: 'Maya', childAge: '7' });
    });

    expect(setItemCalls).toHaveLength(0);

    act(() => {
      setDocumentVisibilityState('hidden');
      document.dispatchEvent(new Event('visibilitychange'));
    });

    expect(setItemCalls).toHaveLength(1);
    expect(storage['gifta-wizard-draft-child']).toBe(
      JSON.stringify({ childName: 'Maya', childAge: '7' }),
    );
  });

  it('filters out non-string restored values', () => {
    storage['gifta-wizard-draft-child'] = JSON.stringify({
      childName: 'Maya',
      childAge: 7,
      childNote: null,
    });

    const { result } = renderHook(() =>
      useDraftPersistence('child', ['childName', 'childAge', 'childNote']),
    );

    expect(result.current.restoreValues()).toEqual({ childName: 'Maya' });
  });

  it('debounces rapid writes into a single setItem call', () => {
    const { result } = renderHook(() =>
      useDraftPersistence('child', ['childName', 'childAge']),
    );

    act(() => {
      result.current.persistValues({ childName: 'Ava', childAge: '6' });
      result.current.persistValues({ childName: 'Mia', childAge: '7' });
      result.current.persistValues({ childName: 'Maya', childAge: '8' });
    });

    expect(setItemCalls).toHaveLength(0);

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(setItemCalls).toHaveLength(1);
    expect(storage['gifta-wizard-draft-child']).toBe(
      JSON.stringify({ childName: 'Maya', childAge: '8' }),
    );
  });
});

