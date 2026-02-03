import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getClerkConfigStatus } from '@/lib/auth/clerk-config';

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/auth(.*)',
  '/create',
  '/health/live',
  '/health/ready',
  '/api/health',
  '/api/webhooks(.*)',
  '/api/v1(.*)',
  '/v1(.*)',
  // Job-secret endpoints (must enforce INTERNAL_JOB_SECRET in handler):
  '/api/internal/webhooks/process',
  '/api/internal/retention/run',
  '/api/internal/karri/batch',
  '/api/internal/payments/reconcile',
  '/api/internal/api-keys(.*)',
  // Guest pages (route groups are not in URL):
  /^\/(?!api|_next|sign-in|sign-up|create|dashboard|admin|health)([^/]+)$/,
  /^\/(?!api|_next|sign-in|sign-up|create|dashboard|admin|health)([^/]+)\/(contribute|thanks|payment-failed)$/,
]);

let missingClerkKeysLogged = false;

const getRequestId = (request: NextRequest): string => {
  return request.headers.get('x-request-id') ?? globalThis.crypto.randomUUID();
};

export default clerkMiddleware(async (auth, req) => {
  const requestId = getRequestId(req);
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set('x-request-id', requestId);
  const clerkConfig = getClerkConfigStatus();
  const pathname = req.nextUrl.pathname;

  if (!clerkConfig.flagEnabled) {
    if (!isPublicRoute(req)) {
      if (req.nextUrl.pathname.startsWith('/api')) {
        return NextResponse.json(
          { error: 'auth_disabled' },
          { status: 503, headers: { 'x-request-id': requestId } }
        );
      }

      return new NextResponse('Authentication unavailable', {
        status: 503,
        headers: { 'x-request-id': requestId },
      });
    }
  } else if (!clerkConfig.isEnabled) {
    if (pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')) {
      return new NextResponse('Authentication unavailable', {
        status: 503,
        headers: { 'x-request-id': requestId },
      });
    }

    if (!missingClerkKeysLogged) {
      missingClerkKeysLogged = true;
      console.error(
        'Clerk keys are missing. Set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.'
      );
    }

    if (!isPublicRoute(req)) {
      if (req.nextUrl.pathname.startsWith('/api')) {
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
  } else if (!isPublicRoute(req)) {
    const protectResponse = await auth().protect();
    if (protectResponse) {
      protectResponse.headers.set('x-request-id', requestId);
      return protectResponse;
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set('x-request-id', requestId);
  return response;
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
