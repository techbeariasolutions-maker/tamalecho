import { Outlet } from 'react-router';
import SkipLink from '../components/SkipLink.jsx';
import Header from '../components/Header.jsx';

export default function Layout() {
  return (
    <div className="app">
      <SkipLink targetId="contenido" />
      <Header />
      {/* tabIndex -1: permite que «Saltar al contenido» mueva el foco aquí. */}
      <main id="contenido" className="app-main" tabIndex={-1}>
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>TamalEcho Tips · Equipo TamalEcho · Consejos de Scrum y PMI/PMBOK</p>
      </footer>
    </div>
  );
}
