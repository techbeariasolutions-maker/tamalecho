import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderApp } from './renderApp.jsx';

const CASES = [
  { path: '/', h1: 'TamalEcho Tips', title: 'TamalEcho Tips' },
  { path: '/biblioteca/scrum', h1: 'Biblioteca de Scrum', title: 'Biblioteca de Scrum · TamalEcho Tips' },
  { path: '/biblioteca/pmbok', h1: 'Biblioteca de PMI/PMBOK', title: 'Biblioteca de PMI/PMBOK · TamalEcho Tips' },
  { path: '/tip/SCR-01', h1: 'Product Backlog', title: 'Product Backlog · TamalEcho Tips' },
  { path: '/tip/SCR-99', h1: 'Consejo no encontrado', title: 'Consejo no encontrado · TamalEcho Tips' },
  { path: '/historial', h1: 'Historial', title: 'Historial · TamalEcho Tips', pending: true },
  { path: '/progreso', h1: 'Progreso', title: 'Progreso · TamalEcho Tips', pending: true },
  { path: '/ajustes', h1: 'Ajustes', title: 'Ajustes · TamalEcho Tips' },
  { path: '/ayuda', h1: 'Ayuda', title: 'Ayuda · TamalEcho Tips' },
  { path: '/privacidad', h1: 'Privacidad', title: 'Privacidad · TamalEcho Tips' },
];

describe('rutas', () => {
  it.each(CASES)('$path muestra un único h1 «$h1» y su título', async ({ path, h1, title, sprint, pending }) => {
    await renderApp(path);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(h1);
    // El título se define en un efecto; en la primera carga (en frío) puede llegar después del h1.
    await waitFor(() => expect(document.title).toBe(title));
    if (sprint) {
      expect(screen.getByText(`Esta sección estará disponible en el Sprint ${sprint}.`)).toBeInTheDocument();
    }
    if (pending) {
      // Sin sprint comprometido no se promete fecha (D-11, WP-S2-12).
      expect(screen.getByText('Esta sección todavía no está disponible.')).toBeInTheDocument();
      expect(screen.queryByText(/disponible en el Sprint/)).not.toBeInTheDocument();
    }
  });

  it('/biblioteca redirige a la biblioteca de Scrum', async () => {
    await renderApp('/biblioteca');
    expect(screen.getByRole('heading', { level: 1, name: 'Biblioteca de Scrum' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Biblioteca', exact: true })).toHaveAttribute('aria-current', 'page');
  });

  it('un enfoque inválido muestra NotFound', async () => {
    await renderApp('/biblioteca/kanban');
    expect(screen.getByRole('heading', { level: 1, name: 'No encontramos esta página' })).toBeInTheDocument();
  });

  it('una ruta desconocida muestra NotFound con enlace al inicio', async () => {
    await renderApp('/no-existe');
    expect(screen.getByRole('heading', { level: 1, name: 'No encontramos esta página' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
    expect(document.title).toBe('Página no encontrada · TamalEcho Tips');
  });
});
