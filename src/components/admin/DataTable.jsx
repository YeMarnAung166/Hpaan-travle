import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import Button from '../ui/Button';

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
  const itemsPerPage = 10;

  const finalAddLabel = addButtonLabel || t('admin.add');
  const finalEmptyMessage = emptyMessage || t('admin.empty');
  const finalSearchPlaceholder = searchPlaceholder || t('common.search');

  // Filter data
  const filteredData = searchable
    ? data.filter((item) =>
        Object.values(item)
          .filter(v => typeof v === 'string' || typeof v === 'number')
          .join(' ')
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    : data;

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold">{title}</h2>
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
          <Button onClick={onAdd} variant="primary" size="md">
            {finalAddLabel}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg border border-neutral-mid">
          <thead className="bg-neutral-light">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-left text-sm font-semibold text-text">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3 text-left text-sm font-semibold text-text">{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="text-center py-8 text-text-soft">
                  {finalEmptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => (
                <tr key={item.id || idx} className="border-t border-neutral-mid hover:bg-neutral-light/50 transition">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-2 text-sm text-text">
                      {col.render ? col.render(item[col.key], item) : item[col.key]}
                    </td>
                  ))}
                  <td className="px-4 py-2 whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => onEdit(item)} className="mr-2">
                      {t('admin.edit')}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(item.id)} className="text-error">
                      {t('admin.delete')}
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-neutral-mid rounded disabled:opacity-50 hover:bg-neutral-light transition"
          >
            {t('pagination.previous')}
          </button>
          <span className="px-3 py-1 text-text-soft">
            {t('pagination.page_of', { current: currentPage, total: totalPages })}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-neutral-mid rounded disabled:opacity-50 hover:bg-neutral-light transition"
          >
            {t('pagination.next')}
          </button>
        </div>
      )}
    </div>
  );
}