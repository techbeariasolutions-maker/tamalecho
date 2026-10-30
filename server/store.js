// Almacén de suscripciones (HT-07.1-A, D-21). Todos los adaptadores ofrecen save, remove, get y list.
import { Redis } from '@upstash/redis';

// Las suscripciones viven en un solo hash de Redis: registro.id → registro.
const SUBSCRIPTIONS_KEY = 'push:subscriptions';

// Recibe el cliente por parámetro para poder probarlo sin red.
export function createRedisStore(redis) {
  return {
    async save(record) {
      await redis.hset(SUBSCRIPTIONS_KEY, { [record.id]: record });
    },
    async remove(id) {
      await redis.hdel(SUBSCRIPTIONS_KEY, id);
    },
    async get(id) {
      return redis.hget(SUBSCRIPTIONS_KEY, id);
    },
    async list() {
      return Object.values((await redis.hgetall(SUBSCRIPTIONS_KEY)) ?? {});
    },
  };
}

// Almacén en memoria para las pruebas.
export function createMemoryStore() {
  const records = new Map();
  return {
    async save(record) {
      records.set(record.id, record);
    },
    async remove(id) {
      records.delete(id);
    },
    async get(id) {
      return records.get(id) ?? null;
    },
    async list() {
      return [...records.values()];
    },
  };
}

// Almacén real. Redis.fromEnv() lee KV_REST_API_URL y KV_REST_API_TOKEN, las variables que crea
// la conexión de Upstash en Vercel (docs/sprint-2/SPIKE_WEBPUSH.md).
export function createDefaultStore() {
  return createRedisStore(Redis.fromEnv());
}
