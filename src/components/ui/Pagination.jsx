import { useMemo } from 'react';

export default function Pagination({ page, totalPages, onPageChange }) {
  const safePage = Math.max(1, Math.min(page, totalPages));
  const pages = useMemo(() => {
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
      return items;
    }

    items.push(1);
    let start = Math.max(2, page - 1);
    let end = Math.min(totalPages - 1, page + 1);

    if (page <= 3) {
      start = 2;
      end = Math.min(maxVisible, totalPages - 1);
    }
    if (page >= totalPages - 2) {
      start = Math.max(totalPages - maxVisible + 1, 2);
      end = totalPages - 1;
    }

    if (start > 2) items.push('...');
    for (let i = start; i <= end; i++) items.push(i);
    if (end < totalPages - 1) items.push('...');
    items.push(totalPages);

    return items;
  }, [page, totalPages]);

  if (totalPages <= 1) return null;

  if (safePage !== page) {
    onPageChange(safePage);
    return null;
  }

  return (
    <nav className="flex items-center justify-center gap-1 mt-8" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-overlay transition text-text"
        aria-label="Previous page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 py-1.5 text-sm text-text-soft">...</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[36px] px-3 py-1.5 text-sm rounded-lg font-medium transition ${
              p === page
                ? 'bg-primary text-white shadow-sm'
                : 'text-text hover:bg-overlay border border-border'
            }`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-3 py-1.5 text-sm rounded-lg border border-border disabled:opacity-30 disabled:cursor-not-allowed hover:bg-overlay transition text-text"
        aria-label="Next page"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
