import { useState } from 'react';
import Button from '../../components/Button.jsx';
import { getPermission, requestPermission } from '../../services/notificationService.js';

const STATE_TEXT = {
  default: 'Estado: todavía no das permiso en este navegador.',
  granted: 'Estado: permitidas. Si la pestaña está abierta pero en segundo plano, el aviso llega como notificación.',
};

const RESULT_TEXT = {
  granted: 'Listo: las notificaciones quedaron permitidas.',
  denied: 'No diste permiso. Los avisos seguirán apareciendo dentro de la página.',
  dismissed: 'No elegiste ninguna opción. Puedes intentarlo de nuevo cuando quieras.',
};

// Sin permiso o sin soporte (HU-06.2-B): se explica por qué y que los avisos de la página siguen.
const BLOCKED_TEXT = {
  denied: 'Bloqueaste las notificaciones de este sitio. Puedes permitirlas en la configuración del navegador.',
  unsupported: 'Tu navegador no permite notificaciones.',
};

function Alternative({ permission }) {
  return (
    <div className="message">
      <p>{BLOCKED_TEXT[permission]}</p>
      <p>
        Los avisos dentro de la página siguen funcionando. Para recibirlos con la pestaña cerrada se necesita Web
        Push.
      </p>
      <p>
        <a className="tap-link" href="#avisos-pestana-cerrada">
          Ver «Avisos con la pestaña cerrada»
        </a>
      </p>
    </div>
  );
}

// Notificaciones del navegador (HU-06.2-A). El permiso se pide SOLO al pulsar el botón, nunca al
// cargar (CLAUDE.md §2). `onPermissionChange` avisa a Ajustes para refrescar el estado de Web Push,
// que usa el mismo permiso.
export default function NotificationSection({ onPermissionChange }) {
  // Leer el permiso no lo pide.
  const [permission, setPermission] = useState(() => getPermission());
  const [result, setResult] = useState('');

  const activate = async () => {
    const next = await requestPermission();
    setPermission(next);
    if (next === 'granted' || next === 'denied') setResult(next);
    else setResult('dismissed');
    onPermissionChange?.();
  };

  return (
    <section className="settings-section" aria-labelledby="notificaciones-titulo">
      <h2 id="notificaciones-titulo">Notificaciones del navegador</h2>
      <p>
        Si las permites, cuando la pestaña de TamalEcho esté abierta pero no la estés viendo, el aviso te llega como
        notificación del sistema. Si estás en la página, el aviso aparece dentro de ella.
      </p>
      {BLOCKED_TEXT[permission] ? <Alternative permission={permission} /> : <p>{STATE_TEXT[permission]}</p>}
      {permission === 'default' && <Button onClick={activate}>Activar notificaciones</Button>}
      <p className="settings-status" role="status">
        {RESULT_TEXT[result] ?? ''}
      </p>
    </section>
  );
}
