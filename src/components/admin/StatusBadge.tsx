import { cn } from '@/lib/utils';

export interface StatusBadgeProps {
  status: string;
  variant?: 'teal' | 'green' | 'amber' | 'red' | 'blue' | 'gray';
  className?: string;
}

const variantStyles: Record<NonNullable<StatusBadgeProps['variant']>, string> = {
  teal: 'bg-teal-50 text-teal-700',
  green: 'bg-green-50 text-green-700',
  amber: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-blue-50 text-blue-700',
  gray: 'bg-gray-100 text-gray-600',
};

const statusVariantMap: Record<string, NonNullable<StatusBadgeProps['variant']>> = {
  active: 'green',
  completed: 'green',
  paid_out: 'green',
  pending: 'amber',
  processing: 'amber',
  failed: 'red',
  closed: 'gray',
  funded: 'teal',
  cancelled: 'gray',
  draft: 'blue',
  expired: 'gray',
  refunded: 'gray',
  inactive: 'gray',
};

const toSentenceCase = (value: string) => {
  const normalized = value.replace(/_/g, ' ').trim().toLowerCase();
  if (!normalized) return '';
  return normalized[0].toUpperCase() + normalized.slice(1);
};

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  const normalized = status.trim().toLowerCase();
  const resolvedVariant = variant ?? statusVariantMap[normalized] ?? 'gray';
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[resolvedVariant],
        className
      )}
    >
      {toSentenceCase(status)}
    </span>
  );
}
