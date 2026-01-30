import { NextResponse } from 'next/server';

import { isDemoMode } from '@/lib/demo';
import { demoKv } from '@/lib/demo/kv-mock';
import { seedDemoDatabase } from '@/lib/db/seed-demo';

let resetPromise: Promise<void> | null = null;

export async function POST() {
  if (!isDemoMode()) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  if (!resetPromise) {
    resetPromise = (async () => {
      demoKv.clear();
      await seedDemoDatabase();
    })().finally(() => {
      resetPromise = null;
    });
  }

  await resetPromise;
  return NextResponse.json({ ok: true, demo: true });
}

export async function GET() {
  if (!isDemoMode()) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }

  return NextResponse.json(
    { error: 'method_not_allowed', hint: 'Use POST or visit /demo/reset' },
    { status: 405 }
  );
}
