'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const FIRST_CURSOR_SENTINEL = '__FIRST__';

interface AdminPaginationProps {
  hasMore: boolean;
  nextCursor: string | null;
  totalCount?: number;
  currentPage: number;
  basePath: string;
}

const toStack = (value: string | null) =>
  value
    ? value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const toHref = (basePath: string, params: URLSearchParams) => {
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
};

export function AdminPagination({
  hasMore,
  nextCursor,
  totalCount,
  currentPage,
  basePath,
}: AdminPaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const path = basePath || pathname;

  const state = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    const activeCursor = params.get('cursor');
    const stack = toStack(params.get('cursor_stack'));
    const canGoBack = stack.length > 0;

    let previousHref: string | null = null;
    if (canGoBack) {
      const previousParams = new URLSearchParams(searchParams.toString());
      const previousStack = toStack(previousParams.get('cursor_stack'));
      const target = previousStack.pop();

      if (previousStack.length > 0) {
        previousParams.set('cursor_stack', previousStack.join(','));
      } else {
        previousParams.delete('cursor_stack');
      }

      if (!target || target === FIRST_CURSOR_SENTINEL) {
        previousParams.delete('cursor');
      } else {
        previousParams.set('cursor', target);
      }

      previousParams.set('page', String(Math.max(1, currentPage - 1)));
      previousHref = toHref(path, previousParams);
    }

    let nextHref: string | null = null;
    if (hasMore && nextCursor) {
      const nextParams = new URLSearchParams(searchParams.toString());
      const nextStack = toStack(nextParams.get('cursor_stack'));
      nextStack.push(activeCursor ?? FIRST_CURSOR_SENTINEL);
      nextParams.set('cursor_stack', nextStack.join(','));
      nextParams.set('cursor', nextCursor);
      nextParams.set('page', String(currentPage + 1));
      nextHref = toHref(path, nextParams);
    }

    return { previousHref, nextHref };
  }, [searchParams, hasMore, nextCursor, currentPage, path]);

  return (
    <nav
      aria-label="Pagination"
      className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm"
    >
      <p className="text-sm text-gray-600">
        {totalCount !== undefined ? `Showing ${totalCount} results` : `Page ${currentPage}`}
      </p>
      <div className="flex items-center gap-2">
        {state.previousHref ? (
          <Link
            href={state.previousHref}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Previous
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="cursor-not-allowed rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400"
          >
            Previous
          </span>
        )}
        {state.nextHref ? (
          <Link
            href={state.nextHref}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Next
          </Link>
        ) : (
          <span
            aria-disabled="true"
            className="cursor-not-allowed rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-400"
          >
            Next
          </span>
        )}
      </div>
    </nav>
  );
}
