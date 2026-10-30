// Adaptador HTTP de Vercel: POST /api/push/subscribe (alta) y DELETE (baja). La lógica está en server/.
import { handleSubscribe } from '../../server/handlers.js';
import { createDefaultStore } from '../../server/store.js';

export default {
  fetch: (request) => handleSubscribe(request, { store: createDefaultStore() }),
};
