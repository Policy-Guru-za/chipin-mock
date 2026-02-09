'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';

import {
  BanknotesIcon,
  ChartBarIcon,
  CogIcon,
  DashboardIcon,
  GiftIcon,
  HeartIcon,
  MenuIcon,
  WalletIcon,
  XIcon,
} from '@/components/icons';
import { cn } from '@/lib/utils';

type AdminSidebarProps = {
  userEmail: string;
};

const navItems = [
  { href: '/admin', label: 'Dashboard', Icon: DashboardIcon },
  { href: '/admin/dream-boards', label: 'Dream Boards', Icon: GiftIcon },
  { href: '/admin/contributions', label: 'Contributions', Icon: WalletIcon },
  { href: '/admin/payouts', label: 'Payout queue', Icon: BanknotesIcon },
  { href: '/admin/charities', label: 'Charity management', Icon: HeartIcon },
  { href: '/admin/reports', label: 'Financial reports', Icon: ChartBarIcon },
  { href: '/admin/settings', label: 'Settings', Icon: CogIcon },
];

const isActive = (pathname: string, href: string) =>
  href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

const NavContent = ({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) => (
  <nav aria-label="Admin navigation" className="mt-4">
    <ul className="space-y-2">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-r-lg border-l-2 px-4 py-2.5 text-sm transition',
                active
                  ? 'border-teal-600 bg-teal-50 font-semibold text-teal-700'
                  : 'border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
            >
              <item.Icon size="md" />
              <span>{item.label}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  </nav>
);

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const [openForPath, setOpenForPath] = useState<string | null>(null);

  const normalizedPathname = useMemo(() => pathname || '/admin', [pathname]);
  const isOpen = openForPath === normalizedPathname;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenForPath(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  return (
    <>
      <aside className="hidden h-screen w-60 shrink-0 border-r border-gray-200 bg-white px-4 py-6 lg:fixed lg:inset-y-0 lg:left-0 lg:block">
        <p className="font-display text-lg font-bold text-teal-600">Gifta Admin</p>
        <NavContent pathname={normalizedPathname} />
        <p className="mt-6 truncate text-xs text-gray-500">{userEmail}</p>
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 lg:hidden">
        <div>
          <p className="font-display text-lg font-bold text-teal-600">Gifta Admin</p>
          <p className="truncate text-xs text-gray-500">{userEmail}</p>
        </div>
        <button
          type="button"
          aria-label="Toggle admin menu"
          aria-expanded={isOpen}
          onClick={() =>
            setOpenForPath((current) => (current === normalizedPathname ? null : normalizedPathname))
          }
          className="rounded-lg border border-gray-200 p-2 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {isOpen ? <XIcon /> : <MenuIcon />}
        </button>
      </header>

      {isOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            onClick={() => setOpenForPath(null)}
            className="absolute inset-0 bg-black/30"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-hidden={!isOpen}
            className="relative h-full w-60 border-r border-gray-200 bg-white px-4 py-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-lg font-bold text-teal-600">Gifta Admin</p>
              <button
                type="button"
                onClick={() => setOpenForPath(null)}
                className="rounded-lg p-2 text-gray-700 hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <span className="sr-only">Close menu</span>
                <XIcon />
              </button>
            </div>
            <NavContent pathname={normalizedPathname} onNavigate={() => setOpenForPath(null)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
