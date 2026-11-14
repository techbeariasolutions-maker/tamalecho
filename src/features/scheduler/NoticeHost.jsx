import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Link, useNavigate } from 'react-router';
import Button from '../../components/Button.jsx';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useNoticeScheduler } from '../../hooks/useNoticeScheduler.js';
import { announceSettingsChanged } from '../../hooks/useSettings.js';
import { getBrowserRepository } from '../../services/storage.js';
import { currentTimeZone, syncPushSettings } from '../../services/pushClient.js';
import NoticeToast from './NoticeToast.jsx';

// Lugar de los avisos dentro de la página (HU-06.1-A). Vive en el Layout, así que funciona en
// cualquier ruta. Reglas (CLAUDE.md §10):
// - la región role="status" existe siempre, para que el lector de pantalla anuncie el aviso al
//   aparecer; el aviso nunca mueve el foco;
// - solo hay un aviso a la vez;
// - se cierra con «Cerrar», con Escape o al abrir el consejo;
// - «Pausar avisos» pausa desde el propio aviso (HU-06.1-B) y lo confirma en la misma región.
export default function NoticeHost() {
  const { getTips } = useCatalog();
  // La lista se calcula una vez: el hook recalcula si cambia su identidad.
  const tips = useMemo(() => getTips(), [getTips]);
  const navigate = useNavigate();
  // Al pulsar una notificación nativa se abre la ficha en esta misma pestaña.
  const openTip = useCallback((id) => navigate(`/tip/${id}`), [navigate]);
  const { notice, dismiss } = useNoticeScheduler({ tips, openTip });
  const hostRef = useRef(null);
  const confirmRef = useRef(null);
  const [pausedHere, setPausedHere] = useState(false);

  // Al cerrar:
  // - la página no salta: a 360 px el aviso va en el flujo, así que quitarlo subiría todo lo de
  //   abajo. Se mide el elemento siguiente antes y después y se compensa el desplazamiento (T2-11);
  // - si el foco estaba dentro del aviso, pasa al contenido principal para no perderse.
  const close = useCallback(() => {
    const host = hostRef.current;
    const hadFocus = host?.contains(document.activeElement);
    const anchor = host?.nextElementSibling;
    const before = anchor?.getBoundingClientRect().top;
    flushSync(() => dismiss());
    if (anchor && window.scrollY > 0) window.scrollBy(0, anchor.getBoundingClientRect().top - before);
    if (hadFocus) document.getElementById('contenido')?.focus({ preventScroll: true });
  }, [dismiss]);

  // Pausa desde el aviso: se guarda en este dispositivo, se avisa a Ajustes si está abierto y, si hay
  // Web Push activo, se manda al servidor para que tampoco envíe avisos con la pestaña cerrada.
  const pause = useCallback(() => {
    const result = getBrowserRepository().saveSettings({ paused: true });
    dismiss();
    setPausedHere(true);
    announceSettingsChanged();
    if (result.saved) syncPushSettings(result.settings, currentTimeZone()).catch(() => {});
  }, [dismiss]);

  // El botón desaparece al pausar: el foco pasa a la confirmación para no perderse.
  useEffect(() => {
    if (pausedHere) confirmRef.current?.focus();
  }, [pausedHere]);

  useEffect(() => {
    if (!notice) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') close();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [notice, close]);

  return (
    <div className="notice-host" role="status" ref={hostRef}>
      {notice && <NoticeToast key={notice.key} notice={notice} onClose={close} onPause={pause} />}
      {!notice && pausedHere && (
        <div className="notice notice--confirm">
          <p ref={confirmRef} tabIndex={-1} className="notice__title">
            Avisos en pausa. Puedes seguir leyendo consejos cuando quieras.
          </p>
          <div className="button-row">
            <Link to="/ajustes" className="button button--secondary" onClick={() => setPausedHere(false)}>
              Reanudar en Ajustes
            </Link>
            <Button variant="secondary" aria-label="Cerrar mensaje de pausa" onClick={() => setPausedHere(false)}>
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
