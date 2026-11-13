import { expect, test } from './fixtures.js';
import { tabTo } from './keyboard-helpers.js';

// Ayuda y privacidad (HU-13, HT-08.1-B). T3-13: se recorren solo con teclado.

test('T3-13: solo con teclado se va de la Ayuda al aviso de privacidad y de ahí a Ajustes', async ({ page }) => {
  await page.goto('/ayuda');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ayuda');

  await tabTo(page, page.getByRole('link', { name: 'Leer el aviso de privacidad' }), 60);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Privacidad');
  await expect(page).toHaveTitle('Privacidad · TamalEcho Tips');

  await tabTo(page, page.getByRole('link', { name: 'Ir a Ajustes para borrar tus datos' }), 60);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ajustes');
});

test('el aviso de privacidad se alcanza con teclado desde el pie de la portada', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const footerLink = page.getByRole('contentinfo').getByRole('link', { name: 'Aviso de privacidad' });
  await tabTo(page, footerLink, 80);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/privacidad$/);
});

test('el enlace de sugerencias abre GitHub en otra pestaña y lo avisa', async ({ page }) => {
  await page.goto('/ayuda');
  const link = page.getByRole('link', { name: /Enviar una sugerencia en GitHub/ });
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(link).toHaveAttribute('href', /^https:\/\/github\.com\/.+\/issues\/new\?template=sugerencia\.yml$/);
  await expect(link).toContainText('(se abre en otra pestaña)');
});

for (const path of ['/ayuda', '/privacidad']) {
  test(`${path} carga sin errores en la consola`, async ({ page }) => {
    const errors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });
}
