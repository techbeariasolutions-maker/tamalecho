import { vi } from 'vitest';
import { createRepository } from '../../../src/services/storage.js';
import { createFakeStorage } from './fakeStorage.js';

// Clave pública sintética: 65 bytes (0x04 seguido de 64 bytes 0x01) en base64 URL. No es una clave real;
// se arma en la prueba para que nadie la confunda con un secreto (PRUEBAS §1).
export const FAKE_VAPID_PUBLIC_KEY = btoa(String.fromCharCode(4, ...new Array(64).fill(1)))
  .replace(/\+/g, '-')
  .replace(/\//g, '_')
  .replace(/=+$/, '');
export const FAKE_ENDPOINT = 'https://fcm.googleapis.com/fcm/send/abc123';

// `onUnsubscribe` se llama cuando el navegador cancela la suscripción.
function createFakeSubscription(onUnsubscribe) {
  return {
    endpoint: FAKE_ENDPOINT,
    toJSON: () => ({
      endpoint: FAKE_ENDPOINT,
      expirationTime: null,
      keys: { p256dh: 'p256dh-de-prueba', auth: 'auth-de-prueba' },
    }),
    unsubscribe: vi.fn(async () => {
      onUnsubscribe();
      return true;
    }),
  };
}

// Navegador simulado con service worker, PushManager, Notification y fetch.
// `state` permite ajustar el escenario: permiso, suscripción existente, respuesta del servidor.
export function createPushEnv({
  permission = 'default',
  answer = 'granted',
  subscribed = false,
  registered = subscribed,
  serverOk = true,
  vapidPublicKey = FAKE_VAPID_PUBLIC_KEY,
  storage = createFakeStorage(),
} = {}) {
  const state = { permission, subscription: null };
  const clear = () => {
    state.subscription = null;
  };
  if (subscribed) state.subscription = createFakeSubscription(clear);

  const pushManager = {
    getSubscription: vi.fn(async () => state.subscription),
    subscribe: vi.fn(async () => {
      state.subscription = createFakeSubscription(clear);
      return state.subscription;
    }),
  };

  const registration = { pushManager };
  const serviceWorker = {
    registered,
    register: vi.fn(async () => {
      serviceWorker.registered = true;
      return registration;
    }),
    getRegistration: vi.fn(async () => (serviceWorker.registered ? registration : undefined)),
    get ready() {
      return Promise.resolve(registration);
    },
  };

  const Notification = {
    get permission() {
      return state.permission;
    },
    requestPermission: vi.fn(async () => {
      state.permission = answer;
      return answer;
    }),
  };

  const fetch = vi.fn(async () => ({ ok: serverOk, status: serverOk ? 201 : 500 }));

  return {
    state,
    env: {
      navigator: { serviceWorker },
      Notification,
      PushManager: function PushManager() {},
      isSecureContext: true,
      fetch,
      vapidPublicKey,
      repository: createRepository(storage),
    },
    storage,
    serviceWorker,
    pushManager,
    Notification,
    fetch,
  };
}
