import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'reduce' });

test('T-14: con movimiento reducido no hay animaciones activas', async ({ page }) => {
  await page.goto('/');
  // El enlace «Saltar al contenido» y los botones usan transiciones: se activan y se mide.
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Saltar al contenido' })).toBeFocused();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);

  await page.goto('/biblioteca/scrum');
  await page.getByRole('button', { name: 'Eventos' }).hover();
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
});

test('sin movimiento reducido la transición sí existe (control de la prueba anterior)', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/');
  await page.keyboard.press('Tab');
  expect(await page.evaluate(() => document.getAnimations().length)).toBeGreaterThan(0);
});
