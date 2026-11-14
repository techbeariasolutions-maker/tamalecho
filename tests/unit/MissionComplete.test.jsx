import { beforeEach, describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';
import { getBrowserRepository } from '../../src/services/storage.js';
import { getTipById } from '../../src/services/catalog.js';
import avatarCatalog from '../../src/data/avatarStates.json';

// Ficha como microlección y «Marcar como comprendida» (rediseño D-24, DISEÑO_UI_UX §6).
describe('microlección y misión completada', () => {
  const tip = getTipById('SCR-01');

  beforeEach(() => {
    window.localStorage.clear();
  });

  it('muestra el tiempo de lectura y los bloques en el orden del diseño', async () => {
    await renderApp('/tip/SCR-01');
    expect(screen.getByText(/^\d+ min de lectura$/)).toBeInTheDocument();
    const headings = within(screen.getByRole('article')).getAllByRole('heading', { level: 2 });
    expect(headings.map((heading) => heading.textContent.trim())).toEqual([
      'Explicación',
      'Error frecuente',
      'Ejemplo',
      'Acción para hoy',
    ]);
    expect(screen.getByRole('region', { name: 'Acción para hoy' })).toHaveTextContent(tip.action);
  });

  it('al marcarla guarda el progreso, el personaje reacciona y el foco va al mensaje', async () => {
    await renderApp('/tip/SCR-01');
    // Sin reacción antes del clic: la celebración solo ocurre por acción del usuario.
    expect(document.querySelector('[data-reaction]')).toBeNull();

    await userEvent.setup().click(screen.getByRole('button', { name: 'Marcar como comprendida' }));

    const status = screen.getByText('¡Misión completada! Ya cuenta en tu progreso.');
    expect(status).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Marcar como comprendida' })).not.toBeInTheDocument();
    const section = screen.getByRole('region', { name: '¿Terminaste la misión?' });
    expect(within(section).getByRole('img', { name: avatarCatalog.reactions.orgulloso.alt })).toBeInTheDocument();
    expect(Object.keys(getBrowserRepository().getCompleted())).toEqual(['SCR-01']);
  });

  it('al volver a una misión completada lo dice, sin botón y sin repetir la celebración', async () => {
    getBrowserRepository().markCompleted({ id: 'SCR-01', at: new Date(2026, 10, 9, 10) });
    await renderApp('/tip/SCR-01');
    expect(screen.getByText('Ya marcaste esta misión como comprendida.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Marcar como comprendida' })).not.toBeInTheDocument();
    expect(document.querySelector('[data-reaction]')).toBeNull();
  });

  it('la portada muestra «Repasar misión» y «Completado» cuando la misión de hoy ya se completó', async () => {
    const { getFeaturedTip } = await import('../../src/services/catalog.js');
    const today = getFeaturedTip(new Date());
    getBrowserRepository().markCompleted({ id: today.id, at: new Date() });
    await renderApp('/');
    expect(screen.getByRole('link', { name: `Repasar misión: ${today.title}` })).toBeInTheDocument();
    const step = screen.getAllByRole('listitem').find((item) => item.getAttribute('aria-current') === 'step');
    expect(within(step).getByText('✓ Completado')).toBeInTheDocument();
  });
});
