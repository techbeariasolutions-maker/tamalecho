import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PushSection from '../../src/features/scheduler/PushSection.jsx';
import { DEFAULT_SETTINGS } from '../../src/services/schedule.js';
import { disablePush, enablePush } from '../../src/services/pushClient.js';

vi.mock('../../src/services/pushClient.js', () => ({
  enablePush: vi.fn(),
  disablePush: vi.fn(),
  currentTimeZone: () => 'America/Monterrey',
}));

const SETTINGS = { ...DEFAULT_SETTINGS, activeDays: [...DEFAULT_SETTINGS.activeDays] };

// Envoltura con estado, como la usa SettingsPage.
function Harness({ initial }) {
  const [status, setStatus] = useState(initial);
  return <PushSection status={status} settings={SETTINGS} onStatusChange={setStatus} />;
}

const section = () => screen.getByRole('region', { name: 'Avisos con la pestaña cerrada' });

describe('PushSection (HU-15.1-A)', () => {
  beforeEach(() => {
    vi.mocked(enablePush).mockReset();
    vi.mocked(disablePush).mockReset();
  });

  it('explica qué hace y qué se envía al servidor', () => {
    render(<Harness initial="off" />);
    expect(section()).toHaveTextContent('aunque cierres la pestaña');
    expect(section()).toHaveTextContent(
      'nuestro servidor guarda solo la suscripción de este navegador, tu zona horaria y tu horario de avisos',
    );
  });

  it('mientras consulta al navegador no muestra botón', () => {
    render(<Harness initial={null} />);
    expect(section()).toHaveTextContent('Comprobando si tu navegador permite estos avisos…');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  describe('los 4 estados', () => {
    it('unsupported: mensaje honesto, mención de iPhone y sin botón', () => {
      render(<Harness initial="unsupported" />);
      expect(section()).toHaveTextContent(
        'Tu navegador no permite avisos con la pestaña cerrada; los avisos dentro de la página siguen funcionando.',
      );
      expect(section()).toHaveTextContent('En iPhone y iPad se necesita la app instalada');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('denied: explica cómo permitirlas y sin botón', () => {
      render(<Harness initial="denied" />);
      expect(section()).toHaveTextContent('Bloqueaste las notificaciones de este sitio');
      expect(section()).toHaveTextContent('Los avisos dentro de la página siguen funcionando.');
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('off: estado y botón «Activar avisos»', () => {
      render(<Harness initial="off" />);
      expect(section()).toHaveTextContent('Estado: desactivados en este navegador.');
      expect(screen.getByRole('button', { name: 'Activar avisos' })).toBeInTheDocument();
    });

    it('on: estado y botón «Desactivar avisos»', () => {
      render(<Harness initial="on" />);
      expect(section()).toHaveTextContent('Estado: activados en este navegador.');
      expect(screen.getByRole('button', { name: 'Desactivar avisos' })).toBeInTheDocument();
    });
  });

  it('activar llama a enablePush con los ajustes y la zona horaria, y conserva el foco en el botón', async () => {
    vi.mocked(enablePush).mockResolvedValue({ ok: true, status: 'on' });
    const user = userEvent.setup();
    render(<Harness initial="off" />);
    await user.click(screen.getByRole('button', { name: 'Activar avisos' }));

    expect(enablePush).toHaveBeenCalledWith(SETTINGS, 'America/Monterrey');
    const button = await screen.findByRole('button', { name: 'Desactivar avisos' });
    expect(button).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('quedaron activados');
  });

  it('desactivar llama a disablePush y lo anuncia', async () => {
    vi.mocked(disablePush).mockResolvedValue({ ok: true, status: 'off', serverRemoved: true });
    const user = userEvent.setup();
    render(<Harness initial="on" />);
    await user.click(screen.getByRole('button', { name: 'Desactivar avisos' }));

    expect(disablePush).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole('button', { name: 'Activar avisos' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('quedaron desactivados');
  });

  it('si el servidor no confirmó la baja, lo dice sin alarmar', async () => {
    vi.mocked(disablePush).mockResolvedValue({ ok: true, status: 'off', serverRemoved: false });
    const user = userEvent.setup();
    render(<Harness initial="on" />);
    await user.click(screen.getByRole('button', { name: 'Desactivar avisos' }));
    expect(await screen.findByText(/no pudimos avisarle al servidor/)).toHaveAttribute('role', 'status');
  });

  it('si se niega el permiso, el botón desaparece y el foco pasa al texto del estado', async () => {
    vi.mocked(enablePush).mockResolvedValue({ ok: false, status: 'denied', error: 'permission' });
    const user = userEvent.setup();
    render(<Harness initial="off" />);
    await user.click(screen.getByRole('button', { name: 'Activar avisos' }));

    const state = await screen.findByText(/Bloqueaste las notificaciones/);
    expect(state).toHaveFocus();
    expect(screen.getByRole('status')).toHaveTextContent('No diste permiso');
  });

  it.each([
    ['config', 'falta la configuración del servidor'],
    ['failed', 'Revisa tu conexión'],
  ])('error %s: queda desactivado y lo explica', async (error, text) => {
    vi.mocked(enablePush).mockResolvedValue({ ok: false, status: 'off', error });
    const user = userEvent.setup();
    render(<Harness initial="off" />);
    await user.click(screen.getByRole('button', { name: 'Activar avisos' }));
    expect(await screen.findByText(new RegExp(text))).toHaveAttribute('role', 'status');
    expect(screen.getByRole('button', { name: 'Activar avisos' })).toBeInTheDocument();
  });

  it('un doble clic no activa dos veces', async () => {
    let finish;
    vi.mocked(enablePush).mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = () => resolve({ ok: true, status: 'on' });
        }),
    );
    const user = userEvent.setup();
    render(<Harness initial="off" />);
    const button = screen.getByRole('button', { name: 'Activar avisos' });
    await user.click(button);
    await user.click(button);
    finish();
    await screen.findByRole('button', { name: 'Desactivar avisos' });
    expect(enablePush).toHaveBeenCalledTimes(1);
  });
});
