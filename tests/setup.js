import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Sin `globals: true`, Testing Library no limpia el DOM por sí sola entre pruebas.
afterEach(() => {
  cleanup();
});
