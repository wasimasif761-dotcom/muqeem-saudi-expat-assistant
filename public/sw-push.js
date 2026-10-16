/**
 * Muqeem Push Notification & Background Sync Service Worker Handler
 */

self.addEventListener('push', (event) => {
  let data = {
    title: 'تنبيه مقيم | Muqeem Alert',
    body: 'تذكير بانتهاء وثيقة رسمية | Document expiry reminder',
    icon: '/pwa-192x192.png',
    badge: '/pwa-192x192.png',
    tag: 'muqeem-expiry',
    url: '/',
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch {
      data.body = event.data.text() || data.body;
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/pwa-192x192.png',
    badge: data.badge || '/pwa-192x192.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
      documentId: data.documentId,
    },
    actions: [
      { action: 'open_app', title: 'Open / کھولیں / فتح' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/';

  if (event.action === 'dismiss') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // If not open, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Periodic or background sync event for scheduled offline expiry checks
self.addEventListener('sync', (event) => {
  if (event.tag === 'muqeem-check-reminders') {
    event.waitUntil(
      // Broadcast to any active client to trigger a local check
      self.clients.matchAll().then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: 'CHECK_EXPIRIES_NOW' });
        });
      })
    );
  }
});
