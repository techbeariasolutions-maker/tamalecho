import { expect, test } from './fixtures.js';
import { STORAGE_KEY } from './routes.js';

// Avisos dentro de la página sin ráfagas atrasadas (HU-04.2-A, HU-04.2-B).
// La hora se fija con page.clock: lunes 9/11/2026, hora local del sistema (la misma del navegador).
// Ajustes recomendados: cada 3 h desde las 08:00 (08, 11, 14, 17 y 20 h), silencio de 21:00 a 08:00.
test.use({ noticesPaused: false });

const at = (day, hours, minutes = 0) => new Date(2026, 10, day, hours, minutes);
const notice = (page) => page.getByRole('status').filter({ hasText: 'Consejo de ahora' });
const noticeCards = (page) => page.locator('.notice');

// Guarda datos locales antes de que cargue la app (esquema v1 de storage.js).
async function seed(page, data) {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key, JSON.stringify(value)),
    [STORAGE_KEY, { schemaVersion: 1, ...data }],
  );
}

async function servedWindows(page) {
  return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)).servedWindows, STORAGE_KEY);
}

test.describe('HU-04.2-B: sin ráfagas atrasadas', () => {
  test('a las 10:59 no hay aviso y a las 11:00 aparece uno', async ({ page }) => {
    await seed(page, { servedWindows: ['2026-11-09@08:00'] });
    await page.clock.install({ time: at(9, 10, 59) });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(noticeCards(page)).toHaveCount(0);

    await page.clock.fastForward('01:00');
    await expect(notice(page)).toBeVisible();
    await expect(noticeCards(page)).toHaveCount(1);
  });

  test('T2-06: al volver tras saltar 9 h aparece exactamente un aviso, el más reciente', async ({ page }) => {
    await seed(page, { servedWindows: ['2026-11-09@08:00'] });
    await page.clock.install({ time: at(9, 8, 30) });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    // fastForward simula una suspensión: los temporizadores vencidos corren una sola vez al final.
    await page.clock.fastForward('09:00:00');
    await expect(noticeCards(page)).toHaveCount(1);
    expect(await servedWindows(page)).toEqual(['2026-11-09@08:00', '2026-11-09@17:00']);
  });

  test('T2-07: al cambiar de día aparece solo la primera ventana del día nuevo', async ({ page }) => {
    await seed(page, { servedWindows: ['2026-11-09@20:00'] });
    await page.clock.install({ time: at(9, 20, 30) });
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(noticeCards(page)).toHaveCount(0);

    await page.clock.fastForward('12:00:00');
    await expect(noticeCards(page)).toHaveCount(1);
    expect(await servedWindows(page)).toEqual(['2026-11-09@20:00', '2026-11-10@08:00']);
  });

  test('T2-07: en pausa no aparece ningún aviso', async ({ page }) => {
    await seed(page, { settings: { paused: true } });
    await page.clock.install({ time: at(9, 10, 59) });
    await page.goto('/');
    await page.clock.fastForward('01:00');
    await expect(page.getByText('Avisos en pausa.')).toBeVisible();
    await expect(noticeCards(page)).toHaveCount(0);
  });

  test('T2-07 / T2-15: de 21:00 a 08:00 no aparece y la lectura sigue funcionando', async ({ page }) => {
    await page.clock.setFixedTime(at(9, 22));
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(noticeCards(page)).toHaveCount(0);
    await page.goto('/biblioteca/pmbok');
    await page.getByRole('link', { name: /^Ver más sobre / }).first().click();
    await expect(page).toHaveURL(/\/tip\/PMI-/);
    await expect(noticeCards(page)).toHaveCount(0);
  });

  test('T2-03: recargar no repite la ventana ya servida', async ({ page }) => {
    await page.clock.setFixedTime(at(9, 14, 5));
    await page.goto('/');
    await expect(notice(page)).toBeVisible();
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(noticeCards(page)).toHaveCount(0);
  });
});
