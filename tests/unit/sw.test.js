// @vitest-environment node
import { readFileSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// public/sw.js no es un módulo: se ejecuta con un `self` simulado y se capturan sus manejadores.
const SOURCE = readFileSync(new URL('../../public/sw.js', import.meta.url), 'utf8');
const ORIGIN = 'https://tamalecho.example';

function loadServiceWorker({ windows = [] } = {}) {
  const handlers = {};
  const self = {
    location: { origin: ORIGIN },
    addEventListener: (type, handler) => {
      handlers[type] = handler;
    },
    registration: { showNotification: vi.fn(async () => {}) },
    clients: {
      matchAll: vi.fn(async () => windows),
      openWindow: vi.fn(async () => ({})),
    },
  };
  new Function('self', SOURCE)(self);
  return { handlers, self };
}

// Ejecuta un evento y espera lo que el service worker pasó a waitUntil.
async function dispatch(handler, event) {
  let pending = Promise.resolve();
  handler({ ...event, waitUntil: (promise) => (pending = promise) });
  return pending;
}

const pushEvent = (payload) => ({
  data:
    payload === undefined
      ? null
      : {
          json: () => (typeof payload === 'string' ? JSON.parse(payload) : payload),
        },
});

function windowClient(url) {
  const client = { url, focus: vi.fn(async () => client), navigate: vi.fn(async () => client) };
  return client;
}

describe('public/sw.js (HU-15.1-A)', () => {
  let sw;
  beforeEach(() => {
    sw = loadServiceWorker();
  });

  it('solo atiende push y notificationclick: sin fetch ni caché (D-20)', () => {
    expect(Object.keys(sw.handlers).sort()).toEqual(['notificationclick', 'push']);
    expect(SOURCE).not.toMatch(/caches\b|addEventListener\(\s*['"]fetch/);
  });

  describe('push', () => {
    it('muestra título y cuerpo, guarda la URL en data y usa una sola etiqueta', async () => {
      await dispatch(sw.handlers.push, pushEvent({ title: 'Product Backlog', body: 'Resumen', url: '/tip/SCR-01' }));
      expect(sw.self.registration.showNotification).toHaveBeenCalledWith('Product Backlog', {
        body: 'Resumen',
        tag: 'tamalecho-aviso',
        renotify: true,
        data: { url: '/tip/SCR-01' },
      });
    });

    it('sin datos o con JSON corrupto muestra un aviso genérico que abre la portada', async () => {
      await dispatch(sw.handlers.push, pushEvent());
      await dispatch(sw.handlers.push, pushEvent('{roto'));
      for (const [title, options] of sw.self.registration.showNotification.mock.calls) {
        expect(title).toBe('TamalEcho Tips');
        expect(options.data.url).toBe('/');
      }
    });

    it.each([
      ['otro dominio', 'https://malicioso.example/tip/SCR-01'],
      ['protocolo relativo', '//malicioso.example/'],
      ['javascript:', 'javascript:alert(1)'],
      ['no es texto', 42],
    ])('una URL de %s se cambia por la portada', async (_, url) => {
      await dispatch(sw.handlers.push, pushEvent({ title: 'T', body: 'B', url }));
      expect(sw.self.registration.showNotification.mock.calls[0][1].data.url).toBe('/');
    });

    it('usa el ícono solo si el servidor manda una ruta del sitio', async () => {
      await dispatch(sw.handlers.push, pushEvent({ title: 'T', icon: '/icono.png' }));
      await dispatch(sw.handlers.push, pushEvent({ title: 'T', icon: 'https://otro.example/i.png' }));
      expect(sw.self.registration.showNotification.mock.calls[0][1].icon).toBe('/icono.png');
      expect(sw.self.registration.showNotification.mock.calls[1][1]).not.toHaveProperty('icon');
    });
  });

  describe('notificationclick', () => {
    const clickEvent = (url) => ({ notification: { close: vi.fn(), data: { url } } });

    it('cierra el aviso y abre la ficha si no hay pestañas del sitio', async () => {
      const event = clickEvent('/tip/SCR-01');
      await dispatch(sw.handlers.notificationclick, event);
      expect(event.notification.close).toHaveBeenCalled();
      expect(sw.self.clients.openWindow).toHaveBeenCalledWith(`${ORIGIN}/tip/SCR-01`);
    });

    it('si la ficha ya está abierta, la enfoca sin abrir otra', async () => {
      const tab = windowClient(`${ORIGIN}/tip/SCR-01`);
      sw = loadServiceWorker({ windows: [windowClient('https://otro.example/'), tab] });
      await dispatch(sw.handlers.notificationclick, clickEvent('/tip/SCR-01'));
      expect(tab.focus).toHaveBeenCalled();
      expect(sw.self.clients.openWindow).not.toHaveBeenCalled();
    });

    it('si hay otra pestaña del sitio, la enfoca y la lleva a la ficha', async () => {
      const tab = windowClient(`${ORIGIN}/biblioteca/scrum`);
      sw = loadServiceWorker({ windows: [tab] });
      await dispatch(sw.handlers.notificationclick, clickEvent('/tip/PMI-03'));
      expect(tab.focus).toHaveBeenCalled();
      expect(tab.navigate).toHaveBeenCalledWith(`${ORIGIN}/tip/PMI-03`);
      expect(sw.self.clients.openWindow).not.toHaveBeenCalled();
    });

    it('si no puede llevar esa pestaña a la ficha, abre una nueva', async () => {
      const tab = windowClient(`${ORIGIN}/`);
      tab.navigate.mockRejectedValueOnce(new TypeError('no controlada'));
      sw = loadServiceWorker({ windows: [tab] });
      await dispatch(sw.handlers.notificationclick, clickEvent('/tip/SCR-02'));
      expect(sw.self.clients.openWindow).toHaveBeenCalledWith(`${ORIGIN}/tip/SCR-02`);
    });

    it('nunca abre otro dominio aunque el aviso lo traiga', async () => {
      await dispatch(sw.handlers.notificationclick, clickEvent('https://malicioso.example/'));
      expect(sw.self.clients.openWindow).toHaveBeenCalledWith(`${ORIGIN}/`);
    });
  });
});
