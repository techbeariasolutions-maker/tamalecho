// Caducidad de suscripciones por inactividad (S-06, D-27). Lógica pura: recibe la fecha por parámetro.
// «Actividad» = la última vez que el navegador sincronizó su suscripción con el servidor (alta, cambio de
// ajustes o la renovación diaria al abrir la app). Un envío exitoso NO cuenta: el servicio de push acepta
// avisos aunque nadie los lea, así que no distingue a quien dejó de usar la página.
export const INACTIVITY_DAYS = 60;

const DAY_MS = 24 * 60 * 60 * 1000;

// ¿Pasó el plazo sin actividad? Un registro sin fecha (creado antes de este cambio) no caduca aquí:
// sendScheduled le pone la fecha de hoy para que su plazo empiece a contar desde ahora.
export function isInactive(record, now) {
  if (!record.lastSeenAt) return false;
  const seen = Date.parse(record.lastSeenAt);
  if (Number.isNaN(seen)) return false;
  return now.getTime() - seen > INACTIVITY_DAYS * DAY_MS;
}
