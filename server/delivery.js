// Silencio remoto (HU-07.2-B) y agenda del envío programado (HT-07.2-A, HU-15.2-A, HT-07.2-B).
// Decide si una suscripción debe recibir un aviso ahora, con el mismo código de horario que usa el
// navegador (src/services/schedule.js). Funciones puras: la fecha llega como parámetro.

import {
  getCurrentWindow,
  getWindowsForDay,
  idempotencyKey,
  isQuietTime,
  validateSettings,
} from '../src/services/schedule.js';
import { dayOfYear } from '../src/services/catalog.js';

// El job corre cada 30 min y GitHub Actions puede retrasarse (D-21). Una ventana se envía si empezó
// hace 60 min o menos; si el job se retrasó más, esa ventana se da por perdida y se espera la
// siguiente. Así nunca llega un aviso atrasado (CLAUDE.md §2).
export const MAX_DELAY_MINUTES = 60;

// Límite de frecuencia (HT-07.2-B): nunca dos avisos a la misma suscripción con menos de 90 min de
// diferencia, aunque cambie su horario a mitad del día (la cadencia mínima es de 120 min).
export const MIN_MINUTES_BETWEEN_SENDS = 90;

const MINUTE = 60 * 1000;

// Convierte un instante en la hora de reloj de `timeZone`: devuelve un Date cuyos getHours(),
// getDate(), getDay(), etc. dan la fecha y la hora que vería una persona en esa zona.
// Así schedule.js (que trabaja con la hora local) sirve igual en el servidor, que corre en UTC.
export function toWallClock(now, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23',
    })
      .formatToParts(now)
      .map(({ type, value }) => [type, Number(value)]),
  );
  return new Date(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute);
}

// ¿Se le envía el aviso a esta suscripción ahora? No, si en su zona horaria:
// - los avisos están en pausa;
// - es horario de silencio;
// - es un día sin avisos (getWindowsForDay devuelve [] para un día inactivo).
// Los ajustes guardados pasan otra vez por validateSettings, por si un registro viejo no los trae completos.
export function shouldDeliver(record, now) {
  const { settings } = validateSettings(record.settings);
  if (settings.paused) return false;
  let local;
  try {
    local = toWallClock(now, record.timeZone);
  } catch {
    // Una zona horaria que ya no reconoce el servidor: mejor no enviar que enviar a deshoras.
    return false;
  }
  if (isQuietTime(local, settings)) return false;
  return getWindowsForDay(local, settings).length > 0;
}

// Agenda del envío programado (HT-07.2-A, HU-15.2-A). Devuelve la ventana que hay que enviar ahora a
// esta suscripción, como { key, window } en su hora local, o null si no toca:
// - en pausa, en silencio o en un día sin avisos (las mismas reglas de shouldDeliver);
// - si no hay ventana vigente o empezó hace más de MAX_DELAY_MINUTES;
// - si esa ventana ya se le envió (clave idempotente guardada en lastWindowKey);
// - si el último envío fue hace menos de MIN_MINUTES_BETWEEN_SENDS.
export function getDueWindow(record, now) {
  if (!shouldDeliver(record, now)) return null;
  const { settings } = validateSettings(record.settings);
  const local = toWallClock(now, record.timeZone);
  const window = getCurrentWindow(local, settings);
  if (!window) return null;
  if (local - window > MAX_DELAY_MINUTES * MINUTE) return null;
  const key = idempotencyKey(window);
  if (record.lastWindowKey === key) return null;
  if (record.lastSentAt && now - new Date(record.lastSentAt) < MIN_MINUTES_BETWEEN_SENDS * MINUTE) return null;
  return { key, window };
}

// Consejo de una ventana: determinista por día y hora, para que cada ventana del día traiga uno
// distinto y todos los dispositivos con la misma ventana reciban el mismo (sin Math.random).
export function tipForWindow(tips, window) {
  if (tips.length === 0) return null;
  const index = (dayOfYear(window) - 1) * 24 + window.getHours();
  return tips[index % tips.length];
}
