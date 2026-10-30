import { describe, expect, it } from 'vitest';
import {
  DEFAULT_SETTINGS,
  getCurrentWindow,
  getDayPart,
  getNextWindow,
  getWindowsForDay,
  idempotencyKey,
  isQuietTime,
  validateSettings,
} from '../../src/services/schedule.js';

// Fechas locales construidas a mano (CLAUDE.md §11). El 29/10/2026 es jueves.
const at = (day, hours, minutes = 0, month = 9) => new Date(2026, month, day, hours, minutes);
const hoursOf = (windows) => windows.map((window) => idempotencyKey(window).slice(-5));
const settings = (overrides) => ({ ...DEFAULT_SETTINGS, ...overrides });

describe('motor de horario', () => {
  describe('getWindowsForDay (T2-01)', () => {
    it('con 3 horas desde las 08:00 da 08, 11, 14, 17 y 20', () => {
      expect(hoursOf(getWindowsForDay(at(29, 0)))).toEqual(['08:00', '11:00', '14:00', '17:00', '20:00']);
    });

    it('con 2 horas desde las 08:00 da 08, 10, 12, 14, 16, 18 y 20', () => {
      const windows = getWindowsForDay(at(29, 0), settings({ intervalMinutes: 120 }));
      expect(hoursOf(windows)).toEqual(['08:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00']);
    });

    it('omite las ventanas que caen en silencio', () => {
      // Silencio de 15:00 a 18:00: se omite la de las 17:00. Como ya no hay silencio nocturno, entra la de las 23:00.
      const windows = getWindowsForDay(at(29, 0), settings({ quietStart: '15:00', quietEnd: '18:00' }));
      expect(hoursOf(windows)).toEqual(['08:00', '11:00', '14:00', '20:00', '23:00']);
    });

    it('un día inactivo no tiene ventanas', () => {
      // 31/10/2026 es sábado (6).
      expect(getWindowsForDay(at(31, 9), settings({ activeDays: [1, 2, 3, 4, 5] }))).toEqual([]);
    });
  });

  describe('isQuietTime', () => {
    it('el silencio 21:00–08:00 cruza la medianoche', () => {
      expect(isQuietTime(at(29, 20, 59))).toBe(false);
      expect(isQuietTime(at(29, 21, 0))).toBe(true);
      expect(isQuietTime(at(29, 23, 59))).toBe(true);
      expect(isQuietTime(at(30, 0, 0))).toBe(true);
      expect(isQuietTime(at(30, 7, 59))).toBe(true);
      expect(isQuietTime(at(30, 8, 0))).toBe(false);
    });

    it('funciona con un silencio dentro del mismo día', () => {
      const quiet = settings({ quietStart: '13:00', quietEnd: '15:00' });
      expect(isQuietTime(at(29, 12, 59), quiet)).toBe(false);
      expect(isQuietTime(at(29, 14, 0), quiet)).toBe(true);
      expect(isQuietTime(at(29, 15, 0), quiet)).toBe(false);
    });
  });

  describe('getCurrentWindow (T2-02)', () => {
    it('antes de la primera ventana no hay ventana vigente', () => {
      expect(getCurrentWindow(at(29, 7, 59))).toBeNull();
    });

    it('justo al empezar una ventana, esa es la vigente', () => {
      expect(idempotencyKey(getCurrentWindow(at(29, 11, 0)))).toBe('2026-10-29@11:00');
    });

    it('al volver de una suspensión de 9 horas devuelve solo la más reciente', () => {
      // Se suspendió a las 08:30 y volvió a las 17:30: pasaron las ventanas de 11, 14 y 17.
      const before = getCurrentWindow(at(29, 8, 30));
      const after = getCurrentWindow(at(29, 17, 30));
      expect(idempotencyKey(before)).toBe('2026-10-29@08:00');
      expect(idempotencyKey(after)).toBe('2026-10-29@17:00');
    });

    it('después de la medianoche no arrastra ventanas del día anterior', () => {
      expect(getCurrentWindow(at(29, 23, 59))).not.toBeNull();
      expect(getCurrentWindow(at(30, 0, 0))).toBeNull();
    });
  });

  describe('getNextWindow', () => {
    it('da la siguiente ventana del mismo día', () => {
      expect(idempotencyKey(getNextWindow(at(29, 13, 0), settings({ intervalMinutes: 120 })))).toBe(
        '2026-10-29@14:00',
      );
    });

    it('después de la última ventana pasa al día siguiente', () => {
      expect(idempotencyKey(getNextWindow(at(29, 20, 0)))).toBe('2026-10-30@08:00');
    });

    it('salta los días inactivos', () => {
      // Viernes 30/10 a las 21:00, solo de lunes a viernes → lunes 2/11 a las 08:00.
      const next = getNextWindow(at(30, 21, 0), settings({ activeDays: [1, 2, 3, 4, 5] }));
      expect(idempotencyKey(next)).toBe('2026-11-02@08:00');
    });

    it('cruza el fin de mes', () => {
      expect(idempotencyKey(getNextWindow(at(31, 22, 0)))).toBe('2026-11-01@08:00');
    });

    it('devuelve null si el silencio cubre todo el día', () => {
      expect(getNextWindow(at(29, 9), settings({ quietStart: '00:00', quietEnd: '23:59' }))).toBeNull();
    });
  });

  describe('idempotencyKey', () => {
    it('usa la fecha y la hora locales con ceros a la izquierda', () => {
      expect(idempotencyKey(new Date(2026, 0, 5, 8, 0))).toBe('2026-01-05@08:00');
    });

    it('da la misma clave para la misma ventana y claves distintas para ventanas distintas', () => {
      const keys = getWindowsForDay(at(29, 0), settings({ intervalMinutes: 120 })).map(idempotencyKey);
      expect(new Set(keys).size).toBe(keys.length);
      expect(idempotencyKey(at(29, 14))).toBe(idempotencyKey(new Date(2026, 9, 29, 14, 0)));
    });
  });

  describe('getDayPart', () => {
    it.each([
      [9, 'despierto'],
      [14, 'hambre'],
      [17, 'atento'],
      [20, 'cansado'],
      [3, 'cansado'],
    ])('a las %i:00 es «%s»', (hour, part) => {
      expect(getDayPart(at(29, hour))).toBe(part);
    });

    it('respeta los límites de cada franja', () => {
      expect(getDayPart(at(29, 4, 59))).toBe('cansado');
      expect(getDayPart(at(29, 5, 0))).toBe('despierto');
      expect(getDayPart(at(29, 11, 59))).toBe('despierto');
      expect(getDayPart(at(29, 12, 0))).toBe('hambre');
      expect(getDayPart(at(29, 16, 0))).toBe('atento');
      expect(getDayPart(at(29, 19, 59))).toBe('atento');
    });

    it('la franja de comida configurada mueve «hambre»', () => {
      const lunch = settings({ lunchStart: '13:00', lunchEnd: '15:00' });
      expect(getDayPart(at(29, 12, 30), lunch)).toBe('despierto');
      expect(getDayPart(at(29, 13, 30), lunch)).toBe('hambre');
      expect(getDayPart(at(29, 15, 0), lunch)).toBe('atento');
    });
  });

  describe('validateSettings', () => {
    it('sin datos devuelve los valores recomendados y ningún error', () => {
      expect(validateSettings(undefined)).toEqual({ settings: { ...DEFAULT_SETTINGS, activeDays: [0, 1, 2, 3, 4, 5, 6] }, errors: [] });
      expect(validateSettings('basura').errors).toEqual([]);
    });

    it('conserva los valores válidos', () => {
      const { settings: result, errors } = validateSettings({
        intervalMinutes: 120,
        startTime: '09:30',
        activeDays: [5, 1, 3],
        paused: true,
      });
      expect(errors).toEqual([]);
      expect(result).toMatchObject({ intervalMinutes: 120, startTime: '09:30', activeDays: [1, 3, 5], paused: true });
    });

    it('reemplaza los inválidos por los recomendados y reporta un error por campo', () => {
      const { settings: result, errors } = validateSettings({
        intervalMinutes: 90,
        startTime: '25:00',
        quietStart: '9:00',
        activeDays: [],
        paused: 'sí',
      });
      expect(result).toEqual({ ...DEFAULT_SETTINGS, activeDays: [0, 1, 2, 3, 4, 5, 6] });
      expect(errors.map((error) => error.field)).toEqual([
        'intervalMinutes',
        'startTime',
        'quietStart',
        'activeDays',
        'paused',
      ]);
      expect(errors.every((error) => typeof error.message === 'string' && error.message.length > 0)).toBe(true);
    });

    it('rechaza días repetidos o fuera de rango', () => {
      expect(validateSettings({ activeDays: [1, 1] }).errors).toHaveLength(1);
      expect(validateSettings({ activeDays: [7] }).errors).toHaveLength(1);
    });

    it('rechaza una comida que termina antes de empezar', () => {
      const { settings: result, errors } = validateSettings({ lunchStart: '15:00', lunchEnd: '13:00' });
      expect(errors.map((error) => error.field)).toEqual(['lunchEnd']);
      expect(result.lunchStart).toBe('12:00');
      expect(result.lunchEnd).toBe('16:00');
    });
  });
});
