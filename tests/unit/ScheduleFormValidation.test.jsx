import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';
import { DEFAULT_SETTINGS } from '../../src/services/schedule.js';
import { createRepository } from '../../src/services/storage.js';

// Guardado validado (HU-07.1-B): los valores inválidos no se guardan, el error se asocia al campo
// con aria-describedby y el foco va al primer campo con error.
const browserRepository = () => createRepository(window.localStorage);
const scheduleStatus = () =>
  within(screen.getByRole('region', { name: 'Cuándo aprender' })).getAllByRole('status')[0];
const save = (user) => user.click(screen.getByRole('button', { name: 'Guardar horario' }));
const setTime = (label, value) => fireEvent.change(screen.getByLabelText(label), { target: { value } });

function expectDescribedError(control, text) {
  expect(control).toHaveAttribute('aria-invalid', 'true');
  const id = control.getAttribute('aria-describedby');
  expect(id).toBeTruthy();
  expect(document.getElementById(id)).toHaveTextContent(text);
}

describe('guardado validado del horario (HU-07.1-B)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 9, 9));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('una hora vacía no se guarda, se explica junto al campo y recibe el foco', async () => {
    const user = userEvent.setup();
    browserRepository().saveSettings({ startTime: '09:00' });
    await renderApp('/ajustes');
    setTime('Hora del primer aviso', '');
    await save(user);

    const input = screen.getByLabelText('Hora del primer aviso');
    expectDescribedError(input, 'Escribe la hora con el formato HH:MM');
    expect(input).toHaveFocus();
    expect(scheduleStatus()).toHaveTextContent('No guardamos ningún cambio');
    expect(browserRepository().getSettings().startTime).toBe('09:00');
  });

  it('si la comida termina antes de empezar, el error va en «Fin de la comida» y no se guarda nada', async () => {
    const user = userEvent.setup();
    await renderApp('/ajustes');
    await user.click(screen.getByRole('radio', { name: 'Cada 2 horas' }));
    setTime('Inicio de la comida', '15:00');
    setTime('Fin de la comida', '13:00');
    await save(user);

    expectDescribedError(screen.getByLabelText('Fin de la comida'), 'La comida debe terminar después de empezar.');
    expect(screen.getByLabelText('Fin de la comida')).toHaveFocus();
    // Tampoco se guardó la cadencia, que sí era válida: el guardado es todo o nada.
    expect(browserRepository().getSettings()).toMatchObject({ intervalMinutes: 180, lunchStart: '12:00' });
  });

  it('sin ningún día activo, el error se asocia al grupo y a cada casilla', async () => {
    const user = userEvent.setup();
    await renderApp('/ajustes');
    const group = screen.getByRole('group', { name: 'Días con avisos' });
    for (const box of within(group).getAllByRole('checkbox')) await user.click(box);
    await save(user);

    expect(group).toHaveAttribute('aria-describedby');
    expect(document.getElementById(group.getAttribute('aria-describedby'))).toHaveTextContent(
      'Elige al menos un día de la semana.',
    );
    for (const box of within(group).getAllByRole('checkbox')) expectDescribedError(box, 'Elige al menos un día');
    expect(within(group).getByRole('checkbox', { name: 'Lunes' })).toHaveFocus();
    expect(browserRepository().getSettings().activeDays).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('al corregir y guardar, los errores desaparecen', async () => {
    const user = userEvent.setup();
    await renderApp('/ajustes');
    setTime('Hora del primer aviso', '');
    await save(user);
    setTime('Hora del primer aviso', '10:00');
    await save(user);

    const input = screen.getByLabelText('Hora del primer aviso');
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(scheduleStatus()).toHaveTextContent('Listo: guardamos tu horario.');
    expect(browserRepository().getSettings().startTime).toBe('10:00');
  });

  it('«Restaurar valores recomendados» vuelve al horario recomendado y conserva la pausa', async () => {
    const user = userEvent.setup();
    browserRepository().saveSettings({ intervalMinutes: 120, startTime: '09:30', activeDays: [1, 2], paused: true });
    await renderApp('/ajustes');
    await user.click(screen.getByRole('button', { name: 'Restaurar valores recomendados' }));

    expect(scheduleStatus()).toHaveTextContent('Listo: el horario volvió a los valores recomendados.');
    expect(screen.getByRole('radio', { name: 'Cada 3 horas' })).toBeChecked();
    expect(screen.getByLabelText('Hora del primer aviso')).toHaveValue('08:00');
    expect(browserRepository().getSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      activeDays: [...DEFAULT_SETTINGS.activeDays],
      paused: true,
    });
  });
});
