import { useCallback, useState } from 'react';
import { getBrowserRepository } from '../services/storage.js';

function snapshot(repository) {
  return { settings: repository.getSettings(), historyCount: repository.getHistory().length };
}

// Puerta de entrada de los componentes al repositorio local (HT-04.2-A, HT-04.2-B).
// `repository` se puede inyectar en las pruebas; por defecto es el del navegador.
// `historyCount` es lo que muestra la sección «Tus datos en este dispositivo».
export function useSettings(repository = getBrowserRepository()) {
  const [state, setState] = useState(() => snapshot(repository));

  const saveSettings = useCallback(
    (input) => {
      const result = repository.saveSettings(input);
      setState((current) => ({ ...current, settings: result.settings }));
      return result;
    },
    [repository],
  );

  // Devuelve true si se pudo restablecer; false si el navegador no deja guardar datos.
  const resetAll = useCallback(() => {
    const done = repository.resetAll();
    setState(snapshot(repository));
    return done;
  }, [repository]);

  return { settings: state.settings, historyCount: state.historyCount, saveSettings, resetAll };
}
