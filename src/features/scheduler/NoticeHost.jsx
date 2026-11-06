import { useCallback, useEffect, useMemo, useRef } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate } from 'react-router';
import { useCatalog } from '../../hooks/useCatalog.js';
import { useNoticeScheduler } from '../../hooks/useNoticeScheduler.js';
import NoticeToast from './NoticeToast.jsx';

// Lugar de los avisos dentro de la página (HU-06.1-A). Vive en el Layout, así que funciona en
// cualquier ruta. Reglas (CLAUDE.md §10):
// - la región role="status" existe siempre, para que el lector de pantalla anuncie el aviso al
//   aparecer; el aviso nunca mueve el foco;
// - solo hay un aviso a la vez;
// - se cierra con «Cerrar», con Escape o al abrir el consejo.
export default function NoticeHost() {
  const { getTips } = useCatalog();
  // La lista se calcula una vez: el hook recalcula si cambia su identidad.
  const tips = useMemo(() => getTips(), [getTips]);
  const navigate = useNavigate();
  // Al pulsar una notificación nativa se abre la ficha en esta misma pestaña.
  const openTip = useCallback((id) => navigate(`/tip/${id}`), [navigate]);
  const { notice, dismiss } = useNoticeScheduler({ tips, openTip });
  const hostRef = useRef(null);

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
      {notice && <NoticeToast key={notice.key} notice={notice} onClose={close} />}
    </div>
  );
}
