'use client';

import type { CSSProperties } from 'react';
import { UserButton, useUser } from '@clerk/nextjs';

import { DashboardIcon, GiftIcon } from '@/components/icons';

type UserAvatarVariant = 'pill' | 'compact';

interface UserAvatarMenuProps {
  afterSignOutUrl?: string;
  variant?: UserAvatarVariant;
}

const toAlphaNumericChars = (value: string | null | undefined) =>
  (value ?? '').trim().toUpperCase().match(/[A-Z0-9]/g) ?? [];

const deriveInitials = (
  firstName: string | null | undefined,
  lastName: string | null | undefined,
  emailAddress: string | null | undefined
) => {
  const firstNameChars = toAlphaNumericChars(firstName);
  const lastNameChars = toAlphaNumericChars(lastName);

  if (firstNameChars[0] && lastNameChars[0]) {
    return `${firstNameChars[0]}${lastNameChars[0]}`;
  }

  if (firstNameChars[0] && firstNameChars[1]) {
    return `${firstNameChars[0]}${firstNameChars[1]}`;
  }

  if (firstNameChars[0]) {
    return firstNameChars[0];
  }

  if (lastNameChars[0]) {
    return lastNameChars[0];
  }

  const localPartChars = toAlphaNumericChars(emailAddress?.split('@')[0] ?? null);
  if (localPartChars[0] && localPartChars[1]) {
    return `${localPartChars[0]}${localPartChars[1]}`;
  }

  if (localPartChars[0]) {
    return localPartChars[0];
  }

  return 'U';
};

const deriveFirstName = (firstName: string | null | undefined) => {
  const normalized = firstName?.trim();
  if (!normalized) return 'User';
  return normalized;
};

const encodeCssContent = (value: string) =>
  `"${value
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r\n|\r|\n/g, '\\A ')}"`;

type SoftSignetStyle = CSSProperties & {
  '--gifta-soft-signet-initials'?: string;
  '--gifta-soft-signet-name'?: string;
};

export function UserAvatarMenu({ afterSignOutUrl = '/', variant = 'pill' }: UserAvatarMenuProps) {
  const { user } = useUser();
  const firstNameDisplay = deriveFirstName(user?.firstName);
  const initialsDisplay = deriveInitials(
    user?.firstName,
    user?.lastName,
    user?.primaryEmailAddress?.emailAddress
  );
  const isCompact = variant === 'compact';

  const wrapperStyle: SoftSignetStyle = {
    '--gifta-soft-signet-initials': encodeCssContent(initialsDisplay),
    '--gifta-soft-signet-name': encodeCssContent(firstNameDisplay),
  };

  return (
    <div
      className={`gifta-soft-signet ${isCompact ? 'gifta-soft-signet--compact' : 'gifta-soft-signet--pill'}`}
      style={wrapperStyle}
    >
      <UserButton
        afterSignOutUrl={afterSignOutUrl}
        showName={!isCompact}
        appearance={{
          elements: {
            userButtonBox: 'gifta-soft-signet-box',
            userButtonTrigger: `gifta-soft-signet-trigger ${isCompact ? 'gifta-soft-signet-trigger--compact' : 'gifta-soft-signet-trigger--pill'}`,
            userButtonTrigger__open: 'gifta-soft-signet-trigger-open',
            userButtonAvatarBox: 'gifta-soft-signet-avatar',
            userButtonAvatarBox__open: 'gifta-soft-signet-avatar-open',
            userButtonAvatarImage: 'gifta-soft-signet-avatar-image',
            userButtonOuterIdentifier: `gifta-soft-signet-identifier ${isCompact ? 'gifta-soft-signet-identifier--compact' : ''}`.trim(),
            userButtonOuterIdentifier__open: 'gifta-soft-signet-identifier-open',
          },
        }}
      >
        <UserButton.MenuItems>
          <UserButton.Link
            label="Dashboard"
            href="/dashboard"
            labelIcon={<DashboardIcon size="sm" className="text-text-muted" />}
          />
          <UserButton.Link
            label="Create Dreamboard"
            href="/create/child"
            labelIcon={<GiftIcon size="sm" className="text-text-muted" />}
          />
          <UserButton.Action label="manageAccount" />
          <UserButton.Action label="signOut" />
        </UserButton.MenuItems>
      </UserButton>
    </div>
  );
}
