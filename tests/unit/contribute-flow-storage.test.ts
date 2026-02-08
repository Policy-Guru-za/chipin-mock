/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearFlowData,
  getFlowData,
  getStorageKey,
  saveFlowData,
  type ContributeFlowData,
} from '@/lib/contributions/flow-storage';

const slug = 'maya-board';

const buildFlowData = (): ContributeFlowData => ({
  amountCents: 25000,
  contributorName: 'Ava',
  isAnonymous: false,
  message: 'Happy birthday!',
  slug,
  childName: 'Maya',
  dreamBoardId: '00000000-0000-4000-8000-000000000001',
  timestamp: Date.now(),
});

afterEach(() => {
  sessionStorage.clear();
});

describe('contribute flow storage', () => {
  it('builds the storage key from slug', () => {
    expect(getStorageKey(slug)).toBe('gifta_contribute_maya-board');
  });

  it('round-trips saved flow data', () => {
    const data = buildFlowData();
    expect(saveFlowData(data)).toBe(true);

    const stored = getFlowData(slug);
    expect(stored).toEqual(data);
  });

  it('returns null for missing entries', () => {
    expect(getFlowData(slug)).toBeNull();
  });

  it('expires entries older than 30 minutes and removes them', () => {
    const expired = { ...buildFlowData(), timestamp: Date.now() - 31 * 60 * 1000 };
    sessionStorage.setItem(getStorageKey(slug), JSON.stringify(expired));

    expect(getFlowData(slug)).toBeNull();
    expect(sessionStorage.getItem(getStorageKey(slug))).toBeNull();
  });

  it('returns null for invalid JSON payloads', () => {
    sessionStorage.setItem(getStorageKey(slug), '{not-json');
    expect(getFlowData(slug)).toBeNull();
  });

  it('clears stored flow data', () => {
    saveFlowData(buildFlowData());
    clearFlowData(slug);
    expect(getFlowData(slug)).toBeNull();
  });

  it('is SSR-safe when window is unavailable', () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      configurable: true,
    });

    expect(saveFlowData(buildFlowData())).toBe(false);
    expect(getFlowData(slug)).toBeNull();
    expect(() => clearFlowData(slug)).not.toThrow();

    Object.defineProperty(globalThis, 'window', {
      value: originalWindow,
      configurable: true,
    });
  });

  it('returns false when sessionStorage writes fail', () => {
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota exceeded');
    });

    expect(saveFlowData(buildFlowData())).toBe(false);
    setItemSpy.mockRestore();
  });
});
