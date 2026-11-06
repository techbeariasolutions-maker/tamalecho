import { test as base, expect } from '@playwright/test';

// Fixture común de las E2E (WP-S2-7).
// Desde que existen los avisos dentro de la página (HU-04.2, HU-06.1-A), cualquier ruta puede
// mostrar un aviso según la hora real en que corra la prueba. Para que las pruebas que no son de
// avisos den siempre el mismo resultado, por defecto se guardan los ajustes con la pausa activa,
// **solo si la prueba no guardó antes sus propios datos** (y antes de que cargue la app).
// Las pruebas de avisos y de horario lo desactivan con `test.use({ noticesPaused: false })`
// y fijan la hora con page.clock.
export const test = base.extend({
  noticesPaused: [true, { option: true }],
  page: async ({ page, noticesPaused }, use) => {
    if (noticesPaused) {
      await page.addInitScript(() => {
        const key = 'tamalecho:v1';
        if (window.localStorage.getItem(key) === null) {
          window.localStorage.setItem(key, JSON.stringify({ schemaVersion: 1, settings: { paused: true } }));
        }
      });
    }
    await use(page);
  },
});

export { expect };
