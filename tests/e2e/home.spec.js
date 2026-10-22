import { expect, test } from '@playwright/test';

test('la portada carga sin errores en la consola', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  await expect(page).toHaveTitle('TamalEcho Tips');
  await expect(page.getByRole('heading', { level: 1, name: 'TamalEcho Tips' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('T-01: sin cuenta, la portada muestra un consejo y lleva a ambos enfoques', async ({ page }) => {
  await page.goto('/');
  const featured = page.getByRole('region', { name: 'Consejo del día' });
  await expect(featured.getByRole('article')).toBeVisible();
  await expect(featured.getByRole('link', { name: /^Ver más sobre / })).toBeVisible();

  await page.getByRole('link', { name: 'Explorar Scrum' }).click();
  await expect(page).toHaveURL(/\/biblioteca\/scrum$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Biblioteca de Scrum');

  await page.goto('/');
  await page.getByRole('link', { name: 'Explorar PMI/PMBOK' }).click();
  await expect(page).toHaveURL(/\/biblioteca\/pmbok$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Biblioteca de PMI/PMBOK');
});

test('el consejo destacado abre su ficha', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('region', { name: 'Consejo del día' }).getByRole('link', { name: /^Ver más sobre / });
  const title = (await link.textContent()).replace('Ver más sobre ', '');
  await link.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
});
