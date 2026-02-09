/**
 * @vitest-environment jsdom
 */
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) =>
    createElement('img', { src, alt, ...props }),
}));

import { GiftIconPicker } from '@/components/gift/GiftIconPicker';

const setMatchMedia = (queries: Record<string, boolean>) => {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: queries[query] ?? false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))
  );
};

const renderPicker = () =>
  render(
    <>
      <label htmlFor="giftName">Gift name</label>
      <input id="giftName" defaultValue="Ballet shoes" />

      <label htmlFor="giftDescription">Gift description</label>
      <textarea id="giftDescription" defaultValue="Dance classes" />

      <GiftIconPicker
        selectedIconId="ballet"
        giftNameInputId="giftName"
        giftDescriptionInputId="giftDescription"
        defaultGiftName="Ballet shoes"
        defaultGiftDescription="Dance classes"
        childAge={7}
      />
    </>
  );

describe('GiftIconPicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setMatchMedia({
      '(min-width: 640px)': false,
      '(min-width: 768px)': false,
    });
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('keeps manual icon selection when text suggestion updates', () => {
    const { container } = renderPicker();
    const selectedIconInput = container.querySelector('input[name="giftIconId"]') as HTMLInputElement;
    expect(selectedIconInput.value).toBe('ballet');

    fireEvent.click(screen.getByRole('radio', { name: 'Train' }));
    expect(selectedIconInput.value).toBe('train');

    const giftNameInput = screen.getByLabelText('Gift name');
    fireEvent.input(giftNameInput, { target: { value: 'soccer ball gift' } });
    vi.advanceTimersByTime(350);

    expect(selectedIconInput.value).toBe('train');
  });

  it('uses responsive md column count for vertical keyboard navigation', () => {
    setMatchMedia({
      '(min-width: 640px)': true,
      '(min-width: 768px)': true,
    });

    renderPicker();

    const bicycle = screen.getByRole('radio', { name: 'Bicycle' });
    const fishing = screen.getByRole('radio', { name: 'Fishing' });
    bicycle.focus();

    fireEvent.keyDown(bicycle, { key: 'ArrowDown' });

    expect(fishing).toHaveFocus();
  });
});
