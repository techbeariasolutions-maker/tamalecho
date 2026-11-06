import { useEffect } from 'react';
import { getBrowserRepository } from '../services/storage.js';

// Reloj real del navegador. Va fuera del hook para que su identidad no cambie en cada render.
const systemClock = () => new Date();

// Registra la lectura de una ficha (HU-08.1-A) al abrirla o al pasar a otro consejo.
// - Sin duplicados consecutivos: lo decide recordReading en storage.js. Así tampoco duplica el
//   doble montaje de React en desarrollo.
// - Recibir un aviso no pasa por aquí: solo cuenta abrir la ficha.
// - Si el navegador no deja guardar, la lectura simplemente no se registra; la ficha se lee igual.
export function useReadingLog(tipId, repository = getBrowserRepository(), clock = systemClock) {
  useEffect(() => {
    if (tipId) repository.recordReading({ id: tipId, at: clock() });
  }, [tipId, repository, clock]);
}
