import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';
import { getPushStatus, syncPushSettings } from '../../src/services/pushClient.js';

// HU-07.2-B, lado del cliente: con Web Push activo, cambiar el horario o la pausa actualiza la
// suscripción en el servidor.

vi.mock('../../src/services/pushClient.js', async (importOriginal) => ({
  ...(await importOriginal()),
  getPushStatus: vi.fn(),
  syncPushSettings: vi.fn(),
  currentTimeZone: () => 'America/Monterrey',
}));

describe('Ajustes sincroniza el horario con el servidor', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(syncPushSettings).mockReset().mockResolvedValue({ ok: true, synced: true });
  });

  afterEach(() => {
    vi.mocked(getPushStatus).mockReset();
  });

  it('con push activo, guardar el horario y pausar envían los ajustes nuevos', async () => {
    vi.mocked(getPushStatus).mockResolvedValue('on');
    const user = userEvent.setup();
    await renderApp('/ajustes');
    await screen.findByText('Estado: activados en este navegador.');

    await user.click(screen.getByRole('radio', { name: 'Cada 2 horas' }));
    await user.click(screen.getByRole('button', { name: 'Guardar horario' }));
    expect(syncPushSettings).toHaveBeenLastCalledWith(
      expect.objectContaining({ intervalMinutes: 120, paused: false }),
      'America/Monterrey',
    );

    await user.click(screen.getByRole('button', { name: 'Pausar avisos' }));
    expect(syncPushSettings).toHaveBeenLastCalledWith(expect.objectContaining({ paused: true }), 'America/Monterrey');
    expect(syncPushSettings).toHaveBeenCalledTimes(2);
  });

  it('con push desactivado no llama al servidor', async () => {
    vi.mocked(getPushStatus).mockResolvedValue('off');
    const user = userEvent.setup();
    await renderApp('/ajustes');
    await screen.findByText('Estado: desactivados en este navegador.');
    await user.click(screen.getByRole('button', { name: 'Pausar avisos' }));
    expect(syncPushSettings).not.toHaveBeenCalled();
  });

  it('si el servidor no recibe el cambio, la sección de push lo dice', async () => {
    vi.mocked(getPushStatus).mockResolvedValue('on');
    vi.mocked(syncPushSettings).mockResolvedValue({ ok: false, synced: false });
    const user = userEvent.setup();
    await renderApp('/ajustes');
    await screen.findByText('Estado: activados en este navegador.');
    await user.click(screen.getByRole('button', { name: 'Pausar avisos' }));
    const pushSection = screen.getByRole('region', { name: 'Avisos con la pestaña cerrada' });
    expect(await within(pushSection).findByText(/no pudimos avisarle al servidor/)).toBeInTheDocument();
  });
});
