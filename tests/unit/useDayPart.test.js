import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useDayPart } from '../../src/hooks/useDayPart.js';
import { DEFAULT_SETTINGS } from '../../src/services/schedule.js';

// Fechas locales construidas a mano (CLAUDE.md §11). El 9/11/2026 es lunes.
const at = (hours, minutes = 0, seconds = 0) => new Date(2026, 10, 9, hours, minutes, seconds);

describe('useDayPart (HU-05.1-B)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('devuelve la franja de la hora actual', () => {
    vi.setSystemTime(at(9));
    const { result } = renderHook(() => useDayPart(DEFAULT_SETTINGS));
    expect(result.current).toBe('despierto');
  });

  it('cambia sola al llegar el inicio de la comida, con un solo temporizador', () => {
    vi.setSystemTime(at(11, 59, 30));
    const { result } = renderHook(() => useDayPart(DEFAULT_SETTINGS));
    expect(result.current).toBe('despierto');
    expect(vi.getTimerCount()).toBe(1);

    act(() => vi.advanceTimersByTime(29_000));
    expect(result.current).toBe('despierto');

    act(() => vi.advanceTimersByTime(1_000));
    expect(result.current).toBe('hambre');
    expect(vi.getTimerCount()).toBe(1);
  });

  it('recalcula al volver a la pestaña aunque el temporizador se haya retrasado', () => {
    vi.setSystemTime(at(13));
    const { result } = renderHook(() => useDayPart(DEFAULT_SETTINGS));
    expect(result.current).toBe('hambre');

    // El equipo estuvo suspendido: el reloj avanzó sin que corriera ningún temporizador.
    vi.setSystemTime(at(21));
    act(() => window.dispatchEvent(new Event('focus')));
    expect(result.current).toBe('cansado');
  });

  it('respeta la franja de comida de los ajustes', () => {
    vi.setSystemTime(at(12, 30));
    const settings = { ...DEFAULT_SETTINGS, lunchStart: '13:00', lunchEnd: '15:00' };
    const { result } = renderHook(() => useDayPart(settings));
    expect(result.current).toBe('despierto');
  });

  it('al desmontar no deja temporizadores pendientes', () => {
    vi.setSystemTime(at(9));
    const { unmount } = renderHook(() => useDayPart(DEFAULT_SETTINGS));
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
