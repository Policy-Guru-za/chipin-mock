/**
 * @vitest-environment jsdom
 */
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

const clerkMocks = vi.hoisted(() => ({
  captureUserButtonProps: vi.fn(),
  useUserMock: vi.fn(),
}));

vi.mock('@clerk/nextjs', () => {
  const UserButton = function MockUserButton({ children, ...props }: { children: ReactNode }) {
    clerkMocks.captureUserButtonProps(props);
    return createElement('div', { 'data-testid': 'mock-user-button' }, children);
  };

  UserButton.MenuItems = function MockUserButtonMenuItems({ children }: { children: ReactNode }) {
    return createElement('div', { 'data-testid': 'mock-menu-items' }, children);
  };
  UserButton.Link = function MockUserButtonLink({ label, href }: { label: string; href: string }) {
    return createElement('a', { href }, label);
  };
  UserButton.Action = function MockUserButtonAction({ label }: { label: string }) {
    return createElement('button', {}, label);
  };

  return {
    UserButton,
    useUser: clerkMocks.useUserMock,
  };
});

import { UserAvatarMenu } from '@/components/auth/UserAvatarMenu';

type MockUser = {
  firstName?: string | null;
  lastName?: string | null;
  primaryEmailAddress?: {
    emailAddress?: string | null;
  } | null;
};

const setMockUser = (user: MockUser | null) => {
  clerkMocks.useUserMock.mockReturnValue({ user });
};

describe('UserAvatarMenu', () => {
  beforeEach(() => {
    clerkMocks.captureUserButtonProps.mockClear();
    clerkMocks.useUserMock.mockReset();
  });

  it('uses pill variant defaults with stable appearance mapping and preserved menu items', () => {
    setMockUser({
      firstName: 'Ryan',
      lastName: 'Laubscher',
      primaryEmailAddress: { emailAddress: 'ryan@example.com' },
    });

    const { container } = render(<UserAvatarMenu afterSignOutUrl="/bye" />);
    const props = clerkMocks.captureUserButtonProps.mock.calls.at(-1)?.[0];

    expect(props.afterSignOutUrl).toBe('/bye');
    expect(props.showName).toBe(true);
    expect(props.appearance.elements.userButtonBox).toBe('gifta-soft-signet-box');
    expect(props.appearance.elements.userButtonTrigger).toContain('gifta-soft-signet-trigger');
    expect(props.appearance.elements.userButtonTrigger__open).toBe('gifta-soft-signet-trigger-open');
    expect(props.appearance.elements.userButtonAvatarBox).toBe('gifta-soft-signet-avatar');
    expect(props.appearance.elements.userButtonAvatarBox__open).toBe('gifta-soft-signet-avatar-open');
    expect(props.appearance.elements.userButtonAvatarImage).toBe('gifta-soft-signet-avatar-image');
    expect(props.appearance.elements.userButtonOuterIdentifier).toContain('gifta-soft-signet-identifier');
    expect(props.appearance.elements.userButtonOuterIdentifier__open).toBe(
      'gifta-soft-signet-identifier-open'
    );

    const wrapper = container.querySelector('.gifta-soft-signet');
    expect(wrapper).not.toBeNull();
    expect(wrapper?.style.getPropertyValue('--gifta-soft-signet-name')).toBe('"Ryan"');
    expect(wrapper?.style.getPropertyValue('--gifta-soft-signet-initials')).toBe('"RL"');

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
    expect(screen.getByRole('link', { name: 'Create Dreamboard' })).toHaveAttribute(
      'href',
      '/create/child'
    );
    expect(screen.getByRole('button', { name: 'manageAccount' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'signOut' })).toBeInTheDocument();
  });

  it('uses compact variant without name display', () => {
    setMockUser({
      firstName: 'Ava',
      lastName: 'Stone',
      primaryEmailAddress: { emailAddress: 'ava@example.com' },
    });

    render(<UserAvatarMenu variant="compact" />);
    const props = clerkMocks.captureUserButtonProps.mock.calls.at(-1)?.[0];

    expect(props.showName).toBe(false);
    expect(props.appearance.elements.userButtonTrigger).toContain(
      'gifta-soft-signet-trigger--compact'
    );
    expect(props.appearance.elements.userButtonOuterIdentifier).toContain(
      'gifta-soft-signet-identifier--compact'
    );
  });

  it('falls back to email local-part initials and default name when user names are missing', () => {
    setMockUser({
      firstName: null,
      lastName: null,
      primaryEmailAddress: { emailAddress: 'alpha.beta+1@example.com' },
    });

    const { container } = render(<UserAvatarMenu />);
    const wrapper = container.querySelector('.gifta-soft-signet');

    expect(wrapper?.style.getPropertyValue('--gifta-soft-signet-name')).toBe('"User"');
    expect(wrapper?.style.getPropertyValue('--gifta-soft-signet-initials')).toBe('"AL"');
  });

  it('uses final fallback initials when names and email are unavailable', () => {
    setMockUser({
      firstName: null,
      lastName: null,
      primaryEmailAddress: null,
    });

    const { container } = render(<UserAvatarMenu />);
    const wrapper = container.querySelector('.gifta-soft-signet');

    expect(wrapper?.style.getPropertyValue('--gifta-soft-signet-name')).toBe('"User"');
    expect(wrapper?.style.getPropertyValue('--gifta-soft-signet-initials')).toBe('"U"');
  });

  it('safely escapes CSS content payloads for custom properties', () => {
    setMockUser({
      firstName: 'A"\\\nB',
      lastName: 'C',
      primaryEmailAddress: { emailAddress: 'abc@example.com' },
    });

    const { container } = render(<UserAvatarMenu />);
    const wrapper = container.querySelector('.gifta-soft-signet');
    const encodedName = wrapper?.style.getPropertyValue('--gifta-soft-signet-name') ?? '';

    expect(encodedName).toContain('\\"');
    expect(encodedName).toContain('\\\\');
    expect(encodedName).toContain('\\A');
    expect(encodedName).not.toContain('\n');
  });
});
