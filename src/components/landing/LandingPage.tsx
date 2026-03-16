'use client';

import { useState } from 'react';

import { AgentationHomepageOverlay } from '@/components/dev/AgentationHomepageOverlay';
import { LandingBodyExact } from '@/components/landing-exact/LandingBodyExact';

import chromeStyles from './LandingChrome.module.css';
import { LandingNav } from './LandingNav';

interface LandingPageProps {
  isClerkEnabled?: boolean;
}

export function LandingPage({ isClerkEnabled = false }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className={chromeStyles.page}>
      <LandingNav
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isClerkEnabled={isClerkEnabled}
      />

      <LandingBodyExact />
      <AgentationHomepageOverlay />
    </div>
  );
}
