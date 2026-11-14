import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderApp } from './renderApp.jsx';
import { getFeaturedTip } from '../../src/services/catalog.js';

// Portada «Ruta diaria» (rediseño D-24, DISEÑO_UI_UX §4).
describe('HomePage', () => {
  it('el héroe tiene un h1 y la misión de hoy con una sola llamada a la acción', async () => {
    await renderApp('/');
    const mission = getFeaturedTip(new Date());
    const hero = screen.getByRole('region', { name: 'Tu ruta diaria' });
    const card = within(hero).getByRole('article', { name: mission.title });
    expect(within(card).getByText('Misión de hoy')).toBeInTheDocument();
    expect(within(card).getByText(/min de lectura$/)).toBeInTheDocument();
    const links = within(hero).getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAccessibleName(`Empezar misión: ${mission.title}`);
    expect(links[0]).toHaveAttribute('href', `/tip/${mission.id}`);
  });

  it('sin lecturas invita a empezar la racha y muestra el progreso en 0', async () => {
    await renderApp('/');
    expect(screen.getByText(/Empieza tu racha hoy/)).toBeInTheDocument();
    const bar = screen.getByRole('progressbar', { name: 'Conceptos leídos' });
    expect(bar).toHaveAttribute('aria-valuenow', '0');
  });

  it('la ruta de la semana tiene 5 pasos, marca hoy y dice el estado con texto', async () => {
    await renderApp('/');
    const route = screen.getByRole('region', { name: 'Tu ruta de la semana' });
    const steps = within(route).getAllByRole('listitem');
    expect(steps).toHaveLength(5);
    expect(steps.filter((step) => step.getAttribute('aria-current') === 'step')).toHaveLength(1);
    for (const step of steps) expect(within(step).getByText('Nuevo')).toBeInTheDocument();
  });

  it('tiene accesos a Scrum y a PMI/PMBOK y dice que no son equivalentes', async () => {
    await renderApp('/');
    expect(screen.getByRole('link', { name: 'Explorar Scrum' })).toHaveAttribute('href', '/biblioteca/scrum');
    expect(screen.getByRole('link', { name: 'Explorar PMI/PMBOK' })).toHaveAttribute('href', '/biblioteca/pmbok');
    expect(screen.getByText(/Son enfoques distintos, no equivalentes\./)).toBeInTheDocument();
  });

  it('muestra el personaje con su estado y una frase visible (HT-05.1-B)', async () => {
    await renderApp('/');
    const figure = screen.getByRole('figure');
    expect(figure).toHaveClass('avatar--hero');
    expect(within(figure).getByRole('img', { name: /^Personaje / })).toBeInTheDocument();
    expect(figure.querySelector('figcaption').textContent.trim()).not.toBe('');
  });
});
