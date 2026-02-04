import { notFound } from 'next/navigation';

import { isPaymentSimulatorEnabled } from '@/lib/config/feature-flags';

import { PaymentSimulatorClient } from './PaymentSimulatorClient';

export const dynamic = 'force-dynamic';

type PaymentSimulatorPageProps = {
  searchParams?: {
    contributionId?: string;
    contribution_id?: string;
    returnTo?: string;
  };
};

const normalizeReturnTo = (value: string | undefined) =>
  value && value.startsWith('/') ? value : '/';

export default function PaymentSimulatorPage({ searchParams }: PaymentSimulatorPageProps) {
  if (!isPaymentSimulatorEnabled()) {
    notFound();
  }

  const contributionId = searchParams?.contributionId ?? searchParams?.contribution_id;
  const returnTo = normalizeReturnTo(searchParams?.returnTo);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-3xl border border-border bg-white p-8 shadow-soft">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-text">Sandbox payment simulator</h1>
        <p className="text-sm text-text-muted">
          This is a sandbox flow. No external payment provider is contacted.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-subtle p-4 text-sm text-text">
        <p className="font-semibold text-text">Contribution ID</p>
        <p className="break-all text-text-muted">
          {contributionId ?? 'Missing contribution id'}
        </p>
      </div>

      <PaymentSimulatorClient contributionId={contributionId} returnTo={returnTo} />
    </div>
  );
}
