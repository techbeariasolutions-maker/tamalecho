// @vitest-environment node
// Caducidad por inactividad (S-06, D-27): sin red ni claves reales; webpush y el almacén son simulados.
import { describe, expect, it, vi } from 'vitest';
import { handleSubscribe } from '../../../server/handlers.js';
import { INACTIVITY_DAYS, isInactive } from '../../../server/expiry.js';
import { sendScheduled } from '../../../server/push.js';
import { createMemoryStore } from '../../../server/store.js';
import { subscriptionId } from '../../../server/subscriptions.js';
import { getTips } from '../../../src/services/catalog.js';
import { ENDPOINT, makeBody, makeRecord, VAPID } from './fixtures.js';

const DAY = 24 * 60 * 60 * 1000;
// Lunes 9/11/2026, 11:07 en Monterrey (UTC−6): toca la ventana de las 11:00.
const NOW = new Date(Date.UTC(2026, 10, 9, 17, 7));
const daysAgo = (days) => new Date(NOW.getTime() - days * DAY).toISOString();

describe('isInactive', () => {
  it(`caduca solo cuando pasan más de ${INACTIVITY_DAYS} días desde lastSeenAt`, () => {
    expect(isInactive({ lastSeenAt: daysAgo(INACTIVITY_DAYS - 1) }, NOW)).toBe(false);
    expect(isInactive({ lastSeenAt: daysAgo(INACTIVITY_DAYS) }, NOW)).toBe(false);
    expect(isInactive({ lastSeenAt: daysAgo(INACTIVITY_DAYS + 1) }, NOW)).toBe(true);
  });

  it('un registro sin fecha o con fecha inválida no caduca (no se borra por un dato que falta)', () => {
    expect(isInactive({}, NOW)).toBe(false);
    expect(isInactive({ lastSeenAt: 'no-es-una-fecha' }, NOW)).toBe(false);
  });

  it('el plazo es de 60 días (el aviso de privacidad lo dice con ese número)', () => {
    expect(INACTIVITY_DAYS).toBe(60);
  });
});

describe('handleSubscribe registra la actividad', () => {
  const post = (body) => new Request('https://tamalecho.test/api/push/subscribe', { method: 'POST', body: JSON.stringify(body) });

  it('guarda lastSeenAt con la hora del servidor en cada alta', async () => {
    const store = createMemoryStore();
    await handleSubscribe(post(makeBody()), { store, now: () => NOW });
    expect((await store.get(subscriptionId(ENDPOINT))).lastSeenAt).toBe(NOW.toISOString());
  });

  it('una sincronización posterior renueva lastSeenAt y conserva lo que maneja el servidor', async () => {
    const store = createMemoryStore();
    await handleSubscribe(post(makeBody()), { store, now: () => new Date(NOW.getTime() - 40 * DAY) });
    const id = subscriptionId(ENDPOINT);
    await store.save({ ...(await store.get(id)), lastWindowKey: '2026-11-09@11:00', lastSentAt: NOW.toISOString() });
    await handleSubscribe(post(makeBody()), { store, now: () => NOW });
    expect(await store.get(id)).toMatchObject({
      lastSeenAt: NOW.toISOString(),
      lastWindowKey: '2026-11-09@11:00',
      lastSentAt: NOW.toISOString(),
    });
  });

  it('ignora un lastSeenAt que venga en el cuerpo', async () => {
    const store = createMemoryStore();
    await handleSubscribe(post({ ...makeBody(), lastSeenAt: '2099-01-01T00:00:00.000Z' }), { store, now: () => NOW });
    expect((await store.get(subscriptionId(ENDPOINT))).lastSeenAt).toBe(NOW.toISOString());
  });
});

describe('sendScheduled y la caducidad', () => {
  const tips = getTips();
  const run = (store) => {
    const webpush = { sendNotification: vi.fn(async () => ({})) };
    return { webpush, result: sendScheduled({ webpush, store, vapid: VAPID, now: NOW, tips }) };
  };

  it('borra la suscripción inactiva sin enviarle nada y la cuenta como expired', async () => {
    const store = createMemoryStore();
    await store.save(makeRecord('vieja', { lastSeenAt: daysAgo(INACTIVITY_DAYS + 5) }));
    await store.save(makeRecord('activa', { lastSeenAt: daysAgo(3) }));
    const { webpush, result } = run(store);
    expect(await result).toEqual({ sent: 1, removed: 0, failed: 0, skipped: 0, expired: 1 });
    expect(await store.get('vieja')).toBeNull();
    expect(await store.get('activa')).not.toBeNull();
    expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
  });

  it('una suscripción inactiva se borra aunque no le toque ninguna ventana (p. ej. en pausa)', async () => {
    const store = createMemoryStore();
    await store.save(makeRecord('vieja', { settings: { paused: true }, lastSeenAt: daysAgo(INACTIVITY_DAYS + 1) }));
    const { webpush, result } = run(store);
    expect((await result).expired).toBe(1);
    expect(await store.get('vieja')).toBeNull();
    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });

  it('un registro anterior a la caducidad (sin lastSeenAt) recibe la fecha de hoy y no se borra', async () => {
    const store = createMemoryStore();
    await store.save(makeRecord('antigua'));
    const { result } = run(store);
    expect((await result).expired).toBe(0);
    const saved = await store.get('antigua');
    expect(saved.lastSeenAt).toBe(NOW.toISOString());
    // El envío de la ventana vigente se guardó sobre la misma versión del registro.
    expect(saved.lastWindowKey).toBe('2026-11-09@11:00');
  });

  it('no cambia la fecha de actividad de un registro que ya la tiene', async () => {
    const store = createMemoryStore();
    const seen = daysAgo(10);
    await store.save(makeRecord('a', { lastSeenAt: seen }));
    await run(store).result;
    expect((await store.get('a')).lastSeenAt).toBe(seen);
  });
});
