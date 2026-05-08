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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <form onSubmit={onSubmit}>
          {children}
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Saving...' : submitLabel}
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-text-soft hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
}