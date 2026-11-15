import { useCallback, useState } from 'react';
import { getBrowserRepository } from '../services/storage.js';

// Reloj real del navegador. Va fuera del hook para que su identidad no cambie en cada render.
const systemClock = () => new Date();

// Historial de lecturas, misiones completadas y respuestas de la microevaluación del dispositivo
// (rediseño D-24 y HU-10). Se leen al montar la página; cada acción guarda y actualiza el estado.
// Si el navegador no deja guardar, la marca dura solo mientras la página está abierta.
export function useProgress(repository = getBrowserRepository(), clock = systemClock) {
  const [history] = useState(() => repository.getHistory());
  const [completed, setCompleted] = useState(() => repository.getCompleted());
  const [answers, setAnswers] = useState(() => repository.getQuizAnswers());

  const markCompleted = useCallback(
    (id) => {
      const at = clock();
      const saved = repository.markCompleted({ id, at });
      setCompleted((current) => (current[id] ? current : { ...current, [id]: at.toISOString() }));
      return saved;
    },
    [repository, clock],
  );

  // Guarda si la respuesta de la pregunta de un consejo fue correcta (HU-10.2-A).
  const saveAnswer = useCallback(
    (id, correct) => {
      const at = clock();
      const saved = repository.saveQuizAnswer({ id, correct, at });
      setAnswers((current) => ({ ...current, [id]: { correct, at: at.toISOString() } }));
      return saved;
    },
    [repository, clock],
  );

  // Reiniciar progreso (HU-10.2-B): misiones completadas y respuestas. El historial no se toca.
  const resetProgress = useCallback(() => {
    const saved = repository.resetProgress();
    setCompleted({});
    setAnswers({});
    return saved;
  }, [repository]);

  return { history, completed, answers, markCompleted, saveAnswer, resetProgress };
}
