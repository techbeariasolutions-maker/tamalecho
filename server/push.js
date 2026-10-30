// Envío de avisos Web Push (HT-07.1-B). `webpush` y `store` se reciben por parámetro para probarlos sin red.

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

// Devuelve 'sent', 'removed' o 'failed'. Una suscripción caducada se borra del almacén.
export async function sendToSubscription(record, payload, { webpush, store, vapid }) {
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
    // Solo se registra el código: el endpoint y las claves no deben quedar en los registros.
    console.error('No se pudo enviar un aviso. Código:', error.statusCode ?? 'sin código');
    return 'failed';
  }
}

// Envía a todas las suscripciones. Una que falle no detiene a las demás.
export async function sendToAll(payload, { webpush, store, vapid }) {
  const records = await store.list();
  const results = await Promise.all(
    records.map((record) => sendToSubscription(record, payload, { webpush, store, vapid })),
  );
  const count = (outcome) => results.filter((result) => result === outcome).length;
  return { sent: count('sent'), removed: count('removed'), failed: count('failed') };
}
