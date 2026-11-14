// @vitest-environment node
// Web Push completo (WP-P1, D-26): agenda (HT-07.2-A), sin duplicados (HU-15.2-A) y límites y
// reintentos (HT-07.2-B). Sin red ni claves reales: webpush y el almacén son simulados.
import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { getDueWindow, MAX_DELAY_MINUTES, MIN_MINUTES_BETWEEN_SENDS, tipForWindow } from '../../../server/delivery.js';
import { isRetriable, MAX_ATTEMPTS, sendScheduled, sendToSubscription } from '../../../server/push.js';
import { handleDispatch, handleSubscribe } from '../../../server/handlers.js';
import { createMemoryStore } from '../../../server/store.js';
import { subscriptionId } from '../../../server/subscriptions.js';
import { getTips } from '../../../src/services/catalog.js';
import { ENDPOINT, makeBody, makeRecord, pushError, TIP, VAPID } from './fixtures.js';

// Monterrey usa UTC−6 todo el año. El 9/11/2026 es lunes. Ajustes por defecto: cada 3 h desde las
// 08:00 (ventanas 08, 11, 14, 17 y 20 h) y silencio de 21:00 a 08:00.
const utc = (hours, minutes = 0) => new Date(Date.UTC(2026, 10, 9, hours, minutes));
const monterrey = (hours, minutes = 0) => utc(hours + 6, minutes);
const TIPS = getTips();

describe('getDueWindow: agenda por zona horaria con clave idempotente', () => {
  it('a las 11:07 de Monterrey toca la ventana de las 11:00, con su clave local', () => {
    const due = getDueWindow(makeRecord('a'), monterrey(11, 7));
    expect(due.key).toBe('2026-11-09@11:00');
  });

  it('usa la hora local de cada suscripción: a la misma hora UTC, Monterrey y Tijuana están en ventanas distintas', () => {
    const now = utc(19, 7); // 13:07 en Monterrey (UTC−6), 11:07 en Tijuana (UTC−8)
    // En Monterrey la ventana vigente es la de las 11:00, pero empezó hace más de 60 min: no se envía.
    expect(getDueWindow(makeRecord('mty'), now)).toBeNull();
    expect(getDueWindow(makeRecord('tij', { timeZone: 'America/Tijuana' }), now).key).toBe('2026-11-09@11:00');
    expect(getDueWindow(makeRecord('mty'), utc(20, 7)).key).toBe('2026-11-09@14:00');
  });

  it('no repite una ventana ya enviada (HU-15.2-A)', () => {
    const record = makeRecord('a', { lastWindowKey: '2026-11-09@11:00' });
    expect(getDueWindow(record, monterrey(11, 37))).toBeNull();
    expect(getDueWindow(record, monterrey(14, 7)).key).toBe('2026-11-09@14:00');
  });

  it(`si el job se retrasa más de ${MAX_DELAY_MINUTES} min, la ventana se omite: nunca llega atrasada`, () => {
    expect(getDueWindow(makeRecord('a'), monterrey(12, 0))).not.toBeNull();
    expect(getDueWindow(makeRecord('a'), monterrey(12, 1))).toBeNull();
  });

  it('no envía en silencio, en pausa ni en un día sin avisos (prueba de no envío, HT-07.2-B)', () => {
    expect(getDueWindow(makeRecord('a'), monterrey(21, 7))).toBeNull();
    expect(getDueWindow(makeRecord('a'), monterrey(7, 59))).toBeNull();
    expect(getDueWindow(makeRecord('a', { settings: { paused: true } }), monterrey(11, 7))).toBeNull();
    // El 9/11/2026 es lunes (1): solo martes activo.
    expect(getDueWindow(makeRecord('a', { settings: { activeDays: [2] } }), monterrey(11, 7))).toBeNull();
  });

  it(`límite de frecuencia: nunca dos avisos con menos de ${MIN_MINUTES_BETWEEN_SENDS} min de diferencia`, () => {
    // Se le envió la ventana de las 11:00 a las 11:00 y después cambió a cada 2 h (ventanas pares).
    // A las 12:07 la ventana de las 12:00 es nueva, pero solo pasaron 67 min: todavía no.
    // A las 12:31 ya pasaron 91 min: sí.
    const lastSentAt = monterrey(11, 0).toISOString();
    const record = makeRecord('a', { settings: { intervalMinutes: 120, startTime: '08:00' }, lastWindowKey: '2026-11-09@10:00', lastSentAt });
    expect(getDueWindow(record, monterrey(12, 7))).toBeNull();
    expect(getDueWindow(record, monterrey(12, 31)).key).toBe('2026-11-09@12:00');
  });

  it('con una zona horaria desconocida no envía', () => {
    expect(getDueWindow(makeRecord('a', { timeZone: 'Marte/Olimpo' }), monterrey(11, 7))).toBeNull();
  });
});

