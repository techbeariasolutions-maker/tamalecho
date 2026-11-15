// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { handleSubscribe } from '../../../server/handlers.js';
import { RATE_LIMIT, RATE_WINDOW_SECONDS, clientIp, createRateLimiter, rateLimitKey } from '../../../server/rateLimit.js';
import { createMemoryStore, createRedisStore } from '../../../server/store.js';
import { makeBody } from './fixtures.js';

// Límite de frecuencia de /api/push/subscribe (S-02, opción B).
const URL = 'https://tamalecho.test/api/push/subscribe';
const request = (ip, method = 'POST', body = makeBody()) =>
  new Request(URL, { method, body: JSON.stringify(body), headers: ip ? { 'x-real-ip': ip } : {} });

describe('clientIp y rateLimitKey', () => {
  it('usa x-real-ip, luego el primer x-forwarded-for y si no hay, un valor fijo', () => {
    expect(clientIp(new Request(URL, { headers: { 'x-real-ip': ' 1.1.1.1 ', 'x-forwarded-for': '2.2.2.2' } }))).toBe('1.1.1.1');
    expect(clientIp(new Request(URL, { headers: { 'x-forwarded-for': '2.2.2.2, 3.3.3.3' } }))).toBe('2.2.2.2');
    expect(clientIp(new Request(URL))).toBe('desconocido');
  });

  it('la llave no contiene la IP y cambia con el secreto', () => {
    const key = rateLimitKey('203.0.113.7', 'secreto');
    expect(key).not.toContain('203.0.113.7');
    expect(key).toMatch(/^ratelimit:subscribe:[0-9a-f]{64}$/);
    expect(rateLimitKey('203.0.113.7', 'otro')).not.toBe(key);
    expect(rateLimitKey('203.0.113.8', 'secreto')).not.toBe(key);
  });
});

describe('createRateLimiter', () => {
  it('deja pasar hasta el límite y bloquea después', async () => {
    const limiter = createRateLimiter({ store: createMemoryStore(), secret: 's', limit: 3 });
    const results = [];
    for (let index = 0; index < 5; index += 1) results.push((await limiter.check(request('9.9.9.9'))).allowed);
    expect(results).toEqual([true, true, true, false, false]);
  });

  it('cuenta cada IP por separado', async () => {
    const limiter = createRateLimiter({ store: createMemoryStore(), secret: 's', limit: 1 });
    expect((await limiter.check(request('1.1.1.1'))).allowed).toBe(true);
    expect((await limiter.check(request('1.1.1.1'))).allowed).toBe(false);
    expect((await limiter.check(request('2.2.2.2'))).allowed).toBe(true);
  });

  it('si el almacén falla, deja pasar (no impide dar de baja los avisos)', async () => {
    const store = { hit: async () => { throw new Error('Redis caído'); } };
    const result = await createRateLimiter({ store, secret: 's' }).check(request('1.1.1.1'));
    expect(result).toEqual({ allowed: true, retryAfter: 0 });
  });

  it('el límite por defecto es generoso y la ventana dura 10 minutos', () => {
    expect(RATE_LIMIT).toBe(20);
    expect(RATE_WINDOW_SECONDS).toBe(600);
  });
});

describe('handleSubscribe con límite', () => {
  it('responde 429 con Retry-After al pasar el límite, antes de leer el cuerpo', async () => {
    const store = createMemoryStore();
    const limiter = createRateLimiter({ store, secret: 's', limit: 2 });
    expect((await handleSubscribe(request('5.5.5.5'), { store, limiter })).status).toBe(201);
    expect((await handleSubscribe(request('5.5.5.5'), { store, limiter })).status).toBe(201);
    const blocked = await handleSubscribe(request('5.5.5.5', 'POST', 'esto no es json'), { store, limiter });
    expect(blocked.status).toBe(429);
    expect(blocked.headers.get('retry-after')).toBe(String(RATE_WINDOW_SECONDS));
    // Otra IP no se ve afectada.
    expect((await handleSubscribe(request('6.6.6.6'), { store, limiter })).status).toBe(201);
  });

  it('también limita las bajas (DELETE)', async () => {
    const store = createMemoryStore();
    const limiter = createRateLimiter({ store, secret: 's', limit: 1 });
    await handleSubscribe(request('7.7.7.7', 'DELETE', { endpoint: 'x' }), { store, limiter });
    const blocked = await handleSubscribe(request('7.7.7.7', 'DELETE', { endpoint: 'x' }), { store, limiter });
    expect(blocked.status).toBe(429);
  });

  it('un método no permitido sigue dando 405 sin gastar el límite', async () => {
    const store = createMemoryStore();
    const limiter = createRateLimiter({ store, secret: 's', limit: 1 });
    const response = await handleSubscribe(new Request(URL, { method: 'GET', headers: { 'x-real-ip': '8.8.8.8' } }), { store, limiter });
    expect(response.status).toBe(405);
    expect((await handleSubscribe(request('8.8.8.8'), { store, limiter })).status).toBe(201);
  });

  it('sin limitador no hay límite (compatibilidad)', async () => {
    const store = createMemoryStore();
    for (let index = 0; index < 30; index += 1) {
      expect((await handleSubscribe(request('1.2.3.4'), { store })).status).toBe(201);
    }
  });
});

describe('almacén Redis: hit', () => {
  it('crea el contador con caducidad solo una vez y lo incrementa', async () => {
    const calls = [];
    const values = new Map();
    const redis = {
      async set(key, value, options) {
        calls.push({ key, value, options });
        if (options?.nx && values.has(key)) return null;
        values.set(key, value);
        return 'OK';
      },
      async incr(key) {
        values.set(key, (values.get(key) ?? 0) + 1);
        return values.get(key);
      },
    };
    const store = createRedisStore(redis);
    expect(await store.hit('k', 600)).toBe(1);
    expect(await store.hit('k', 600)).toBe(2);
    expect(calls.every((call) => call.options.ex === 600 && call.options.nx === true)).toBe(true);
  });
});
