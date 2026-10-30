// SPIKE desechable (WP-S2-1). Service worker mínimo: solo push y notificationclick, sin caché (D-20).
/* global self, URL */
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const receivedAt = new Date();
  const sentAt = data.sentAt ? new Date(data.sentAt) : null;
  const delaySeconds = sentAt ? Math.round((receivedAt - sentAt) / 1000) : null;
  event.waitUntil(
    self.registration.showNotification(data.title ?? 'TamalEcho Tips', {
      body: `${data.body ?? ''}${delaySeconds !== null ? `\n(Retraso: ${delaySeconds} s)` : ''}`,
      data: { url: data.url ?? '/' },
      tag: 'tamalecho-aviso',
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data.url, self.location.origin).href;
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      const open = clients.find((client) => client.url.startsWith(self.location.origin));
      return open ? open.navigate(url).then((client) => client.focus()) : self.clients.openWindow(url);
    }),
  );
});
