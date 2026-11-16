// Envío de avisos Web Push (HT-07.1-B; agenda HT-07.2). `webpush` y `store` se reciben por parámetro para probarlos sin red.
import { getDueWindow, tipForWindow } from './delivery.js';
import { isInactive } from './expiry.js';

// Si el dispositivo está apagado, el servicio de push descarta el aviso después de 2 horas, la cadencia
// más corta. Así un aviso viejo nunca llega junto con el siguiente (regla de «sin atrasados», CLAUDE.md §2).
export const TTL_SECONDS = 2 * 60 * 60;

// Respuestas con las que el servicio de push indica que la suscripción ya no existe.
const EXPIRED_STATUS = [404, 410];

// Claves VAPID desde el entorno. Devuelve null si falta alguna, para fallar sin enviar nada.
export function readVapidConfig(env) {
  const { VAPID_SUBJECT: subject, VAPID_PUBLIC_KEY: publicKey, VAPID_PRIVATE_KEY: privateKey } = env;
  return subject && publicKey && privateKey ? { subject, publicKey, privateKey } : null;
}

// Payload mínimo: el aviso abre la ficha del consejo.
export function buildTipPayload(tip) {
  return { title: tip.title, body: tip.summary, url: `/tip/${tip.id}` };
}

// Reintento acotado (HT-07.2-B): un solo reintento, y solo ante errores temporales del servicio de
// push (demasiadas solicitudes, error del servidor o fallo de red sin código). Un 4xx distinto es
// un error definitivo y no se repite.
export const MAX_ATTEMPTS = 2;
export const RETRY_DELAY_MS = 1000;

export function isRetriable(error) {
  const status = error?.statusCode;
  return status === undefined || status === 429 || (status >= 500 && status <= 599);
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Devuelve 'sent', 'removed' o 'failed'. Una suscripción caducada se borra del almacén.
// `sleep` se recibe por parámetro para que las pruebas no esperen de verdad.
export async function sendToSubscription(record, payload, { webpush, store, vapid, sleep = wait }) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await webpush.sendNotification(record.subscription, JSON.stringify(payload), {
        vapidDetails: vapid,
        TTL: TTL_SECONDS,
      });
      return 'sent';
    } catch (error) {
      if (EXPIRED_STATUS.includes(error.statusCode)) {
        await store.remove(record.id);
        return 'removed';
      }
      if (attempt < MAX_ATTEMPTS && isRetriable(error)) {
        await sleep(RETRY_DELAY_MS);
        continue;
      }
      // Registro de errores: solo el código y el intento; el endpoint y las claves nunca se registran.
      console.error('No se pudo enviar un aviso. Código:', error.statusCode ?? 'sin código', '· intentos:', attempt);
      return 'failed';
    }
  }
  return 'failed';
}

// Envía a todas las suscripciones. Una que falle no detiene a las demás.
// `shouldSend(record)` decide cuáles reciben el aviso ahora (silencio remoto, HU-07.2-B); las
// demás se cuentan como 'skipped' y no se tocan.
export async function sendToAll(payload, { webpush, store, vapid, shouldSend = () => true }) {
  const records = await store.list();
  const results = await Promise.all(
    records.map((record) =>
      shouldSend(record) ? sendToSubscription(record, payload, { webpush, store, vapid }) : 'skipped',
    ),
  );
  const count = (outcome) => results.filter((result) => result === outcome).length;
  return { sent: count('sent'), removed: count('removed'), failed: count('failed'), skipped: count('skipped') };
}

// Guarda la ventana enviada sobre la versión ACTUAL del registro, no sobre la que se leyó al empezar:
// - si la persona se dio de baja mientras se enviaba, el registro ya no existe y no se escribe nada
//   (no se «resucita» una suscripción borrada ni se guardan sus datos);
// - si cambió sus ajustes durante el envío, se conservan los nuevos.
// Queda una ventana de milisegundos entre leer y escribir; si coincide con una baja, el registro
// huérfano no tiene endpoint válido y se borra en el siguiente envío, cuando el servicio responda 404 o 410.
async function markDelivered(store, id, windowKey, now) {
  const current = await store.get(id);
  if (!current) return;
  await store.save({ ...current, lastWindowKey: windowKey, lastSentAt: now.toISOString() });
}

// Pone la fecha de actividad sobre la versión ACTUAL del registro (mismo cuidado que markDelivered).
async function markSeen(store, id, now) {
  const current = await store.get(id);
  if (!current || current.lastSeenAt) return;
  await store.save({ ...current, lastSeenAt: now.toISOString() });
}

// Envío programado (HT-07.2-A, HU-15.2-A). Lo dispara el job de GitHub Actions cada 30 min.
// A cada suscripción le toca a lo sumo la ventana vigente de su hora local (getDueWindow). Después
// de un envío exitoso se guarda la clave de la ventana y la hora, para no repetirla aunque el job
// corra otra vez dentro de la misma ventana. Si el envío falla no se guarda nada: la siguiente
// corrida lo vuelve a intentar mientras la ventana siga vigente (reintento acotado entre corridas).
export async function sendScheduled({ webpush, store, vapid, now, tips, sleep }) {
  const records = await store.list();
  const results = await Promise.all(
    records.map(async (record) => {
      // S-06: sin actividad por más de INACTIVITY_DAYS, la suscripción se borra sin enviar nada.
      if (isInactive(record, now)) {
        await store.remove(record.id);
        return 'expired';
      }
      // Registro anterior a la caducidad: su plazo empieza hoy, no se borra de golpe.
      if (!record.lastSeenAt) await markSeen(store, record.id, now);
      const due = getDueWindow(record, now);
      if (!due) return 'skipped';
      const tip = tipForWindow(tips, due.window);
      if (!tip) return 'skipped';
      const outcome = await sendToSubscription(record, buildTipPayload(tip), { webpush, store, vapid, sleep });
      if (outcome === 'sent') await markDelivered(store, record.id, due.key, now);
      return outcome;
    }),
  );
  const count = (outcome) => results.filter((result) => result === outcome).length;
  return {
    sent: count('sent'),
    removed: count('removed'),
    failed: count('failed'),
    skipped: count('skipped'),
    expired: count('expired'),
  };
}
