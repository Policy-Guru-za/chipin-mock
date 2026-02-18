/**
 * @vitest-environment jsdom
 */
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GiftIconPreview } from '@/components/create-wizard/GiftIconPreview';

const mocks = vi.hoisted(() => ({
  getGiftIconById: vi.fn(),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    src,
    className,
  }: {
    alt: string;
    src: string;
    className?: string;
  }) => (
    <span
      role="img"
      aria-label={alt}
      data-src={src}
      className={className}
    />
  ),
}));

vi.mock('@/lib/icons/gift-icons', () => ({
  getGiftIconById: mocks.getGiftIconById,
}));

function mountHiddenIconInput(value: string) {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'giftIconId';
  input.value = value;
  document.body.appendChild(input);
  return input;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getGiftIconById.mockImplementation((iconId: string) => {
    if (iconId === 'scooter') {
      return {
        id: 'scooter',
        src: '/icons/gifts/scooter.png',
        label: 'Scooter',
        bgColor: '#E8F0E4',
      };
    }

    return undefined;
  });
});

afterEach(() => {
  cleanup();
  document.body.innerHTML = '';
});

describe('GiftIconPreview', () => {
  it('renders placeholder when no icon is selected', () => {
    render(<GiftIconPreview selectedIcon={null} />);
    expect(screen.getByText('Choose an icon below')).toBeInTheDocument();
    expect(screen.getByText('Your selected gift icon will appear here on the Dreamboard.')).toBeInTheDocument();
  });

  it('renders icon image when an icon is selected', async () => {
    mountHiddenIconInput('scooter');
    render(<GiftIconPreview selectedIcon="scooter" />);

    const iconImage = await screen.findByRole('img', { name: 'Scooter' });
    expect(iconImage).toBeInTheDocument();
    expect(iconImage).toHaveAttribute('data-src', '/icons/gifts/scooter.png');
  });

  it('updates when selectedIcon prop changes', async () => {
    const hiddenInput = mountHiddenIconInput('');
    const { rerender } = render(<GiftIconPreview selectedIcon={null} />);
    expect(screen.getByText('Choose an icon below')).toBeInTheDocument();

    hiddenInput.value = 'scooter';
    rerender(<GiftIconPreview selectedIcon="scooter" />);

    expect(await screen.findByRole('img', { name: 'Scooter' })).toBeInTheDocument();
    expect(screen.getByText('Scooter selected')).toBeInTheDocument();
  });

  it('applies selected-state visual styling classes', async () => {
    mountHiddenIconInput('scooter');
    const { container } = render(<GiftIconPreview selectedIcon="scooter" />);

    await screen.findByText('This icon will represent the dream gift.');

    const previewContainer = container.querySelector('.bg-sage-wash');
    expect(previewContainer).toBeInTheDocument();
    expect(previewContainer).toHaveClass('rounded-[20px]');
  });
});
