import { fireEvent, render, renderHook, act, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getBrowserRepository } from '../../src/services/storage.js';
import { announceSettingsChanged, useSettings } from '../../src/hooks/useSettings.js';

// HU-06.1-B (WP-P2): «Pausar avisos» desde el propio aviso, con foco y región anunciable.
// tests/setup.js reemplaza NoticeHost por un componente vacío; aquí se usa el real.
const { default: NoticeHost } = await vi.importActual('../../src/features/scheduler/NoticeHost.jsx');

vi.mock('../../src/services/pushClient.js', async (importOriginal) => ({
  ...(await importOriginal()),
  syncPushSettings: vi.fn(async () => ({ ok: true, synced: false })),
}));
const { syncPushSettings } = await import('../../src/services/pushClient.js');

const at = (hours, minutes = 0) => new Date(2026, 10, 9, hours, minutes);

function renderHost() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <main id="contenido" tabIndex={-1}>
        <NoticeHost />
        <Routes>
          <Route path="/" element={<button type="button">Otro control</button>} />
          <Route path="/ajustes" element={<h1>Ajustes</h1>} />
        </Routes>
      </main>
    </MemoryRouter>,
  );
}

describe('pausar desde el aviso', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(at(9, 30));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('el aviso tiene un botón «Pausar avisos» siempre visible', () => {
    renderHost();
    expect(within(screen.getByRole('status')).getByRole('button', { name: 'Pausar avisos desde este aviso' })).toBeInTheDocument();
  });

  it('pausa en el dispositivo, avisa al servidor, confirma en la misma región y mueve el foco a la confirmación', () => {
    renderHost();
    fireEvent.click(screen.getByRole('button', { name: 'Pausar avisos desde este aviso' }));

    expect(getBrowserRepository().getSettings().paused).toBe(true);
    expect(syncPushSettings).toHaveBeenCalledWith(expect.objectContaining({ paused: true }), expect.any(String));
    const region = screen.getByRole('status');
    expect(within(region).queryByText('Consejo de ahora')).not.toBeInTheDocument();
    const confirmation = within(region).getByText('Avisos en pausa. Puedes seguir leyendo consejos cuando quieras.');
    expect(confirmation).toHaveFocus();
    expect(within(region).getByRole('link', { name: 'Reanudar en Ajustes' })).toHaveAttribute('href', '/ajustes');
    // Navegar sigue funcionando.
    expect(screen.getByRole('button', { name: 'Otro control' })).toBeInTheDocument();
  });

  it('la confirmación se cierra y la región queda vacía', () => {
    renderHost();
    fireEvent.click(screen.getByRole('button', { name: 'Pausar avisos desde este aviso' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar mensaje de pausa' }));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});

describe('useSettings se entera de cambios hechos fuera del hook', () => {
  beforeEach(() => window.localStorage.clear());

  it('al anunciar el cambio vuelve a leer el repositorio', () => {
    const { result } = renderHook(() => useSettings());
    expect(result.current.settings.paused).toBe(false);
    getBrowserRepository().saveSettings({ paused: true });
    act(() => announceSettingsChanged());
    expect(result.current.settings.paused).toBe(true);
  });
});
