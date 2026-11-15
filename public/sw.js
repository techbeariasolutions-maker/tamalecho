// Service worker de TamalEcho Tips.
// - Web Push (HU-15.1-A): `push` y `notificationclick`.
// - Lectura sin conexión (HT-06.2-A, HU-12, WP-P5): precarga los archivos del build publicado y los
//   sirve sin red. Escrito a mano, sin vite-plugin-pwa ni Workbox (CLAUDE.md §4).
// Reglas de la caché:
// - Una caché por versión del build (`tamalecho-<versión>`, de /precache-manifest.json). Al activarse
//   una versión nueva se borran las anteriores: una versión vieja no persiste (HT-06.2-B).
// - Las páginas se piden primero a la red: si hay conexión siempre se ve lo último publicado; sin red
//   se usa la copia guardada. Los archivos con hash en el nombre no cambian y se sirven de la caché.
// - Nunca se guarda ni se intercepta /api/: leer sin conexión no envía nada (HU-12.2-B).

const CACHE_PREFIX = 'tamalecho-';
const PRECACHE_URL = '/precache-manifest.json';

async function readPrecacheManifest() {
  const response = await fetch(PRECACHE_URL, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// Instalar: guardar todo lo publicado. Si falla (sin red, build sin manifiesto), el service worker
// se instala igual y la app funciona solo con red, como antes.
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const { version, urls } = await readPrecacheManifest();
        const cache = await caches.open(`${CACHE_PREFIX}${version}`);
        await cache.addAll(urls);
      } catch {
        // Sin precarga: la lectura sigue funcionando con conexión.
      }
      await self.skipWaiting();
    })(),
  );
});

// Activar: borrar las cachés de versiones anteriores y tomar control de las pestañas abiertas.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const { version } = await readPrecacheManifest();
        const current = `${CACHE_PREFIX}${version}`;
        const names = await caches.keys();
        await Promise.all(
          names.filter((name) => name.startsWith(CACHE_PREFIX) && name !== current).map((name) => caches.delete(name)),
        );
      } catch {
        // Sin red no se sabe cuál es la versión actual: se limpia en la siguiente activación con red.
      }
      await self.clients.claim();
    })(),
  );
});

// ¿Se atiende esta petición desde aquí? Solo GET del mismo sitio y nunca la API ni el manifiesto
// de precarga (que siempre debe venir fresco de la red).
function isCacheable(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  return url.origin === self.location.origin && !url.pathname.startsWith('/api/') && url.pathname !== PRECACHE_URL;
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (!isCacheable(request)) return;

  if (request.mode === 'navigate') {
    // Páginas: primero la red; sin red, la portada guardada (la app resuelve la ruta en el navegador).
    event.respondWith(
      fetch(request).catch(
        async () => (await caches.match('/', { ignoreSearch: true, ignoreVary: true })) ?? Response.error(),
      ),
    );
    return;
  }

  // Archivos: primero la caché (tienen hash en el nombre); si no están, la red.
  // ignoreVary: el servidor responde «Vary: Origin» y los scripts de módulo se piden con Origin, que la
  // precarga no lleva; sin esto no coincidirían. Es seguro porque el contenido no cambia por origen.
  event.respondWith((async () => (await caches.match(request, { ignoreVary: true })) ?? fetch(request))());
});

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
