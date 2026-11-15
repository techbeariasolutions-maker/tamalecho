import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import { isOnline, onConnectionChange, registerOfflineSupport, SERVICE_WORKER_URL } from '../../src/services/offline.js';
import OfflineBanner from '../../src/components/OfflineBanner.jsx';

// WP-P5 (D-26): registro del service worker, estado de conexión y PWA instalable.
describe('registerOfflineSupport', () => {
  const navigatorWith = (register) => ({ serviceWorker: { register } });

  it('registra /sw.js en producción con contexto seguro, sin pedir permisos', async () => {
    const register = vi.fn(async () => ({}));
    const result = await registerOfflineSupport({ navigator: navigatorWith(register), isSecureContext: true, isDev: false });
    expect(result).toBe('registered');
    expect(register).toHaveBeenCalledWith(SERVICE_WORKER_URL);
  });

  it('en desarrollo no registra nada (la caché escondería los cambios)', async () => {
    const register = vi.fn();
    expect(await registerOfflineSupport({ navigator: navigatorWith(register), isSecureContext: true, isDev: true })).toBe('skipped');
    expect(register).not.toHaveBeenCalled();
  });

  it('sin contexto seguro o sin soporte: «unsupported»; si falla el registro: «failed», sin lanzar', async () => {
    expect(await registerOfflineSupport({ navigator: navigatorWith(vi.fn()), isSecureContext: false, isDev: false })).toBe('unsupported');
    expect(await registerOfflineSupport({ navigator: {}, isSecureContext: true, isDev: false })).toBe('unsupported');
    const failing = vi.fn(async () => Promise.reject(new Error('no')));
    expect(await registerOfflineSupport({ navigator: navigatorWith(failing), isSecureContext: true, isDev: false })).toBe('failed');
  });
});

describe('estado de conexión', () => {
  it('isOnline lee navigator.onLine y, si no lo sabe, supone que sí', () => {
    expect(isOnline({ navigator: { onLine: false } })).toBe(false);
    expect(isOnline({ navigator: { onLine: true } })).toBe(true);
    expect(isOnline({ navigator: {} })).toBe(true);
  });

  it('onConnectionChange avisa en cada cambio y deja de escuchar', () => {
    const target = new EventTarget();
    const callback = vi.fn();
    const stop = onConnectionChange(callback, { target });
    target.dispatchEvent(new Event('offline'));
    target.dispatchEvent(new Event('online'));
    expect(callback.mock.calls).toEqual([[false], [true]]);
    stop();
    target.dispatchEvent(new Event('offline'));
    expect(callback).toHaveBeenCalledTimes(2);
  });
});

describe('OfflineBanner (HU-12.2-A)', () => {
  afterEach(() => {
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => true });
  });

  it('con conexión no muestra nada; al perderla lo anuncia sin role="status" propio', () => {
    render(<OfflineBanner />);
    expect(screen.queryByText(/Sin conexión/)).not.toBeInTheDocument();
    act(() => window.dispatchEvent(new Event('offline')));
    const text = screen.getByText(/Sin conexión\. Puedes seguir leyendo/);
    expect(text.parentElement).toHaveAttribute('aria-live', 'polite');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    act(() => window.dispatchEvent(new Event('online')));
    expect(screen.queryByText(/Sin conexión/)).not.toBeInTheDocument();
  });

  it('si la página se abre ya sin red, lo dice desde el inicio', () => {
    Object.defineProperty(window.navigator, 'onLine', { configurable: true, get: () => false });
    render(<OfflineBanner />);
    expect(screen.getByText(/Sin conexión/)).toBeInTheDocument();
  });
});

describe('PWA instalable (HU-12.1-A)', () => {
  const read = (path) => readFileSync(resolve(cwd(), path), 'utf8');

  it('el manifest tiene nombre, idioma, inicio, modo standalone y los tres íconos', () => {
    const manifest = JSON.parse(read('public/manifest.webmanifest'));
    expect(manifest).toMatchObject({ name: 'TamalEcho Tips', lang: 'es-MX', start_url: '/', display: 'standalone' });
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(['192x192', '512x512', '512x512']);
    expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
    for (const icon of manifest.icons) {
      expect(() => readFileSync(resolve(cwd(), `public${icon.src}`))).not.toThrow();
    }
  });

  it('index.html enlaza el manifest, el ícono y el color del tema', () => {
    const html = read('index.html');
    expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
    expect(html).toContain('rel="apple-touch-icon"');
    expect(html).toContain('<meta name="theme-color"');
  });
});
