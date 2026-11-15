// Adaptador HTTP de Vercel: POST /api/push/subscribe (alta) y DELETE (baja). La lógica está en server/.
import { handleSubscribe } from '../../server/handlers.js';
import { createRateLimiter } from '../../server/rateLimit.js';
import { createDefaultStore } from '../../server/store.js';

export default {
  fetch: (request) => {
    const store = createDefaultStore();
    // La llave del contador usa el secreto del disparador, que ya existe en el servidor (S-02).
    const limiter = createRateLimiter({ store, secret: process.env.DISPATCH_SECRET });
    return handleSubscribe(request, { store, limiter });
  },
};
