import { fireEvent, renderHook, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from './renderApp.jsx';
import { createFakeStorage } from './fixtures/fakeStorage.js';
import { useNoticeScheduler } from '../../src/hooks/useNoticeScheduler.js';
import { useReadingLog } from '../../src/hooks/useReadingLog.js';
import { getTips } from '../../src/services/catalog.js';
import { createRepository } from '../../src/services/storage.js';
import { pickTipForWindow } from '../../src/services/tipPicker.js';

// Registro de lecturas (HU-08.1-A, T2-22).
const at = (hours, minutes = 0) => new Date(2026, 10, 9, hours, minutes);
const TIPS = getTips();

describe('recordReading', () => {
  it('agrega la lectura y no duplica dos lecturas seguidas del mismo consejo', () => {
    const repository = createRepository(createFakeStorage());
    expect(repository.recordReading({ id: 'SCR-01', at: at(9) })).toBe(true);
    expect(repository.recordReading({ id: 'SCR-01', at: at(9, 5) })).toBe(false);
    expect(repository.recordReading({ id: 'PMI-02', at: at(9, 10) })).toBe(true);
    // Volver al primero después de otro sí cuenta: no es consecutivo.
    expect(repository.recordReading({ id: 'SCR-01', at: at(9, 15) })).toBe(true);
    expect(repository.getHistory().map((entry) => entry.id)).toEqual(['SCR-01', 'PMI-02', 'SCR-01']);
  });

  it('rechaza IDs o fechas inválidos', () => {
    const repository = createRepository(createFakeStorage());
    expect(repository.recordReading({ id: 'no-es-id', at: at(9) })).toBe(false);
    expect(repository.recordReading({ id: 'SCR-01', at: 'ayer' })).toBe(false);
    expect(repository.getHistory()).toEqual([]);
  });
});

describe('useReadingLog', () => {
  it('registra al montar y al cambiar de consejo, y el doble montaje de StrictMode no duplica', () => {
    const repository = createRepository(createFakeStorage());
    const clock = () => at(9);
    const { rerender } = renderHook(({ id }) => useReadingLog(id, repository, clock), {
      initialProps: { id: 'SCR-01' },
      wrapper: StrictMode,
    });
    rerender({ id: 'SCR-02' });
    rerender({ id: 'SCR-02' });
    expect(repository.getHistory().map((entry) => entry.id)).toEqual(['SCR-01', 'SCR-02']);
  });
});

describe('la ficha registra la lectura', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('abrir /tip/:id registra una lectura y volver a abrirla seguida no la duplica', async () => {
    const first = await renderApp('/tip/SCR-01');
    first.unmount();
    await renderApp('/tip/SCR-01');
    expect(createRepository(window.localStorage).getHistory().map((entry) => entry.id)).toEqual(['SCR-01']);
  });

  it('pasar al siguiente consejo registra otra lectura', async () => {
    await renderApp('/tip/SCR-01');
    fireEvent.click(screen.getByRole('link', { name: /^Siguiente consejo: / }));
    await screen.findByRole('heading', { level: 1 });
    const ids = createRepository(window.localStorage).getHistory().map((entry) => entry.id);
    expect(ids).toHaveLength(2);
    expect(ids[0]).toBe('SCR-01');
  });
});

describe('los avisos y las lecturas', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('un aviso emitido no se registra como lectura', () => {
    vi.setSystemTime(at(14, 5));
    const repository = createRepository(createFakeStorage());
    const { result } = renderHook(() => useNoticeScheduler({ tips: TIPS, repository }));
    expect(result.current.notice).not.toBeNull();
    expect(repository.getHistory()).toEqual([]);
  });

  it('el aviso evita el consejo leído que habría elegido', () => {
    vi.setSystemTime(at(14, 5));
    const key = '2026-11-09@14:00';
    const wouldPick = pickTipForWindow(key, [], TIPS);
    const repository = createRepository(createFakeStorage());
    repository.recordReading({ id: wouldPick.id, at: at(13) });

    const { result } = renderHook(() => useNoticeScheduler({ tips: TIPS, repository }));
    expect(result.current.notice.key).toBe(key);
    expect(result.current.notice.tip.id).not.toBe(wouldPick.id);
  });
});

describe('sin almacenamiento', () => {
  it('la ficha se lee aunque el navegador no deje guardar', async () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Bloqueado', 'QuotaExceededError');
    });
    await renderApp('/tip/PMI-01');
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    setItem.mockRestore();
  });
});
