// Silencio remoto (HU-07.2-B). Decide si una suscripción debe recibir el aviso en este momento,
// con el mismo código de horario que usa el navegador (src/services/schedule.js).

import { getWindowsForDay, isQuietTime, validateSettings } from '../src/services/schedule.js';

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
