import '@testing-library/jest-dom/vitest';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Los avisos dentro de la página (NoticeHost, HU-06.1-A) dependen de la hora real: si quedaran
// activos en todas las pruebas que montan el Layout, aparecerían o no según la hora en que corra
// la suite. Aquí se reemplazan por un componente vacío; sus pruebas usan el real con
// vi.importActual (tests/unit/NoticeHost.test.jsx) y el E2E prueba la integración con el Layout.
vi.mock('../src/features/scheduler/NoticeHost.jsx', () => ({ default: () => null }));

// jsdom no implementa scrollTo; la ficha lo usa al cambiar de consejo.
// (Las pruebas con entorno node no tienen window.)
if (typeof window !== 'undefined') window.scrollTo = () => {};

// Sin `globals: true`, Testing Library no limpia el DOM por sí sola entre pruebas.
afterEach(() => {
  cleanup();
});
