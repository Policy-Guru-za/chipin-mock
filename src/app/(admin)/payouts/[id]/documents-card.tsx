import { Card } from '@/components/ui/card';
import { getPayoutDetail } from '@/lib/payouts/queries';

type PayoutDetail = NonNullable<Awaited<ReturnType<typeof getPayoutDetail>>>;

export const DocumentsCard = ({ payout }: { payout: PayoutDetail }) => {
  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">Documents</h2>
      <p className="text-sm text-text-muted">
        Karri card credits do not require receipts or certificates.
      </p>
    </Card>
  );
};
