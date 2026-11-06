// Almacenamientos falsos con la interfaz de Web Storage, para probar src/services/storage.js
// sin depender del navegador.
export function createFakeStorage(initial = {}) {
  const items = new Map(Object.entries(initial));
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => items.set(key, String(value)),
    removeItem: (key) => items.delete(key),
    clear: () => items.clear(),
    get length() {
      return items.size;
    },
  };
}

// Simula un navegador que no deja guardar: cada operación lanza un error.
export function createFailingStorage() {
  const fail = () => {
    throw new DOMException('Bloqueado', 'SecurityError');
  };
  return { getItem: fail, setItem: fail, removeItem: fail, clear: fail, length: 0 };
}
