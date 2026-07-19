import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { requestNotificationPermission, subscribeToPush, unsubscribeFromPush, saveSubscription, isPushSubscribed, isServiceWorkerReady } from '../utils/pushManager';

export default function NotificationToggle() {
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [swReady, setSwReady] = useState(true);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    isServiceWorkerReady().then(ready => {
      setSwReady(ready);
      if (!ready) setInfo('Service worker not ready');
    });
    isPushSubscribed().then(setSubscribed);
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    setError('');
    setInfo('');

    try {
      if (subscribed) {
        await unsubscribeFromPush();
        setSubscribed(false);
      } else {
        const perm = await requestNotificationPermission();
        if (!perm.granted) {
          setError(perm.reason === 'denied' ? 'Notifications blocked in browser settings' : 'Permission not granted');
          return;
        }

        const sub = await subscribeToPush();
        if (!sub.success) {
          if (sub.error === 'No service worker registration') {
            setInfo('Service worker not ready');
          } else {
            setError(sub.error);
          }
          return;
        }

        const saved = await saveSubscription(sub.subscription);
        if (!saved.success) {
          setError(saved.error);
          return;
        }

        setSubscribed(true);
      }
    } catch {
      setError('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        {subscribed ? (
          <Bell className="w-5 h-5 text-primary" />
        ) : (
          <BellOff className="w-5 h-5 text-text-soft" />
        )}
        <div>
          <p className="text-sm font-medium text-text">
            Push Notifications
          </p>
          <p className="text-xs text-text-soft">
            {subscribed ? 'Enabled for events & alerts' : 'Get notified about events and weather'}
          </p>
        </div>
      </div>
      <button
        onClick={handleToggle}
        disabled={loading || !swReady}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          !swReady ? 'opacity-40 cursor-not-allowed' : subscribed ? 'bg-primary' : 'bg-neutral-mid'
        }`}
        role="switch"
        aria-checked={subscribed}
        aria-label="Toggle push notifications"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 mx-auto text-white animate-spin" />
        ) : (
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              subscribed ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        )}
      </button>
      {error && (
        <p className="text-xs text-red-500 mt-1 w-full">{error}</p>
      )}
      {info && (
        <p className="text-xs text-text-soft mt-1 w-full">{info}</p>
      )}
    </div>
  );
}