describe('tipForWindow', () => {
  it('es determinista y cambia entre ventanas del mismo día', () => {
    const at11 = new Date(2026, 10, 9, 11, 0);
    const at14 = new Date(2026, 10, 9, 14, 0);
    expect(tipForWindow(TIPS, at11)).toBe(tipForWindow(TIPS, new Date(2026, 10, 9, 11, 0)));
    expect(tipForWindow(TIPS, at11)).not.toBe(tipForWindow(TIPS, at14));
    expect(tipForWindow([], at11)).toBeNull();
  });
});

describe('reintento acotado (HT-07.2-B)', () => {
  const record = makeRecord('a');
  const noWait = vi.fn(async () => {});

  it.each([429, 500, 503, undefined])('reintenta una vez ante un error temporal (%s)', async (status) => {
    expect(isRetriable(pushError(status))).toBe(true);
    const webpush = { sendNotification: vi.fn().mockRejectedValueOnce(pushError(status)).mockResolvedValueOnce({}) };
    const outcome = await sendToSubscription(record, {}, { webpush, store: createMemoryStore(), vapid: VAPID, sleep: noWait });
    expect(outcome).toBe('sent');
    expect(webpush.sendNotification).toHaveBeenCalledTimes(2);
  });

  it(`no pasa de ${MAX_ATTEMPTS} intentos y registra el error sin datos de la suscripción`, async () => {
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    const webpush = { sendNotification: vi.fn().mockRejectedValue(pushError(503)) };
    const outcome = await sendToSubscription(record, {}, { webpush, store: createMemoryStore(), vapid: VAPID, sleep: noWait });
    expect(outcome).toBe('failed');
    expect(webpush.sendNotification).toHaveBeenCalledTimes(MAX_ATTEMPTS);
    expect(JSON.stringify(log.mock.calls)).not.toContain(ENDPOINT);
    log.mockRestore();
  });

  it('un error definitivo (400) no se reintenta', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(isRetriable(pushError(400))).toBe(false);
    const webpush = { sendNotification: vi.fn().mockRejectedValue(pushError(400)) };
    await sendToSubscription(record, {}, { webpush, store: createMemoryStore(), vapid: VAPID, sleep: noWait });
    expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
    vi.restoreAllMocks();
  });
});

describe('sendScheduled: un aviso por ventana y suscripción', () => {
  const setup = async (records) => {
    const store = createMemoryStore();
    for (const record of records) await store.save(record);
    const webpush = { sendNotification: vi.fn(async () => ({})) };
    return { store, webpush };
  };

  it('envía la ventana vigente, guarda su clave y no la repite en la siguiente corrida', async () => {
    const { store, webpush } = await setup([makeRecord('a')]);
    const first = await sendScheduled({ webpush, store, vapid: VAPID, now: monterrey(11, 7), tips: TIPS });
    expect(first).toEqual({ sent: 1, removed: 0, failed: 0, skipped: 0 });
    expect((await store.get('a')).lastWindowKey).toBe('2026-11-09@11:00');

    const second = await sendScheduled({ webpush, store, vapid: VAPID, now: monterrey(11, 37), tips: TIPS });
    expect(second.skipped).toBe(1);
    expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
  });

  it('el aviso abre la ficha del consejo de esa ventana (HT-06.1-B)', async () => {
    const { store, webpush } = await setup([makeRecord('a')]);
    await sendScheduled({ webpush, store, vapid: VAPID, now: monterrey(11, 7), tips: TIPS });
    const payload = JSON.parse(webpush.sendNotification.mock.calls[0][1]);
    const tip = tipForWindow(TIPS, new Date(2026, 10, 9, 11, 0));
    expect(payload).toEqual({ title: tip.title, body: tip.summary, url: `/tip/${tip.id}` });
  });

  it('si el envío falla no guarda la clave: la siguiente corrida lo intenta otra vez', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { store } = await setup([makeRecord('a')]);
    const webpush = { sendNotification: vi.fn().mockRejectedValue(pushError(400)) };
    await sendScheduled({ webpush, store, vapid: VAPID, now: monterrey(11, 7), tips: TIPS, sleep: async () => {} });
    expect((await store.get('a')).lastWindowKey).toBeUndefined();
    vi.restoreAllMocks();
  });

  // Revisión de seguridad del PR #69: guardar la ventana no debe resucitar una suscripción borrada.
  it('si la persona se da de baja mientras se envía, el registro no vuelve a aparecer', async () => {
    const { store } = await setup([makeRecord('a')]);
    const webpush = {
      sendNotification: vi.fn(async () => {
        await store.remove('a'); // la baja llega justo durante el envío
        return {};
      }),
    };
    const result = await sendScheduled({ webpush, store, vapid: VAPID, now: monterrey(11, 7), tips: TIPS });
    expect(result.sent).toBe(1);
    expect(await store.get('a')).toBeNull();
    expect(await store.list()).toEqual([]);
  });

  it('si cambian los ajustes mientras se envía, se conservan los nuevos', async () => {
    const { store } = await setup([makeRecord('a')]);
    const webpush = {
      sendNotification: vi.fn(async () => {
        await store.save({ ...(await store.get('a')), settings: { paused: true } });
        return {};
      }),
    };
    await sendScheduled({ webpush, store, vapid: VAPID, now: monterrey(11, 7), tips: TIPS });
    const record = await store.get('a');
    expect(record.settings).toEqual({ paused: true });
    expect(record.lastWindowKey).toBe('2026-11-09@11:00');
  });

  it('en silencio no envía nada', async () => {
    const { store, webpush } = await setup([makeRecord('a'), makeRecord('b')]);
    const result = await sendScheduled({ webpush, store, vapid: VAPID, now: monterrey(22, 7), tips: TIPS });
    expect(result.skipped).toBe(2);
    expect(webpush.sendNotification).not.toHaveBeenCalled();
  });
});

