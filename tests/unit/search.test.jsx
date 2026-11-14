import { beforeEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';
import { normalize, searchTips } from '../../src/services/search.js';
import { getTips } from '../../src/services/catalog.js';
import { getBrowserRepository } from '../../src/services/storage.js';
import { makeTip } from './fixtures/catalog.js';

// Búsqueda y ruta recomendada en la biblioteca (rediseño D-24, etapa 3).
describe('normalize', () => {
  it('quita acentos y mayúsculas pero conserva la ñ', () => {
    expect(normalize('  Planificación   ÁGIL ')).toBe('planificacion agil');
    expect(normalize('Año')).toBe('año');
    expect(normalize(undefined)).toBe('');
  });
});

describe('searchTips', () => {
  const tips = [
    makeTip({ id: 'SCR-01', title: 'Product Backlog', summary: 'Ordena por valor.', tags: ['artefacto'] }),
    makeTip({ id: 'SCR-02', title: 'Daily Scrum', summary: 'Revisa el avance hacia el backlog.', tags: ['evento'] }),
    makeTip({ id: 'SCR-03', title: 'Retrospectiva', summary: 'Mejora continua.', tags: ['mejora', 'evento'] }),
  ];

  it('sin búsqueda devuelve la lista igual', () => {
    expect(searchTips(tips, '   ')).toBe(tips);
  });

  it('busca en título, resumen y etiquetas sin importar acentos ni mayúsculas', () => {
    expect(searchTips(tips, 'MEJORA').map((tip) => tip.id)).toEqual(['SCR-03']);
    expect(searchTips(tips, 'evento').map((tip) => tip.id)).toEqual(['SCR-02', 'SCR-03']);
    expect(searchTips(tips, 'retrospectíva').map((tip) => tip.id)).toEqual(['SCR-03']);
  });

  it('exige todas las palabras y pone primero las que coinciden en el título', () => {
    expect(searchTips(tips, 'backlog').map((tip) => tip.id)).toEqual(['SCR-01', 'SCR-02']);
    expect(searchTips(tips, 'backlog valor').map((tip) => tip.id)).toEqual(['SCR-01']);
    expect(searchTips(tips, 'inexistente')).toEqual([]);
  });
});

describe('biblioteca con búsqueda', () => {
  beforeEach(() => window.localStorage.clear());

  it('filtra al escribir, guarda la búsqueda en la URL y la combina con la categoría', async () => {
    await renderApp('/biblioteca/scrum?q=backlog');
    const field = screen.getByRole('searchbox', { name: 'Buscar en Scrum' });
    expect(field).toHaveValue('backlog');
    const expected = searchTips(getTips({ framework: 'scrum' }), 'backlog');
    expect(screen.getByRole('status')).toHaveTextContent(`${expected.length} consejo`);
    expect(screen.getByRole('status')).toHaveTextContent('para «backlog»');

    const user = userEvent.setup();
    await user.clear(field);
    await user.type(field, 'zzz');
    expect(screen.getByText('No encontramos «zzz» en Scrum.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buscar «zzz» en PMI/PMBOK' })).toHaveAttribute(
      'href',
      '/biblioteca/pmbok?q=zzz',
    );

    await user.click(screen.getByRole('button', { name: 'Limpiar búsqueda y filtro' }));
    expect(field).toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent(`${getTips({ framework: 'scrum' }).length} consejos`);
  });

  it('la ruta recomendada muestra los siguientes 3 conceptos sin completar del enfoque', async () => {
    const [first, second, third, fourth] = getTips({ framework: 'pmbok' });
    getBrowserRepository().markCompleted({ id: first.id, at: new Date(2026, 10, 9, 10) });
    await renderApp('/biblioteca/pmbok');
    const route = screen.getByRole('region', { name: 'Ruta recomendada de PMI/PMBOK' });
    const links = within(route).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([second.title, third.title, fourth.title]);
  });
});
