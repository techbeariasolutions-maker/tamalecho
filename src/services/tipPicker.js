// Elige el consejo de un aviso (HU-04.2-A). Función pura: sin Math.random ni fechas.
// - Determinista por clave de ventana: la misma ventana ('2026-11-09@14:00') siempre da el mismo
//   consejo, aunque se recargue la página o se calcule en otro momento.
// - Evita los consejos leídos recientemente (`recentIds`) mientras queden otros. WP-S2-11 le pasa
//   el historial de lecturas; si todos son recientes, elige entre todos.

// Hash FNV-1a de 32 bits: reparte claves parecidas ('…@14:00', '…@17:00') en índices distintos.
function hashKey(key) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function pickTipForWindow(windowKey, recentIds = [], tips = []) {
  if (tips.length === 0) return null;
  const recent = new Set(recentIds);
  const fresh = tips.filter((tip) => !recent.has(tip.id));
  const candidates = fresh.length > 0 ? fresh : tips;
  return candidates[hashKey(windowKey) % candidates.length];
}
