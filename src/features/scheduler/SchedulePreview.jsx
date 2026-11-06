import { formatClock, getWindowsForDay } from '../../services/schedule.js';

// Por qué hoy no hay avisos: el día no está activo o el silencio cubre todas las horas que quedan
// (por ejemplo, si el primer aviso es a las 22:00 con silencio de 21:00 a 08:00).
function emptyText(now, settings) {
  return settings.activeDays.includes(now.getDay())
    ? 'Hoy no hay avisos: con este horario todos caen en el silencio.'
    : 'Hoy no hay avisos: no es uno de tus días con avisos.';
}

// Vista previa de los avisos de hoy (HU-07.1-A). Usa getWindowsForDay, el mismo cálculo que
// programa los avisos, así que lo que se ve aquí es exactamente lo que hará el motor.
// Muestra los ajustes guardados, no lo que se está escribiendo en el formulario.
export default function SchedulePreview({ settings, now }) {
  const windows = getWindowsForDay(now, settings);

  return (
    <section className="schedule-preview" aria-labelledby="vista-previa-titulo">
      <h3 id="vista-previa-titulo">Avisos de hoy</h3>
      {windows.length === 0 ? (
        <p>{emptyText(now, settings)}</p>
      ) : (
        <ul className="schedule-preview__list">
          {windows.map((start) => (
            <li key={start.getTime()}>{formatClock(start)}</li>
          ))}
        </ul>
      )}
      {settings.paused && <p>Los avisos están en pausa: no te llegará ninguno hasta que los reanudes.</p>}
    </section>
  );
}
