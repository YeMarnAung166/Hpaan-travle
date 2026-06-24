import { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../ui/Button';

function SortIcon({ direction }) {
  if (!direction) return <span className="ml-1 opacity-30">↕</span>;
  return <span className="ml-1">{direction === 'asc' ? '↑' : '↓'}</span>;
}

export default function DataTable({
  title,
  data,
  columns,
  onAdd,
  onEdit,
  onDelete,
  addButtonLabel = null,
  emptyMessage = null,
  searchable = true,
  searchPlaceholder = null,
}) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(null);

  const finalAddLabel = addButtonLabel || t('admin.add');
  const finalEmptyMessage = emptyMessage || t('admin.empty');
  const finalSearchPlaceholder = searchPlaceholder || t('common.search');

  const handleSort = (key) => {
    if (sortKey === key) {
      if (sortDir === 'asc') { setSortDir('desc'); }
      else if (sortDir === 'desc') { setSortKey(null); setSortDir(null); }
      else { setSortDir('asc'); }
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setCurrentPage(1);
  };

  const processed = useMemo(() => {
    let items = [...data];

    if (searchable && searchTerm) {
      const term = searchTerm.toLowerCase();
      items = items.filter((item) =>
        Object.values(item)
          .filter(v => typeof v === 'string' || typeof v === 'number')
          .join(' ')
          .toLowerCase()
          .includes(term)
      );
    }

    if (sortKey) {
      items.sort((a, b) => {
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        if (aVal == null) return 1;
        if (bVal == null) return -1;
        if (typeof aVal === 'string') {
          return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    return items;
  }, [data, searchTerm, sortKey, sortDir, searchable]);

  const totalPages = Math.ceil(processed.length / perPage);
  const paginated = processed.slice((currentPage - 1) * perPage, currentPage * perPage);

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 2) start = 2;
      if (currentPage >= totalPages - 1) end = totalPages - 1;
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [totalPages, currentPage]);

  const renderMobileCard = (item, idx) => (
    <div key={item.id || idx} className="bg-white dark:bg-neutral-dark rounded-xl border border-border p-4 space-y-2">
      {columns.map((col) => (
        <div key={col.key} className="flex justify-between items-start gap-2">
          <span className="text-xs font-semibold text-text-soft uppercase shrink-0 w-24">{col.label}</span>
          <span className="text-sm text-text text-right">
            {col.render ? col.render(item[col.key], item) : item[col.key] ?? '—'}
          </span>
        </div>
      ))}
      <div className="flex justify-end gap-2 pt-2 border-t border-border">
        <Button variant="ghost" size="sm" onClick={() => onEdit(item)}>{t('admin.edit')}</Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-red-600 dark:text-red-400">{t('admin.delete')}</Button>
      </div>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">{title}</h2>
          {searchable && searchTerm && (
            <span className="text-sm text-text-soft bg-neutral-light dark:bg-neutral-dark px-2 py-0.5 rounded-full">
              {processed.length} {t('common.results_of') || 'of'} {data.length}
            </span>
          )}
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          {searchable && (
            <input
              type="text"
              placeholder={finalSearchPlaceholder}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-neutral-mid rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 flex-1 sm:flex-none w-full sm:w-64"
            />
          )}
          <Button onClick={onAdd} variant="primary" size="md">{finalAddLabel}</Button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full bg-white dark:bg-neutral-dark rounded-xl border border-border">
          <thead className="bg-neutral-light dark:bg-neutral-dark/50">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`px-4 py-3 text-left text-sm font-semibold cursor-pointer select-none hover:bg-overlay/50 transition ${sortKey === col.key ? 'text-primary' : 'text-text'}`}
                >
                  <span className="inline-flex items-center">
                    {col.label}
                    <SortIcon direction={sortKey === col.key ? sortDir : null} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-semibold text-text">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-12 text-text-soft">{finalEmptyMessage}</td>
              </tr>
            ) : (
              paginated.map((item, idx) => (
                <tr key={item.id || idx} className="border-t border-border hover:bg-overlay/30 transition">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-sm text-text">
                      {col.render ? col.render(item[col.key], item) : item[col.key] ?? '—'}
                    </td>
                  ))}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="mr-2">{t('admin.edit')}</Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-red-600 dark:text-red-400">{t('admin.delete')}</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {paginated.length === 0 ? (
          <p className="text-center py-12 text-text-soft">{finalEmptyMessage}</p>
        ) : (
          paginated.map((item, idx) => renderMobileCard(item, idx))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6">
          <div className="flex items-center gap-2 text-sm text-text-soft">
            <span>{t('common.per_page') || 'Per page'}:</span>
            <select
              value={perPage}
              onChange={(e) => { setPerPage(Number(e.target.value)); setCurrentPage(1); }}
              className="border border-border rounded px-2 py-1 text-sm bg-white dark:bg-neutral-dark"
            >
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 border border-border rounded text-sm disabled:opacity-40 hover:bg-overlay transition"
            >
              {t('pagination.previous')}
            </button>
            {pageNumbers.map((page, i) =>
              page === '...' ? (
                <span key={`ellipsis-${i}`} className="px-2 text-text-soft text-sm">…</span>
              ) : (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded text-sm font-medium transition ${currentPage === page ? 'bg-primary text-white' : 'text-text hover:bg-overlay border border-border'}`}
                >
                  {page}
                </button>
              )
            )}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 border border-border rounded text-sm disabled:opacity-40 hover:bg-overlay transition"
            >
              {t('pagination.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
