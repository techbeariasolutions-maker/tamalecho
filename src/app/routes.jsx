import { Navigate } from 'react-router';
import Layout from './Layout.jsx';
import HomePage from '../features/home/HomePage.jsx';
import PlaceholderPage from '../features/placeholders/PlaceholderPage.jsx';
import NotFoundPage from '../features/notfound/NotFoundPage.jsx';

// Rutas de CLAUDE.md §7. La biblioteca (WP-6) y la ficha (WP-7) son marcadores por ahora.
export const routes = [
  {
    element: <Layout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/biblioteca', element: <Navigate to="/biblioteca/scrum" replace /> },
      { path: '/biblioteca/:enfoque', element: <PlaceholderPage title="Biblioteca" sprint={1} /> },
      { path: '/tip/:id', element: <PlaceholderPage title="Consejo" sprint={1} /> },
      { path: '/historial', element: <PlaceholderPage title="Historial" sprint={2} /> },
      { path: '/progreso', element: <PlaceholderPage title="Progreso" sprint={2} /> },
      { path: '/ajustes', element: <PlaceholderPage title="Ajustes" sprint={2} /> },
      { path: '/ayuda', element: <PlaceholderPage title="Ayuda" sprint={3} /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
];
