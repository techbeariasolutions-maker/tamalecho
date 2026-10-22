import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// jsdom no implementa scrollTo; la ficha lo usa al cambiar de consejo.
// (Las pruebas con entorno node no tienen window.)
if (typeof window !== 'undefined') window.scrollTo = () => {};

// Sin `globals: true`, Testing Library no limpia el DOM por sí sola entre pruebas.
afterEach(() => {
  cleanup();
});
