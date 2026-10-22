import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from './renderApp.jsx';

describe('HomePage', () => {
  it('muestra un consejo destacado en una tarjeta', () => {
    renderApp('/');
    const section = screen.getByRole('region', { name: 'Consejo del día' });
    expect(within(section).getByRole('article')).toBeInTheDocument();
    expect(within(section).getByRole('link', { name: /^Ver más sobre / })).toBeInTheDocument();
  });

  it('tiene accesos a Scrum y a PMI/PMBOK', () => {
    renderApp('/');
    expect(screen.getByRole('link', { name: 'Explorar Scrum' })).toHaveAttribute('href', '/biblioteca/scrum');
    expect(screen.getByRole('link', { name: 'Explorar PMI/PMBOK' })).toHaveAttribute('href', '/biblioteca/pmbok');
  });

  it('tiene enlaces visibles a Biblioteca, Ajustes y Ayuda fuera del menú', () => {
    renderApp('/');
    const more = screen.getByRole('navigation', { name: 'Más secciones' });
    expect(within(more).getAllByRole('link').map((link) => link.textContent)).toEqual(['Biblioteca', 'Ajustes', 'Ayuda']);
  });

  it('muestra la sugerencia inicial de por dónde empezar', () => {
    renderApp('/');
    expect(screen.getByText(/^¿Por dónde empezar\? Si tu equipo trabaja en iteraciones cortas/)).toBeInTheDocument();
  });
});
