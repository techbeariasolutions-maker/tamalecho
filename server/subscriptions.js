// Validación de suscripciones Web Push (HT-07.1-A). Lógica pura: no toca la red ni el almacén.
import { createHash } from 'node:crypto';
import { validateSettings } from '../src/services/schedule.js';

// Una suscripción real ocupa unos cientos de bytes; esto evita guardar cuerpos abusivos.
export const MAX_BODY_BYTES = 4096;

// El servidor hace peticiones a la URL que recibe, así que solo acepta servicios de push conocidos.
// Sin esta lista, cualquiera podría registrar una URL arbitraria y usar el servidor para llamarla.
const PUSH_HOSTS = [
  /^fcm\.googleapis\.com$/, // Chrome y derivados
  /^updates\.push\.services\.mozilla\.com$/, // Firefox
  /\.notify\.windows\.com$/, // Edge
  /^web\.push\.apple\.com$/, // Safari
];

function isPushEndpoint(value) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && PUSH_HOSTS.some((host) => host.test(url.hostname));
  } catch {
    return false;
  }
}

function isTimeZone(value) {
  if (typeof value !== 'string' || value === '') return false;
  try {
    new Intl.DateTimeFormat('es-MX', { timeZone: value });
    return true;
  } catch {
    return false;
  }
}

const isKey = (value) => typeof value === 'string' && value.length > 0;

// Llave del registro: un hash, para no usar el endpoint completo como llave en el almacén.
export function subscriptionId(endpoint) {
  return createHash('sha256').update(endpoint).digest('hex');
}

// Valida el cuerpo de POST /api/push/subscribe. Devuelve { value, errors }; `value` es el registro
// que se guarda y contiene únicamente lo mínimo (CLAUDE.md §2): nada de lo demás que llegue en el cuerpo.
export function validateSubscription(body) {
  const source = body && typeof body === 'object' ? body : {};
  const { endpoint, keys } = source.subscription ?? {};
  const errors = [];

  if (!isPushEndpoint(endpoint)) errors.push({ field: 'endpoint', message: 'El servicio de avisos no es válido.' });
  if (!isKey(keys?.p256dh) || !isKey(keys?.auth)) {
    errors.push({ field: 'keys', message: 'Faltan las claves de la suscripción.' });
  }
  if (!isTimeZone(source.timeZone)) errors.push({ field: 'timeZone', message: 'La zona horaria no es válida.' });

  const { settings, errors: settingsErrors } = validateSettings(source.settings);
  errors.push(...settingsErrors);

  if (errors.length > 0) return { value: null, errors };
  return {
    value: {
      id: subscriptionId(endpoint),
      subscription: { endpoint, keys: { p256dh: keys.p256dh, auth: keys.auth } },
      timeZone: source.timeZone,
      settings,
    },
    errors,
  };
}
