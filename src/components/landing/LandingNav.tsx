'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { navLinks } from './content';

interface LandingNavProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export function LandingNav({ mobileMenuOpen, setMobileMenuOpen }: LandingNavProps) {
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback(() => {
    setMobileMenuOpen(false);
    menuButtonRef.current?.focus();
  }, [setMobileMenuOpen]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        setMobileMenuOpen(false);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [setMobileMenuOpen]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const menu = menuRef.current;
    if (!menu) return undefined;

    const focusable = menu.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0] as HTMLElement;
    const last = focusable[focusable.length - 1] as HTMLElement;

    if (first) {
      first.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== 'Tab' || !first || !last) return;

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, closeMenu]);

  return (
    <>
      {/* Mobile Menu Overlay & Drawer */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 animate-in fade-in duration-300"
            onClick={() => closeMenu()}
          />
          <div
            className="fixed top-0 right-0 bottom-0 z-50 w-[280px] max-w-[85vw] bg-[#FFFCF9] px-6 pt-20 pb-6 flex flex-col gap-2 animate-in slide-in-from-right duration-300"
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            ref={menuRef}
            tabIndex={-1}
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => closeMenu()}
                className="block px-4 py-4 text-[#3D3D3D] no-underline font-medium text-base rounded-lg transition-colors hover:bg-black/[0.04]"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/create"
              onClick={() => closeMenu()}
              className="mt-auto w-full bg-gradient-to-br from-[#6B9E88] to-[#5A8E78] text-white border-none px-6 py-4 rounded-[10px] font-semibold text-[15px] text-center"
            >
              Create a Free Dreamboard
            </Link>
          </div>
        </>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 flex justify-between items-center px-4 py-4 md:px-10 md:py-6 lg:px-16 lg:py-7 z-30 border-b border-black/[0.04] bg-[#FFFCF9]/95 supports-[backdrop-filter]:backdrop-blur-sm">
        <Link
          href="/"
          className="flex items-center gap-2.5 no-underline"
          style={{ fontFamily: 'var(--font-nunito)' }}
        >
          <span className="text-[30px]">🎁</span>
          <span className="text-[28px] font-bold text-[#3D3D3D]">Gifta</span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-10">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-[#777] no-underline font-medium text-[15px] hover:text-[#3D3D3D] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <Link
            href="/create"
            className="bg-gradient-to-br from-[#6B9E88] to-[#5A8E78] text-white border-none px-7 py-3.5 rounded-[10px] font-semibold text-[15px] shadow-[0_4px_16px_rgba(107,158,136,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_20px_rgba(107,158,136,0.4)] active:translate-y-0"
          >
            Create a Free Dreamboard
          </Link>
          <Link
            href="/create"
            className="bg-transparent text-[#5A8E78] border-2 border-[#5A8E78] px-6 py-3 rounded-[10px] font-semibold text-[15px] transition-all hover:bg-[#5A8E78] hover:text-white"
          >
            Login
          </Link>
        </div>

        {/* Hamburger Menu Button */}
        <button
          className="lg:hidden flex flex-col gap-[5px] bg-transparent border-none cursor-pointer p-2 z-[60]"
          onClick={() => (mobileMenuOpen ? closeMenu() : setMobileMenuOpen(true))}
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-menu"
          ref={menuButtonRef}
        >
          <span
            className={`block w-6 h-0.5 bg-[#3D3D3D] transition-all duration-300 ${
              mobileMenuOpen ? 'rotate-45 translate-y-[7px]' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[#3D3D3D] transition-all duration-300 ${
              mobileMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span
            className={`block w-6 h-0.5 bg-[#3D3D3D] transition-all duration-300 ${
              mobileMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''
            }`}
          />
        </button>
      </nav>
    </>
  );
}
