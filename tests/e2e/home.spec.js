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
