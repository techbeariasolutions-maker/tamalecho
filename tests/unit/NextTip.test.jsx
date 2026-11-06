import { act, render, renderHook, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NextTip, { describeNextWindow } from '../../src/features/scheduler/NextTip.jsx';
import { useNextWindow } from '../../src/hooks/useNextWindow.js';
import { DEFAULT_SETTINGS } from '../../src/services/schedule.js';

// «Próximo consejo» (HU-04.1-A). Fechas locales construidas a mano; el 9/11/2026 es lunes.
const at = (day, hours, minutes = 0) => new Date(2026, 10, day, hours, minutes);
const settings = (overrides) => ({ ...DEFAULT_SETTINGS, ...overrides });

describe('describeNextWindow', () => {
  it('dice hoy, mañana o el día de la semana con la hora local', () => {
    expect(describeNextWindow(at(9, 13), at(9, 14))).toBe('hoy a las 14:00');
    expect(describeNextWindow(at(9, 22), at(10, 8))).toBe('mañana a las 08:00');
    expect(describeNextWindow(at(13, 22), at(16, 8))).toBe('el lunes a las 08:00');
  });
});

describe('NextTip', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('T2-05: a las 13:00 con cadencia de 2 h, el próximo consejo es hoy a las 14:00', () => {
    vi.setSystemTime(at(9, 13));
    render(<NextTip settings={settings({ intervalMinutes: 120 })} />);
    expect(screen.getByText('Próximo consejo: hoy a las 14:00.')).toBeInTheDocument();
  });

  it('después de la última ventana del día anuncia la de mañana', () => {
    vi.setSystemTime(at(9, 20, 30));
    render(<NextTip settings={DEFAULT_SETTINGS} />);
    expect(screen.getByText('Próximo consejo: mañana a las 08:00.')).toBeInTheDocument();
  });

  it('salta los días sin avisos', () => {
    // Viernes 13/11 a las 22:00, solo de lunes a viernes: el siguiente es el lunes.
    vi.setSystemTime(at(13, 22));
    render(<NextTip settings={settings({ activeDays: [1, 2, 3, 4, 5] })} />);
    expect(screen.getByText('Próximo consejo: el lunes a las 08:00.')).toBeInTheDocument();
  });

  it('en pausa dice «Avisos en pausa»', () => {
    vi.setSystemTime(at(9, 13));
    render(<NextTip settings={settings({ paused: true })} />);
    expect(screen.getByText('Avisos en pausa.')).toBeInTheDocument();
  });

  it('se actualiza sola cuando empieza la ventana anunciada', () => {
    vi.setSystemTime(at(9, 13, 59));
    render(<NextTip settings={DEFAULT_SETTINGS} />);
    expect(screen.getByText('Próximo consejo: hoy a las 14:00.')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText('Próximo consejo: hoy a las 17:00.')).toBeInTheDocument();
  });
});

describe('useNextWindow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('usa un solo temporizador y recalcula al volver a la pestaña', () => {
    vi.setSystemTime(at(9, 9));
    const { result } = renderHook(() => useNextWindow(DEFAULT_SETTINGS));
    expect(result.current.next).toEqual(at(9, 11));
    expect(vi.getTimerCount()).toBe(1);

    // El equipo estuvo suspendido 6 horas: ningún temporizador corrió.
    vi.setSystemTime(at(9, 15));
    act(() => window.dispatchEvent(new Event('focus')));
    expect(result.current.next).toEqual(at(9, 17));
    expect(vi.getTimerCount()).toBe(1);
  });
});
