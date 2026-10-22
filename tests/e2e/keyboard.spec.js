import { expect, test } from '@playwright/test';
import { tipsOf } from './catalog-data.js';

// Presiona Tab hasta que el foco llegue a `locator`. Falla si no llega en `max` pasos.
async function tabTo(page, locator, max = 40) {
  for (let step = 0; step < max; step += 1) {
    await page.keyboard.press('Tab');
    if (await locator.evaluate((element) => element === document.activeElement)) return step + 1;
    // Cada elemento que recibe el foco debe mostrar el anillo de foco.
    const outline = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement);
      return { style: style.outlineStyle, width: parseFloat(style.outlineWidth) };
    });
    expect(outline.style, 'anillo de foco visible').not.toBe('none');
    expect(outline.width, 'grosor del anillo de foco').toBeGreaterThan(0);
  }
  throw new Error(`El foco no llegó al elemento en ${max} pulsaciones de Tab`);
}

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
