// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { subscriptionId, validateSubscription } from '../../../server/subscriptions.js';
import { ENDPOINT, makeBody } from './fixtures.js';

const fields = (result) => result.errors.map((error) => error.field);

describe('validateSubscription', () => {
  it('acepta una suscripción válida y arma el registro', () => {
    const { value, errors } = validateSubscription(makeBody());
    expect(errors).toEqual([]);
    expect(value).toMatchObject({
      id: subscriptionId(ENDPOINT),
      subscription: { endpoint: ENDPOINT, keys: { p256dh: 'clave-p256dh', auth: 'clave-auth' } },
      timeZone: 'America/Monterrey',
    });
    expect(value.settings.intervalMinutes).toBe(120);
  });

  it('guarda solo lo mínimo: descarta cualquier otro dato del cuerpo', () => {
    const body = makeBody({ correo: 'alguien@ejemplo.test' });
    body.subscription.expirationTime = 123;
    const { value } = validateSubscription(body);
    expect(Object.keys(value).sort()).toEqual(['id', 'settings', 'subscription', 'timeZone']);
    expect(Object.keys(value.subscription).sort()).toEqual(['endpoint', 'keys']);
  });

  it.each([
    'https://fcm.googleapis.com/fcm/send/abc',
    'https://updates.push.services.mozilla.com/wpush/v2/abc',
    'https://wns2-bl2p.notify.windows.com/w/?token=abc',
    'https://web.push.apple.com/abc',
  ])('acepta el servicio de push %s', (endpoint) => {
    const body = makeBody({ subscription: { endpoint, keys: { p256dh: 'p', auth: 'a' } } });
    expect(validateSubscription(body).errors).toEqual([]);
  });

  it.each([
    ['sin https', 'http://fcm.googleapis.com/fcm/send/abc'],
    ['un host arbitrario', 'https://ejemplo.test/recurso'],
    ['un host interno', 'https://169.254.169.254/latest'],
    ['un host que imita a un servicio', 'https://fcm.googleapis.com.ejemplo.test/abc'],
    ['una cadena que no es URL', 'no-es-url'],
    ['un valor que no es texto', 123],
  ])('rechaza un endpoint con %s', (_caso, endpoint) => {
    const body = makeBody({ subscription: { endpoint, keys: { p256dh: 'p', auth: 'a' } } });
    expect(fields(validateSubscription(body))).toEqual(['endpoint']);
  });

  it('rechaza si faltan claves', () => {
    const body = makeBody({ subscription: { endpoint: ENDPOINT, keys: { p256dh: 'p' } } });
    expect(fields(validateSubscription(body))).toEqual(['keys']);
  });

  it.each(['', 'Marte/Olympus', 42, undefined])('rechaza la zona horaria %s', (timeZone) => {
    expect(fields(validateSubscription(makeBody({ timeZone })))).toEqual(['timeZone']);
  });

  it('rechaza ajustes de horario inválidos', () => {
    expect(fields(validateSubscription(makeBody({ settings: { intervalMinutes: 15 } })))).toEqual(['intervalMinutes']);
  });

  it.each([null, undefined, 'texto', 7])('un cuerpo %s no lanza error: solo se reporta', (body) => {
    const result = validateSubscription(body);
    expect(result.value).toBeNull();
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe('subscriptionId', () => {
  it('es estable y no contiene el endpoint', () => {
    expect(subscriptionId(ENDPOINT)).toBe(subscriptionId(ENDPOINT));
    expect(subscriptionId(ENDPOINT)).not.toContain('fcm');
    expect(subscriptionId(`${ENDPOINT}x`)).not.toBe(subscriptionId(ENDPOINT));
  });
});
