import { describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderApp } from './renderApp.jsx';

const CASES = [
  { path: '/', h1: 'Tu ruta diaria', title: 'TamalEcho Tips' },
  { path: '/biblioteca/scrum', h1: 'Biblioteca de Scrum', title: 'Biblioteca de Scrum · TamalEcho Tips' },
  { path: '/biblioteca/pmbok', h1: 'Biblioteca de PMI/PMBOK', title: 'Biblioteca de PMI/PMBOK · TamalEcho Tips' },
  { path: '/tip/SCR-01', h1: 'Product Backlog', title: 'Product Backlog · TamalEcho Tips' },
  { path: '/tip/SCR-99', h1: 'Consejo no encontrado', title: 'Consejo no encontrado · TamalEcho Tips' },
  { path: '/historial', h1: 'Historial', title: 'Historial · TamalEcho Tips' },
  { path: '/progreso', h1: 'Mi progreso', title: 'Mi progreso · TamalEcho Tips' },
  { path: '/ajustes', h1: 'Ajustes', title: 'Ajustes · TamalEcho Tips' },
  { path: '/ayuda', h1: 'Ayuda', title: 'Ayuda · TamalEcho Tips' },
  { path: '/privacidad', h1: 'Privacidad', title: 'Privacidad · TamalEcho Tips' },
];

describe('rutas', () => {
  it.each(CASES)('$path muestra un único h1 «$h1» y su título', async ({ path, h1, title }) => {
    await renderApp(path);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(h1);
    // El título se define en un efecto; en la primera carga (en frío) puede llegar después del h1.
    await waitFor(() => expect(document.title).toBe(title));
    // Rediseño D-24: ya no quedan marcadores; ninguna ruta promete una sección futura.
    expect(screen.queryByText(/^Esta sección (estará|todavía no está) disponible/)).not.toBeInTheDocument();
  });

  it('/biblioteca redirige a la biblioteca de Scrum', async () => {
    await renderApp('/biblioteca');
    expect(screen.getByRole('heading', { level: 1, name: 'Biblioteca de Scrum' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explorar', exact: true })).toHaveAttribute('aria-current', 'page');
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
