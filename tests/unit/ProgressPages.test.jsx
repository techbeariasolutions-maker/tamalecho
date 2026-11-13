import { beforeEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';
import { getBrowserRepository } from '../../src/services/storage.js';
import { getTipById, getTips } from '../../src/services/catalog.js';
import { getBadges, getHistoryList, getRecommendation, summarizeProgress } from '../../src/services/progress.js';

// Historial y Mi progreso (rediseño D-24, DISEÑO_UI_UX §7). Fechas fijas: noviembre de 2026.
const at = (day, hours = 10) => new Date(2026, 10, day, hours);
const reading = (id, day, hours = 10) => ({ id, at: at(day, hours).toISOString() });

describe('getHistoryList', () => {
  it('cada consejo una vez, en su apertura más reciente, del más reciente al más antiguo', () => {
    const history = [reading('SCR-01', 7), reading('PMI-01', 8), reading('SCR-01', 9), reading('SCR-99', 9, 11)];
    const list = getHistoryList(history, getTipById);
    // SCR-99 ya no existe en el catálogo: se ignora.
    expect(list.map((entry) => entry.tip.id)).toEqual(['SCR-01', 'PMI-01']);
    expect(list[0].at).toEqual(at(9));
  });

  it('filtra por enfoque', () => {
    const history = [reading('SCR-01', 7), reading('PMI-01', 8)];
    expect(getHistoryList(history, getTipById, 'pmbok').map((entry) => entry.tip.id)).toEqual(['PMI-01']);
  });
});

describe('insignias y recomendación', () => {
  it('las insignias se ganan por hitos, sin puntos', () => {
    const tips = getTips();
    const none = getBadges(summarizeProgress({ tips, history: [], completed: {} }));
    expect(none.map((badge) => badge.earned)).toEqual([false, false, false]);

    const scrumDone = Object.fromEntries(tips.filter((tip) => tip.framework === 'scrum').map((tip) => [tip.id, at(9).toISOString()]));
    const all = getBadges(summarizeProgress({ tips, history: [], completed: scrumDone }));
    expect(all.map((badge) => badge.earned)).toEqual([true, true, true]);
  });

  it('recomienda el primer paso de la ruta desde hoy sin completar; luego cualquiera del catálogo', () => {
    const tips = getTips();
    const route = [
      { tip: tips[0], isToday: false },
      { tip: tips[1], isToday: true },
      { tip: tips[2], isToday: false },
    ];
    expect(getRecommendation(route, tips, {})).toBe(tips[1]);
    expect(getRecommendation(route, tips, { [tips[1].id]: 'x' })).toBe(tips[2]);
    expect(getRecommendation(route, tips, { [tips[1].id]: 'x', [tips[2].id]: 'x' })).toBe(tips[0]);
    const everything = Object.fromEntries(tips.map((tip) => [tip.id, 'x']));
    expect(getRecommendation(route, tips, everything)).toBeNull();
  });
});

describe('HistoryPage', () => {
  beforeEach(() => window.localStorage.clear());

  it('sin lecturas invita a empezar una misión, sin mensaje técnico', async () => {
    await renderApp('/historial');
    expect(screen.getByText('Todavía no abres ningún consejo.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Empezar la misión de hoy' })).toHaveAttribute('href', '/');
  });

  it('lista los consejos abiertos y filtra por enfoque con la URL', async () => {
    const repository = getBrowserRepository();
    repository.recordReading({ id: 'SCR-01', at: at(8) });
    repository.recordReading({ id: 'PMI-01', at: at(9) });
    await renderApp('/historial');
    const list = screen.getByRole('list', { name: 'Consejos abiertos' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent(getTipById('PMI-01').title);
    expect(within(items[1]).getByRole('link', { name: `Abrir de nuevo ${getTipById('SCR-01').title}` })).toHaveAttribute(
      'href',
      '/tip/SCR-01',
    );

    await userEvent.setup().click(screen.getByRole('button', { name: 'Scrum' }));
    expect(screen.getByRole('button', { name: 'Scrum' })).toHaveAttribute('aria-pressed', 'true');
    expect(within(screen.getByRole('list', { name: 'Consejos abiertos' })).getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByRole('status')).toHaveTextContent('1 consejo');
  });
});

describe('ProgressPage', () => {
  beforeEach(() => window.localStorage.clear());

  it('muestra el resumen, el avance por enfoque, la recomendación y las insignias', async () => {
    const repository = getBrowserRepository();
    repository.recordReading({ id: 'SCR-01', at: new Date() });
    repository.markCompleted({ id: 'SCR-01', at: new Date() });
    await renderApp('/progreso');
    expect(screen.getByRole('heading', { level: 1, name: 'Mi progreso' })).toBeInTheDocument();
    const stats = screen.getByRole('list', { name: 'Resumen' });
    expect(stats).toHaveTextContent('1de 24 conceptos leídos');
    expect(stats).toHaveTextContent('1misión completada');
    expect(stats).toHaveTextContent('1 díade racha');
    expect(screen.getByRole('progressbar', { name: 'Conceptos de Scrum leídos' })).toHaveAttribute('aria-valuenow', '1');
    expect(screen.getByRole('progressbar', { name: 'Conceptos de PMI/PMBOK leídos' })).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByRole('link', { name: /^Continuar con / })).toBeInTheDocument();
    const badges = screen.getByRole('region', { name: 'Insignias' });
    expect(within(badges).getByText('Primera misión').parentElement).toHaveTextContent('✓ Obtenida');
    expect(within(badges).getByText('Cinco conceptos').parentElement).toHaveTextContent('Pendiente');
  });
});
