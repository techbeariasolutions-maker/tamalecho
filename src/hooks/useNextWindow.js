import { useEffect, useState } from 'react';
import { getNextWindow } from '../services/schedule.js';

// Reloj real del navegador. Va fuera del hook para que su identidad no cambie en cada render.
const systemClock = () => new Date();

function snapshot(clock, settings) {
  const now = clock();
  return { now, next: getNextWindow(now, settings) };
}

// Próxima ventana de aviso (HU-04.1-A). El cálculo es getNextWindow de schedule.js; este hook
// decide cuándo repetirlo:
// - al montar y cuando cambian los ajustes;
// - con un solo setTimeout hasta que empiece esa ventana (sin setInterval);
// - al volver a la pestaña (visibilitychange o focus), por si el equipo estuvo suspendido.
// Devuelve { now, next }; `next` es null si con ese horario no hay ninguna ventana en una semana.
export function useNextWindow(settings, clock = systemClock) {
  const [state, setState] = useState(() => snapshot(clock, settings));

  useEffect(() => {
    let timer;

    function update() {
      const current = snapshot(clock, settings);
      setState(current);
      clearTimeout(timer);
      if (current.next) timer = setTimeout(update, current.next.getTime() - current.now.getTime());
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

  return state;
}
