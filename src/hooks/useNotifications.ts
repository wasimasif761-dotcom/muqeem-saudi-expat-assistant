import { useEffect, useState } from 'react';
import { Language } from '../types';
import { checkAndTriggerDueReminders } from '../utils/reminders';

export function useNotifications(lang: Language) {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [swRegistered, setSwRegistered] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setSwRegistered(true);
      }).catch(() => {
        setSwRegistered(false);
      });
    }
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) return false;
    try {
      const res = await Notification.requestPermission();
      setPermission(res);

      if (res === 'granted') {
        // Register background sync if supported
        if ('serviceWorker' in navigator && 'SyncManager' in window) {
          try {
            const reg = await navigator.serviceWorker.ready;
            // @ts-expect-error sync is experimental in standard lib
            await reg.sync.register('muqeem-check-reminders');
          } catch {
            // Background sync not supported in this browser
          }
        }
        return true;
      }
      return false;
    } catch (e) {
      console.warn('Error requesting notification permission:', e);
      return false;
    }
  };

  const triggerTestAlert = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) return false;
    }

    const title = lang === 'ur' 
      ? 'مقیم ٹیسٹ الرٹ' 
      : lang === 'ar' 
        ? 'تنبيه تجريبي من مُقيم' 
        : 'Muqeem Test Notification';

    const body = lang === 'ur'
      ? 'آپ کے فون پر مقیم کی سمارٹ نوٹیفکیشن کامیابی سے فعال ہو چکی ہیں!'
      : lang === 'ar'
        ? 'تم تفعيل إشعارات مقيم بنجاح على جهازك!'
        : 'Muqeem smart expiry notifications are now active on your device!';

    try {
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.ready;
        await reg.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: 'muqeem-test',
        });
        return true;
      } else {
        new Notification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
        });
        return true;
      }
    } catch {
      await checkAndTriggerDueReminders(lang);
      return true;
    }
  };

  return {
    isSupported,
    permission,
    swRegistered,
    isEnabled: permission === 'granted',
    requestPermission,
    triggerTestAlert,
  };
}
