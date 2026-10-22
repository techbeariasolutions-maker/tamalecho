import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';
import { getNextTip, getTipById } from '../../src/services/catalog.js';

describe('TipDetailPage', () => {
  const tip = getTipById('SCR-01');

  it('muestra la ficha completa del consejo', () => {
    renderApp('/tip/SCR-01');
    expect(screen.getByRole('heading', { level: 1, name: tip.title })).toBeInTheDocument();
    for (const section of ['Explicación', 'Error frecuente', 'Ejemplo', 'Acción para hoy']) {
      expect(screen.getByRole('heading', { level: 2, name: section })).toBeInTheDocument();
    }
    expect(screen.getByText(tip.explanation)).toBeInTheDocument();
    expect(screen.getByText(tip.commonMistake)).toBeInTheDocument();
    expect(screen.getByText(tip.example)).toBeInTheDocument();
    expect(screen.getByText(`Scrum · ${tip.category}`)).toBeInTheDocument();
    expect(screen.getByText(`SCR-01 · versión ${tip.version}`)).toBeInTheDocument();
  });

  it('muestra las etiquetas del consejo', () => {
    renderApp('/tip/SCR-01');
    expect(screen.getByText('Etiquetas:').parentElement).toHaveTextContent(`Etiquetas: ${tip.tags.join(', ')}`);
  });

  it('muestra el selector de enfoque con el enfoque del consejo marcado', () => {
    renderApp('/tip/PMI-01');
    const nav = screen.getByRole('navigation', { name: 'Enfoque' });
    expect(within(nav).getByRole('link', { name: 'PMI/PMBOK' })).toHaveAttribute('aria-current', 'true');
    expect(within(nav).getByRole('link', { name: 'Scrum' })).not.toHaveAttribute('aria-current');
    expect(within(nav).getByRole('link', { name: 'Scrum' })).toHaveAttribute('href', '/biblioteca/scrum');
  });

  it('el enlace externo de la fuente abre en otra pestaña y lo dice', () => {
    renderApp('/tip/SCR-01');
    const link = screen.getByRole('link', { name: /se abre en otra pestaña/ });
    expect(link).toHaveAttribute('href', tip.source.url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('«Siguiente consejo» lleva al siguiente de su categoría', async () => {
    const next = getNextTip('SCR-01');
    renderApp('/tip/SCR-01');
    await userEvent.setup().click(screen.getByRole('link', { name: `Siguiente consejo: ${next.title}` }));
    expect(screen.getByRole('heading', { level: 1, name: next.title })).toBeInTheDocument();
  });

  it('sin siguiente consejo (único en su categoría) no muestra el enlace', () => {
    const lonely = ['SCR-01', 'SCR-11', 'PMI-12'].find((id) => getNextTip(id) === null);
    renderApp(`/tip/${lonely}`);
    expect(screen.queryByRole('link', { name: /^Siguiente consejo/ })).not.toBeInTheDocument();
  });

  it('«Volver a la biblioteca» usa la URL recibida en state', () => {
    renderApp({ pathname: '/tip/SCR-01', state: { from: '/biblioteca/scrum?categoria=X' } });
    expect(screen.getByRole('link', { name: 'Volver a la biblioteca' })).toHaveAttribute(
      'href',
      '/biblioteca/scrum?categoria=X',
    );
  });

  it('sin state, «Volver» va a la biblioteca del enfoque con la categoría del tip', () => {
    renderApp('/tip/SCR-01');
    const expected = `/biblioteca/scrum?${new URLSearchParams({ categoria: tip.category })}`;
    expect(screen.getByRole('link', { name: 'Volver a la biblioteca' })).toHaveAttribute('href', expected);
  });

  it('ignora un state que no apunta a la biblioteca', () => {
    renderApp({ pathname: '/tip/SCR-01', state: { from: 'https://otro-sitio.example' } });
    expect(screen.getByRole('link', { name: 'Volver a la biblioteca' }).getAttribute('href')).toMatch(
      /^\/biblioteca\/scrum\?categoria=/,
    );
  });

  it('un id inexistente muestra el estado alterno', () => {
    renderApp('/tip/SCR-99');
    expect(screen.getByText('Este consejo no existe o fue retirado.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir a la biblioteca de consejos' })).toHaveAttribute('href', '/biblioteca');
  });
});
