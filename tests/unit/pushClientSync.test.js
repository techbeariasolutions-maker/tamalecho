import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../../src/services/schedule.js';
import { syncPushSettings } from '../../src/services/pushClient.js';
import { createPushEnv } from './fixtures/fakePush.js';

// HU-07.2-B, lado del cliente: syncPushSettings con el navegador simulado.
describe('syncPushSettings', () => {
  const SETTINGS = { ...DEFAULT_SETTINGS, activeDays: [...DEFAULT_SETTINGS.activeDays], paused: true };

  it('con una suscripción reenvía la suscripción con la zona horaria y los ajustes nuevos', async () => {
    const push = createPushEnv({ permission: 'granted', subscribed: true });
    await expect(syncPushSettings(SETTINGS, 'America/Monterrey', push.env)).resolves.toEqual({ ok: true, synced: true });
    expect(push.fetch).toHaveBeenCalledTimes(1);
    const [url, options] = push.fetch.mock.calls[0];
    expect(url).toBe('/api/push/subscribe');
    expect(options.method).toBe('POST');
    expect(JSON.parse(options.body)).toMatchObject({ timeZone: 'America/Monterrey', settings: { paused: true } });
  });

  it('sin suscripción no hace nada: no registra el service worker ni pide permiso', async () => {
    const push = createPushEnv({ permission: 'default' });
    await expect(syncPushSettings(SETTINGS, 'America/Monterrey', push.env)).resolves.toEqual({ ok: true, synced: false });
    expect(push.fetch).not.toHaveBeenCalled();
    expect(push.serviceWorker.register).not.toHaveBeenCalled();
    expect(push.Notification.requestPermission).not.toHaveBeenCalled();
  });

  it('si el servidor falla lo reporta sin lanzar errores', async () => {
    const push = createPushEnv({ permission: 'granted', subscribed: true, serverOk: false });
    await expect(syncPushSettings(SETTINGS, 'America/Monterrey', push.env)).resolves.toEqual({ ok: false, synced: false });
  });
});
