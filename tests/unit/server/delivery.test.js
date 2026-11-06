// @vitest-environment node
import { describe, expect, it, vi } from 'vitest';
import { shouldDeliver, toWallClock } from '../../../server/delivery.js';
import { handleDispatch } from '../../../server/handlers.js';
import { sendToAll } from '../../../server/push.js';
import { createMemoryStore } from '../../../server/store.js';
import { makeRecord, TIP, VAPID } from './fixtures.js';

// Silencio remoto (HU-07.2-B, T2-16). Los instantes se construyen en UTC para que la prueba dé
// lo mismo en Windows, en el CI y en cualquier zona horaria de la máquina.
// Monterrey: UTC−6 todo el año. Madrid: UTC+1 en noviembre. 9/11/2026 es lunes.
const utc = (day, hours, minutes = 0) => new Date(Date.UTC(2026, 10, day, hours, minutes));
const fullSettings = (overrides = {}) => ({
  intervalMinutes: 180,
  startTime: '08:00',
  quietStart: '21:00',
  quietEnd: '08:00',
  lunchStart: '12:00',
  lunchEnd: '16:00',
  activeDays: [0, 1, 2, 3, 4, 5, 6],
  paused: false,
  ...overrides,
});

describe('toWallClock', () => {
  it('da la hora de reloj de la zona indicada', () => {
    const local = toWallClock(utc(9, 15, 30), 'America/Monterrey');
    expect([local.getDate(), local.getHours(), local.getMinutes()]).toEqual([9, 9, 30]);
    const madrid = toWallClock(utc(9, 15, 30), 'Europe/Madrid');
    expect([madrid.getDate(), madrid.getHours()]).toEqual([9, 16]);
  });

  it('cambia de fecha según la zona (lunes 9 en Monterrey, martes 10 en Tokio)', () => {
    const instant = utc(9, 23);
    expect(toWallClock(instant, 'America/Monterrey').getDay()).toBe(1);
    expect(toWallClock(instant, 'Asia/Tokyo').getDay()).toBe(2);
  });
});

describe('shouldDeliver', () => {
  it('fuera de silencio sí envía', () => {
    expect(shouldDeliver(makeRecord('a', { settings: fullSettings() }), utc(9, 15))).toBe(true);
  });

  it('en silencio según la zona de la suscripción no envía (la misma hora UTC, dos zonas)', () => {
    // 03:00 UTC = 21:00 del domingo en Monterrey (silencio) y 04:00 del lunes en Madrid (silencio).
    // 15:00 UTC = 09:00 en Monterrey (sí) y 16:00 en Madrid (sí). 21:00 UTC = 15:00 / 22:00 (sí / no).
    const monterrey = makeRecord('mty', { timeZone: 'America/Monterrey', settings: fullSettings() });
    const madrid = makeRecord('mad', { timeZone: 'Europe/Madrid', settings: fullSettings() });
    expect([shouldDeliver(monterrey, utc(9, 3)), shouldDeliver(madrid, utc(9, 3))]).toEqual([false, false]);
    expect([shouldDeliver(monterrey, utc(9, 15)), shouldDeliver(madrid, utc(9, 15))]).toEqual([true, true]);
    expect([shouldDeliver(monterrey, utc(9, 21)), shouldDeliver(madrid, utc(9, 21))]).toEqual([true, false]);
  });

  it('respeta un silencio configurado que cruza la medianoche', () => {
    const record = makeRecord('a', { settings: fullSettings({ quietStart: '23:00', quietEnd: '06:00' }) });
    // 04:00 UTC = 22:00 del domingo en Monterrey: fuera de ese silencio.
    expect(shouldDeliver(record, utc(9, 4))).toBe(true);
    // 06:00 UTC = 00:00 del lunes en Monterrey: dentro.
    expect(shouldDeliver(record, utc(9, 6))).toBe(false);
  });

  it('en pausa no envía', () => {
    expect(shouldDeliver(makeRecord('a', { settings: fullSettings({ paused: true }) }), utc(9, 15))).toBe(false);
  });

  it('en un día sin avisos no envía', () => {
    // Lunes en Monterrey, con avisos solo el fin de semana.
    const record = makeRecord('a', { settings: fullSettings({ activeDays: [0, 6] }) });
    expect(shouldDeliver(record, utc(9, 15))).toBe(false);
  });

  it('con ajustes incompletos usa los recomendados y con una zona inválida no envía', () => {
    expect(shouldDeliver(makeRecord('a', { settings: {} }), utc(9, 15))).toBe(true);
    expect(shouldDeliver(makeRecord('a', { timeZone: 'Zona/Inexistente', settings: {} }), utc(9, 15))).toBe(false);
  });
});

describe('dispatch con silencio remoto (T2-16)', () => {
  it('solo envía a las suscripciones fuera de silencio y de pausa, y cuenta las omitidas', async () => {
    const store = createMemoryStore();
    await store.save(makeRecord('mty', { timeZone: 'America/Monterrey', settings: fullSettings() }));
    await store.save(makeRecord('mad', { timeZone: 'Europe/Madrid', settings: fullSettings() }));
    await store.save(makeRecord('pausa', { timeZone: 'America/Monterrey', settings: fullSettings({ paused: true }) }));
    const webpush = { sendNotification: vi.fn().mockResolvedValue({ statusCode: 201 }) };

    // 21:00 UTC: 15:00 en Monterrey (envía) y 22:00 en Madrid (silencio).
    const request = new Request('https://tamalecho.test/api/push/dispatch', {
      method: 'POST',
      headers: { authorization: 'Bearer secreto' },
    });
    const env = {
      DISPATCH_SECRET: 'secreto',
      VAPID_SUBJECT: VAPID.subject,
      VAPID_PUBLIC_KEY: VAPID.publicKey,
      VAPID_PRIVATE_KEY: VAPID.privateKey,
    };
    const response = await handleDispatch(request, { store, webpush, env, now: utc(9, 21), getFeaturedTip: () => TIP });

    expect(await response.json()).toEqual({ sent: 1, removed: 0, failed: 0, skipped: 2 });
    expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
    expect(webpush.sendNotification.mock.calls[0][0].endpoint).toMatch(/\/mty$/);
    // Omitir no borra: las suscripciones siguen guardadas.
    expect(await store.list()).toHaveLength(3);
  });

  it('sendToAll sin filtro envía a todas', async () => {
    const store = createMemoryStore();
    await store.save(makeRecord('a'));
    const webpush = { sendNotification: vi.fn().mockResolvedValue({}) };
    expect(await sendToAll({ title: 't', body: 'b', url: '/' }, { webpush, store, vapid: VAPID })).toEqual({
      sent: 1,
      removed: 0,
      failed: 0,
      skipped: 0,
    });
  });
});
