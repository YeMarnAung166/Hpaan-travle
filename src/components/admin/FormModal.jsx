// src/components/admin/FormModal.jsx
export default function FormModal({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitLabel = 'Save',
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-neutral-dark rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white dark:bg-neutral-dark border-b border-neutral-mid px-6 py-4 flex justify-between items-center rounded-t-2xl">
          <h3 className="text-xl font-semibold text-text">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-soft hover:text-text transition"
          >
            ✕
          </button>
        </div>
        <form onSubmit={onSubmit}>
          <div className="p-6 space-y-4">
            {children}
          </div>
          <div className="sticky bottom-0 bg-white dark:bg-neutral-dark border-t border-neutral-mid px-6 py-4 flex justify-end gap-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-neutral-mid rounded-lg text-text hover:bg-neutral-light transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light transition disabled:opacity-50"
            >
              {loading ? 'Saving...' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}