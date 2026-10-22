import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';
import { getCategories, getTips } from '../../src/services/catalog.js';

const tipList = () => screen.getByRole('list', { name: /^Consejos de / });

describe('LibraryPage', () => {
  it.each(['scrum', 'pmbok'])('en %s lista todas sus categorías y todos sus consejos', (framework) => {
    renderApp(`/biblioteca/${framework}`);
    const filter = screen.getByRole('group', { name: 'Filtrar por categoría' });
    const buttons = within(filter).getAllByRole('button').map((button) => button.textContent);
    expect(buttons).toEqual(['Todas', ...getCategories(framework)]);
    const total = getTips({ framework }).length;
    expect(screen.getByRole('status')).toHaveTextContent(`${total} consejos`);
    expect(within(tipList()).getAllByRole('article')).toHaveLength(total);
  });

  it('el selector de enfoque marca el activo con aria-current', () => {
    renderApp('/biblioteca/pmbok');
    const nav = screen.getByRole('navigation', { name: 'Enfoque' });
    expect(within(nav).getByRole('link', { name: 'PMI/PMBOK' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Scrum' })).not.toHaveAttribute('aria-current');
  });

  it('el filtro marca la categoría con aria-pressed y limita la lista', async () => {
    const user = userEvent.setup();
    renderApp('/biblioteca/scrum');
    const [category] = getCategories('scrum');
    const button = screen.getByRole('button', { name: category });
    expect(screen.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'true');

    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'false');
    const expected = getTips({ framework: 'scrum', category }).map((tip) => tip.title);
    const titles = within(tipList()).getAllByRole('heading', { level: 2 }).map((heading) => heading.textContent);
    expect(titles).toEqual(expected);
  });

  it('lee la categoría desde ?categoria=', () => {
    const category = getCategories('pmbok')[1];
    renderApp(`/biblioteca/pmbok?categoria=${encodeURIComponent(category)}`);
    expect(screen.getByRole('button', { name: category })).toHaveAttribute('aria-pressed', 'true');
    const count = getTips({ framework: 'pmbok', category }).length;
    expect(screen.getByRole('status')).toHaveTextContent(count === 1 ? '1 consejo' : `${count} consejos`);
  });

  it('una categoría inexistente muestra un mensaje vacío', () => {
    renderApp('/biblioteca/scrum?categoria=Inventada');
    expect(screen.getByText('No hay consejos en la categoría «Inventada».')).toBeInTheDocument();
    expect(screen.getByText('0 consejos')).toBeInTheDocument();
  });
});
