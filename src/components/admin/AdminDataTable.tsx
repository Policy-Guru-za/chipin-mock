import type { ReactNode } from 'react';

export interface AdminDataColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface AdminDataTableProps<T> {
  columns: AdminDataColumn<T>[];
  data: T[];
  emptyMessage?: string;
  keyExtractor: (item: T) => string;
  caption?: string;
}

export function AdminDataTable<T>({
  columns,
  data,
  emptyMessage = 'No records found.',
  keyExtractor,
  caption = 'Admin dataset table',
}: AdminDataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm" role="table">
        <caption className="sr-only">{caption}</caption>
        <thead className="sticky top-0 z-10 bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`px-4 py-3 text-xs font-semibold uppercase tracking-[0.08em] text-gray-500 ${column.className ?? ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={keyExtractor(item)} className="border-t border-gray-100 hover:bg-gray-50">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`px-4 py-3 align-top [overflow-wrap:anywhere] ${column.className ?? ''}`}
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
