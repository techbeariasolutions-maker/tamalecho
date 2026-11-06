import { useEffect, useState } from 'react';
import { getDayPart, getNextDayPartChange } from '../services/schedule.js';

// Reloj real del navegador. Va fuera del hook para que su identidad no cambie en cada render.
const systemClock = () => new Date();

// Franja actual del personaje (HU-05.1-B). El cálculo vive en schedule.js; este hook solo
// decide cuándo recalcular:
// - al montar y cuando cambian los ajustes (por ejemplo, la franja de comida);
// - con un solo setTimeout hasta el próximo cambio de franja (sin setInterval);
// - al volver a la pestaña (visibilitychange o focus), porque los temporizadores se
//   retrasan mientras la pestaña está oculta o el equipo suspendido.
// `clock` se puede inyectar en las pruebas.
export function useDayPart(settings, clock = systemClock) {
  const [dayPart, setDayPart] = useState(() => getDayPart(clock(), settings));

  useEffect(() => {
    let timer;

    function update() {
      const now = clock();
      setDayPart(getDayPart(now, settings));
      clearTimeout(timer);
      timer = setTimeout(update, getNextDayPartChange(now, settings).getTime() - now.getTime());
    }

    function updateIfVisible() {
      if (document.visibilityState === 'visible') update();
    }

    update();
    document.addEventListener('visibilitychange', updateIfVisible);
    window.addEventListener('focus', update);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', updateIfVisible);
      window.removeEventListener('focus', update);
    };
  }, [settings, clock]);

  return dayPart;
}
