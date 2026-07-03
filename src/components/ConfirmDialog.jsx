import { useEffect, useState } from 'react';
import BottomSheet from './BottomSheet';

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, confirmText = 'Delete', cancelText = 'Cancel', variant = 'danger' }) {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onCancel]);

  if (!open) return null;

  const btnColors = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    primary: 'bg-primary hover:bg-primary-light text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
  };

  const dialogContent = (
    <>
      <h3 className="text-lg font-semibold text-text mb-2">{title || 'Are you sure?'}</h3>
      {message && <p className="text-text-soft text-sm mb-6">{message}</p>}
      <div className="flex gap-3 justify-end">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-border text-text hover:bg-overlay transition min-h-[44px]"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className={`px-4 py-2 text-sm font-medium rounded-lg transition min-h-[44px] ${btnColors[variant] || btnColors.danger}`}
        >
          {confirmText}
        </button>
      </div>
    </>
  );

  if (isMobile) {
    return <BottomSheet open={open} onClose={onCancel} title={title || 'Are you sure?'}>{dialogContent}</BottomSheet>;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div
        className="bg-white dark:bg-neutral-dark rounded-xl p-6 w-full max-w-sm shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        {dialogContent}
      </div>
    </div>
  );
}
