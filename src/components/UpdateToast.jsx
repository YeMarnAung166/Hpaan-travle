import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, X } from 'lucide-react';

export default function UpdateToast() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    const handler = (e) => {
      if (e.detail && e.detail.registerPromise) {
        e.detail.registerPromise.then((reg) => {
          if (reg.waiting) {
            setNeedRefresh(true);
            setRegistration(reg);
          }
        });
      }
    };

    window.addEventListener('sw.prompt', handler);

    navigator.serviceWorker.getRegistration().then((reg) => {
      if (!reg) return;
      if (reg.waiting) {
        setNeedRefresh(true);
        setRegistration(reg);
        return;
      }
      reg.addEventListener('updatefound', () => {
        const newSW = reg.installing;
        if (newSW) {
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              setNeedRefresh(true);
              setRegistration(reg);
            }
          });
        }
      });
    });

    return () => window.removeEventListener('sw.prompt', handler);
  }, []);

  const handleRefresh = () => {
    if (!registration || !registration.waiting) return;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  };

  const handleDismiss = () => {
    setNeedRefresh(false);
  };

  return (
    <AnimatePresence>
      {needRefresh && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-[136px] left-4 right-4 z-[9999] max-w-md mx-auto"
        >
          <div className="bg-white dark:bg-neutral-dark rounded-2xl shadow-elevated border border-border-light dark:border-border p-4 flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="flex-1 text-sm text-text font-medium">
              New version available!
            </p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-light transition whitespace-nowrap"
            >
              Refresh
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-text-soft hover:text-text rounded-full hover:bg-overlay transition"
              aria-label="Dismiss update toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
