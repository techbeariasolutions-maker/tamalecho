import { describe, expect, it } from 'vitest';
import {
  getRoute,
  getStreak,
  getTipStatus,
  localDayKey,
  readingMinutes,
  summarizeProgress,
  WORDS_PER_MINUTE,
} from '../../src/services/progress.js';
import { getFeaturedTip, getTips } from '../../src/services/catalog.js';

// Rediseño D-24: progreso local y «Ruta diaria». Fechas fijas (el 9/11/2026 es lunes).
const at = (day, hours = 10) => new Date(2026, 10, day, hours);
const reading = (id, day, hours = 10) => ({ id, at: at(day, hours).toISOString() });

describe('readingMinutes', () => {
  it('estima minutos con 200 palabras por minuto y nunca menos de 1', () => {
    const words = (n) => Array.from({ length: n }, () => 'palabra').join(' ');
    expect(readingMinutes({ summary: 'corto' })).toBe(1);
    expect(readingMinutes({ explanation: words(WORDS_PER_MINUTE * 3) })).toBe(3);
    expect(readingMinutes({ summary: words(250), example: words(250) })).toBe(3);
  });
});

describe('localDayKey', () => {
  it('usa el día local, no el de UTC', () => {
    expect(localDayKey(new Date(2026, 10, 9, 23, 30))).toBe('2026-11-09');
    expect(localDayKey(new Date(2026, 0, 5, 0, 5))).toBe('2026-01-05');
  });
});

describe('getStreak', () => {
  it('sin lecturas la racha es 0', () => {
    expect(getStreak([], at(9))).toBe(0);
  });

  it('cuenta días seguidos hasta hoy, con varias lecturas el mismo día', () => {
    const history = [reading('SCR-01', 7), reading('SCR-02', 8), reading('SCR-03', 8, 18), reading('PMI-01', 9)];
    expect(getStreak(history, at(9, 20))).toBe(3);
  });

  it('si hoy aún no hay lecturas, la racha sigue viva desde ayer', () => {
    expect(getStreak([reading('SCR-01', 7), reading('SCR-02', 8)], at(9, 8))).toBe(2);
  });

  it('un día sin lecturas la corta', () => {
    expect(getStreak([reading('SCR-01', 6), reading('SCR-02', 8)], at(9, 8))).toBe(1);
    expect(getStreak([reading('SCR-01', 6)], at(9))).toBe(0);
  });
});

describe('getRoute', () => {
  it('da 5 días con hoy en medio y el consejo destacado de cada día', () => {
    const route = getRoute(getFeaturedTip, at(9));
    expect(route).toHaveLength(5);
    expect(route.map((step) => step.date.getDate())).toEqual([7, 8, 9, 10, 11]);
    expect(route.map((step) => step.isToday)).toEqual([false, false, true, false, false]);
    expect(route[2].tip).toEqual(getFeaturedTip(at(9)));
    for (const step of route) expect(step.tip).toEqual(getFeaturedTip(step.date));
  });

  it('cruza el fin de año sin saltarse días', () => {
    const route = getRoute(getFeaturedTip, new Date(2026, 11, 31, 10));
    expect(route.map((step) => localDayKey(step.date))).toEqual([
      '2026-12-29',
      '2026-12-30',
      '2026-12-31',
      '2027-01-01',
      '2027-01-02',
    ]);
  });
});

describe('estado y resumen del progreso', () => {
  it('completado gana a leído, y leído a nuevo', () => {
    const readIds = new Set(['SCR-01', 'SCR-02']);
    const completed = { 'SCR-02': at(9).toISOString() };
    expect(getTipStatus('SCR-01', readIds, completed)).toBe('leido');
    expect(getTipStatus('SCR-02', readIds, completed)).toBe('completado');
    expect(getTipStatus('SCR-03', readIds, completed)).toBe('nuevo');
  });

  it('resume por enfoque sin contar dos veces el mismo consejo', () => {
    const tips = getTips();
    const history = [reading('SCR-01', 8), reading('SCR-01', 9), reading('PMI-01', 9)];
    const completed = { 'SCR-01': at(9).toISOString(), 'SCR-05': at(9).toISOString() };
    const summary = summarizeProgress({ tips, history, completed });
    expect(summary.total).toBe(tips.length);
    // SCR-05 está completado sin lectura registrada (el historial guarda solo 50): cuenta como leído.
    expect(summary.read).toBe(3);
    expect(summary.completed).toBe(2);
    expect(summary.byFramework.scrum).toEqual({ total: 12, read: 2, completed: 2 });
    expect(summary.byFramework.pmbok).toEqual({ total: 12, read: 1, completed: 0 });
  });
});
