import { useState, useEffect } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { requestNotificationPermission, subscribeToPush, unsubscribeFromPush, saveSubscription, isPushSubscribed } from '../utils/pushManager';

export default function NotificationToggle() {
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    isPushSubscribed().then(setSubscribed);
  }, []);

  const handleToggle = async () => {
    setLoading(true);
    setError('');

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
          setError(sub.error);
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
        disabled={loading}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
          subscribed ? 'bg-primary' : 'bg-neutral-mid'
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
    </div>
  );
}
