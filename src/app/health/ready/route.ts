import { NextResponse } from 'next/server';

import {
  checkBlobToken,
  checkDb,
  checkKarriAutomation,
  checkPayoutEncryption,
  checkKv,
} from '@/lib/health/checks';
import { getBuildInfo } from '@/lib/health/metadata';

export async function GET() {
  const [db, kv, blob, payoutEncryption, karri] = await Promise.all([
    checkDb(),
    checkKv(),
    checkBlobToken(),
    checkPayoutEncryption(),
    checkKarriAutomation(),
  ]);
  const checks = { db, kv, blob, payoutEncryption, karri };
  const ok = Object.values(checks).every((check) => check.ok);

  return NextResponse.json(
    {
      status: ok ? 'ready' : 'not_ready',
      timestamp: new Date().toISOString(),
      build: getBuildInfo(),
      checks,
    },
    { status: ok ? 200 : 503 }
  );
}
