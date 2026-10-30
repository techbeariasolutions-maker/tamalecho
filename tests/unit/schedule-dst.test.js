import process from 'node:process';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getCurrentWindow, getNextWindow, getWindowsForDay, idempotencyKey } from '../../src/services/schedule.js';

// Cambio de horario de verano (HT-04.1-B). La mayor parte de México ya no lo usa, pero Tijuana sí:
// en 2026 adelanta el reloj el domingo 8 de marzo y lo atrasa el domingo 1 de noviembre.
// Las ventanas son de reloj local, así que deben seguir siendo 08, 11, 14, 17 y 20 h esos días.
const originalTz = process.env.TZ;

beforeAll(() => {
  process.env.TZ = 'America/Tijuana';
});

afterAll(() => {
  if (originalTz === undefined) delete process.env.TZ;
  else process.env.TZ = originalTz;
});

const hoursOf = (windows) => windows.map((window) => idempotencyKey(window).slice(-5));

describe('motor de horario con cambio de horario de verano (America/Tijuana)', () => {
  it('la zona horaria de la prueba sí tiene cambio de horario', () => {
    // Si este caso falla, el entorno ignora TZ y los siguientes no prueban nada.
    const winter = new Date(2026, 0, 15, 12).getTimezoneOffset();
    const summer = new Date(2026, 6, 15, 12).getTimezoneOffset();
    expect(winter - summer).toBe(60);
  });

  it.each([
    ['adelanta el reloj', 2, 8],
    ['atrasa el reloj', 10, 1],
  ])('el día que %s las ventanas no se mueven', (_label, month, day) => {
    const windows = getWindowsForDay(new Date(2026, month, day, 0), {
      intervalMinutes: 180,
      startTime: '08:00',
      quietStart: '21:00',
      quietEnd: '08:00',
      lunchStart: '12:00',
      lunchEnd: '16:00',
      activeDays: [0, 1, 2, 3, 4, 5, 6],
      paused: false,
    });
    expect(hoursOf(windows)).toEqual(['08:00', '11:00', '14:00', '17:00', '20:00']);
  });

  it('la ventana vigente y la siguiente son correctas a través del cambio', () => {
    expect(idempotencyKey(getCurrentWindow(new Date(2026, 2, 8, 9, 0)))).toBe('2026-03-08@08:00');
    // Sábado 7 de marzo a las 22:00 → domingo 8 a las 08:00, aunque esa noche dure una hora menos.
    expect(idempotencyKey(getNextWindow(new Date(2026, 2, 7, 22, 0)))).toBe('2026-03-08@08:00');
  });
});
