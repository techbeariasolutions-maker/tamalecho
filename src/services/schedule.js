// Motor de horario de los avisos (HT-04.1-A, HU-04.1-B). Único lugar donde se calcula el horario
// (CLAUDE.md §6).
// Reglas:
// - Todas las funciones reciben la fecha como parámetro. Nunca llaman a Date.now() ni a new Date()
//   sin argumentos, para poder probarlas con fechas fijas.
// - No usan APIs del navegador. El servidor (server/) también las importa para respetar el silencio.
// - Las ventanas son de reloj local («a las 14:00»): se construyen con año, mes, día, hora y minuto.
//   Así un cambio de horario de verano no las desplaza.

export const INTERVAL_OPTIONS = [120, 180];

// Valores recomendados. Que estén activos todos los días es una propuesta del equipo;
// la confirma el Product Owner (PLAN §6, WP-S2-2).
export const DEFAULT_SETTINGS = Object.freeze({
  intervalMinutes: 180,
  startTime: '08:00',
  quietStart: '21:00',
  quietEnd: '08:00',
  lunchStart: '12:00',
  lunchEnd: '16:00',
  activeDays: Object.freeze([0, 1, 2, 3, 4, 5, 6]),
  paused: false,
});

// Franjas del personaje (CONTEXTO §3.2). «hambre» y «atento» dependen de la franja de comida.
const AWAKE_FROM = 5 * 60; // 05:00
const TIRED_FROM = 20 * 60; // 20:00
const MINUTES_PER_DAY = 24 * 60;

const TIME_PATTERN = /^([01]\d|2[0-3]):([0-5]\d)$/;

// 'HH:MM' → minutos desde la medianoche.
export function toMinutes(time) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function minutesOfDay(date) {
  return date.getHours() * 60 + date.getMinutes();
}

function pad(value) {
  return String(value).padStart(2, '0');
}

// Fecha local del mismo día que `date`, a los `minutes` minutos desde la medianoche.
function atMinutes(date, minutes) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), Math.floor(minutes / 60), minutes % 60);
}

function addDays(date, days) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

// ¿`minute` está dentro del rango [from, to)? Funciona aunque el rango cruce la medianoche.
function inRange(minute, from, to) {
  if (from === to) return false;
  return from < to ? minute >= from && minute < to : minute >= from || minute < to;
}

// Valida los ajustes. Los valores inválidos se reemplazan por los recomendados y se reporta
// un error en español por campo, para mostrarlo junto al control (HU-07.1-B).
export function validateSettings(input) {
  const source = input && typeof input === 'object' ? input : {};
  const settings = { ...DEFAULT_SETTINGS, activeDays: [...DEFAULT_SETTINGS.activeDays] };
  const errors = [];

  if ('intervalMinutes' in source) {
    if (INTERVAL_OPTIONS.includes(source.intervalMinutes)) settings.intervalMinutes = source.intervalMinutes;
    else errors.push({ field: 'intervalMinutes', message: 'La frecuencia debe ser cada 2 o cada 3 horas.' });
  }

  for (const field of ['startTime', 'quietStart', 'quietEnd', 'lunchStart', 'lunchEnd']) {
    if (!(field in source)) continue;
    if (typeof source[field] === 'string' && TIME_PATTERN.test(source[field])) settings[field] = source[field];
    else errors.push({ field, message: 'Escribe la hora con el formato HH:MM, por ejemplo 08:00.' });
  }

  if (toMinutes(settings.lunchStart) >= toMinutes(settings.lunchEnd)) {
    errors.push({ field: 'lunchEnd', message: 'La comida debe terminar después de empezar.' });
    settings.lunchStart = DEFAULT_SETTINGS.lunchStart;
    settings.lunchEnd = DEFAULT_SETTINGS.lunchEnd;
  }

  if ('activeDays' in source) {
    const days = source.activeDays;
    const valid =
      Array.isArray(days) &&
      days.length > 0 &&
      days.every((day) => Number.isInteger(day) && day >= 0 && day <= 6) &&
      new Set(days).size === days.length;
    if (valid) settings.activeDays = [...days].sort((a, b) => a - b);
    else errors.push({ field: 'activeDays', message: 'Elige al menos un día de la semana.' });
  }

  if ('paused' in source) {
    if (typeof source.paused === 'boolean') settings.paused = source.paused;
    else errors.push({ field: 'paused', message: 'El estado de pausa no es válido.' });
  }

  return { settings, errors };
}

// Franja del día para el personaje: 'despierto' | 'hambre' | 'atento' | 'cansado'.
export function getDayPart(now, settings = DEFAULT_SETTINGS) {
  const minute = minutesOfDay(now);
  const lunchStart = toMinutes(settings.lunchStart);
  const lunchEnd = toMinutes(settings.lunchEnd);
  if (minute < AWAKE_FROM || minute >= TIRED_FROM) return 'cansado';
  if (minute >= lunchStart && minute < lunchEnd) return 'hambre';
  if (minute < lunchStart) return 'despierto';
  return 'atento';
}

// ¿Es horario de silencio? El rango por defecto (21:00–08:00) cruza la medianoche.
export function isQuietTime(now, settings = DEFAULT_SETTINGS) {
  return inRange(minutesOfDay(now), toMinutes(settings.quietStart), toMinutes(settings.quietEnd));
}

// Ventanas del día de `date`: desde la hora de inicio, cada `intervalMinutes`, hasta la medianoche.
// Se omiten las que caen en silencio. Un día inactivo no tiene ventanas.
export function getWindowsForDay(date, settings = DEFAULT_SETTINGS) {
  if (!settings.activeDays.includes(date.getDay())) return [];
  const quietStart = toMinutes(settings.quietStart);
  const quietEnd = toMinutes(settings.quietEnd);
  const windows = [];
  for (let minute = toMinutes(settings.startTime); minute < MINUTES_PER_DAY; minute += settings.intervalMinutes) {
    if (!inRange(minute, quietStart, quietEnd)) windows.push(atMinutes(date, minute));
  }
  return windows;
}

// Ventana vigente: la última de hoy que ya empezó, o null.
// Al volver de una suspensión larga devuelve solo la más reciente, nunca las atrasadas (HU-04).
export function getCurrentWindow(now, settings = DEFAULT_SETTINGS) {
  const started = getWindowsForDay(now, settings).filter((window) => window <= now);
  return started.length > 0 ? started[started.length - 1] : null;
}

// Siguiente ventana después de `now`, aunque sea otro día. Revisa hasta una semana adelante;
// null si no hay ninguna (por ejemplo, si el silencio cubre todo el día).
export function getNextWindow(now, settings = DEFAULT_SETTINGS) {
  for (let offset = 0; offset <= 7; offset += 1) {
    const day = offset === 0 ? now : addDays(now, offset);
    const next = getWindowsForDay(day, settings).find((window) => window > now);
    if (next) return next;
  }
  return null;
}

// Clave única de una ventana con la fecha y la hora locales: '2026-10-29@14:00'.
// Sirve para no mostrar ni enviar dos veces el mismo aviso.
export function idempotencyKey(windowStart) {
  const date = `${windowStart.getFullYear()}-${pad(windowStart.getMonth() + 1)}-${pad(windowStart.getDate())}`;
  return `${date}@${pad(windowStart.getHours())}:${pad(windowStart.getMinutes())}`;
}
