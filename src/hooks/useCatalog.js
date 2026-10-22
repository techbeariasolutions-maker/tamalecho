import * as catalog from '../services/catalog.js';

// Puerta de entrada de los componentes al catálogo. Sin estado global ni temporizadores:
// hoy el catálogo es estático; si en el futuro se carga por red, solo cambia este hook.
export function useCatalog() {
  return catalog;
}
