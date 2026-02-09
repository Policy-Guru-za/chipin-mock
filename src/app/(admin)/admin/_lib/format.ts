export const formatAdminDate = (value: Date) =>
  value.toLocaleDateString('en-ZA', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export const formatAdminDateOrDash = (value: Date | null) => (value ? formatAdminDate(value) : '—');