describe('endpoints', () => {
  const DISPATCH = 'https://tamalecho.test/api/push/dispatch';
  const env = { DISPATCH_SECRET: 'secreto', VAPID_SUBJECT: 's', VAPID_PUBLIC_KEY: 'p', VAPID_PRIVATE_KEY: 'k' };
  const post = (url) => new Request(url, { method: 'POST', headers: { authorization: 'Bearer secreto' } });

  it('?mode=scheduled usa la agenda; sin modo sigue siendo el envío de prueba', async () => {
    const store = createMemoryStore();
    await store.save(makeRecord('a'));
    const webpush = { sendNotification: vi.fn(async () => ({})) };
    const deps = { store, webpush, env, now: monterrey(11, 7), getFeaturedTip: () => TIP, getTips };

    const scheduled = await (await handleDispatch(post(`${DISPATCH}?mode=scheduled`), deps)).json();
    expect(scheduled).toMatchObject({ mode: 'scheduled', sent: 1 });
    const again = await (await handleDispatch(post(`${DISPATCH}?mode=scheduled`), deps)).json();
    expect(again).toMatchObject({ sent: 0, skipped: 1 });

    // El envío de prueba no mira la clave: sirve para comprobar que llega un aviso cuando se quiera.
    const test = await (await handleDispatch(post(DISPATCH), deps)).json();
    expect(test).toMatchObject({ sent: 1 });
  });

  it('al volver a sincronizar los ajustes se conserva la última ventana enviada', async () => {
    const store = createMemoryStore();
    const id = subscriptionId(ENDPOINT);
    const subscribe = (body) =>
      handleSubscribe(new Request('https://tamalecho.test/api/push/subscribe', { method: 'POST', body: JSON.stringify(body) }), { store });

    await subscribe(makeBody());
    await store.save({ ...(await store.get(id)), lastWindowKey: '2026-11-09@11:00', lastSentAt: monterrey(11, 7).toISOString() });
    await subscribe(makeBody({ settings: { intervalMinutes: 180, paused: true } }));
    const record = await store.get(id);
    expect(record.settings.paused).toBe(true);
    expect(record.lastWindowKey).toBe('2026-11-09@11:00');
  });

  it('el cuerpo del alta no puede escribir la clave de la última ventana', async () => {
    const store = createMemoryStore();
    await handleSubscribe(
      new Request('https://tamalecho.test/api/push/subscribe', {
        method: 'POST',
        body: JSON.stringify({ ...makeBody(), lastWindowKey: '2099-01-01@08:00', lastSentAt: 'x' }),
      }),
      { store },
    );
    const record = await store.get(subscriptionId(ENDPOINT));
    expect(record.lastWindowKey).toBeUndefined();
    expect(record.lastSentAt).toBeUndefined();
  });
});

describe('workflow push-dispatch', () => {
  it('corre cada 30 min fuera de la hora en punto, usa el modo programado y no se encima', () => {
    const workflow = readFileSync('.github/workflows/push-dispatch.yml', 'utf8');
    expect(workflow).toContain("cron: '7,37 * * * *'");
    expect(workflow).toContain("github.event_name == 'schedule' && 'scheduled'");
    expect(workflow).toContain('dispatch?mode=${MODE}');
    expect(workflow).toMatch(/concurrency:\s+group: push-dispatch\s+cancel-in-progress: false/);
  });
});
