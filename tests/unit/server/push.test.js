// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildTipPayload,
  readVapidConfig,
  sendToAll,
  sendToSubscription,
  TTL_SECONDS,
} from '../../../server/push.js';
import { createMemoryStore } from '../../../server/store.js';
import { makeRecord, pushError, TIP, VAPID } from './fixtures.js';

const PAYLOAD = buildTipPayload(TIP);

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('readVapidConfig', () => {
  const env = { VAPID_SUBJECT: 's', VAPID_PUBLIC_KEY: 'pub', VAPID_PRIVATE_KEY: 'priv' };

  it('lee las tres variables', () => {
    expect(readVapidConfig(env)).toEqual({ subject: 's', publicKey: 'pub', privateKey: 'priv' });
  });

  it.each(['VAPID_SUBJECT', 'VAPID_PUBLIC_KEY', 'VAPID_PRIVATE_KEY'])('devuelve null si falta %s', (name) => {
    expect(readVapidConfig({ ...env, [name]: '' })).toBeNull();
  });
});

describe('buildTipPayload', () => {
  it('lleva solo título, cuerpo y la URL de la ficha', () => {
    expect(PAYLOAD).toEqual({ title: 'Product Backlog', body: 'Ordena el trabajo por valor.', url: '/tip/SCR-01' });
  });
});

describe('sendToSubscription', () => {
  it('envía con las claves VAPID y un TTL de 2 horas', async () => {
    const webpush = { sendNotification: vi.fn().mockResolvedValue({ statusCode: 201 }) };
    const record = makeRecord('a');
    const outcome = await sendToSubscription(record, PAYLOAD, { webpush, store: createMemoryStore(), vapid: VAPID });
    expect(outcome).toBe('sent');
    expect(TTL_SECONDS).toBe(7200);
    expect(webpush.sendNotification).toHaveBeenCalledWith(record.subscription, JSON.stringify(PAYLOAD), {
      vapidDetails: VAPID,
      TTL: 7200,
    });
  });

  it.each([404, 410])('borra la suscripción caducada cuando el servicio responde %i', async (status) => {
    const store = createMemoryStore();
    await store.save(makeRecord('a'));
    const webpush = { sendNotification: vi.fn().mockRejectedValue(pushError(status)) };
    expect(await sendToSubscription(makeRecord('a'), PAYLOAD, { webpush, store, vapid: VAPID })).toBe('removed');
    expect(await store.list()).toEqual([]);
  });

  it('un error temporal no borra la suscripción', async () => {
    const store = createMemoryStore();
    await store.save(makeRecord('a'));
    const webpush = { sendNotification: vi.fn().mockRejectedValue(pushError(500)) };
    expect(await sendToSubscription(makeRecord('a'), PAYLOAD, { webpush, store, vapid: VAPID })).toBe('failed');
    expect(await store.list()).toHaveLength(1);
  });

  it('no escribe el endpoint en los registros', async () => {
    const webpush = { sendNotification: vi.fn().mockRejectedValue(pushError(500)) };
    const record = makeRecord('a');
    await sendToSubscription(record, PAYLOAD, { webpush, store: createMemoryStore(), vapid: VAPID });
    expect(JSON.stringify(console.error.mock.calls)).not.toContain(record.subscription.endpoint);
  });
});

describe('sendToAll', () => {
  it('una suscripción que falla no detiene a las demás y el resumen cuenta cada caso', async () => {
    const store = createMemoryStore();
    await Promise.all(['ok', 'caducada', 'falla'].map((id) => store.save(makeRecord(id))));
    const webpush = {
      sendNotification: vi.fn(async (subscription) => {
        if (subscription.endpoint.endsWith('/caducada')) throw pushError(410);
        if (subscription.endpoint.endsWith('/falla')) throw pushError(503);
        return { statusCode: 201 };
      }),
    };
    expect(await sendToAll(PAYLOAD, { webpush, store, vapid: VAPID })).toEqual({ sent: 1, removed: 1, failed: 1 });
    expect((await store.list()).map((record) => record.id).sort()).toEqual(['falla', 'ok']);
  });

  it('sin suscripciones no envía nada', async () => {
    const webpush = { sendNotification: vi.fn() };
    const summary = await sendToAll(PAYLOAD, { webpush, store: createMemoryStore(), vapid: VAPID });
    expect(summary).toEqual({ sent: 0, removed: 0, failed: 0 });
    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });
});
