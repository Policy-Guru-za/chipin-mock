'use client';

import { useEffect, useRef } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';

import {
  getGoogleAnalyticsBootstrapScript,
  GOOGLE_ANALYTICS_MEASUREMENT_ID,
  isGoogleAnalyticsEnabled,
  shouldTrackGoogleAnalyticsPath,
  trackGoogleAnalyticsPageView,
} from '@/lib/analytics/google';

export function GoogleAnalyticsTag() {
  const pathname = usePathname();
  const lastTrackedPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (
      !pathname ||
      !isGoogleAnalyticsEnabled(GOOGLE_ANALYTICS_MEASUREMENT_ID) ||
      !shouldTrackGoogleAnalyticsPath(pathname) ||
      lastTrackedPathnameRef.current === pathname
    ) {
      return;
    }

    lastTrackedPathnameRef.current = pathname;
    trackGoogleAnalyticsPageView({
      measurementId: GOOGLE_ANALYTICS_MEASUREMENT_ID,
      pathname,
    });
  }, [pathname]);

  if (
    !pathname ||
    !isGoogleAnalyticsEnabled(GOOGLE_ANALYTICS_MEASUREMENT_ID) ||
    !shouldTrackGoogleAnalyticsPath(pathname)
  ) {
    return null;
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ANALYTICS_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id={`google-analytics-${GOOGLE_ANALYTICS_MEASUREMENT_ID}`} strategy="afterInteractive">
        {getGoogleAnalyticsBootstrapScript(GOOGLE_ANALYTICS_MEASUREMENT_ID)}
      </Script>
    </>
  );
}
