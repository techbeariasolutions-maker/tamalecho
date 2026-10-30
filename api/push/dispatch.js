// Adaptador HTTP de Vercel: POST /api/push/dispatch con el secreto DISPATCH_SECRET. La lógica está en server/.
import process from 'node:process';
import webpush from 'web-push';
import { handleDispatch } from '../../server/handlers.js';
import { createDefaultStore } from '../../server/store.js';
import { getFeaturedTip } from '../../src/services/catalog.js';

export default {
  fetch: (request) =>
    handleDispatch(request, {
      store: createDefaultStore(),
      webpush,
      env: process.env,
      now: new Date(),
      getFeaturedTip,
    }),
};
