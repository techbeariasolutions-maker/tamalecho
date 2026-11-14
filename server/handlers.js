// Lógica de los endpoints de Web Push. Reciben un Request y devuelven un Response, así que se prueban
// sin desplegar. Los archivos de api/ solo les pasan sus dependencias reales (CLAUDE.md §6).
import { createHash, timingSafeEqual } from 'node:crypto';
import { shouldDeliver } from './delivery.js';
import { buildTipPayload, readVapidConfig, sendScheduled, sendToAll } from './push.js';
import { MAX_BODY_BYTES, subscriptionId, validateSubscription } from './subscriptions.js';

const json = (status, body, headers) => Response.json(body, { status, headers });

// Lee el cuerpo JSON con un límite de tamaño. Devuelve { body } o { error } con la respuesta lista.
// Si el cliente declara un Content-Length mayor al límite, se rechaza sin leer el cuerpo (HT-08.2-A);
// si no lo declara o miente, el tamaño se vuelve a medir después de leerlo.
async function readJson(request) {
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return { error: json(413, { error: 'La solicitud es demasiado grande.' }) };
  }
  const text = await request.text();
  if (new TextEncoder().encode(text).length > MAX_BODY_BYTES) {
    return { error: json(413, { error: 'La solicitud es demasiado grande.' }) };
  }
  try {
    return { body: JSON.parse(text) };
  } catch {
    return { error: json(400, { error: 'La solicitud no es JSON válido.' }) };
  }
}

// POST = alta o actualización · DELETE = baja. Solo quien conoce el endpoint puede darlo de baja.
export async function handleSubscribe(request, { store }) {
  if (request.method !== 'POST' && request.method !== 'DELETE') {
    return json(405, { error: 'Método no permitido.' }, { Allow: 'POST, DELETE' });
  }

  const { body, error } = await readJson(request);
  if (error) return error;

  if (request.method === 'DELETE') {
    if (typeof body?.endpoint !== 'string' || body.endpoint === '') {
      return json(400, { error: 'Falta el endpoint de la suscripción.' });
    }
    await store.remove(subscriptionId(body.endpoint));
    return json(200, { ok: true });
  }

  const { value, errors } = validateSubscription(body);
  if (errors.length > 0) return json(400, { error: 'La suscripción no es válida.', errors });
  // Al volver a sincronizar los ajustes se conserva lo que maneja el servidor (última ventana enviada
  // y hora del último envío). Si se perdiera, el job podría repetir el aviso de la ventana actual
  // (HU-15.2-A). Ningún campo del cuerpo puede escribir estos valores.
  const existing = await store.get(value.id);
  const record = { ...value };
  if (existing?.lastWindowKey) record.lastWindowKey = existing.lastWindowKey;
  if (existing?.lastSentAt) record.lastSentAt = existing.lastSentAt;
  await store.save(record);
  return json(201, { ok: true });
}

// Compara el header contra el secreto en tiempo constante. Sin secreto configurado, nadie pasa.
function isAuthorized(header, secret) {
  if (!secret || !header) return false;
  const digest = (value) => createHash('sha256').update(value).digest();
  return timingSafeEqual(digest(header), digest(`Bearer ${secret}`));
}

// Dos modos, los dos los dispara GitHub Actions (D-21):
// - prueba (por defecto): envía el consejo destacado a las suscripciones que no están en silencio;
// - programado (?mode=scheduled, HT-07.2-A): a cada suscripción, a lo sumo su ventana vigente, una vez.
export async function handleDispatch(request, { store, webpush, env, now, getFeaturedTip, getTips }) {
  if (!isAuthorized(request.headers.get('authorization'), env.DISPATCH_SECRET)) {
    return json(401, { error: 'No autorizado.' });
  }
  if (request.method !== 'POST') {
    return json(405, { error: 'Método no permitido.' }, { Allow: 'POST' });
  }

  const vapid = readVapidConfig(env);
  if (!vapid) return json(503, { error: 'Faltan las claves VAPID en el servidor.' });

  if (new URL(request.url).searchParams.get('mode') === 'scheduled') {
    return json(200, { mode: 'scheduled', ...(await sendScheduled({ webpush, store, vapid, now, tips: getTips() })) });
  }

  const payload = buildTipPayload(getFeaturedTip(now));
  // Silencio remoto (HU-07.2-B): se omiten las suscripciones en silencio, en pausa o en un día
  // sin avisos según su propia zona horaria.
  const shouldSend = (record) => shouldDeliver(record, now);
  return json(200, await sendToAll(payload, { webpush, store, vapid, shouldSend }));
}
