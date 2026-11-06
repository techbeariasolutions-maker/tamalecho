import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';
import { createRepository } from '../../src/services/storage.js';

// Panel de horario en /ajustes (HU-07.1-A). Solo se simula la fecha (lunes 9/11/2026, 09:00) para
// que la vista previa sea fija; los temporizadores siguen siendo reales para user-event.
const browserRepository = () => createRepository(window.localStorage);
const scheduleSection = () => screen.getByRole('region', { name: 'Horario de los avisos' });
const previewTimes = () =>
  within(screen.getByRole('region', { name: 'Avisos de hoy' }))
    .queryAllByRole('listitem')
    .map((item) => item.textContent);

describe('panel de horario (HU-07.1-A)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 9, 9));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('agrupa los controles con fieldset y legend y todos tienen etiqueta visible', async () => {
    await renderApp('/ajustes');
    const section = scheduleSection();
    expect(within(section).getByRole('group', { name: 'Cada cuánto quieres un consejo' })).toBeInTheDocument();
    expect(within(section).getByRole('group', { name: 'Días con avisos' })).toBeInTheDocument();
    expect(within(section).getByRole('group', { name: 'Hora de la comida' })).toBeInTheDocument();
    expect(within(section).getByRole('radio', { name: 'Cada 3 horas' })).toBeChecked();
    expect(within(section).getByLabelText('Hora del primer aviso')).toHaveValue('08:00');
    expect(within(section).getAllByRole('checkbox')).toHaveLength(7);
    expect(within(section).getByLabelText('Empieza a las')).toHaveValue('12:00');
    expect(within(section).getByLabelText('Termina a las')).toHaveValue('16:00');
  });

  it('la vista previa muestra las ventanas del motor con los valores recomendados', async () => {
    await renderApp('/ajustes');
    expect(previewTimes()).toEqual(['08:00', '11:00', '14:00', '17:00', '20:00']);
  });

  it('al guardar cada 2 horas se conserva y la vista previa cambia (T2-14)', async () => {
    const user = userEvent.setup();
    await renderApp('/ajustes');
    await user.click(screen.getByRole('radio', { name: 'Cada 2 horas' }));
    await user.click(screen.getByRole('button', { name: 'Guardar horario' }));

    expect(within(scheduleSection()).getByRole('status')).toHaveTextContent('Listo: guardamos tu horario.');
    expect(previewTimes()).toEqual(['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']);
    expect(browserRepository().getSettings().intervalMinutes).toBe(120);
  });

  it('guarda los días activos y la vista previa avisa si hoy no hay avisos', async () => {
    const user = userEvent.setup();
    await renderApp('/ajustes');
    // El 9/11/2026 es lunes: se quita el lunes.
    await user.click(screen.getByRole('checkbox', { name: 'Lunes' }));
    await user.click(screen.getByRole('button', { name: 'Guardar horario' }));

    expect(browserRepository().getSettings().activeDays).toEqual([0, 2, 3, 4, 5, 6]);
    expect(screen.getByText(/Hoy no hay avisos/)).toBeInTheDocument();
  });

  it('la vista previa usa lo guardado, no lo que se está escribiendo', async () => {
    const user = userEvent.setup();
    await renderApp('/ajustes');
    await user.click(screen.getByRole('radio', { name: 'Cada 2 horas' }));
    expect(previewTimes()).toEqual(['08:00', '11:00', '14:00', '17:00', '20:00']);
  });
});
