// Progreso local y «Ruta diaria» (rediseño D-24). Funciones puras: reciben la fecha y los datos
// como parámetros; no leen el almacenamiento ni llaman a new Date() sin argumentos.
// Todo se calcula en el dispositivo con el historial de lecturas y las misiones completadas
// (CLAUDE.md §2: sin cuentas ni datos en el servidor).

// Velocidad de lectura para estimar la duración de una misión.
export const WORDS_PER_MINUTE = 200;

// Campos que se leen en la ficha de una misión.
const READING_FIELDS = ['summary', 'explanation', 'commonMistake', 'example', 'action'];

// Minutos estimados para leer un consejo completo (mínimo 1).
export function readingMinutes(tip) {
  const words = READING_FIELDS.map((field) => tip?.[field] ?? '')
    .join(' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

// Día local de una fecha como texto «AAAA-MM-DD» (sin depender de la zona UTC).
export function localDayKey(date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

// Mismo día local, `offset` días antes o después (respeta el horario de verano).
function addDays(date, offset) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset);
}

// Racha: días seguidos con al menos una lectura, contando hacia atrás desde hoy.
// Si hoy todavía no hay lecturas, la racha sigue viva desde ayer (no se rompe a primera hora).
export function getStreak(history, now) {
  const days = new Set(history.map((entry) => localDayKey(new Date(entry.at))));
  let cursor = days.has(localDayKey(now)) ? now : addDays(now, -1);
  let streak = 0;
  while (days.has(localDayKey(cursor))) {
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

// Ruta de `length` días alrededor de hoy (hoy en medio). Cada día tiene su consejo destacado,
// el mismo que mostraría la portada ese día (getFeaturedTip es determinista por fecha).
export function getRoute(getFeaturedTip, now, length = 5) {
  const before = Math.floor(length / 2);
  return Array.from({ length }, (_, index) => {
    const date = addDays(now, index - before);
    return { date, tip: getFeaturedTip(date), isToday: index === before };
  }).filter((step) => step.tip);
}

// Estado de un consejo para el usuario: 'completado' > 'leido' > 'nuevo'.
export function getTipStatus(id, readIds, completed) {
  if (completed[id]) return 'completado';
  if (readIds.has(id)) return 'leido';
  return 'nuevo';
}

// Texto del estado, para que no dependa solo del color o del ícono (CLAUDE.md §10).
export const STATUS_LABELS = { nuevo: 'Nuevo', leido: 'Leído', completado: 'Completado' };

// Resumen del progreso: totales y por enfoque. `tips` es la lista completa del catálogo.
export function summarizeProgress({ tips, history, completed }) {
  const readIds = new Set(history.map((entry) => entry.id));
  const count = (list, predicate) => list.filter(predicate).length;
  const byFramework = {};
  for (const framework of [...new Set(tips.map((tip) => tip.framework))]) {
    const own = tips.filter((tip) => tip.framework === framework);
    byFramework[framework] = {
      total: own.length,
      read: count(own, (tip) => readIds.has(tip.id) || Boolean(completed[tip.id])),
      completed: count(own, (tip) => Boolean(completed[tip.id])),
    };
  }
  return {
    total: tips.length,
    read: count(tips, (tip) => readIds.has(tip.id) || Boolean(completed[tip.id])),
    completed: count(tips, (tip) => Boolean(completed[tip.id])),
    byFramework,
    readIds,
  };
}
