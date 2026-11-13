import { expect, test } from './fixtures.js';
import { tipsOf } from './catalog-data.js';
import { tabTo } from './keyboard-helpers.js';

test('T-11: solo con teclado se abre un consejo desde la biblioteca filtrada y se vuelve', async ({ page }) => {
  const category = 'Eventos';
  const [tip] = tipsOf('scrum', category);
  await page.goto('/biblioteca/scrum');

  await tabTo(page, page.getByRole('button', { name: category }));
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/categoria=Eventos$/);

  await tabTo(page, page.getByRole('link', { name: `Ver más sobre ${tip.title}` }));
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(tip.title);

  await tabTo(page, page.getByRole('link', { name: 'Volver a la biblioteca' }));
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/biblioteca\/scrum\?categoria=Eventos$/);
  await expect(page.getByRole('button', { name: category })).toHaveAttribute('aria-pressed', 'true');
});

test('el ejemplo comparativo se abre y se cierra con el teclado', async ({ page }) => {
  await page.goto('/biblioteca/pmbok');
  const summary = page.getByText('Ver ejemplo: mismo problema, dos enfoques');
  await tabTo(page, summary);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 2, name: 'Mismo problema, dos enfoques' })).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 2, name: 'Mismo problema, dos enfoques' })).toBeHidden();
});
