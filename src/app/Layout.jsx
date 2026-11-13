import { lazy, Suspense } from 'react';
import { Link, Outlet } from 'react-router';
import SkipLink from '../components/SkipLink.jsx';
import Header from '../components/Header.jsx';
import Message from '../components/Message.jsx';

// Avisos dentro de la página (HU-06.1-A). Se cargan aparte para que el catálogo no entre en el
// paquete inicial; mientras cargan no se muestra nada.
const NoticeHost = lazy(() => import('../features/scheduler/NoticeHost.jsx'));

export default function Layout() {
  return (
    <div className="app">
      <SkipLink targetId="contenido" />
      <Header />
      {/* tabIndex -1: permite que «Saltar al contenido» mueva el foco aquí. */}
      <main id="contenido" className="app-main" tabIndex={-1}>
        <Suspense fallback={null}>
          <NoticeHost />
        </Suspense>
        <Suspense fallback={<Message variant="loading">Cargando…</Message>}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="app-footer">
        <p>TamalEcho Tips · Equipo TamalEcho · Consejos de Scrum y PMI/PMBOK</p>
        {/* HU-13.2-A: el aviso de privacidad se alcanza desde cualquier página. */}
        <p>
          <Link to="/privacidad" className="app-footer__link">
            Aviso de privacidad
          </Link>
        </p>
      </footer>
    </div>
  );
}
