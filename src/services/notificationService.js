// Servicio de notificaciones del navegador (HT-06.1-A). Junto con pushClient.js, es el único lugar
// que usa `Notification` (CLAUDE.md §6).
// Reglas (CLAUDE.md §2):
// - El permiso solo se pide desde un clic: requestPermission no se llama al cargar la app.
// - Sin permiso o sin soporte, los avisos siguen apareciendo dentro de la página.
// - Las funciones reciben sus dependencias en `env` para probarlas sin navegador; por defecto
//   usan las del navegador.

// Una sola etiqueta: un aviso nuevo reemplaza al anterior en lugar de apilarse (igual que sw.js).
export const NOTIFICATION_TAG = 'tamalecho-aviso';

function browserEnv() {
  const hasWindow = typeof window !== 'undefined';
  return {
    Notification: hasWindow ? window.Notification : undefined,
    document: typeof document === 'undefined' ? undefined : document,
    focusWindow: hasWindow ? () => window.focus() : () => {},
  };
}

function resolveEnv(env) {
  return { ...browserEnv(), ...env };
}

export function isNotificationSupported(env) {
  return Boolean(resolveEnv(env).Notification);
}

// 'unsupported' | 'default' | 'granted' | 'denied'. Solo consulta: no pide nada.
export function getPermission(env) {
  const { Notification } = resolveEnv(env);
  if (!Notification) return 'unsupported';
  return ['default', 'granted', 'denied'].includes(Notification.permission) ? Notification.permission : 'default';
}

// Pide el permiso. Llamarla SOLO desde el manejador de un clic (HU-06.2-A).
// Devuelve el permiso resultante. Acepta la versión con promesa y la antigua con callback.
export async function requestPermission(env) {
  const { Notification } = resolveEnv(env);
  if (!Notification) return 'unsupported';
  try {
    const result = await new Promise((resolve) => {
      const maybePromise = Notification.requestPermission(resolve);
      if (maybePromise && typeof maybePromise.then === 'function') maybePromise.then(resolve, () => resolve(null));
    });
    return ['default', 'granted', 'denied'].includes(result) ? result : getPermission({ Notification });
  } catch {
    return getPermission({ Notification });
  }
}

// Emite un aviso (HT-06.1-A).
// - Con permiso concedido y la pestaña oculta: notificación nativa; al pulsarla se enfoca la
//   pestaña y se abre la ficha con `openTip(id)`.
// - En cualquier otro caso (pestaña visible, sin permiso, sin soporte o si el navegador no deja
//   crear la notificación, como Chrome en Android): `showInPage()`, el aviso de la página.
// Devuelve 'native' o 'page'.
export function notify(notice, { showInPage, openTip = () => {} }, env) {
  const resolved = resolveEnv(env);
  const hidden = resolved.document?.visibilityState === 'hidden';
  if (hidden && getPermission(resolved) === 'granted') {
    try {
      const { tip } = notice;
      const notification = new resolved.Notification(tip.title, {
        body: tip.summary,
        tag: NOTIFICATION_TAG,
        data: { url: `/tip/${tip.id}` },
      });
      notification.onclick = () => {
        resolved.focusWindow();
        openTip(tip.id);
        notification.close();
      };
      return 'native';
    } catch {
      // Algunos navegadores solo permiten notificaciones desde un service worker.
    }
  }
  showInPage();
  return 'page';
}
