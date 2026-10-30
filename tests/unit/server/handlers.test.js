// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { handleDispatch, handleSubscribe } from '../../../server/handlers.js';
import { createMemoryStore } from '../../../server/store.js';
import { MAX_BODY_BYTES, subscriptionId } from '../../../server/subscriptions.js';
import { ENDPOINT, makeBody, makeRecord, TIP } from './fixtures.js';

const SUBSCRIBE_URL = 'https://tamalecho.test/api/push/subscribe';
const DISPATCH_URL = 'https://tamalecho.test/api/push/dispatch';

const subscribeRequest = (method, body) =>
  new Request(SUBSCRIBE_URL, { method, body: typeof body === 'string' ? body : JSON.stringify(body) });

describe('handleSubscribe (T2-17)', () => {
  it('POST guarda la suscripción y responde 201', async () => {
    const store = createMemoryStore();
    const response = await handleSubscribe(subscribeRequest('POST', makeBody()), { store });
    expect(response.status).toBe(201);
    expect(await store.get(subscriptionId(ENDPOINT))).toMatchObject({ timeZone: 'America/Monterrey' });
  });

  it('POST con la misma suscripción la actualiza sin duplicarla', async () => {
    const store = createMemoryStore();
    await handleSubscribe(subscribeRequest('POST', makeBody()), { store });
    await handleSubscribe(subscribeRequest('POST', makeBody({ timeZone: 'America/Tijuana' })), { store });
    expect(await store.list()).toHaveLength(1);
    expect((await store.get(subscriptionId(ENDPOINT))).timeZone).toBe('America/Tijuana');
  });

  it('DELETE borra la suscripción', async () => {
    const store = createMemoryStore();
    await handleSubscribe(subscribeRequest('POST', makeBody()), { store });
    const response = await handleSubscribe(subscribeRequest('DELETE', { endpoint: ENDPOINT }), { store });
    expect(response.status).toBe(200);
    expect(await store.list()).toEqual([]);
  });

  it('DELETE sin endpoint responde 400', async () => {
    const response = await handleSubscribe(subscribeRequest('DELETE', {}), { store: createMemoryStore() });
    expect(response.status).toBe(400);
  });

  it('una suscripción inválida responde 400 y no se guarda', async () => {
    const store = createMemoryStore();
    const body = makeBody({ subscription: { endpoint: 'https://ejemplo.test/x', keys: { p256dh: 'p', auth: 'a' } } });
    const response = await handleSubscribe(subscribeRequest('POST', body), { store });
    expect(response.status).toBe(400);
    expect((await response.json()).errors[0].field).toBe('endpoint');
    expect(await store.list()).toEqual([]);
  });

  it('un JSON mal formado responde 400', async () => {
    const response = await handleSubscribe(subscribeRequest('POST', '{ no es json'), { store: createMemoryStore() });
    expect(response.status).toBe(400);
  });

  it('un cuerpo demasiado grande responde 413 y no se guarda', async () => {
    const store = createMemoryStore();
    const body = makeBody({ relleno: 'x'.repeat(MAX_BODY_BYTES) });
    const response = await handleSubscribe(subscribeRequest('POST', body), { store });
    expect(response.status).toBe(413);
    expect(await store.list()).toEqual([]);
  });

  it.each(['GET', 'PUT'])('%s responde 405', async (method) => {
    const request = new Request(SUBSCRIBE_URL, { method, body: method === 'GET' ? undefined : '{}' });
    const response = await handleSubscribe(request, { store: createMemoryStore() });
    expect(response.status).toBe(405);
    expect(response.headers.get('allow')).toBe('POST, DELETE');
  });
});

describe('handleDispatch (T2-19)', () => {
  const ENV = {
    DISPATCH_SECRET: 'secreto-de-prueba',
    VAPID_SUBJECT: 'https://ejemplo.test',
    VAPID_PUBLIC_KEY: 'publica',
    VAPID_PRIVATE_KEY: 'privada',
  };

  async function setup(env = ENV) {
    const store = createMemoryStore();
    await store.save(makeRecord('a'));
    const webpush = { sendNotification: vi.fn().mockResolvedValue({ statusCode: 201 }) };
    const getFeaturedTip = vi.fn(() => TIP);
    const now = new Date(2026, 10, 2, 9, 0);
    return { store, webpush, env, now, getFeaturedTip };
  }

  const dispatchRequest = (authorization, method = 'POST') =>
    new Request(DISPATCH_URL, { method, headers: authorization ? { authorization } : {} });

  it.each([
    ['sin el header', undefined],
    ['con un secreto incorrecto', 'Bearer otro-secreto'],
    ['sin el prefijo Bearer', 'secreto-de-prueba'],
  ])('responde 401 y no envía nada %s', async (_caso, header) => {
    const deps = await setup();
    const response = await handleDispatch(dispatchRequest(header), deps);
    expect(response.status).toBe(401);
    expect(deps.webpush.sendNotification).not.toHaveBeenCalled();
  });

  it('si el servidor no tiene secreto, nadie pasa', async () => {
    const deps = await setup({ ...ENV, DISPATCH_SECRET: '' });
    const response = await handleDispatch(dispatchRequest('Bearer '), deps);
    expect(response.status).toBe(401);
    expect(deps.webpush.sendNotification).not.toHaveBeenCalled();
  });

  it('una petición GET sin secreto también responde 401', async () => {
    const response = await handleDispatch(dispatchRequest(undefined, 'GET'), await setup());
    expect(response.status).toBe(401);
  });

  it('con el secreto, GET responde 405', async () => {
    const response = await handleDispatch(dispatchRequest('Bearer secreto-de-prueba', 'GET'), await setup());
    expect(response.status).toBe(405);
  });

  it('sin claves VAPID responde 503 y no envía nada', async () => {
    const deps = await setup({ ...ENV, VAPID_PRIVATE_KEY: '' });
    const response = await handleDispatch(dispatchRequest('Bearer secreto-de-prueba'), deps);
    expect(response.status).toBe(503);
    expect(deps.webpush.sendNotification).not.toHaveBeenCalled();
  });

  it('con el secreto envía el consejo destacado de hoy y responde el resumen', async () => {
    const deps = await setup();
    const response = await handleDispatch(dispatchRequest('Bearer secreto-de-prueba'), deps);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ sent: 1, removed: 0, failed: 0 });
    expect(deps.getFeaturedTip).toHaveBeenCalledWith(deps.now);
    const [, payload] = deps.webpush.sendNotification.mock.calls[0];
    expect(JSON.parse(payload).url).toBe('/tip/SCR-01');
  });
});
