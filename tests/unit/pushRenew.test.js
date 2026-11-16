import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS } from '../../src/services/schedule.js';
import { enablePush, RENEW_INTERVAL_MS, renewPushSubscription, syncPushSettings } from '../../src/services/pushClient.js';
import { FAKE_ENDPOINT, createPushEnv } from './fixtures/fakePush.js';

// S-06, lado del cliente: la renovación diaria de la suscripción al abrir la app.
const SETTINGS = { ...DEFAULT_SETTINGS, activeDays: [...DEFAULT_SETTINGS.activeDays] };
const NOW = new Date('2026-11-09T17:07:00.000Z');
const withClock = (push, now = NOW) => ({ ...push.env, now: () => now });
const agoIso = (ms) => new Date(NOW.getTime() - ms).toISOString();

describe('renewPushSubscription', () => {
  it('con los avisos activos y sin renovación previa, reenvía la suscripción y anota la fecha', async () => {
    const push = createPushEnv({ permission: 'granted', subscribed: true });
    push.env.repository.savePushState({ status: 'on', endpoint: FAKE_ENDPOINT });
    await expect(renewPushSubscription(SETTINGS, 'America/Monterrey', withClock(push))).resolves.toEqual({ ok: true, synced: true });
    expect(push.fetch).toHaveBeenCalledTimes(1);
    expect(push.fetch.mock.calls[0][1].method).toBe('POST');
    expect(push.env.repository.getPushState()).toEqual({ status: 'on', endpoint: FAKE_ENDPOINT, syncedAt: NOW.toISOString() });
  });

  it('no vuelve a enviar si la última renovación fue hace menos de un día', async () => {
    const push = createPushEnv({ permission: 'granted', subscribed: true });
    push.env.repository.savePushState({ status: 'on', endpoint: FAKE_ENDPOINT, syncedAt: agoIso(RENEW_INTERVAL_MS - 60_000) });
    await expect(renewPushSubscription(SETTINGS, 'America/Monterrey', withClock(push))).resolves.toEqual({ ok: true, synced: false });
    expect(push.fetch).not.toHaveBeenCalled();
  });

  it('renueva cuando pasó más de un día', async () => {
    const push = createPushEnv({ permission: 'granted', subscribed: true });
    push.env.repository.savePushState({ status: 'on', endpoint: FAKE_ENDPOINT, syncedAt: agoIso(RENEW_INTERVAL_MS + 60_000) });
    await renewPushSubscription(SETTINGS, 'America/Monterrey', withClock(push));
    expect(push.fetch).toHaveBeenCalledTimes(1);
    expect(push.env.repository.getPushState().syncedAt).toBe(NOW.toISOString());
  });

  it('si los avisos no están activos en este dispositivo no envía nada ni toca permisos', async () => {
    const push = createPushEnv({ permission: 'default' });
    await expect(renewPushSubscription(SETTINGS, 'America/Monterrey', withClock(push))).resolves.toEqual({ ok: true, synced: false });
    expect(push.fetch).not.toHaveBeenCalled();
    expect(push.serviceWorker.register).not.toHaveBeenCalled();
    expect(push.Notification.requestPermission).not.toHaveBeenCalled();
  });

  it('si el servidor falla no anota la fecha: se reintenta al abrir otra vez', async () => {
    const push = createPushEnv({ permission: 'granted', subscribed: true, serverOk: false });
    push.env.repository.savePushState({ status: 'on', endpoint: FAKE_ENDPOINT });
    await expect(renewPushSubscription(SETTINGS, 'America/Monterrey', withClock(push))).resolves.toEqual({ ok: false, synced: false });
    expect(push.env.repository.getPushState().syncedAt).toBeUndefined();
  });
});

describe('syncedAt en activar y sincronizar', () => {
  it('enablePush y syncPushSettings anotan la fecha de la sincronización', async () => {
    const push = createPushEnv({ permission: 'default' });
    await enablePush(SETTINGS, 'America/Monterrey', withClock(push));
    expect(push.env.repository.getPushState().syncedAt).toBe(NOW.toISOString());

    const later = new Date(NOW.getTime() + 3 * 60 * 60 * 1000);
    await syncPushSettings(SETTINGS, 'America/Monterrey', withClock(push, later));
    expect(push.env.repository.getPushState().syncedAt).toBe(later.toISOString());
  });
});
