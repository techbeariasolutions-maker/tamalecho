// Service worker mínimo de TamalEcho Tips (HU-15.1-A, D-20).
// Solo atiende `push` y `notificationclick`. No tiene manejador de `fetch` ni caché: el modo sin
// conexión es HT-06.2-A / HU-12 y no está activado (CLAUDE.md §3).

// Una sola etiqueta: un aviso nuevo reemplaza al anterior en vez de apilarse (spike D-21, «uno a la vez»).
const NOTIFICATION_TAG = 'tamalecho-aviso';
const DEFAULT_TITLE = 'TamalEcho Tips';

// Solo rutas del mismo sitio ('/tip/SCR-01'). Cualquier otra cosa abre la portada:
// un aviso nunca debe poder llevar a otro dominio.
function safePath(value) {
  if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return '/';
  try {
    const url = new URL(value, self.location.origin);
    return url.origin === self.location.origin ? `${url.pathname}${url.search}` : '/';
  } catch {
    return '/';
  }
}

function readPayload(event) {
  if (!event.data) return {};
  try {
    const data = event.data.json();
    return data && typeof data === 'object' ? data : {};
  } catch {
    return {};
  }
}

self.addEventListener('push', (event) => {
  const data = readPayload(event);
  const title = typeof data.title === 'string' && data.title.trim() !== '' ? data.title : DEFAULT_TITLE;
  const options = {
    body: typeof data.body === 'string' ? data.body : '',
    tag: NOTIFICATION_TAG,
    renotify: true,
    data: { url: safePath(data.url) },
  };
  // El ícono solo se usa si el servidor lo manda; todavía no hay un ícono aprobado en el repositorio.
  if (typeof data.icon === 'string' && data.icon.startsWith('/')) options.icon = data.icon;
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(safePath(event.notification.data?.url), self.location.origin).href;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const exact = windows.find((client) => client.url === target);
      if (exact) return exact.focus();

      // Si hay una pestaña del sitio abierta, se reutiliza y se lleva a la ficha.
      const sameSite = windows.find((client) => new URL(client.url).origin === self.location.origin);
      if (sameSite) {
        try {
          const focused = await sameSite.focus();
          return await focused.navigate(target);
        } catch {
          // navigate() falla si la pestaña no está controlada por este service worker.
        }
      }
      return self.clients.openWindow(target);
    })(),
  );
});
