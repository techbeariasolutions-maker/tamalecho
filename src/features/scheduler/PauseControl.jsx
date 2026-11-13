import { useState } from 'react';
import Button from '../../components/Button.jsx';

const RESULT_TEXT = {
  paused: 'Listo: los avisos quedaron en pausa.',
  resumed: 'Listo: los avisos se reanudaron.',
  failed: 'No se pudo guardar porque este navegador no permite guardar información del sitio.',
};

// Pausar / reanudar los avisos (HU-07.2-A). Es un botón de alternancia: su nombre no cambia
// («Pausar avisos») y aria-pressed dice si la pausa está activa. El texto de al lado dice el estado
// con palabras. La pausa se guarda con los ajustes, así que se conserva al recargar.
// La lectura de consejos nunca se bloquea (CLAUDE.md §2).
export default function PauseControl({ paused, onSave }) {
  const [result, setResult] = useState('');

  const toggle = () => {
    const next = !paused;
    const outcome = onSave({ paused: next });
    if (!outcome.saved) setResult('failed');
    else setResult(next ? 'paused' : 'resumed');
  };

  return (
    <section className="settings-section" aria-labelledby="pausa-titulo">
      <h2 id="pausa-titulo">Pausar temporalmente</h2>
      <p>
        {paused
          ? 'Los avisos están en pausa. Puedes seguir leyendo consejos cuando quieras.'
          : 'Los avisos están activos. Si los pausas, no te llegará ninguno hasta que los reanudes.'}
      </p>
      <Button variant="secondary" aria-pressed={paused} onClick={toggle}>
        Pausar avisos
      </Button>
      <p className="settings-status" role="status">
        {RESULT_TEXT[result] ?? ''}
      </p>
    </section>
  );
}
