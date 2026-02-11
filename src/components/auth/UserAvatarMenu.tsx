'use client';

import { UserButton } from '@clerk/nextjs';

import { DashboardIcon, GiftIcon } from '@/components/icons';

interface UserAvatarMenuProps {
  afterSignOutUrl?: string;
}

export function UserAvatarMenu({ afterSignOutUrl = '/' }: UserAvatarMenuProps) {
  return (
    <UserButton afterSignOutUrl={afterSignOutUrl}>
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
  );
}
