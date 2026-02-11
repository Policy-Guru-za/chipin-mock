'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';

import { UserAvatarMenu } from '@/components/auth/UserAvatarMenu';
import { buttonVariants } from '@/components/ui/button';
import { MenuIcon } from '@/components/icons';
import { MobileNav } from '@/components/layout/MobileNav';
import { trackNavDrawerOpened } from '@/lib/analytics/metrics';
const navLinkClasses = 'text-sm font-medium text-text-muted transition hover:text-text';

interface HeaderProps {
  isClerkEnabled?: boolean;
}

export function Header({ isClerkEnabled = false }: HeaderProps) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const handleOpenMobileNav = useCallback(() => {
    setIsMobileNavOpen(true);
    trackNavDrawerOpened();
  }, []);

  const handleCloseMobileNav = useCallback(() => {
    setIsMobileNavOpen(false);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-surface/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 no-underline"
            style={{ fontFamily: 'var(--font-nunito)' }}
          >
            <span className="text-[30px]">🎁</span>
            <span className="text-[28px] font-bold text-[#3D3D3D]">Gifta</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="/#how-it-works" className={navLinkClasses}>
              How it works
            </Link>
            <Link href="/#safety" className={navLinkClasses}>
              Trust & safety
            </Link>
            <Link href="/create" className={buttonVariants({ size: 'sm' })}>
              Create a Dreamboard
            </Link>
            {isClerkEnabled ? (
              <>
                <SignedOut>
                  <Link
                    href="/sign-in"
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    Sign in
                  </Link>
                </SignedOut>
                <SignedIn>
                  <UserAvatarMenu afterSignOutUrl="/" />
                </SignedIn>
              </>
            ) : null}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={handleOpenMobileNav}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-text-muted hover:bg-subtle hover:text-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"
            aria-label="Open navigation menu"
            aria-expanded={isMobileNavOpen}
            aria-controls="mobile-nav"
          >
            <MenuIcon size="lg" />
          </button>
        </div>
      </header>

      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={handleCloseMobileNav}
        isClerkEnabled={isClerkEnabled}
      />
    </>
  );
}
