// Cliente de Web Push (HU-15.1-A). Junto con notificationService.js, es el único lugar que usa
// `Notification`, `PushManager` y `navigator.serviceWorker` (CLAUDE.md §6).
// Reglas:
// - Cargar la página no registra el service worker ni pide permiso: getPushStatus solo consulta.
// - enablePush se llama únicamente desde un clic (CLAUDE.md §2, HU-06.2-A).
// - Activar o desactivar no cambia los ajustes de horario.
// - Todas las funciones reciben sus dependencias en `env` para probarlas sin navegador;
//   por defecto usan las del navegador.

import { getPermission, requestPermission } from './notificationService.js';
import { getBrowserRepository } from './storage.js';

export const SERVICE_WORKER_URL = '/sw.js';
export const SUBSCRIBE_URL = '/api/push/subscribe';

function browserEnv() {
  const hasWindow = typeof window !== 'undefined';
  return {
    navigator: typeof navigator === 'undefined' ? undefined : navigator,
    Notification: hasWindow ? window.Notification : undefined,
    PushManager: hasWindow ? window.PushManager : undefined,
    isSecureContext: hasWindow ? window.isSecureContext : false,
    fetch: typeof fetch === 'undefined' ? undefined : (...args) => fetch(...args),
    vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    repository: getBrowserRepository(),
  };
}

function resolveEnv(env) {
  return { ...browserEnv(), ...env };
}

// Clave VAPID pública (base64 URL) → bytes, como la pide pushManager.subscribe.
export function urlBase64ToUint8Array(base64Url) {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

export function isPushSupported(env) {
  const { navigator: nav, Notification, PushManager, isSecureContext } = resolveEnv(env);
  return Boolean(isSecureContext && nav && 'serviceWorker' in nav && PushManager && Notification);
}

async function currentSubscription(nav) {
  const registration = await nav.serviceWorker.getRegistration('/');
  return registration ? registration.pushManager.getSubscription() : null;
}

// 'unsupported' | 'denied' | 'off' | 'on'. La suscripción del navegador manda sobre el estado local.
export async function getPushStatus(env) {
  const resolved = resolveEnv(env);
  if (!isPushSupported(resolved)) return 'unsupported';
  if (getPermission({ Notification: resolved.Notification }) === 'denied') return 'denied';
  try {
    return (await currentSubscription(resolved.navigator)) ? 'on' : 'off';
  } catch {
    return 'off';
  }
}

// Cancela una suscripción sin lanzar errores. Devuelve true solo si el navegador confirmó la baja.
async function cancelQuietly(subscription) {
  try {
    return (await subscription.unsubscribe()) === true;
  } catch {
    return false;
  }
}

async function sendToServer(fetchFn, method, body) {
  const response = await fetchFn(SUBSCRIBE_URL, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}

// Activa los avisos con la pestaña cerrada. Devuelve { ok, status, error? }, con
// error = 'config' (falta la clave pública), 'permission' (no se dio permiso) o 'failed'.
export async function enablePush(settings, timeZone, env) {
  const resolved = resolveEnv(env);
  if (!isPushSupported(resolved)) return { ok: false, status: 'unsupported' };
  // Sin clave no se pide permiso: pedirlo para luego fallar sería engañoso.
  if (!resolved.vapidPublicKey) return { ok: false, status: await getPushStatus(resolved), error: 'config' };

  // El permiso se pide primero, mientras dura la acción del usuario: algunos navegadores lo
  // rechazan si antes se espera a registrar el service worker. Se pide a través de
  // notificationService, el único lugar que lo hace (HT-06.1-A).
  const permission = await requestPermission({ Notification: resolved.Notification });
  if (permission !== 'granted') {
    return { ok: false, status: permission === 'denied' ? 'denied' : 'off', error: 'permission' };
  }

  let subscription = null;
  try {
    await resolved.navigator.serviceWorker.register(SERVICE_WORKER_URL, { scope: '/' });
    const registration = await resolved.navigator.serviceWorker.ready;
    subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(resolved.vapidPublicKey),
      });
    }
    await sendToServer(resolved.fetch, 'POST', { subscription: subscription.toJSON(), timeZone, settings });
  } catch {
    // Si el servidor no la registró, la suscripción del navegador se cancela siempre, nueva o de antes.
    // Así el estado queda 'off' y coincide con el mensaje «No se pudieron activar»; si no, la página
    // diría «no se activaron» y al mismo tiempo ofrecería «Desactivar avisos».
    if (subscription && (await cancelQuietly(subscription))) {
      resolved.repository.savePushState({ status: 'off' });
    }
    // Si no se pudo cancelar, el estado es el que reporte el navegador.
    return { ok: false, status: await getPushStatus(resolved), error: 'failed' };
  }

  resolved.repository.savePushState({ status: 'on', endpoint: subscription.endpoint });
  return { ok: true, status: 'on' };
}

// Desactiva los avisos con la pestaña cerrada: primero cancela la suscripción en el navegador
// (así ya no puede llegar ningún aviso) y después pide al servidor que la borre.
// Devuelve { ok, status, serverRemoved }. ok = false solo si el navegador no pudo cancelarla.
// Si falla la baja en el servidor, el registro queda huérfano y se borra solo en el siguiente envío,
// cuando el servicio de push responda 404 o 410 (server/push.js).
export async function disablePush(env) {
  const resolved = resolveEnv(env);
  const local = resolved.repository.getPushState();
  let endpoint = local?.endpoint ?? null;

  if (isPushSupported(resolved)) {
    try {
      const subscription = await currentSubscription(resolved.navigator);
      if (subscription) {
        endpoint = subscription.endpoint;
        const cancelled = await subscription.unsubscribe();
        if (!cancelled) throw new Error('unsubscribe returned false');
      }
    } catch {
      return { ok: false, status: await getPushStatus(resolved), serverRemoved: false };
    }
  }

  let serverRemoved = endpoint === null;
  if (endpoint) {
    try {
      await sendToServer(resolved.fetch, 'DELETE', { endpoint });
      serverRemoved = true;
    } catch {
      serverRemoved = false;
    }
  }

  resolved.repository.savePushState({ status: 'off' });
  return { ok: true, status: await getPushStatus(resolved), serverRemoved };
}
