import { useCallback, useEffect, useRef, useState } from 'react';
import Button from '../../components/Button.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { useSettings } from '../../hooks/useSettings.js';
import { currentTimeZone, disablePush, getPushStatus, syncPushSettings } from '../../services/pushClient.js';
import NextTip from './NextTip.jsx';
import NotificationSection from './NotificationSection.jsx';
import PauseControl from './PauseControl.jsx';
import PushSection from './PushSection.jsx';
import ScheduleForm from './ScheduleForm.jsx';
import SchedulePreview from './SchedulePreview.jsx';

// Ajustes: horario de los avisos (HU-07.1), notificaciones del navegador (HU-06.2), avisos con la
// pestaña cerrada (HU-15.1-A) y datos locales (HT-04.2-B).
export default function SettingsPage() {
  useDocumentTitle('Ajustes');
  const { settings, historyCount, saveSettings, resetAll } = useSettings();
  // null mientras se consulta al navegador. Consultar no registra nada ni pide permiso.
  const [pushStatus, setPushStatus] = useState(null);
  // Al restablecer los datos el formulario se vuelve a montar para mostrar los valores recomendados.
  const [formVersion, setFormVersion] = useState(0);

  // Web Push usa el mismo permiso que las notificaciones: al cambiarlo se vuelve a consultar.
  const refreshPushStatus = useCallback(async () => {
    setPushStatus(await getPushStatus());
  }, []);

  const afterReset = useCallback(async () => {
    setFormVersion((version) => version + 1);
    await refreshPushStatus();
  }, [refreshPushStatus]);

  useEffect(() => {
    let active = true;
    getPushStatus().then((status) => {
      if (active) setPushStatus(status);
    });
    return () => {
      active = false;
    };
  }, []);

  // Silencio remoto (HU-07.2-B): con Web Push activo, cada cambio guardado de horario o pausa se
  // envía también al servidor. El guardado local no espera a la red.
  const [syncFailed, setSyncFailed] = useState(false);
  const saveAndSync = useCallback(
    (patch) => {
      const result = saveSettings(patch);
      if (result.saved && pushStatus === 'on') {
        syncPushSettings(result.settings, currentTimeZone()).then(({ ok }) => setSyncFailed(!ok));
      }
      return result;
    },
    [saveSettings, pushStatus],
  );

  return (
    <>
      <h1>Ajustes</h1>
      <NextTip settings={settings} />
      <section className="settings-section" aria-labelledby="horario-titulo">
        <h2 id="horario-titulo">Horario de los avisos</h2>
        <ScheduleForm key={formVersion} settings={settings} onSave={saveAndSync} />
        <SchedulePreview settings={settings} now={new Date()} />
      </section>
      <PauseControl paused={settings.paused} onSave={saveAndSync} />
      <NotificationSection onPermissionChange={refreshPushStatus} />
      <PushSection status={pushStatus} settings={settings} onStatusChange={setPushStatus} syncFailed={syncFailed} />
      <LocalDataSection historyCount={historyCount} resetAll={resetAll} onReset={afterReset} />
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
  doneServerPending:
    'Listo: tus datos se restablecieron y los avisos con la pestaña cerrada quedaron desactivados en este ' +
    'navegador. No pudimos avisarle al servidor; borrará la suscripción en su siguiente envío.',
  failed: 'No se pudieron restablecer tus datos porque este navegador no permite guardar información del sitio.',
  pushFailed:
    'No se pudieron desactivar los avisos con la pestaña cerrada, así que no se restableció nada. Intenta de nuevo.',
};

function LocalDataSection({ historyCount, resetAll, onReset }) {
  const [confirming, setConfirming] = useState(false);
  const [status, setStatus] = useState('');
  const resetButtonRef = useRef(null);
  const cancelButtonRef = useRef(null);
  // A dónde mover el foco después del siguiente render. Se fija en los manejadores de clic,
  // no al montar, para no robar el foco al cargar la página.
  const pendingFocus = useRef(null);
  const busy = useRef(false);

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

  // Primero se desactiva Web Push (navegador y servidor) y solo después se borran los datos locales.
  // Si el navegador no puede cancelar la suscripción no se borra nada: el estado local diría
  // «desactivado» mientras siguen llegando avisos (pedido de QA en el PR #48).
  const confirm = async () => {
    if (busy.current) return;
    busy.current = true;
    try {
      const push = await disablePush();
      if (!push.ok) setStatus('pushFailed');
      else if (!resetAll()) setStatus('failed');
      else setStatus(push.serverRemoved ? 'done' : 'doneServerPending');
      setConfirming(false);
      pendingFocus.current = 'reset';
      await onReset();
    } finally {
      busy.current = false;
    }
  };

  return (
    <section className="settings-section" aria-labelledby="datos-locales-titulo">
      <h2 id="datos-locales-titulo">Tus datos en este dispositivo</h2>
      <p>TamalEcho Tips no tiene cuentas ni inicio de sesión. En este navegador se guarda:</p>
      <ul>
        <li>Tus ajustes de los avisos: horario, silencio y pausa.</li>
        <li>
          Tu historial de lecturas, para no repetirte en los avisos los consejos que ya abriste.{' '}
          {historyText(historyCount)}
        </li>
        <li>Los avisos que ya te mostramos, para no repetir el mismo aviso. Esto se conserva al restablecer.</li>
      </ul>
      <p>
        Si activas los avisos con la pestaña cerrada, nuestro servidor también guarda la suscripción de este
        navegador, tu zona horaria y tu horario de avisos. Al desactivarlos o al restablecer tus datos, le pedimos
        al servidor que los borre.
      </p>

      {confirming ? (
        <div className="confirm-box" role="group" aria-labelledby="restablecer-pregunta">
          <p id="restablecer-pregunta">
            ¿Restablecer tus datos? Tus ajustes vuelven a los valores recomendados, se borra tu historial de
            lecturas en este dispositivo y se desactivan los avisos con la pestaña cerrada. No se puede deshacer.
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
