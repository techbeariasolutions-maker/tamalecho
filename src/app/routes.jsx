import { lazy } from 'react';
import { Navigate } from 'react-router';
import Layout from './Layout.jsx';

// Cada página se carga por separado (React.lazy); Layout muestra «Cargando…» mientras tanto.
const HomePage = lazy(() => import('../features/home/HomePage.jsx'));
const LibraryPage = lazy(() => import('../features/library/LibraryPage.jsx'));
const TipDetailPage = lazy(() => import('../features/tips/TipDetailPage.jsx'));
const SettingsPage = lazy(() => import('../features/scheduler/SettingsPage.jsx'));
const HelpPage = lazy(() => import('../features/help/HelpPage.jsx'));
const PlaceholderPage = lazy(() => import('../features/placeholders/PlaceholderPage.jsx'));
const NotFoundPage = lazy(() => import('../features/notfound/NotFoundPage.jsx'));

// Rutas de CLAUDE.md §7.
export const routes = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/biblioteca', element: <Navigate to="/biblioteca/scrum" replace /> },
      { path: '/biblioteca/:enfoque', element: <LibraryPage /> },
      { path: '/tip/:id', element: <TipDetailPage /> },
      { path: '/historial', element: <PlaceholderPage title="Historial" /> },
      { path: '/progreso', element: <PlaceholderPage title="Progreso" /> },
      { path: '/ajustes', element: <SettingsPage /> },
      { path: '/ayuda', element: <HelpPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
