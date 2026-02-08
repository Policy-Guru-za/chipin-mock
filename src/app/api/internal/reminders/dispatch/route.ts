import { NextRequest, NextResponse } from 'next/server';

import { requireInternalJobAuth } from '@/lib/api/internal-auth';
import { jsonInternalError } from '@/lib/api/internal-response';
import { log } from '@/lib/observability/logger';
import { dispatchDueReminders } from '@/lib/reminders/service';

export async function POST(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') ?? undefined;
  const auth = requireInternalJobAuth(request);
  if (!auth.ok) {
    if (auth.error === 'misconfigured') {
      log('error', 'reminders.dispatch_missing_secret', undefined, requestId);
    }
    return jsonInternalError({ code: auth.error, status: auth.status });
  }

  try {
    const summary = await dispatchDueReminders({ requestId });
    return NextResponse.json({
      ok: true,
      scanned: summary.scanned,
      sent: summary.sent,
      failed: summary.failed,
      expired: summary.expired,
      skipped: summary.skipped,
    });
  } catch (error) {
    log(
      'error',
      'reminders.dispatch_unhandled_error',
      { error: error instanceof Error ? error.message : String(error) },
      requestId
    );
    return jsonInternalError({ code: 'internal_error', status: 500 });
  }
}
