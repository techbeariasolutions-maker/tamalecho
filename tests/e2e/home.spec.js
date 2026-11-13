import { expect, test } from './fixtures.js';

test('la portada carga sin errores en la consola', async ({ page }) => {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');

  await expect(page).toHaveTitle('TamalEcho Tips');
  await expect(page.getByRole('heading', { level: 1, name: 'Tu ruta diaria' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('T-01: sin cuenta, la portada muestra un consejo y lleva a ambos enfoques', async ({ page }) => {
  await page.goto('/');
  const hero = page.getByRole('region', { name: 'Tu ruta diaria' });
  await expect(hero.getByRole('article')).toBeVisible();
  await expect(hero.getByRole('link', { name: /^Empezar misión: / })).toBeVisible();
  await expect(page.getByText(/^¿Por dónde empezar\?/)).toBeVisible();

  await page.getByRole('link', { name: 'Explorar Scrum' }).click();
  await expect(page).toHaveURL(/\/biblioteca\/scrum$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Biblioteca de Scrum');

  await page.goto('/');
  await page.getByRole('link', { name: 'Explorar PMI/PMBOK' }).click();
  await expect(page).toHaveURL(/\/biblioteca\/pmbok$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Biblioteca de PMI/PMBOK');
});

test('la misión de hoy abre su ficha', async ({ page }) => {
  await page.goto('/');
  const link = page.getByRole('link', { name: /^Empezar misión: / });
  const title = (await link.getAttribute('aria-label')).replace(/^(Empezar|Repasar) misión: /, '');
  await link.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
});
