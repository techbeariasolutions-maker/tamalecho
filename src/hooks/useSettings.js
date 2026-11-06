import { useCallback, useState } from 'react';
import { getBrowserRepository } from '../services/storage.js';

// Puerta de entrada de los componentes al repositorio local (HT-04.2-A).
// `repository` se puede inyectar en las pruebas; por defecto es el del navegador.
export function useSettings(repository = getBrowserRepository()) {
  const [settings, setSettings] = useState(() => repository.getSettings());

  const saveSettings = useCallback(
    (input) => {
      const result = repository.saveSettings(input);
      setSettings(result.settings);
      return result;
    },
    [repository],
  );

  return { settings, saveSettings };
}
