import { supabase } from '../supabaseClient';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    return { granted: false, reason: 'unsupported' };
  }
  if (Notification.permission === 'granted') {
    return { granted: true };
  }
  if (Notification.permission === 'denied') {
    return { granted: false, reason: 'denied' };
  }
  const result = await Notification.requestPermission();
  return { granted: result === 'granted', reason: result === 'denied' ? 'denied' : 'dismissed' };
}

export async function subscribeToPush() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { success: false, error: 'Push not supported' };
  }

  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) {
    return { success: false, error: 'No service worker registration' };
  }

  let subscription = await reg.pushManager.getSubscription();
  if (subscription) {
    return { success: true, subscription };
  }

  if (!VAPID_PUBLIC_KEY) {
    return { success: false, error: 'VAPID key not configured' };
  }

  subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  return { success: true, subscription };
}

export async function unsubscribeFromPush() {
  if (!('serviceWorker' in navigator)) return;

  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return;

  const subscription = await reg.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user.id);
  }
}

export async function saveSubscription(subscription) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' };
  }

  const subData = subscription.toJSON();

  const { error } = await supabase
    .from('push_subscriptions')
    .upsert({
      user_id: user.id,
      endpoint: subData.endpoint,
      p256dh: subData.keys.p256dh,
      auth: subData.keys.auth,
    }, {
      onConflict: 'user_id',
    });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function isPushSubscribed() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg) return false;
  const subscription = await reg.pushManager.getSubscription();
  return !!subscription;
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  const rawData = window.atob(base64);
  const output = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}
