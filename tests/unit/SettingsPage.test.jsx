import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';
import { DEFAULT_SETTINGS } from '../../src/services/schedule.js';
import { createRepository } from '../../src/services/storage.js';

// SettingsPage usa el repositorio del navegador (localStorage de jsdom). Se siembra y se lee
// siempre a través de createRepository, nunca con la llave a mano.
const browserRepository = () => createRepository(window.localStorage);
const dataSection = () => screen.getByRole('region', { name: 'Tus datos en este dispositivo' });

describe('SettingsPage (HT-04.2-B)', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('muestra el h1, la sección de datos locales y el botón para restablecer', async () => {
    await renderApp('/ajustes');
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    const section = screen.getByRole('region', { name: 'Tus datos en este dispositivo' });
    expect(within(section).getByText(/no tiene cuentas ni inicio de sesión/)).toBeInTheDocument();
    expect(within(section).getAllByRole('listitem')).toHaveLength(3);
    expect(within(section).getByText(/Ahora no hay lecturas registradas\./)).toBeInTheDocument();
    expect(within(section).getByRole('button', { name: 'Restablecer mis datos' })).toBeInTheDocument();
    expect(within(section).getByRole('status')).toBeEmptyDOMElement();
    // Ya no es el marcador del Sprint 1.
    expect(screen.queryByText(/estará disponible en el Sprint/)).not.toBeInTheDocument();
  });

  it('al cargar no mueve el foco', async () => {
    await renderApp('/ajustes');
    expect(document.body).toHaveFocus();
  });

  it('muestra cuántas lecturas hay guardadas', async () => {
    const repository = browserRepository();
    repository.addHistoryEntry({ id: 'SCR-01', at: new Date(2026, 10, 4, 9) });
    repository.addHistoryEntry({ id: 'PMI-02', at: new Date(2026, 10, 4, 10) });
    await renderApp('/ajustes');
    expect(screen.getByText(/Ahora hay 2 lecturas registradas\./)).toBeInTheDocument();
  });

  it('pide confirmación dentro de la página, sin window.confirm, y al cancelar no borra nada', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    browserRepository().addHistoryEntry({ id: 'SCR-01', at: new Date(2026, 10, 4, 9) });
    const user = userEvent.setup();
    await renderApp('/ajustes');

    await user.click(screen.getByRole('button', { name: 'Restablecer mis datos' }));
    const group = screen.getByRole('group', { name: /¿Restablecer tus datos\?/ });
    expect(within(group).getByRole('button', { name: 'Cancelar' })).toHaveFocus();
    expect(screen.queryByRole('button', { name: 'Restablecer mis datos' })).not.toBeInTheDocument();

    await user.click(within(group).getByRole('button', { name: 'Cancelar' }));
    expect(screen.queryByRole('group', { name: /¿Restablecer tus datos\?/ })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restablecer mis datos' })).toHaveFocus();
    expect(browserRepository().getHistory()).toHaveLength(1);
    expect(confirmSpy).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  it('al confirmar restablece los datos, lo anuncia y devuelve el foco al botón', async () => {
    const repository = browserRepository();
    repository.saveSettings({ intervalMinutes: 120, paused: true });
    repository.addHistoryEntry({ id: 'SCR-01', at: new Date(2026, 10, 4, 9) });
    const user = userEvent.setup();
    await renderApp('/ajustes');
    expect(screen.getByText(/Ahora hay 1 lectura registrada\./)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Restablecer mis datos' }));
    await user.click(screen.getByRole('button', { name: 'Sí, restablecer' }));

    expect(await within(dataSection()).findByText(/Listo: tus datos se restablecieron\./)).toHaveAttribute('role', 'status');
    expect(screen.getByText(/Ahora no hay lecturas registradas\./)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Restablecer mis datos' })).toHaveFocus();
    expect(browserRepository().getSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      activeDays: [...DEFAULT_SETTINGS.activeDays],
    });
    expect(browserRepository().getHistory()).toEqual([]);
  });

  it('se usa solo con teclado', async () => {
    const user = userEvent.setup();
    await renderApp('/ajustes');
    screen.getByRole('button', { name: 'Restablecer mis datos' }).focus();
    await user.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
    await user.keyboard('{Shift>}{Tab}{/Shift}');
    expect(screen.getByRole('button', { name: 'Sí, restablecer' })).toHaveFocus();
    await user.keyboard('{Enter}');
    expect(within(dataSection()).getByRole('status')).toHaveTextContent('Listo');
  });
});
