import { describe, expect, it } from 'vitest';

import {
  buildGoogleAnalyticsPageLocation,
  getGoogleAnalyticsBootstrapScript,
  getGoogleAnalyticsPageTitle,
  sanitizeGoogleAnalyticsEventParameters,
  sanitizeGoogleAnalyticsPath,
  shouldTrackGoogleAnalyticsPath,
} from '@/lib/analytics/google';

describe('google analytics helpers', () => {
  it('excludes admin, api, health, dev, and utility routes from tracking', () => {
    expect(shouldTrackGoogleAnalyticsPath('/')).toBe(true);
    expect(shouldTrackGoogleAnalyticsPath('/dashboard')).toBe(true);
    expect(shouldTrackGoogleAnalyticsPath('/admin')).toBe(false);
    expect(shouldTrackGoogleAnalyticsPath('/api/internal/analytics')).toBe(false);
    expect(shouldTrackGoogleAnalyticsPath('/health/ready')).toBe(false);
    expect(shouldTrackGoogleAnalyticsPath('/dev/icon-picker')).toBe(false);
    expect(shouldTrackGoogleAnalyticsPath('/opengraph-image')).toBe(false);
  });

  it('sanitizes dynamic guest and dashboard paths into stable templates', () => {
    expect(sanitizeGoogleAnalyticsPath('/maya-birthday-demo')).toBe('/[slug]');
    expect(sanitizeGoogleAnalyticsPath('/maya-birthday-demo/contribute')).toBe(
      '/[slug]/contribute'
    );
    expect(sanitizeGoogleAnalyticsPath('/maya-birthday-demo/contribute/payment')).toBe(
      '/[slug]/contribute/payment'
    );
    expect(sanitizeGoogleAnalyticsPath('/maya-birthday-demo/thanks')).toBe('/[slug]/thanks');
    expect(sanitizeGoogleAnalyticsPath('/dashboard/board_123')).toBe('/dashboard/[id]');
    expect(sanitizeGoogleAnalyticsPath('/sign-in/sso-callback')).toBe('/sign-in');
    expect(sanitizeGoogleAnalyticsPath('/create/payout')).toBe('/create/payout');
    expect(sanitizeGoogleAnalyticsPath('/admin')).toBeNull();
  });

  it('returns generic safe page titles for sanitized routes', () => {
    expect(getGoogleAnalyticsPageTitle('/')).toBe('Homepage');
    expect(getGoogleAnalyticsPageTitle('/dashboard/board_123')).toBe(
      'Dreamboard dashboard detail'
    );
    expect(getGoogleAnalyticsPageTitle('/maya-birthday-demo/thanks')).toBe(
      'Contribution thank you'
    );
  });

  it('builds sanitized page locations and disables auto pageviews in bootstrap code', () => {
    expect(
      buildGoogleAnalyticsPageLocation('/maya-birthday-demo/thanks', 'https://www.gifta.co.za')
    ).toBe('https://www.gifta.co.za/[slug]/thanks');

    const bootstrap = getGoogleAnalyticsBootstrapScript('G-CRK4NXDF7J');

    expect(bootstrap).toContain("gtag('config', 'G-CRK4NXDF7J', { send_page_view: false });");
    expect(bootstrap).toContain('window.dataLayer = window.dataLayer || [];');
  });

  it('allowlists only safe GA event parameters', () => {
    expect(
      sanitizeGoogleAnalyticsEventParameters('host_create_published', {
        payout_method: 'bank',
        dream_board_id: 'board-123',
        child_name: 'Mia',
      })
    ).toEqual({ payout_method: 'bank' });

    expect(
      sanitizeGoogleAnalyticsEventParameters('share_link_clicked', {
        channel: 'whatsapp',
        slug: 'mia-birthday-demo',
      })
    ).toEqual({ channel: 'whatsapp' });
  });
});
