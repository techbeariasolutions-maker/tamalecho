// Repositorio local (HT-04.2-A). Única pieza que toca el almacenamiento del navegador
// (CLAUDE.md §6). Recibe el almacenamiento por parámetro para poder probarlo sin navegador.
// Reglas:
// - Todo vive en una sola llave, con número de versión del esquema.
// - Leer nunca lanza errores: sin datos, con JSON corrupto o con una versión desconocida
//   se usan valores seguros.
// - Escribir tampoco lanza errores: si el navegador no deja guardar (modo privado, cuota llena,
//   almacenamiento bloqueado), la operación devuelve `false` y la app sigue funcionando.
// - Los ajustes pasan siempre por validateSettings de schedule.js.
// - No usa Date.now() ni new Date() sin argumentos: la fecha llega como parámetro.

import { ID_PATTERN } from '../data/schema.js';
import { validateSettings } from './schedule.js';

export const STORAGE_KEY = 'tamalecho:v1';
export const SCHEMA_VERSION = 1;
export const MAX_HISTORY_ENTRIES = 50;

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

// Fecha válida → texto ISO; cualquier otra cosa → null.
function toIsoDate(value) {
  if (!(value instanceof Date) && typeof value !== 'string') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function sanitizeHistory(value) {
  if (!Array.isArray(value)) return [];
  const entries = [];
  for (const entry of value) {
    if (!isPlainObject(entry) || typeof entry.id !== 'string' || !ID_PATTERN.test(entry.id)) continue;
    const at = toIsoDate(entry.at);
    if (at) entries.push({ id: entry.id, at });
  }
  return entries.slice(-MAX_HISTORY_ENTRIES);
}

function sanitizeFavorites(value) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.filter((id) => typeof id === 'string' && ID_PATTERN.test(id)))];
}

// Datos iniciales: ajustes recomendados y todo lo demás vacío.
export function createEmptyData() {
  return {
    schemaVersion: SCHEMA_VERSION,
    settings: validateSettings().settings,
    history: [],
    favorites: [],
    progress: {},
    servedWindows: [],
    push: null,
  };
}

// Convierte lo que haya en el almacenamiento (texto JSON, objeto o nada) en datos válidos
// de la versión actual. Nunca lanza errores. Lo que no se reconoce se descarta campo por campo.
export function migrate(data) {
  let source = data;
  if (typeof source === 'string') {
    try {
      source = JSON.parse(source);
    } catch {
      return createEmptyData();
    }
  }
  if (!isPlainObject(source) || source.schemaVersion !== SCHEMA_VERSION) return createEmptyData();

  return {
    schemaVersion: SCHEMA_VERSION,
    settings: validateSettings(isPlainObject(source.settings) ? source.settings : undefined).settings,
    history: sanitizeHistory(source.history),
    favorites: sanitizeFavorites(source.favorites),
    progress: isPlainObject(source.progress) ? source.progress : {},
    servedWindows: [],
    push: isPlainObject(source.push) ? source.push : null,
  };
}

export function createRepository(storage) {
  function read() {
    let raw = null;
    try {
      raw = storage ? storage.getItem(STORAGE_KEY) : null;
    } catch {
      raw = null;
    }
    return migrate(raw);
  }

  function write(data) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  }

  return {
    getSettings() {
      return read().settings;
    },

    // Guarda un cambio parcial sobre los ajustes actuales. Si algún valor es inválido no se
    // guarda nada y se devuelven los errores, para que un valor válido anterior no se pierda.
    // Devuelve { saved, settings, errors }; `settings` son los ajustes vigentes después de la llamada.
    saveSettings(input) {
      const data = read();
      const patch = isPlainObject(input) ? input : {};
      const { settings, errors } = validateSettings({ ...data.settings, ...patch });
      if (errors.length > 0) return { saved: false, settings: data.settings, errors };
      data.settings = settings;
      const saved = write(data);
      return { saved, settings: saved ? settings : read().settings, errors: [] };
    },

    getHistory() {
      return read().history;
    },

    // Agrega una lectura al final del historial y conserva solo las 50 más recientes.
    // No quita duplicados consecutivos: eso lo decide el registro de lecturas (WP-S2-11).
    addHistoryEntry({ id, at } = {}) {
      const iso = toIsoDate(at);
      if (typeof id !== 'string' || !ID_PATTERN.test(id) || !iso) return false;
      const data = read();
      data.history = [...data.history, { id, at: iso }].slice(-MAX_HISTORY_ENTRIES);
      return write(data);
    },
  };
}

function browserStorage() {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    // Algunos navegadores lanzan SecurityError al leer localStorage si el sitio no puede guardar datos.
    return null;
  }
}

let browserRepository = null;

// Repositorio sobre el almacenamiento del navegador, creado una sola vez.
export function getBrowserRepository() {
  if (!browserRepository) browserRepository = createRepository(browserStorage());
  return browserRepository;
}
