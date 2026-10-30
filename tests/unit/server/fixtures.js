// Datos de prueba del backend. Son valores falsos: ninguna prueba usa red ni claves reales.
export const ENDPOINT = 'https://fcm.googleapis.com/fcm/send/prueba-123';

export const makeBody = (overrides = {}) => ({
  subscription: { endpoint: ENDPOINT, keys: { p256dh: 'clave-p256dh', auth: 'clave-auth' } },
  timeZone: 'America/Monterrey',
  settings: { intervalMinutes: 120 },
  ...overrides,
});

export const makeRecord = (id, overrides = {}) => ({
  id,
  subscription: { endpoint: `${ENDPOINT}/${id}`, keys: { p256dh: 'p', auth: 'a' } },
  timeZone: 'America/Monterrey',
  settings: {},
  ...overrides,
});

export const VAPID = { subject: 'https://ejemplo.test', publicKey: 'publica', privateKey: 'privada' };

export const TIP = { id: 'SCR-01', title: 'Product Backlog', summary: 'Ordena el trabajo por valor.' };

// Error con el formato que lanza la librería web-push.
export const pushError = (statusCode) => Object.assign(new Error('Fallo de envío'), { statusCode });
