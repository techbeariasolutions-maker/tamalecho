import { expect, test } from '@playwright/test';
import { catalog, categoriesOf, tipsOf } from './catalog-data.js';

test('T-07: biblioteca filtrada → consejo → «Siguiente» → «Volver» conserva el filtro', async ({ page }) => {
  const category = categoriesOf('scrum').find((name) => tipsOf('scrum', name).length > 1);
  const [first, second] = tipsOf('scrum', category);

  await page.goto('/biblioteca/scrum');
  await page.getByRole('button', { name: category }).click();
  const filteredUrl = page.url();

  await page.getByRole('link', { name: `Ver más sobre ${first.title}` }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(first.title);

  await page.getByRole('link', { name: `Siguiente consejo: ${second.title}` }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(second.title);

  await page.getByRole('link', { name: 'Volver a la biblioteca' }).click();
  expect(page.url()).toBe(filteredUrl);
  await expect(page.getByRole('button', { name: category })).toHaveAttribute('aria-pressed', 'true');
});

test('«Volver» regresa a la biblioteca de origen aunque no tenga filtro', async ({ page }) => {
  const category = categoriesOf('pmbok').find((name) => tipsOf('pmbok', name).length > 1);
  const [first, second] = tipsOf('pmbok', category);

  await page.goto('/biblioteca/pmbok');
  await page.getByRole('link', { name: `Ver más sobre ${first.title}` }).click();
  await page.getByRole('link', { name: `Siguiente consejo: ${second.title}` }).click();
  await page.getByRole('link', { name: 'Volver a la biblioteca' }).click();

  await expect(page).toHaveURL(/\/biblioteca\/pmbok$/);
  await expect(page.getByRole('button', { name: 'Todas' })).toHaveAttribute('aria-pressed', 'true');
});

test('T-09: un consejo inexistente muestra el estado alterno', async ({ page }) => {
  await page.goto('/tip/SCR-99');
  await expect(page.getByText('Este consejo no existe o fue retirado.')).toBeVisible();
  await page.getByRole('link', { name: 'Ir a la biblioteca de consejos' }).click();
  await expect(page).toHaveURL(/\/biblioteca\/scrum$/);
});

test('T-06: los 24 consejos abren su ficha con explicación, ejemplo y fuente con edición', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));

  for (const tip of catalog.tips) {
    await page.goto(`/tip/${tip.id}`);
    await expect(page.getByRole('heading', { level: 1 }), tip.id).toHaveText(tip.title);
    await expect(page.getByText(tip.explanation, { exact: true }), tip.id).toBeVisible();
    await expect(page.getByText(tip.example, { exact: true }), tip.id).toBeVisible();

    const source = page.getByRole('region', { name: 'Fuente' });
    await expect(source, tip.id).toContainText(`${tip.source.authors} (${tip.source.year})`);
    await expect(source, tip.id).toContainText(tip.source.edition);
    const link = source.getByRole('link', { name: /se abre en otra pestaña/ });
    await expect(link, tip.id).toHaveAttribute('href', tip.source.url);
    await expect(link, tip.id).toHaveAttribute('target', '_blank');
    await expect(page.getByText(`Etiquetas: ${tip.tags.join(', ')}`), tip.id).toBeVisible();
  }
  expect(errors).toEqual([]);
});
