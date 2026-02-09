import { cn } from '@/lib/utils';

interface AdminStatsCardProps {
  label: string;
  value: string;
  subtitle?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const valueColor: Record<NonNullable<AdminStatsCardProps['variant']>, string> = {
  default: 'text-gray-900',
  success: 'text-green-700',
  warning: 'text-amber-700',
  danger: 'text-red-700',
};

export function AdminStatsCard({
  label,
  value,
  subtitle,
  variant = 'default',
}: AdminStatsCardProps) {
  return (
    <article
      aria-label={`${label}: ${value}`}
      className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-gray-500">{label}</p>
      <p className={cn('mt-2 font-display text-[28px] font-bold', valueColor[variant])}>{value}</p>
      {subtitle ? <p className="mt-2 text-xs text-gray-400">{subtitle}</p> : null}
    </article>
  );
}
