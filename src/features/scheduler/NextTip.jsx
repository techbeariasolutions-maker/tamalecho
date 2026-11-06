import { useNextWindow } from '../../hooks/useNextWindow.js';
import { calendarDaysBetween, formatClock } from '../../services/schedule.js';

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// «hoy a las 14:00», «mañana a las 08:00» o «el lunes a las 08:00», con la hora local.
export function describeNextWindow(now, next) {
  const time = `a las ${formatClock(next)}`;
  const days = calendarDaysBetween(now, next);
  if (days === 0) return `hoy ${time}`;
  if (days === 1) return `mañana ${time}`;
  return `el ${WEEKDAYS[next.getDay()]} ${time}`;
}

// «Próximo consejo» (HU-04.1-A), en la portada y en Ajustes. Con la pausa activa dice
// «Avisos en pausa». Se actualiza solo cuando empieza la ventana anunciada.
export default function NextTip({ settings }) {
  const { now, next } = useNextWindow(settings);

  let text;
  if (settings.paused) text = 'Avisos en pausa.';
  else if (!next) text = 'Con este horario no hay próximos avisos.';
  else text = `Próximo consejo: ${describeNextWindow(now, next)}.`;

  return <p className="next-tip">{text}</p>;
}
