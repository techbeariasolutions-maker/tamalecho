import { useEffect, useRef, useState } from 'react';
import Button from '../../components/Button.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useSettings } from '../../hooks/useSettings.js';

// Ajustes (HT-04.2-B). Por ahora solo la sección de datos locales; el panel de horario,
// el silencio y la pausa llegan en WP-S2-6.
export default function SettingsPage() {
  useDocumentTitle('Ajustes');
  return (
    <>
      <h1>Ajustes</h1>
      <LocalDataSection />
    </>
  );
}

function historyText(count) {
  if (count === 0) return 'Ahora no hay lecturas registradas.';
  if (count === 1) return 'Ahora hay 1 lectura registrada.';
  return `Ahora hay ${count} lecturas registradas.`;
}

const STATUS_TEXT = {
  done: 'Listo: tus datos se restablecieron. Los ajustes volvieron a los valores recomendados.',
  failed: 'No se pudieron restablecer tus datos porque este navegador no permite guardar información del sitio.',
};

function LocalDataSection() {
  const { historyCount, resetAll } = useSettings();
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState('');
  const resetButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);
  // A dónde mover el foco después del siguiente render. Se fija en los manejadores de clic,
  // no al montar, para no robar el foco al cargar la página.
  const pendingFocus = useRef(null);

  useEffect(() => {
    if (!pendingFocus.current) return;
    const target = pendingFocus.current === 'cancel' ? cancelButtonRef.current : resetButtonRef.current;
    pendingFocus.current = null;
    target?.focus();
  });

  const askConfirmation = () => {
    setStatus('');
    setConfirming(true);
    pendingFocus.current = 'cancel';
  };

  const cancel = () => {
    setConfirming(false);
    pendingFocus.current = 'reset';
  };

  const confirm = () => {
    setStatus(resetAll() ? 'done' : 'failed');
    setConfirming(false);
    pendingFocus.current = 'reset';
  };

  return (
    <section className="settings-section" aria-labelledby="datos-locales-titulo">
      <h2 id="datos-locales-titulo">Tus datos en este dispositivo</h2>
      <p>TamalEcho Tips no tiene cuentas ni inicio de sesión. Esto se guarda solo en este navegador:</p>
      <ul>
        <li>Tus ajustes de los avisos: horario, silencio y pausa.</li>
        <li>
          Tu historial de lecturas, para no repetirte en los avisos los consejos que ya abriste.{' '}
          {historyText(historyCount)}
        </li>
        <li>Los avisos que ya te mostramos, para no repetir el mismo aviso. Esto se conserva al restablecer.</li>
      </ul>

      {confirming ? (
        <div className="confirm-box" role="group" aria-labelledby="restablecer-pregunta">
          <p id="restablecer-pregunta">
            ¿Restablecer tus datos? Tus ajustes vuelven a los valores recomendados y se borra tu historial de
            lecturas en este dispositivo. No se puede deshacer.
          </p>
          <div className="button-row">
            <Button onClick={confirm}>Sí, restablecer</Button>
            <Button variant="secondary" onClick={cancel} ref={cancelButtonRef}>
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <Button variant="secondary" onClick={askConfirmation} ref={resetButtonRef}>
          Restablecer mis datos
        </Button>
      )}

      <p className="settings-status" role="status">
        {STATUS_TEXT[status] ?? ''}
      </p>
    </section>
  );
}
