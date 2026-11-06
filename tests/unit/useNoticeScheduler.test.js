import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNoticeScheduler } from '../../src/hooks/useNoticeScheduler.js';
import { getTips } from '../../src/services/catalog.js';
import { createRepository } from '../../src/services/storage.js';
import { createFakeStorage } from './fixtures/fakeStorage.js';

// Programador de avisos (HU-04.2-A) con temporizadores falsos y un almacenamiento en memoria.
// Fechas locales construidas a mano; el 9/11/2026 es lunes. Ajustes recomendados: cada 3 h
// desde las 08:00 (08, 11, 14, 17 y 20 h) y silencio de 21:00 a 08:00.
const at = (day, hours, minutes = 0) => new Date(2026, 10, day, hours, minutes);
const TIPS = getTips();
const HOUR = 60 * 60 * 1000;

function setup({ now, served = [], settings } = {}) {
  vi.setSystemTime(now);
  const repository = createRepository(createFakeStorage());
  if (settings) repository.saveSettings(settings);
  for (const key of served) repository.markWindowServed(key);
  const hook = renderHook(() => useNoticeScheduler({ tips: TIPS, repository }));
  return { repository, ...hook };
}

describe('useNoticeScheduler (HU-04.2-A)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('al montar muestra la ventana vigente si no se ha servido y la marca como servida', () => {
    const { result, repository } = setup({ now: at(9, 9, 30) });
    expect(result.current.notice).toMatchObject({ key: '2026-11-09@08:00', dayPart: 'despierto' });
    expect(TIPS).toContain(result.current.notice.tip);
    expect(repository.wasWindowServed('2026-11-09@08:00')).toBe(true);
  });

  it('a las 10:59 no hay aviso y a las 11:00 aparece uno, con un solo temporizador', () => {
    const { result } = setup({ now: at(9, 10, 59), served: ['2026-11-09@08:00'] });
    expect(result.current.notice).toBeNull();
    expect(vi.getTimerCount()).toBe(1);

    act(() => vi.advanceTimersByTime(60_000));
    expect(result.current.notice).toMatchObject({ key: '2026-11-09@11:00' });
    expect(vi.getTimerCount()).toBe(1);
  });

  it('al volver de una suspensión de 9 h muestra solo la ventana más reciente', () => {
    const { result, repository } = setup({ now: at(9, 8, 30), served: ['2026-11-09@08:00'] });
    // Suspensión: el reloj salta sin que corra ningún temporizador; al volver llega el focus.
    vi.setSystemTime(at(9, 17, 30));
    act(() => window.dispatchEvent(new Event('focus')));
    expect(result.current.notice).toMatchObject({ key: '2026-11-09@17:00' });
    expect(repository.wasWindowServed('2026-11-09@11:00')).toBe(false);
    expect(repository.wasWindowServed('2026-11-09@14:00')).toBe(false);
  });

  it('no repite una ventana ya servida, ni al recalcular ni en una página nueva', () => {
    const first = setup({ now: at(9, 14, 5) });
    expect(first.result.current.notice).toMatchObject({ key: '2026-11-09@14:00' });
    act(() => first.result.current.dismiss());
    act(() => window.dispatchEvent(new Event('focus')));
    expect(first.result.current.notice).toBeNull();

    // «Recargar»: un hook nuevo sobre el mismo repositorio.
    const again = renderHook(() => useNoticeScheduler({ tips: TIPS, repository: first.repository }));
    expect(again.result.current.notice).toBeNull();
  });

  it('en pausa no muestra avisos, y al reanudar el siguiente cálculo sí', () => {
    const { result, repository } = setup({ now: at(9, 14, 5), settings: { paused: true } });
    expect(result.current.notice).toBeNull();
    repository.saveSettings({ paused: false });
    act(() => window.dispatchEvent(new Event('focus')));
    expect(result.current.notice).toMatchObject({ key: '2026-11-09@14:00' });
  });

  it('en silencio no muestra la ventana de las 20:00 aunque no se haya servido', () => {
    const { result, repository } = setup({ now: at(9, 22) });
    expect(result.current.notice).toBeNull();
    expect(repository.wasWindowServed('2026-11-09@20:00')).toBe(false);
  });

  it('un día inactivo no tiene avisos', () => {
    // El 14/11/2026 es sábado.
    const { result } = setup({ now: at(14, 9), settings: { activeDays: [1, 2, 3, 4, 5] } });
    expect(result.current.notice).toBeNull();
  });

  it('al cambiar de día aparece la primera ventana del día nuevo', () => {
    const { result } = setup({ now: at(9, 20, 30), served: ['2026-11-09@20:00'] });
    expect(result.current.notice).toBeNull();
    act(() => vi.advanceTimersByTime(12 * HOUR));
    expect(result.current.notice).toMatchObject({ key: '2026-11-10@08:00' });
  });

  it('emite a través de notify; si fue nativa no muestra el aviso de la página (HT-06.1-A)', () => {
    vi.setSystemTime(at(9, 14, 5));
    const repository = createRepository(createFakeStorage());
    const openTip = vi.fn();
    const emit = vi.fn((notice, channels) => {
      channels.openTip(notice.tip.id);
      return 'native';
    });
    const { result } = renderHook(() => useNoticeScheduler({ tips: TIPS, repository, emit, openTip }));
    expect(emit).toHaveBeenCalledTimes(1);
    expect(emit.mock.calls[0][0]).toMatchObject({ key: '2026-11-09@14:00' });
    expect(openTip).toHaveBeenCalledWith(emit.mock.calls[0][0].tip.id);
    expect(result.current.notice).toBeNull();
    expect(repository.wasWindowServed('2026-11-09@14:00')).toBe(true);
  });

  it('dismiss cierra el aviso y al desmontar no quedan temporizadores', () => {
    const { result, unmount } = setup({ now: at(9, 9) });
    act(() => result.current.dismiss());
    expect(result.current.notice).toBeNull();
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
