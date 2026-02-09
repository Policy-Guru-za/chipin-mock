import Link from 'next/link';

import { SearchIcon } from '@/components/icons';
import { Button } from '@/components/ui/button';

export interface FilterField {
  key: string;
  label: string;
  type: 'select' | 'date' | 'text' | 'boolean';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface AdminFilterPanelProps {
  basePath: string;
  fields: FilterField[];
  values: Record<string, string>;
}

const booleanOptions = [
  { value: '', label: 'Any' },
  { value: 'true', label: 'Yes' },
  { value: 'false', label: 'No' },
];

export function AdminFilterPanel({ basePath, fields, values }: AdminFilterPanelProps) {
  return (
    <form action={basePath} method="get" className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <fieldset>
        <legend className="sr-only">Admin filters</legend>
        <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-end">
          {fields.map((field) => {
            const currentValue = values[field.key] ?? '';
            return (
              <div key={field.key} className="min-w-[180px] flex-1">
                <label htmlFor={field.key} className="mb-1 block text-xs font-semibold uppercase tracking-[0.08em] text-gray-500">
                  {field.label}
                </label>
                {field.type === 'select' || field.type === 'boolean' ? (
                  <select
                    id={field.key}
                    name={field.key}
                    defaultValue={currentValue}
                    className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    {(field.type === 'boolean' ? booleanOptions : field.options ?? [{ value: '', label: 'Any' }]).map(
                      (option) => (
                        <option key={`${field.key}-${option.value}`} value={option.value}>
                          {option.label}
                        </option>
                      )
                    )}
                  </select>
                ) : field.type === 'date' ? (
                  <input
                    id={field.key}
                    name={field.key}
                    type="date"
                    defaultValue={currentValue}
                    className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                ) : (
                  <div className="relative">
                    <SearchIcon
                      size="sm"
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      id={field.key}
                      name={field.key}
                      type="text"
                      defaultValue={currentValue}
                      placeholder={field.placeholder}
                      className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-3 text-sm text-text placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex items-center gap-3">
            <Button type="submit" variant="outline" size="sm">
              Apply filters
            </Button>
            <Link href={basePath} className="text-sm font-medium text-gray-500 hover:text-gray-900 hover:underline">
              Reset
            </Link>
          </div>
        </div>
      </fieldset>
    </form>
  );
}
