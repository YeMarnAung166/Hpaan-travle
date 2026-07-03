import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download } from 'lucide-react';

const DISMISSED_KEY = 'hpaan_install_dismissed';

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isStandalone] = useState(() => window.matchMedia('(display-mode: standalone)').matches);

  useEffect(() => {
    if (isStandalone) return;

    const dismissed = localStorage.getItem(DISMISSED_KEY);
    if (dismissed) return;

    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    const mediaQuery = window.matchMedia('(min-width: 768px)');
    const checkWidth = (mq) => {
      if (mq.matches) setShow(false);
    };
    mediaQuery.addEventListener('change', checkWidth);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      mediaQuery.removeEventListener('change', checkWidth);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShow(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setDeferredPrompt(null);
    localStorage.setItem(DISMISSED_KEY, 'true');
  };

  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
        >
          <div className="bg-white dark:bg-neutral-dark rounded-2xl shadow-elevated border border-border-light dark:border-border p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
              <Download className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text">Install Hpa-An Travel</p>
              <p className="text-xs text-text-soft mt-0.5">Get the full app experience offline</p>
            </div>
            <button
              onClick={handleInstall}
              className="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-full hover:bg-primary-light transition whitespace-nowrap"
            >
              Install
            </button>
            <button
              onClick={handleDismiss}
              className="p-1.5 text-text-soft hover:text-text rounded-full hover:bg-overlay transition"
              aria-label="Dismiss install banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
