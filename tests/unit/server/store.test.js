// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createMemoryStore, createRedisStore } from '../../../server/store.js';
import { makeRecord } from './fixtures.js';

// Imita los comandos de hash de Redis que usa el adaptador, sin red.
function fakeRedis() {
  const hashes = new Map();
  return {
    async hset(key, values) {
      hashes.set(key, { ...hashes.get(key), ...values });
    },
    async hdel(key, field) {
      delete hashes.get(key)?.[field];
    },
    async hget(key, field) {
      return hashes.get(key)?.[field] ?? null;
    },
    // Como en Upstash: un hash vacío o inexistente devuelve null.
    async hgetall(key) {
      const hash = hashes.get(key);
      return hash && Object.keys(hash).length > 0 ? hash : null;
    },
  };
}

describe.each([
  ['memoria', () => createMemoryStore()],
  ['Redis', () => createRedisStore(fakeRedis())],
])('almacén en %s', (_nombre, createStore) => {
  it('guarda, consulta y borra una suscripción', async () => {
    const store = createStore();
    const record = makeRecord('a');
    await store.save(record);
    expect(await store.get('a')).toEqual(record);
    await store.remove('a');
    expect(await store.get('a')).toBeNull();
  });

  it('lista todas y queda vacío sin errores', async () => {
    const store = createStore();
    expect(await store.list()).toEqual([]);
    await store.save(makeRecord('a'));
    await store.save(makeRecord('b'));
    expect((await store.list()).map((record) => record.id).sort()).toEqual(['a', 'b']);
  });

  it('guardar la misma suscripción la actualiza sin duplicarla', async () => {
    const store = createStore();
    await store.save(makeRecord('a', { timeZone: 'America/Monterrey' }));
    await store.save(makeRecord('a', { timeZone: 'America/Tijuana' }));
    expect(await store.list()).toHaveLength(1);
    expect((await store.get('a')).timeZone).toBe('America/Tijuana');
  });

  it('borrar una suscripción inexistente no lanza error', async () => {
    await expect(createStore().remove('nadie')).resolves.toBeUndefined();
  });
});
