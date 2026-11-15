// Lectura sin conexión (HT-06.2-A, HU-12; WP-P5, D-26). Junto con notificationService.js y
// pushClient.js, es el único lugar que usa `navigator.serviceWorker` (CLAUDE.md §6).
// Reglas:
// - Registrar el service worker NO pide ningún permiso: solo guarda los archivos publicados para
//   leer sin red. El permiso de notificaciones sigue pidiéndose únicamente tras un clic (CLAUDE.md §2).
// - En desarrollo (`npm run dev`) no se registra: la caché escondería los cambios del código.
// - Todas las funciones reciben sus dependencias en `env` para probarlas sin navegador.

export const SERVICE_WORKER_URL = '/sw.js';

function browserEnv() {
  const hasWindow = typeof window !== 'undefined';
  return {
    navigator: typeof navigator === 'undefined' ? undefined : navigator,
    target: hasWindow ? window : undefined,
    isSecureContext: hasWindow ? window.isSecureContext : false,
    isDev: import.meta.env.DEV,
  };
}

const resolveEnv = (env) => ({ ...browserEnv(), ...env });

// Devuelve 'registered' | 'skipped' | 'unsupported' | 'failed'. Nunca lanza errores.
export async function registerOfflineSupport(env) {
  const { navigator: nav, isSecureContext, isDev } = resolveEnv(env);
  if (isDev) return 'skipped';
  if (!isSecureContext || !nav || !('serviceWorker' in nav)) return 'unsupported';
  try {
    await nav.serviceWorker.register(SERVICE_WORKER_URL);
    return 'registered';
  } catch {
    return 'failed';
  }
}

// ¿Hay conexión? Si el navegador no lo sabe, se supone que sí.
export function isOnline(env) {
  return resolveEnv(env).navigator?.onLine !== false;
}

// Avisa con `callback(online)` cada vez que cambia la conexión. Devuelve la función para dejar de escuchar.
export function onConnectionChange(callback, env) {
  const { target } = resolveEnv(env);
  if (!target) return () => {};
  const toOnline = () => callback(true);
  const toOffline = () => callback(false);
  target.addEventListener('online', toOnline);
  target.addEventListener('offline', toOffline);
  return () => {
    target.removeEventListener('online', toOnline);
    target.removeEventListener('offline', toOffline);
  };
}
