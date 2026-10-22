import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from './renderApp.jsx';

const CASES = [
  { path: '/', h1: 'TamalEcho Tips', title: 'TamalEcho Tips' },
  { path: '/biblioteca/scrum', h1: 'Biblioteca de Scrum', title: 'Biblioteca de Scrum · TamalEcho Tips' },
  { path: '/biblioteca/pmbok', h1: 'Biblioteca de PMI/PMBOK', title: 'Biblioteca de PMI/PMBOK · TamalEcho Tips' },
  { path: '/tip/SCR-01', h1: 'Product Backlog', title: 'Product Backlog · TamalEcho Tips' },
  { path: '/tip/SCR-99', h1: 'Consejo no encontrado', title: 'Consejo no encontrado · TamalEcho Tips' },
  { path: '/historial', h1: 'Historial', title: 'Historial · TamalEcho Tips', sprint: 2 },
  { path: '/progreso', h1: 'Progreso', title: 'Progreso · TamalEcho Tips', sprint: 2 },
  { path: '/ajustes', h1: 'Ajustes', title: 'Ajustes · TamalEcho Tips', sprint: 2 },
  { path: '/ayuda', h1: 'Ayuda', title: 'Ayuda · TamalEcho Tips', sprint: 3 },
];

describe('rutas', () => {
  it.each(CASES)('$path muestra un único h1 «$h1» y su título', ({ path, h1, title, sprint }) => {
    renderApp(path);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent(h1);
    expect(document.title).toBe(title);
    if (sprint) {
      expect(screen.getByText(`Esta sección estará disponible en el Sprint ${sprint}.`)).toBeInTheDocument();
    }
  });

  it('/biblioteca redirige a la biblioteca de Scrum', () => {
    renderApp('/biblioteca');
    expect(screen.getByRole('heading', { level: 1, name: 'Biblioteca de Scrum' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Biblioteca', exact: true })).toHaveAttribute('aria-current', 'page');
  });

  it('un enfoque inválido muestra NotFound', () => {
    renderApp('/biblioteca/kanban');
    expect(screen.getByRole('heading', { level: 1, name: 'No encontramos esta página' })).toBeInTheDocument();
  });

  it('una ruta desconocida muestra NotFound con enlace al inicio', () => {
    renderApp('/no-existe');
    expect(screen.getByRole('heading', { level: 1, name: 'No encontramos esta página' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/');
    expect(document.title).toBe('Página no encontrada · TamalEcho Tips');
  });
});
