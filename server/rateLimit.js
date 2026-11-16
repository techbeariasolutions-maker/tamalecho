// Límite de frecuencia de POST/DELETE /api/push/subscribe (S-02, opción B de SEGURIDAD.md §3.5).
// Ventana fija por cliente: el contador vive en el mismo Redis, con caducidad, y se borra solo.
// Privacidad (CLAUDE.md §2): nunca se guarda la IP. La llave es un HMAC de la IP con un secreto del
// servidor, y desaparece al terminar la ventana. Lógica pura: no lee variables de entorno por sí sola.
import { createHmac } from 'node:crypto';

// Una persona real casi nunca pasa de unas pocas solicitudes: activar avisos y cambiar su horario.
// El límite es generoso porque varias personas pueden compartir una IP (por ejemplo, la red de la escuela).
export const RATE_LIMIT = 20;
export const RATE_WINDOW_SECONDS = 10 * 60;

const KEY_PREFIX = 'ratelimit:subscribe:';

// IP del cliente. En Vercel, `x-real-ip` y `x-forwarded-for` los pone la plataforma, no el cliente.
export function clientIp(request) {
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return 'desconocido';
}

// Llave del contador: HMAC de la IP. Sin el secreto no se puede volver a la IP probando direcciones.
export function rateLimitKey(ip, secret) {
  return KEY_PREFIX + createHmac('sha256', secret ?? '').update(ip).digest('hex');
}

// Crea el limitador. `store.hit(key, windowSeconds)` suma uno y devuelve el conteo de la ventana.
// Si el almacén falla, se deja pasar: una caída de Redis no debe impedir que alguien dé de baja sus avisos.
export function createRateLimiter({ store, secret, limit = RATE_LIMIT, windowSeconds = RATE_WINDOW_SECONDS }) {
  return {
    // Devuelve { allowed, retryAfter } (segundos).
    async check(request) {
      try {
        const count = await store.hit(rateLimitKey(clientIp(request), secret), windowSeconds);
        return { allowed: count <= limit, retryAfter: windowSeconds };
      } catch {
        return { allowed: true, retryAfter: 0 };
      }
    },
  };
}
