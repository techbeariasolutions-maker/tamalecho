import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';
import { createRepository } from '../../src/services/storage.js';

// Silencio y pausa (HU-07.2-A). Fecha fija: lunes 9/11/2026, 09:00.
const browserRepository = () => createRepository(window.localStorage);
const pauseSection = () => screen.getByRole('region', { name: 'Pausa' });
const previewTimes = () =>
  within(screen.getByRole('region', { name: 'Avisos de hoy' }))
    .queryAllByRole('listitem')
    .map((item) => item.textContent);

describe('silencio y pausa (HU-07.2-A)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 9, 9));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('el silencio recomendado es de 21:00 a 08:00, en su propio fieldset', async () => {
    await renderApp('/ajustes');
    const group = screen.getByRole('group', { name: 'Silencio' });
    expect(within(group).getByLabelText('Inicio del silencio')).toHaveValue('21:00');
    expect(within(group).getByLabelText('Fin del silencio')).toHaveValue('08:00');
  });

  it('un silencio desde las 20:00 quita la ventana de las 20:00 de la vista previa', async () => {
    const user = userEvent.setup();
    await renderApp('/ajustes');
    fireEvent.change(screen.getByLabelText('Inicio del silencio'), { target: { value: '20:00' } });
    await user.click(screen.getByRole('button', { name: 'Guardar horario' }));
    expect(previewTimes()).toEqual(['08:00', '11:00', '14:00', '17:00']);
    expect(browserRepository().getSettings()).toMatchObject({ quietStart: '20:00', quietEnd: '08:00' });
  });

  it('un silencio sin hora de fin no se guarda y muestra el error', async () => {
    const user = userEvent.setup();
    await renderApp('/ajustes');
    fireEvent.change(screen.getByLabelText('Fin del silencio'), { target: { value: '' } });
    await user.click(screen.getByRole('button', { name: 'Guardar horario' }));
    const input = screen.getByLabelText('Fin del silencio');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveFocus();
    expect(browserRepository().getSettings().quietEnd).toBe('08:00');
  });

  it('«Pausar avisos» es un botón de alternancia con aria-pressed y un texto con el estado', async () => {
    const user = userEvent.setup();
    await renderApp('/ajustes');
    const button = within(pauseSection()).getByRole('button', { name: 'Pausar avisos' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(within(pauseSection()).getByText(/Los avisos están activos\./)).toBeInTheDocument();

    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(within(pauseSection()).getByText(/Los avisos están en pausa\./)).toBeInTheDocument();
    expect(within(pauseSection()).getByRole('status')).toHaveTextContent('los avisos quedaron en pausa');
    expect(screen.getByText(/no te llegará ninguno hasta que los reanudes/)).toBeInTheDocument();
    expect(browserRepository().getSettings().paused).toBe(true);

    await user.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'false');
    expect(within(pauseSection()).getByRole('status')).toHaveTextContent('los avisos se reanudaron');
    expect(browserRepository().getSettings().paused).toBe(false);
  });

  it('pausar no cambia el horario y guardar el horario no quita la pausa', async () => {
    const user = userEvent.setup();
    browserRepository().saveSettings({ intervalMinutes: 120 });
    await renderApp('/ajustes');
    await user.click(screen.getByRole('button', { name: 'Pausar avisos' }));
    await user.click(screen.getByRole('button', { name: 'Guardar horario' }));
    expect(browserRepository().getSettings()).toMatchObject({ intervalMinutes: 120, paused: true });
  });
});
