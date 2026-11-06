import { expect, test } from './fixtures.js';

// Registro de lecturas (HU-08.1-A, T2-22). El conteo se lee en Ajustes («Tus datos en este dispositivo»).
const readings = (page) => page.getByRole('region', { name: 'Tus datos en este dispositivo' });

test('abrir una ficha cuenta una lectura; recargarla no la duplica; otra ficha suma otra', async ({ page }) => {
  await page.goto('/tip/SCR-01');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Product Backlog');
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Product Backlog');

  await page.goto('/ajustes');
  await expect(readings(page)).toContainText('Ahora hay 1 lectura registrada.');

  await page.goto('/tip/PMI-01');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goto('/ajustes');
  await expect(readings(page)).toContainText('Ahora hay 2 lecturas registradas.');
});

test.describe('con un aviso visible', () => {
  test.use({ noticesPaused: false });

  test('recibir un aviso no cuenta como lectura; abrirlo sí', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 10, 9, 14, 5));
    await page.goto('/biblioteca/scrum');
    const notice = page.getByRole('status').filter({ hasText: 'Consejo de ahora' });
    await expect(notice).toBeVisible();

    await page.goto('/ajustes');
    await expect(readings(page)).toContainText('Ahora no hay lecturas registradas.');

    // La ventana ya se sirvió; se vuelve a una nueva para abrir el aviso.
    await page.clock.setFixedTime(new Date(2026, 10, 9, 17, 5));
    await page.goto('/biblioteca/scrum');
    await notice.getByRole('link', { name: /^Ver consejo sobre / }).click();
    await expect(page).toHaveURL(/\/tip\//);
    await page.goto('/ajustes');
    await expect(readings(page)).toContainText('Ahora hay 1 lectura registrada.');
  });
});
