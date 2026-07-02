self.addEventListener('install', e => {
  console.log('Service worker installed');
});

self.addEventListener('fetch', e => {
  e.respondWith(fetch(e.request));
});

self.addEventListener('push', e => {
  if (e.data) {
    const data = e.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/icons/icon192.png',
      data: { url: data.data ? data.data.url : '/' }
    };
    e.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  const url = e.notification.data.url;
  if (url) {
    e.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
        for (let client of windowClients) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
    );
  }
});