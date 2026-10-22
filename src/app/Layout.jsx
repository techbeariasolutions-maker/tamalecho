import { Suspense } from 'react';
import { Outlet } from 'react-router';
import SkipLink from '../components/SkipLink.jsx';
import Header from '../components/Header.jsx';
import Message from '../components/Message.jsx';

export default function Layout() {
  return (
    <div className="app">
      <SkipLink targetId="contenido" />
      <Header />
      {/* tabIndex -1: permite que «Saltar al contenido» mueva el foco aquí. */}
      <main id="contenido" className="app-main" tabIndex={-1}>
        <Suspense fallback={<Message variant="loading">Cargando…</Message>}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="app-footer">
        <p>TamalEcho Tips · Equipo TamalEcho · Consejos de Scrum y PMI/PMBOK</p>
      </footer>
    </div>
  );
}
