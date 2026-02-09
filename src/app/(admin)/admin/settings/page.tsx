import { StatusBadge } from '@/components/admin';
import { getAdminPlatformSettingsDataset } from '@/lib/admin';

const toPercent = (value: number) => `${(value * 100).toFixed(2)}%`;

export default async function AdminSettingsPage() {
  const settings = getAdminPlatformSettingsDataset();

  return (
    <section className="space-y-4">
      <header>
        <h1 className="font-display text-2xl font-bold text-text">Platform settings</h1>
        <p className="text-sm text-gray-500">Read-only runtime configuration for admin verification.</p>
      </header>

      <div className="rounded-r-lg border-l-4 border-blue-400 bg-blue-50 p-4 text-sm text-blue-800">
        Settings are managed via environment variables. Contact engineering to make changes.
      </div>

      <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Platform identity</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Brand</dt>
            <dd className="text-sm text-text">{settings.brand}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Accessibility baseline</dt>
            <dd className="text-sm text-text">{settings.accessibilityBaseline}</dd>
          </div>
        </dl>
      </article>

      <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Fees and limits</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Platform fee</dt>
            <dd className="text-sm text-text">{toPercent(settings.feeConfiguration.percentage)}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Fee basis points</dt>
            <dd className="text-sm text-text">{settings.feeConfiguration.percentageBps}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Minimum fee cents</dt>
            <dd className="text-sm text-text">{settings.feeConfiguration.minFeeCents}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Maximum fee cents</dt>
            <dd className="text-sm text-text">{settings.feeConfiguration.maxFeeCents}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Min contribution cents</dt>
            <dd className="text-sm text-text">{settings.contributionLimits.minContributionCents}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Max contribution cents</dt>
            <dd className="text-sm text-text">{settings.contributionLimits.maxContributionCents}</dd>
          </div>
        </dl>
      </article>

      <article className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-text">Charity and write-path controls</h2>
        <dl className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Split modes</dt>
            <dd className="text-sm text-text">{settings.charityConfiguration.splitModes.join(', ')}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Payout cadence</dt>
            <dd className="text-sm text-text">{settings.charityConfiguration.monthlyPayoutCadence}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Bank write path</dt>
            <dd className="pt-1">
              <StatusBadge status={settings.writePathGates.bankEnabled ? 'active' : 'inactive'} />
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">Charity write path</dt>
            <dd className="pt-1">
              <StatusBadge status={settings.writePathGates.charityEnabled ? 'active' : 'inactive'} />
            </dd>
          </div>
        </dl>
      </article>
    </section>
  );
}
