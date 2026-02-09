import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextFetchEvent, NextRequest } from 'next/server';

import { getClerkConfigStatus, getClerkUrls } from '@/lib/auth/clerk-config';

const isDevPreviewEnabled = () => process.env.DEV_PREVIEW === 'true';
const isDevPreviewRoute = (pathname: string) => pathname.startsWith('/dev/icon-picker');

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth(.*)',
  '/create',
  '/dev/icon-picker(.*)', // Dev-only visual preview route; guarded by DEV_PREVIEW.
  '/health/live',
  '/health/ready',
  '/api/health',
  '/api/webhooks(.*)',
  '/api/v1(.*)',
  '/api/og(.*)',
  '/v1(.*)',
  '/api/internal/contributions/create', // Public guest checkout endpoint; do not add job-secret auth.
  '/api/internal/contributions/reminders', // Public guest reminder scheduling endpoint.
  '/api/internal/downloads(.*)', // Public matcher only; handlers enforce explicit 401/403/404.
  // Job-secret endpoints (must enforce INTERNAL_JOB_SECRET in handler):
  '/api/internal/webhooks/process',
  '/api/internal/retention/run',
  '/api/internal/karri/batch',
  '/api/internal/payments/reconcile',
  '/api/internal/reminders/dispatch',
  '/api/internal/api-keys(.*)',
  // Guest pages (route groups are not in URL):
  /^\/(?!api|_next|sign-in|sign-up|create|dashboard|admin|health)([^/]+)$/,
  /^\/(?!api|_next|sign-in|sign-up|create|dashboard|admin|health)([^/]+)\/(contribute|thanks|payment-failed)$/,
]);


const bypassExactPaths = new Set([
  '/health/live',
  '/health/ready',
  '/api/health',
  // Job-secret endpoints (must enforce INTERNAL_JOB_SECRET in handler):
  '/api/internal/webhooks/process',
  '/api/internal/retention/run',
  '/api/internal/karri/batch',
  '/api/internal/payments/reconcile',
  '/api/internal/reminders/dispatch',
]);

const isBypassRouteWhenAuthUnavailable = (pathname: string): boolean => {
  if (bypassExactPaths.has(pathname)) {
    return true;
  }

  if (isDevPreviewRoute(pathname) && isDevPreviewEnabled()) {
    return true;
  }

  if (pathname.startsWith('/api/webhooks')) {
    return true;
  }

  if (pathname.startsWith('/api/og')) {
    return true;
  }

  if (pathname.startsWith('/api/internal/api-keys')) {
    return true;
  }

  return false;
};
let missingClerkKeysLogged = false;

const getRequestId = (request: NextRequest): string => {
  return request.headers.get('x-request-id') ?? globalThis.crypto.randomUUID();
};

const nextResponseWithRequestId = (req: NextRequest, requestId: string) => {
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set('x-request-id', requestId);
  return response;
};

const getSafeRedirectPath = (req: NextRequest): string => {
  const target = `${req.nextUrl.pathname}${req.nextUrl.search}`;
  return target.startsWith('/') ? target : `/${target}`;
};

const createClerkHandler = (requestId: string) =>
  clerkMiddleware(async (auth, req) => {
    const pathname = req.nextUrl.pathname;

    if (isDevPreviewRoute(pathname) && !isDevPreviewEnabled()) {
      return new NextResponse(null, { status: 404, headers: { 'x-request-id': requestId } });
    }

    if (!isPublicRoute(req)) {
      if (pathname.startsWith('/api')) {
        const authObject = await auth();
        if (!authObject.userId) {
          return new NextResponse(null, { status: 404, headers: { 'x-request-id': requestId } });
        }
      } else {
        await auth.protect();
      }
    }

    return nextResponseWithRequestId(req, requestId);
  });

export default async function middleware(req: NextRequest, event: NextFetchEvent) {
  const requestId = getRequestId(req);
  const clerkConfig = getClerkConfigStatus();
  const pathname = req.nextUrl.pathname;

  if (!clerkConfig.isEnabled) {
    if (!missingClerkKeysLogged) {
      missingClerkKeysLogged = true;
      console.error(
        'Clerk keys are missing. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.'
      );
    }

    if (isBypassRouteWhenAuthUnavailable(pathname)) {
      return nextResponseWithRequestId(req, requestId);
    }

    if (pathname.startsWith('/api')) {
      return NextResponse.json(
        { error: 'auth_unavailable' },
        { status: 503, headers: { 'x-request-id': requestId } }
      );
    }

    return new NextResponse('Authentication unavailable', {
      status: 503,
      headers: { 'x-request-id': requestId },
    });
  }

  const response = (await createClerkHandler(requestId)(req, event)) as Response;
  if (!response.headers.has('x-request-id')) {
    response.headers.set('x-request-id', requestId);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
