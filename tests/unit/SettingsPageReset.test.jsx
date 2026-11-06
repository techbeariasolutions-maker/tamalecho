import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';
import { createRepository } from '../../src/services/storage.js';
import { disablePush, getPushStatus } from '../../src/services/pushClient.js';

// Pedidos de QA en el PR #48: «Restablecer mis datos» desactiva antes Web Push, y el texto
// de datos dice lo que guarda el servidor.
vi.mock('../../src/services/pushClient.js', () => ({
  getPushStatus: vi.fn(),
  enablePush: vi.fn(),
  disablePush: vi.fn(),
  syncPushSettings: vi.fn(async () => ({ ok: true, synced: true })),
  currentTimeZone: () => 'America/Monterrey',
}));

const repository = () => createRepository(window.localStorage);
const dataSection = () => screen.getByRole('region', { name: 'Tus datos en este dispositivo' });
const pushSection = () => screen.getByRole('region', { name: 'Avisos con la pestaña cerrada' });

async function confirmReset(user) {
  await user.click(screen.getByRole('button', { name: 'Restablecer mis datos' }));
  await user.click(screen.getByRole('button', { name: 'Sí, restablecer' }));
}

describe('Ajustes: restablecer con Web Push (HT-04.2-B + HU-15.1-A)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(getPushStatus).mockReset().mockResolvedValue('on');
    vi.mocked(disablePush).mockReset();
    repository().saveSettings({ intervalMinutes: 120 });
    repository().addHistoryEntry({ id: 'SCR-01', at: new Date(2026, 10, 5, 9) });
    repository().savePushState({ status: 'on', endpoint: 'https://fcm.googleapis.com/fcm/send/x' });
  });

  it('el texto ya no dice que todo se guarda solo en el navegador y explica lo que guarda el servidor', async () => {
    await renderApp('/ajustes');
    expect(dataSection()).not.toHaveTextContent('solo en este navegador');
    expect(dataSection()).toHaveTextContent(
      'Si activas los avisos con la pestaña cerrada, nuestro servidor también guarda la suscripción de este ' +
        'navegador, tu zona horaria y tu horario de avisos.',
    );
    expect(dataSection()).toHaveTextContent('le pedimos al servidor que los borre');
  });

  it('la confirmación avisa que también se desactivan los avisos con la pestaña cerrada', async () => {
    const user = userEvent.setup();
    await renderApp('/ajustes');
    await user.click(screen.getByRole('button', { name: 'Restablecer mis datos' }));
    expect(screen.getByRole('group', { name: /se desactivan los avisos con la pestaña cerrada/ })).toBeVisible();
  });

  it('llama a disablePush antes de borrar los datos locales', async () => {
    let historyWhenDisabling = null;
    vi.mocked(disablePush).mockImplementation(async () => {
      historyWhenDisabling = repository().getHistory().length;
      return { ok: true, status: 'off', serverRemoved: true };
    });
    const user = userEvent.setup();
    await renderApp('/ajustes');
    await confirmReset(user);

    expect(await within(dataSection()).findByText(/Listo: tus datos se restablecieron\./)).toBeInTheDocument();
    expect(disablePush).toHaveBeenCalledTimes(1);
    expect(historyWhenDisabling).toBe(1);
    expect(repository().getHistory()).toEqual([]);
    expect(repository().getPushState()).toBeNull();
  });

  it('después de restablecer, la sección de push muestra el estado nuevo', async () => {
    vi.mocked(disablePush).mockResolvedValue({ ok: true, status: 'off', serverRemoved: true });
    const user = userEvent.setup();
    await renderApp('/ajustes');
    expect(await within(pushSection()).findByText('Estado: activados en este navegador.')).toBeInTheDocument();

    vi.mocked(getPushStatus).mockResolvedValue('off');
    await confirmReset(user);
    expect(await within(pushSection()).findByText('Estado: desactivados en este navegador.')).toBeInTheDocument();
  });

  it('si el navegador no pudo cancelar la suscripción, no borra nada y lo explica', async () => {
    vi.mocked(disablePush).mockResolvedValue({ ok: false, status: 'on', serverRemoved: false });
    const user = userEvent.setup();
    await renderApp('/ajustes');
    await confirmReset(user);

    expect(await within(dataSection()).findByText(/así que no se restableció nada/)).toHaveAttribute('role', 'status');
    expect(repository().getHistory()).toHaveLength(1);
    expect(repository().getSettings().intervalMinutes).toBe(120);
    expect(repository().getPushState()).toEqual({ status: 'on', endpoint: 'https://fcm.googleapis.com/fcm/send/x' });
    expect(screen.getByRole('button', { name: 'Restablecer mis datos' })).toHaveFocus();
  });

  it('si el servidor no confirmó la baja, restablece igual y lo dice', async () => {
    vi.mocked(disablePush).mockResolvedValue({ ok: true, status: 'off', serverRemoved: false });
    const user = userEvent.setup();
    await renderApp('/ajustes');
    await confirmReset(user);

    expect(await within(dataSection()).findByText(/No pudimos avisarle al servidor/)).toBeInTheDocument();
    expect(repository().getHistory()).toEqual([]);
  });

  it('un doble clic en «Sí, restablecer» no desactiva dos veces', async () => {
    let finish;
    vi.mocked(disablePush).mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = () => resolve({ ok: true, status: 'off', serverRemoved: true });
        }),
    );
    const user = userEvent.setup();
    await renderApp('/ajustes');
    await user.click(screen.getByRole('button', { name: 'Restablecer mis datos' }));
    const yes = screen.getByRole('button', { name: 'Sí, restablecer' });
    await user.click(yes);
    await user.click(yes);
    finish();
    await within(dataSection()).findByText(/Listo: tus datos se restablecieron\./);
    expect(disablePush).toHaveBeenCalledTimes(1);
  });
});
