import { describe, expect, it } from 'vitest';
import {
  SERVICE_WORKER_URL,
  SUBSCRIBE_URL,
  disablePush,
  enablePush,
  getPushStatus,
  isPushSupported,
  urlBase64ToUint8Array,
} from '../../src/services/pushClient.js';
import { DEFAULT_SETTINGS } from '../../src/services/schedule.js';
import { createRepository } from '../../src/services/storage.js';
import { FAKE_ENDPOINT, FAKE_VAPID_PUBLIC_KEY, createPushEnv } from './fixtures/fakePush.js';

const SETTINGS = { ...DEFAULT_SETTINGS, activeDays: [...DEFAULT_SETTINGS.activeDays], intervalMinutes: 120 };
const TIME_ZONE = 'America/Monterrey';
const bodyOf = (fetchMock, call = 0) => JSON.parse(fetchMock.mock.calls[call][1].body);

describe('pushClient (HU-15.1-A)', () => {
  describe('urlBase64ToUint8Array', () => {
    it('convierte la clave pública a los 65 bytes que pide subscribe', () => {
      const bytes = urlBase64ToUint8Array(FAKE_VAPID_PUBLIC_KEY);
      expect(bytes).toBeInstanceOf(Uint8Array);
      expect(bytes).toHaveLength(65);
      expect(bytes[0]).toBe(4);
      expect(bytes[64]).toBe(1);
    });

    it('acepta los caracteres - y _ de base64 URL', () => {
      expect([...urlBase64ToUint8Array('-_8')]).toEqual([0xfb, 0xff]);
    });
  });

  describe('isPushSupported', () => {
    it('es true con service worker, PushManager, Notification y contexto seguro', () => {
      expect(isPushSupported(createPushEnv().env)).toBe(true);
    });

    it.each([
      ['sin service worker', { navigator: {} }],
      ['sin navigator', { navigator: undefined }],
      ['sin PushManager', { PushManager: undefined }],
      ['sin Notification', { Notification: undefined }],
      ['sin HTTPS', { isSecureContext: false }],
    ])('es false %s', (_, override) => {
      expect(isPushSupported({ ...createPushEnv().env, ...override })).toBe(false);
    });
  });

  describe('getPushStatus: los 4 estados', () => {
    it('unsupported', async () => {
      expect(await getPushStatus({ ...createPushEnv().env, PushManager: undefined })).toBe('unsupported');
    });

    it('denied', async () => {
      expect(await getPushStatus(createPushEnv({ permission: 'denied' }).env)).toBe('denied');
    });

    it('off: sin service worker registrado', async () => {
      expect(await getPushStatus(createPushEnv().env)).toBe('off');
    });

    it('off: registrado pero sin suscripción', async () => {
      expect(await getPushStatus(createPushEnv({ registered: true, permission: 'granted' }).env)).toBe('off');
    });

    it('on: con suscripción en el navegador', async () => {
      expect(await getPushStatus(createPushEnv({ subscribed: true, permission: 'granted' }).env)).toBe('on');
    });

    it('consultar no registra el service worker ni pide permiso', async () => {
      const fake = createPushEnv();
      await getPushStatus(fake.env);
      expect(fake.serviceWorker.register).not.toHaveBeenCalled();
      expect(fake.Notification.requestPermission).not.toHaveBeenCalled();
      expect(fake.fetch).not.toHaveBeenCalled();
    });
  });

  describe('enablePush', () => {
    it('pide permiso, registra el service worker, se suscribe y envía la suscripción con zona y horario', async () => {
      const fake = createPushEnv();
      const result = await enablePush(SETTINGS, TIME_ZONE, fake.env);

      expect(result).toEqual({ ok: true, status: 'on' });
      expect(fake.Notification.requestPermission).toHaveBeenCalledTimes(1);
      expect(fake.serviceWorker.register).toHaveBeenCalledWith(SERVICE_WORKER_URL, { scope: '/' });
      const [options] = fake.pushManager.subscribe.mock.calls[0];
      expect(options.userVisibleOnly).toBe(true);
      expect(options.applicationServerKey).toEqual(urlBase64ToUint8Array(FAKE_VAPID_PUBLIC_KEY));

      expect(fake.fetch).toHaveBeenCalledTimes(1);
      const [url, request] = fake.fetch.mock.calls[0];
      expect(url).toBe(SUBSCRIBE_URL);
      expect(request.method).toBe('POST');
      expect(request.headers['Content-Type']).toBe('application/json');
      expect(bodyOf(fake.fetch)).toEqual({
        subscription: {
          endpoint: FAKE_ENDPOINT,
          expirationTime: null,
          keys: { p256dh: 'p256dh-de-prueba', auth: 'auth-de-prueba' },
        },
        timeZone: TIME_ZONE,
        settings: SETTINGS,
      });
      expect(fake.env.repository.getPushState()).toEqual({ status: 'on', endpoint: FAKE_ENDPOINT });
    });

    it('el permiso se pide antes de registrar el service worker (acción del usuario)', async () => {
      const fake = createPushEnv();
      await enablePush(SETTINGS, TIME_ZONE, fake.env);
      const permissionOrder = fake.Notification.requestPermission.mock.invocationCallOrder[0];
      const registerOrder = fake.serviceWorker.register.mock.invocationCallOrder[0];
      expect(permissionOrder).toBeLessThan(registerOrder);
    });

    it('si ya hay suscripción la reutiliza y solo la vuelve a enviar', async () => {
      const fake = createPushEnv({ subscribed: true, permission: 'granted' });
      expect(await enablePush(SETTINGS, TIME_ZONE, fake.env)).toEqual({ ok: true, status: 'on' });
      expect(fake.pushManager.subscribe).not.toHaveBeenCalled();
      expect(fake.fetch).toHaveBeenCalledTimes(1);
    });

    it('si el usuario niega el permiso no registra nada y queda denied', async () => {
      const fake = createPushEnv({ answer: 'denied' });
      const result = await enablePush(SETTINGS, TIME_ZONE, fake.env);
      expect(result).toEqual({ ok: false, status: 'denied', error: 'permission' });
      expect(fake.serviceWorker.register).not.toHaveBeenCalled();
      expect(fake.fetch).not.toHaveBeenCalled();
      expect(fake.env.repository.getPushState()).toBeNull();
    });

    it('si el usuario cierra el diálogo sin decidir queda off', async () => {
      const fake = createPushEnv({ answer: 'default' });
      expect(await enablePush(SETTINGS, TIME_ZONE, fake.env)).toEqual({
        ok: false,
        status: 'off',
        error: 'permission',
      });
    });

    it('sin clave pública no pide permiso', async () => {
      const fake = createPushEnv({ vapidPublicKey: '' });
      const result = await enablePush(SETTINGS, TIME_ZONE, fake.env);
      expect(result).toEqual({ ok: false, status: 'off', error: 'config' });
      expect(fake.Notification.requestPermission).not.toHaveBeenCalled();
    });

    it('sin soporte no hace nada', async () => {
      const fake = createPushEnv();
      const result = await enablePush(SETTINGS, TIME_ZONE, { ...fake.env, PushManager: undefined });
      expect(result).toEqual({ ok: false, status: 'unsupported' });
      expect(fake.Notification.requestPermission).not.toHaveBeenCalled();
    });

    describe('si el servidor no registra la suscripción (POST falla)', () => {
      it('con suscripción previa: la cancela y el estado queda off, igual que el mensaje', async () => {
        const fake = createPushEnv({ subscribed: true, permission: 'granted', serverOk: false });
        const previous = fake.state.subscription;

        const result = await enablePush(SETTINGS, TIME_ZONE, fake.env);
        expect(result).toEqual({ ok: false, status: 'off', error: 'failed' });
        expect(previous.unsubscribe).toHaveBeenCalledTimes(1);
        expect(await getPushStatus(fake.env)).toBe('off');
        expect(fake.env.repository.getPushState()).toEqual({ status: 'off' });
      });

      it('sin suscripción previa: cancela la nueva y el estado queda off (regresión)', async () => {
        const fake = createPushEnv({ serverOk: false });
        const result = await enablePush(SETTINGS, TIME_ZONE, fake.env);
        expect(result).toEqual({ ok: false, status: 'off', error: 'failed' });
        expect(fake.pushManager.subscribe).toHaveBeenCalledTimes(1);
        expect(fake.state.subscription).toBeNull();
        expect(await getPushStatus(fake.env)).toBe('off');
        expect(fake.env.repository.getPushState()).toEqual({ status: 'off' });
      });

      it('si unsubscribe lanza: no truena, responde failed y el estado es el del navegador', async () => {
        const fake = createPushEnv({ subscribed: true, permission: 'granted', serverOk: false });
        fake.env.repository.savePushState({ status: 'on', endpoint: FAKE_ENDPOINT });
        fake.state.subscription.unsubscribe.mockRejectedValueOnce(new Error('falló'));

        await expect(enablePush(SETTINGS, TIME_ZONE, fake.env)).resolves.toEqual({
          ok: false,
          status: 'on',
          error: 'failed',
        });
        // No se guarda «off»: el navegador sigue suscrito.
        expect(fake.env.repository.getPushState()).toEqual({ status: 'on', endpoint: FAKE_ENDPOINT });
      });

      it('si unsubscribe responde false: se trata como fallo y no guarda off', async () => {
        const fake = createPushEnv({ subscribed: true, permission: 'granted', serverOk: false });
        fake.state.subscription.unsubscribe.mockResolvedValueOnce(false);
        expect(await enablePush(SETTINGS, TIME_ZONE, fake.env)).toEqual({ ok: false, status: 'on', error: 'failed' });
        expect(fake.env.repository.getPushState()).toBeNull();
      });
    });

    it('si falla el registro del service worker responde failed sin lanzar', async () => {
      const fake = createPushEnv();
      fake.serviceWorker.register.mockRejectedValueOnce(new Error('SecurityError'));
      const result = await enablePush(SETTINGS, TIME_ZONE, fake.env);
      expect(result.ok).toBe(false);
      expect(result.error).toBe('failed');
      expect(fake.fetch).not.toHaveBeenCalled();
    });

    it('activar no cambia los ajustes guardados (T2-20, parte de lógica)', async () => {
      const fake = createPushEnv();
      fake.env.repository.saveSettings({ intervalMinutes: 120, startTime: '09:00' });
      const before = fake.env.repository.getSettings();
      await enablePush(before, TIME_ZONE, fake.env);
      await disablePush(fake.env);
      // Un repositorio nuevo sobre el mismo almacenamiento equivale a recargar.
      expect(createRepository(fake.storage).getSettings()).toEqual(before);
    });
  });

  describe('disablePush', () => {
    it('cancela en el navegador, da de baja en el servidor y guarda off', async () => {
      const fake = createPushEnv({ subscribed: true, permission: 'granted' });
      fake.env.repository.savePushState({ status: 'on', endpoint: FAKE_ENDPOINT });
      const subscription = fake.state.subscription;

      const result = await disablePush(fake.env);
      expect(result).toEqual({ ok: true, status: 'off', serverRemoved: true });
      expect(subscription.unsubscribe).toHaveBeenCalledTimes(1);
      const [url, request] = fake.fetch.mock.calls[0];
      expect(url).toBe(SUBSCRIBE_URL);
      expect(request.method).toBe('DELETE');
      expect(bodyOf(fake.fetch)).toEqual({ endpoint: FAKE_ENDPOINT });
      expect(fake.env.repository.getPushState()).toEqual({ status: 'off' });
    });

    it('primero cancela en el navegador y después llama al servidor', async () => {
      const fake = createPushEnv({ subscribed: true, permission: 'granted' });
      const subscription = fake.state.subscription;
      await disablePush(fake.env);
      expect(subscription.unsubscribe.mock.invocationCallOrder[0]).toBeLessThan(
        fake.fetch.mock.invocationCallOrder[0],
      );
    });

    it('si el servidor falla, el navegador ya quedó sin suscripción y lo informa', async () => {
      const fake = createPushEnv({ subscribed: true, permission: 'granted', serverOk: false });
      expect(await disablePush(fake.env)).toEqual({ ok: true, status: 'off', serverRemoved: false });
      expect(fake.state.subscription).toBeNull();
    });

    it('si el navegador no puede cancelar, no llama al servidor ni cambia el estado local', async () => {
      const fake = createPushEnv({ subscribed: true, permission: 'granted' });
      fake.env.repository.savePushState({ status: 'on', endpoint: FAKE_ENDPOINT });
      fake.state.subscription.unsubscribe.mockRejectedValueOnce(new Error('falló'));
      expect(await disablePush(fake.env)).toEqual({ ok: false, status: 'on', serverRemoved: false });
      expect(fake.fetch).not.toHaveBeenCalled();
      expect(fake.env.repository.getPushState()).toEqual({ status: 'on', endpoint: FAKE_ENDPOINT });
    });

    it('si el navegador perdió la suscripción, da de baja en el servidor con el endpoint guardado', async () => {
      const fake = createPushEnv({ registered: true, permission: 'granted' });
      fake.env.repository.savePushState({ status: 'on', endpoint: FAKE_ENDPOINT });
      expect(await disablePush(fake.env)).toEqual({ ok: true, status: 'off', serverRemoved: true });
      expect(bodyOf(fake.fetch)).toEqual({ endpoint: FAKE_ENDPOINT });
    });

    it('sin nada que dar de baja no llama al servidor', async () => {
      const fake = createPushEnv();
      expect(await disablePush(fake.env)).toEqual({ ok: true, status: 'off', serverRemoved: true });
      expect(fake.fetch).not.toHaveBeenCalled();
      expect(fake.serviceWorker.register).not.toHaveBeenCalled();
    });

    it('sin soporte también da de baja en el servidor si había un endpoint guardado', async () => {
      const fake = createPushEnv();
      fake.env.repository.savePushState({ status: 'on', endpoint: FAKE_ENDPOINT });
      const result = await disablePush({ ...fake.env, PushManager: undefined });
      expect(result).toEqual({ ok: true, status: 'unsupported', serverRemoved: true });
      expect(fake.fetch).toHaveBeenCalledTimes(1);
    });
  });
});
