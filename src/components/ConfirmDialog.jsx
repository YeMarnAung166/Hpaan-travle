export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel', variant = 'danger' }) {
  if (!open) return null;

  const btnColors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    primary: 'bg-primary hover:bg-primary-light text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div
        className="bg-white dark:bg-neutral-dark rounded-xl p-6 w-full max-w-sm shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-text mb-2">{title || 'Are you sure?'}</h3>
        {message && <p className="text-text-soft text-sm mb-6">{message}</p>}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text hover:bg-overlay transition"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${btnColors[variant] || btnColors.danger}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
