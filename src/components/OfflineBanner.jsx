import { useEffect, useState } from 'react';
import { isOnline, onConnectionChange } from '../services/offline.js';

// Aviso de «sin conexión» (HU-12.2-A). La región aria-live existe siempre para que el cambio se
// anuncie; el texto solo aparece cuando no hay red. No mueve el foco ni bloquea la lectura.
// Usa aria-live="polite" y no role="status" para no competir con el mensaje de estado de cada página.
export default function OfflineBanner() {
  const [online, setOnline] = useState(() => isOnline());

  useEffect(() => onConnectionChange(setOnline), []);

  return (
    <div className="offline-banner" aria-live="polite">
      {!online && (
        <p className="offline-banner__text">
          Sin conexión. Puedes seguir leyendo los consejos guardados en este dispositivo. Los avisos con la pestaña
          cerrada y los cambios de Web Push esperan a que vuelva la red.
        </p>
      )}
    </div>
  );
}
