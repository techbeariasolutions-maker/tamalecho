import { describe, expect, it } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';

const LABELS = ['Inicio', 'Biblioteca', 'Historial', 'Progreso', 'Ajustes', 'Ayuda'];

function getNav() {
  return screen.getByRole('navigation', { name: 'Principal' });
}

describe('NavMenu', () => {
  it('muestra las seis secciones en orden', async () => {
    await renderApp('/');
    const links = within(getNav()).getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual(LABELS);
  });

  it('marca solo el enlace activo con aria-current="page"', async () => {
    await renderApp('/ajustes');
    const nav = getNav();
    expect(within(nav).getByRole('link', { name: 'Ajustes' })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Inicio' })).not.toHaveAttribute('aria-current');
  });

  it('el botón controla la lista y alterna aria-expanded', async () => {
    const user = userEvent.setup();
    await renderApp('/');
    const toggle = screen.getByRole('button', { name: 'Menú' });
    const list = document.getElementById(toggle.getAttribute('aria-controls'));
    expect(list).not.toBeNull();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(list).toHaveClass('nav-menu__list--open');

    await user.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(list).not.toHaveClass('nav-menu__list--open');
  });

  it('Escape cierra el menú y devuelve el foco al botón', async () => {
    const user = userEvent.setup();
    await renderApp('/');
    const toggle = screen.getByRole('button', { name: 'Menú' });
    await user.click(toggle);
    await user.tab();
    expect(within(getNav()).getByRole('link', { name: 'Inicio' })).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });

  it('al navegar se cierra el menú, cambia la página y el foco vuelve al botón', async () => {
    const user = userEvent.setup();
    await renderApp('/');
    const toggle = screen.getByRole('button', { name: 'Menú' });
    await user.click(toggle);
    await user.click(within(getNav()).getByRole('link', { name: 'Ayuda' }));

    expect(await screen.findByRole('heading', { level: 1, name: 'Ayuda' })).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveFocus();
  });
});
