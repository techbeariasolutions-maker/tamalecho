import { useEffect, useRef, useState } from 'react';
import Button from '../../components/Button.jsx';
import { currentTimeZone, disablePush, enablePush } from '../../services/pushClient.js';

// Textos de cada estado (HU-15.1-A). `null` = todavía se está consultando al navegador.
const STATE_TEXT = {
  unsupported:
    'Tu navegador no permite avisos con la pestaña cerrada; los avisos dentro de la página siguen funcionando. ' +
    'En iPhone y iPad se necesita la app instalada, que todavía no está disponible.',
  denied:
    'Bloqueaste las notificaciones de este sitio, así que no podemos enviarte avisos con la pestaña cerrada. ' +
    'Puedes permitirlas en la configuración del navegador. Los avisos dentro de la página siguen funcionando.',
  off: 'Estado: desactivados en este navegador.',
  on: 'Estado: activados en este navegador.',
};

const RESULT_TEXT = {
  enabled: 'Listo: los avisos con la pestaña cerrada quedaron activados.',
  disabled: 'Listo: los avisos con la pestaña cerrada quedaron desactivados.',
  disabledLocalOnly:
    'Los avisos quedaron desactivados en este navegador, pero no pudimos avisarle al servidor. ' +
    'No te llegarán avisos; el servidor borrará la suscripción en su siguiente envío.',
  permission: 'No diste permiso para las notificaciones, así que los avisos con la pestaña cerrada siguen desactivados.',
  config: 'No se pudieron activar porque falta la configuración del servidor. Intenta más tarde.',
  failed: 'No se pudieron activar los avisos. Revisa tu conexión e intenta de nuevo.',
  disableFailed: 'No se pudieron desactivar los avisos en este navegador. Intenta de nuevo.',
};

// `syncFailed`: el último cambio de horario o pausa no llegó al servidor (HU-07.2-B).
export default function PushSection({ status, settings, onStatusChange, syncFailed = false }) {
  const [result, setResult] = useState('');
  const busy = useRef(false);
  const stateRef = useRef(null);
  const focusStateAfterRender = useRef(false);

  // Si tras la acción ya no hay botón (por ejemplo, se negó el permiso), el foco pasa al texto
  // del estado en lugar de perderse.
  useEffect(() => {
    if (!focusStateAfterRender.current) return;
    focusStateAfterRender.current = false;
    stateRef.current?.focus();
  });

  const updateStatus = (next) => {
    if (next !== 'on' && next !== 'off') focusStateAfterRender.current = true;
    onStatusChange(next);
  };

  const toggle = async () => {
    if (busy.current) return;
    busy.current = true;
    setResult('');
    try {
      if (status === 'on') {
        const outcome = await disablePush();
        updateStatus(outcome.status);
        if (!outcome.ok) setResult('disableFailed');
        else setResult(outcome.serverRemoved ? 'disabled' : 'disabledLocalOnly');
      } else {
        const outcome = await enablePush(settings, currentTimeZone());
        updateStatus(outcome.status);
        setResult(outcome.ok ? 'enabled' : (outcome.error ?? 'failed'));
      }
    } finally {
      busy.current = false;
    }
  };

  const canToggle = status === 'on' || status === 'off';

  return (
    // id: destino del enlace de «Notificaciones del navegador» (HU-06.2-B).
    <section id="avisos-pestana-cerrada" className="settings-subsection" aria-labelledby="push-titulo">
      <h3 id="push-titulo">Avisos con la pestaña cerrada</h3>
      <p>
        Te enviamos el consejo aunque cierres la pestaña, mientras el navegador siga abierto. Para eso, nuestro
        servidor guarda solo la suscripción de este navegador, tu zona horaria y tu horario de avisos.
      </p>
      <p className="push-state" ref={stateRef} tabIndex={-1}>
        {status ? STATE_TEXT[status] : 'Comprobando si tu navegador permite estos avisos…'}
      </p>
      {canToggle && (
        <Button variant={status === 'on' ? 'secondary' : 'primary'} onClick={toggle}>
          {status === 'on' ? 'Desactivar avisos' : 'Activar avisos'}
        </Button>
      )}
      <p className="settings-status" role="status">
        {RESULT_TEXT[result] ?? ''}
        {status === 'on' && syncFailed && !result
          ? 'Guardamos tu horario en este navegador, pero no pudimos avisarle al servidor. Los avisos con la ' +
            'pestaña cerrada pueden seguir el horario anterior; vuelve a guardar para intentarlo de nuevo.'
          : ''}
      </p>
    </section>
  );
}
