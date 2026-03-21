import { CANONICAL_PRODUCTION_APP_URL, joinAppUrl } from '@/lib/utils/request';

export const GOOGLE_ANALYTICS_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim() || null;

const EXCLUDED_PATH_PREFIXES = ['/admin', '/api', '/health', '/dev'] as const;
const EXCLUDED_EXACT_PATHS = new Set(['/opengraph-image', '/twitter-image']);
const RESERVED_ROOT_SEGMENTS = new Set([
  'sign-in',
  'sign-up',
  'auth',
  'create',
  'dashboard',
  'admin',
  'api',
  'health',
  'opengraph-image',
  'twitter-image',
  'dev',
]);

export const GOOGLE_ANALYTICS_PAGE_TITLES = {
  '/': 'Homepage',
  '/sign-in': 'Sign in',
  '/sign-up': 'Sign up',
  '/auth': 'Auth redirect',
  '/create': 'Create Dreamboard',
  '/create/child': 'Create Dreamboard - Child',
  '/create/details': 'Create Dreamboard - Details',
  '/create/gift': 'Create Dreamboard - Gift',
  '/create/dates': 'Create Dreamboard - Dates',
  '/create/giving-back': 'Create Dreamboard - Giving back',
  '/create/payout': 'Create Dreamboard - Payout',
  '/create/review': 'Create Dreamboard - Review',
  '/create/voucher': 'Create Dreamboard - Voucher',
  '/dashboard': 'Dashboard',
  '/dashboard/[id]': 'Dreamboard dashboard detail',
  '/[slug]': 'Dreamboard page',
  '/[slug]/contribute': 'Dreamboard contribution',
  '/[slug]/contribute/payment': 'Dreamboard contribution payment',
  '/[slug]/thanks': 'Contribution thank you',
  '/[slug]/payment-failed': 'Contribution payment failed',
} as const;

const GOOGLE_ANALYTICS_EVENT_ALLOWLIST = {
  host_create_started: ['entry_point'],
  host_create_published: ['payout_method'],
  share_link_clicked: ['channel'],
} as const;

type GoogleAnalyticsScalar = string | number | boolean;
type GoogleAnalyticsEventName = keyof typeof GOOGLE_ANALYTICS_EVENT_ALLOWLIST;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const isScalar = (value: unknown): value is GoogleAnalyticsScalar =>
  typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean';

export const isGoogleAnalyticsEnabled = (
  measurementId: string | null = GOOGLE_ANALYTICS_MEASUREMENT_ID
): measurementId is string => Boolean(measurementId && measurementId.trim().length > 0);

export const shouldTrackGoogleAnalyticsPath = (pathname: string): boolean => {
  if (!pathname.startsWith('/')) return false;
  if (EXCLUDED_EXACT_PATHS.has(pathname)) return false;
  return !EXCLUDED_PATH_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
};

const sanitizeStaticGoogleAnalyticsPath = (pathname: string): string | null => {
  if (pathname === '/') return '/';
  if (pathname.startsWith('/sign-in')) return '/sign-in';
  if (pathname.startsWith('/sign-up')) return '/sign-up';
  if (pathname.startsWith('/auth')) return '/auth';
  if (pathname === '/dashboard') return '/dashboard';
  if (pathname.startsWith('/dashboard/')) return '/dashboard/[id]';
  if (pathname === '/create') return '/create';
  if (pathname.startsWith('/create/')) return pathname;
  return null;
};

const sanitizeGuestGoogleAnalyticsPath = (segments: string[]): string => {
  const [, second, third] = segments;

  if (!second) return '/[slug]';
  if (second === 'contribute' && !third) return '/[slug]/contribute';
  if (second === 'contribute' && third === 'payment') return '/[slug]/contribute/payment';
  if (second === 'thanks') return '/[slug]/thanks';
  if (second === 'payment-failed') return '/[slug]/payment-failed';

  return '/[slug]';
};

export const sanitizeGoogleAnalyticsPath = (pathname: string): string | null => {
  if (!shouldTrackGoogleAnalyticsPath(pathname)) {
    return null;
  }

  const staticPath = sanitizeStaticGoogleAnalyticsPath(pathname);
  if (staticPath) {
    return staticPath;
  }

  const segments = pathname.split('/').filter(Boolean);
  const [root] = segments;

  if (!root) return '/';
  if (RESERVED_ROOT_SEGMENTS.has(root)) return pathname;

  return sanitizeGuestGoogleAnalyticsPath(segments);
};

export const getGoogleAnalyticsPageTitle = (pathname: string): string | null => {
  const sanitizedPath = sanitizeGoogleAnalyticsPath(pathname);
  if (!sanitizedPath) return null;
  return GOOGLE_ANALYTICS_PAGE_TITLES[sanitizedPath as keyof typeof GOOGLE_ANALYTICS_PAGE_TITLES] ??
    'Gifta page';
};

export const getGoogleAnalyticsBootstrapScript = (measurementId: string) => `
window.dataLayer = window.dataLayer || [];
function gtag(){window.dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
gtag('js', new Date());
gtag('config', '${measurementId}', { send_page_view: false });
`;

const ensureGoogleAnalyticsStub = (): ((...args: unknown[]) => void) | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  window.dataLayer = window.dataLayer || [];

  if (typeof window.gtag !== 'function') {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(args);
    };
  }

  return window.gtag;
};

export const buildGoogleAnalyticsPageLocation = (
  pathname: string,
  origin: string = CANONICAL_PRODUCTION_APP_URL
): string | null => {
  const sanitizedPath = sanitizeGoogleAnalyticsPath(pathname);
  return sanitizedPath ? joinAppUrl(origin, sanitizedPath) : null;
};

export const trackGoogleAnalyticsPageView = ({
  measurementId,
  pathname,
  origin = typeof window === 'undefined' ? CANONICAL_PRODUCTION_APP_URL : window.location.origin,
}: {
  measurementId: string;
  pathname: string;
  origin?: string;
}) => {
  if (!isGoogleAnalyticsEnabled(measurementId)) {
    return;
  }

  const pagePath = sanitizeGoogleAnalyticsPath(pathname);
  const pageTitle = getGoogleAnalyticsPageTitle(pathname);
  const pageLocation = buildGoogleAnalyticsPageLocation(pathname, origin);
  const gtag = ensureGoogleAnalyticsStub();

  if (!pagePath || !pageTitle || !pageLocation || !gtag) {
    return;
  }

  gtag('event', 'page_view', {
    page_title: pageTitle,
    page_path: pagePath,
    page_location: pageLocation,
  });
};

export const sanitizeGoogleAnalyticsEventParameters = <
  TEventName extends GoogleAnalyticsEventName,
>(
  eventName: TEventName,
  parameters: Record<string, unknown>
): Record<string, GoogleAnalyticsScalar> => {
  const allowedKeys = GOOGLE_ANALYTICS_EVENT_ALLOWLIST[eventName];
  const sanitized: Record<string, GoogleAnalyticsScalar> = {};

  for (const key of allowedKeys) {
    const value = parameters[key];
    if (isScalar(value)) {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

export const trackGoogleAnalyticsEvent = <TEventName extends GoogleAnalyticsEventName>(
  eventName: TEventName,
  parameters: Record<string, unknown> = {},
  measurementId: string | null = GOOGLE_ANALYTICS_MEASUREMENT_ID
) => {
  if (!isGoogleAnalyticsEnabled(measurementId)) {
    return;
  }

  const gtag = ensureGoogleAnalyticsStub();
  if (!gtag) {
    return;
  }

  gtag('event', eventName, sanitizeGoogleAnalyticsEventParameters(eventName, parameters));
};
