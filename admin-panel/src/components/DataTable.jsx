import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Inbox } from 'lucide-react';

/**
 * Reusable data table.
 *
 * columns: [{ key, header, render?, className?, align? }]
 * data: array of row objects
 * pagination: { page, limit, total, totalPages } or null
 * onPageChange: (page) => void
 * rowKey: string | (row) => string
 * emptyLabel: text shown when no rows
 */
export default function DataTable({
  columns = [],
  data = [],
  pagination = null,
  onPageChange,
  rowKey = 'id',
  emptyLabel = 'No records found',
  loading = false,
}) {
  const resolveKey = (row, i) =>
    typeof rowKey === 'function' ? rowKey(row, i) : row[rowKey] || i;

  const pageMeta = useMemo(() => {
    if (!pagination) return null;
    const total = pagination.total ?? data.length;
    const limit = pagination.limit ?? 20;
    const totalPages = pagination.totalPages ?? Math.max(1, Math.ceil(total / limit));
    const page = pagination.page ?? 1;
    const from = total === 0 ? 0 : (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);
    return { total, limit, totalPages, page, from, to };
  }, [pagination, data.length]);

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="table-base table-striped">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={c.align === 'right' ? 'text-right' : ''}>
                  {c.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={columns.length} className="text-center py-10 text-slate-400">
                  Loading…
                </td>
              </tr>
            )}
            {!loading && data.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="py-12">
                  <div className="flex flex-col items-center text-slate-500">
                    <Inbox size={28} className="mb-2 opacity-60" />
                    <span className="text-sm">{emptyLabel}</span>
                  </div>
                </td>
              </tr>
            )}
            {!loading &&
              data.map((row, i) => (
                <tr key={resolveKey(row, i)}>
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`${c.className || ''} ${c.align === 'right' ? 'text-right' : ''}`}
                    >
                      {c.render ? c.render(row, i) : row[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {pageMeta && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-700 px-4 py-3">
          <p className="text-xs text-slate-400">
            Showing <span className="text-slate-200">{pageMeta.from}</span>–
            <span className="text-slate-200">{pageMeta.to}</span> of{' '}
            <span className="text-slate-200">{pageMeta.total}</span>
          </p>
          <div className="flex items-center gap-1.5">
            <button
              className="btn-ghost px-2 py-1.5 disabled:opacity-40"
              onClick={() => onPageChange?.(pageMeta.page - 1)}
              disabled={pageMeta.page <= 1}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-xs text-slate-300 px-2">
              Page {pageMeta.page} / {pageMeta.totalPages}
            </span>
            <button
              className="btn-ghost px-2 py-1.5 disabled:opacity-40"
              onClick={() => onPageChange?.(pageMeta.page + 1)}
              disabled={pageMeta.page >= pageMeta.totalPages}
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
