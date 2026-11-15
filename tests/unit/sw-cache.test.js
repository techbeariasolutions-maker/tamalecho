// @vitest-environment node
// Caché sin conexión del service worker (HT-06.2-A, HT-06.2-B, HU-12.2-A, HU-12.2-B; WP-P5, D-26).
// public/sw.js se ejecuta con `self`, `caches` y `fetch` simulados.
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

const SOURCE = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8');
const ORIGIN = 'https://tamalecho.example';

// Almacén de cachés en memoria con la misma interfaz que CacheStorage.
function createCaches(initial = {}) {
  const stores = new Map(Object.entries(initial).map(([name, entries]) => [name, new Map(Object.entries(entries))]));
  const keyOf = (request) => new URL(typeof request === 'string' ? request : request.url, ORIGIN).pathname;
  return {
    stores,
    open: vi.fn(async (name) => {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        addAll: vi.fn(async (urls) => urls.forEach((url) => store.set(keyOf(url), `copia de ${url}`))),
      };
    }),
    keys: vi.fn(async () => [...stores.keys()]),
    delete: vi.fn(async (name) => stores.delete(name)),
    match: vi.fn(async (request) => {
      for (const store of stores.values()) {
        if (store.has(keyOf(request))) return store.get(keyOf(request));
      }
      return undefined;
    }),
  };
}

function loadServiceWorker({ caches = createCaches(), fetch = vi.fn() } = {}) {
  const handlers = {};
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type, handler) => {
      handlers[type] = handler;
    },
    skipWaiting: vi.fn(async () => {}),
    clients: { claim: vi.fn(async () => {}) },
    registration: { showNotification: vi.fn() },
  };
  const ResponseStub = { error: () => 'respuesta de error' };
  new Function('self', 'caches', 'fetch', 'Response', SOURCE)(self, caches, fetch, ResponseStub);
  return { handlers, self, caches, fetch };
}

async function dispatch(handler, event) {
  let pending = Promise.resolve();
  handler({ ...event, waitUntil: (promise) => (pending = promise) });
  return pending;
}

// Ejecuta un evento fetch y devuelve lo que el service worker respondió, o null si no lo atendió.
async function respond(handler, request) {
  let response = null;
  handler({ request, respondWith: (value) => (response = value) });
  return response === null ? null : await response;
}

const manifest = (version, urls = ['/', '/assets/app-abc.js']) => ({ ok: true, json: async () => ({ version, urls }) });
const request = (path, { mode = 'no-cors', method = 'GET' } = {}) => ({ url: `${ORIGIN}${path}`, mode, method });

describe('instalar: precarga lo publicado', () => {
  it('guarda en tamalecho-<versión> todas las URLs del manifiesto y activa sin esperar', async () => {
    const sw = loadServiceWorker({ fetch: vi.fn(async () => manifest('v1')) });
    await dispatch(sw.handlers.install, {});
    expect(sw.fetch).toHaveBeenCalledWith('/precache-manifest.json', { cache: 'no-store' });
    expect([...sw.caches.stores.get('tamalecho-v1').keys()]).toEqual(['/', '/assets/app-abc.js']);
    expect(sw.self.skipWaiting).toHaveBeenCalled();
  });

  it('si no hay red al instalar, se instala igual sin caché', async () => {
    const sw = loadServiceWorker({ fetch: vi.fn(async () => Promise.reject(new Error('sin red'))) });
    await expect(dispatch(sw.handlers.install, {})).resolves.toBeUndefined();
    expect(sw.caches.stores.size).toBe(0);
    expect(sw.self.skipWaiting).toHaveBeenCalled();
  });
});

describe('activar: una versión vieja no persiste (HT-06.2-B)', () => {
  it('borra las cachés de versiones anteriores y conserva la actual y las ajenas', async () => {
    const caches = createCaches({ 'tamalecho-v1': { '/': 'vieja' }, 'tamalecho-v2': { '/': 'nueva' }, 'otra-app': {} });
    const sw = loadServiceWorker({ caches, fetch: vi.fn(async () => manifest('v2')) });
    await dispatch(sw.handlers.activate, {});
    expect([...caches.stores.keys()].sort()).toEqual(['otra-app', 'tamalecho-v2']);
    expect(sw.self.clients.claim).toHaveBeenCalled();
  });

  it('sin red no borra nada (no sabe cuál es la actual) y toma control igual', async () => {
    const caches = createCaches({ 'tamalecho-v1': {} });
    const sw = loadServiceWorker({ caches, fetch: vi.fn(async () => Promise.reject(new Error('sin red'))) });
    await dispatch(sw.handlers.activate, {});
    expect([...caches.stores.keys()]).toEqual(['tamalecho-v1']);
    expect(sw.self.clients.claim).toHaveBeenCalled();
  });
});

describe('fetch', () => {
  it('nunca intercepta la API ni el manifiesto de precarga: leer sin conexión no envía nada (HU-12.2-B)', async () => {
    const sw = loadServiceWorker();
    expect(await respond(sw.handlers.fetch, request('/api/push/subscribe', { method: 'POST' }))).toBeNull();
    expect(await respond(sw.handlers.fetch, request('/api/push/dispatch'))).toBeNull();
    expect(await respond(sw.handlers.fetch, request('/precache-manifest.json'))).toBeNull();
    expect(await respond(sw.handlers.fetch, { url: 'https://otro.example/x.js', mode: 'no-cors', method: 'GET' })).toBeNull();
    expect(sw.fetch).not.toHaveBeenCalled();
  });

  it('páginas: primero la red, para ver siempre lo último publicado', async () => {
    const caches = createCaches({ 'tamalecho-v1': { '/': 'portada guardada' } });
    const sw = loadServiceWorker({ caches, fetch: vi.fn(async () => 'página de la red') });
    expect(await respond(sw.handlers.fetch, request('/tip/SCR-02', { mode: 'navigate' }))).toBe('página de la red');
  });

  it('páginas sin red: la portada guardada (la app resuelve la ruta en el navegador)', async () => {
    const caches = createCaches({ 'tamalecho-v1': { '/': 'portada guardada' } });
    const sw = loadServiceWorker({ caches, fetch: vi.fn(async () => Promise.reject(new Error('sin red'))) });
    expect(await respond(sw.handlers.fetch, request('/tip/SCR-02', { mode: 'navigate' }))).toBe('portada guardada');
  });

  it('archivos: primero la caché; si no están, la red', async () => {
    const caches = createCaches({ 'tamalecho-v1': { '/assets/app-abc.js': 'js guardado' } });
    const sw = loadServiceWorker({ caches, fetch: vi.fn(async () => 'js de la red') });
    expect(await respond(sw.handlers.fetch, request('/assets/app-abc.js'))).toBe('js guardado');
    expect(await respond(sw.handlers.fetch, request('/assets/otro-def.js'))).toBe('js de la red');
    // «Vary: Origin» del servidor no debe impedir encontrar los archivos guardados.
    expect(caches.match).toHaveBeenCalledWith(expect.objectContaining({ url: `${ORIGIN}/assets/app-abc.js` }), {
      ignoreVary: true,
    });
  });
});
