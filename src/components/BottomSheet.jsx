import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function BottomSheet({ open, onClose, title, children, className = '' }) {
  const sheetRef = useRef(null);
  const [draggedY, setDraggedY] = useState(0);
  const dragStartY = useRef(0);

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraggedY(0);
      return;
    }
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleTouchStart = (e) => {
    if (sheetRef.current && sheetRef.current.scrollTop > 0) return;
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0) setDraggedY(delta);
  };

  const handleTouchEnd = () => {
    if (draggedY > 120) {
      onClose();
    }
    setDraggedY(0);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          <motion.div
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label={title || 'Sheet'}
            initial={{ y: '100%' }}
            animate={{ y: `${draggedY}px` }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, mass: 0.8 }}
            className={`relative w-full max-w-lg bg-white dark:bg-neutral-dark rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto overscroll-contain ${className}`}
            style={{ willChange: 'transform' }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="sticky top-0 bg-white dark:bg-neutral-dark z-10 rounded-t-2xl">
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-neutral-mid dark:bg-neutral-dark" />
              </div>
              {title && (
                <div className="flex items-center justify-between px-5 pb-3 pt-1">
                  <h2 className="text-lg font-semibold text-text">{title}</h2>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-full text-text-soft hover:text-text hover:bg-overlay transition"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
            <div className={`px-5 pb-6 ${className}`}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
