// Compartir un consejo (HU-08.2-B). Usa la Web Share API si el navegador la tiene y, si no, copia el
// enlace. Solo se comparte el título, el resumen y el enlace público del consejo: nada del usuario
// (ni su historial, ni sus ajustes, ni parámetros de la URL actual).
// Recibe sus dependencias en `env` para probarlo sin navegador.

function browserEnv() {
  const hasWindow = typeof window !== 'undefined';
  return {
    navigator: typeof navigator === 'undefined' ? undefined : navigator,
    origin: hasWindow ? window.location.origin : '',
  };
}

export function buildShareData(tip, origin) {
  return { title: tip.title, text: tip.summary, url: `${origin}/tip/${tip.id}` };
}

// Devuelve 'shared' | 'copied' | 'cancelled' | 'unavailable'. Nunca lanza errores.
// - 'cancelled': la persona cerró el menú de compartir; no se intenta copiar.
// - 'unavailable': no hay forma automática; la página muestra el enlace para copiarlo a mano.
export async function shareTip(tip, env) {
  const { navigator: nav, origin } = { ...browserEnv(), ...env };
  const data = buildShareData(tip, origin);

  if (typeof nav?.share === 'function') {
    try {
      await nav.share(data);
      return 'shared';
    } catch (error) {
      if (error?.name === 'AbortError') return 'cancelled';
      // Otro error (por ejemplo, el navegador no deja compartir aquí): se intenta copiar.
    }
  }

  if (typeof nav?.clipboard?.writeText === 'function') {
    try {
      await nav.clipboard.writeText(data.url);
      return 'copied';
    } catch {
      // Sin permiso para el portapapeles.
    }
  }
  return 'unavailable';
}
