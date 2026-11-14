import { useCallback, useState } from 'react';
import { getBrowserRepository } from '../services/storage.js';

// Reloj real del navegador. Va fuera del hook para que su identidad no cambie en cada render.
const systemClock = () => new Date();

// Historial de lecturas y misiones completadas del dispositivo (rediseño D-24).
// Se leen al montar la página; `markCompleted` guarda y actualiza el estado.
// Si el navegador no deja guardar, la marca dura solo mientras la página está abierta.
export function useProgress(repository = getBrowserRepository(), clock = systemClock) {
  const [history] = useState(() => repository.getHistory());
  const [completed, setCompleted] = useState(() => repository.getCompleted());

  const markCompleted = useCallback(
    (id) => {
      const at = clock();
      const saved = repository.markCompleted({ id, at });
      setCompleted((current) => (current[id] ? current : { ...current, [id]: at.toISOString() }));
      return saved;
    },
    [repository, clock],
  );

  return { history, completed, markCompleted };
}
