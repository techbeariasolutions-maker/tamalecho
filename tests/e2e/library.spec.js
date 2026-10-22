import { expect, test } from '@playwright/test';
import { categoriesOf, tipsOf } from './catalog-data.js';

for (const framework of ['scrum', 'pmbok']) {
  test(`T-04: ${framework} muestra sus categorías y todos sus consejos`, async ({ page }) => {
    await page.goto(`/biblioteca/${framework}`);
    const filter = page.getByRole('group', { name: 'Filtrar por categoría' });
    await expect(filter.getByRole('button')).toHaveText(['Todas', ...categoriesOf(framework)]);

    const total = tipsOf(framework).length;
    await expect(page.getByRole('status')).toHaveText(`${total} consejos`);
    await expect(page.getByRole('list', { name: /^Consejos de / }).getByRole('article')).toHaveCount(total);
  });
}

test('el filtro de categoría cambia la URL y la lista', async ({ page }) => {
  await page.goto('/biblioteca/pmbok');
  const [category] = categoriesOf('pmbok');
  await page.getByRole('button', { name: category }).click();

  await expect(page).toHaveURL(new RegExp(`\\?categoria=${encodeURIComponent(category).replace(/%20/g, '(\\+|%20)')}$`));
  await expect(page.getByRole('button', { name: category })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('list', { name: /^Consejos de / }).getByRole('article')).toHaveCount(
    tipsOf('pmbok', category).length,
  );

  await page.getByRole('button', { name: 'Todas' }).click();
  await expect(page).toHaveURL(/\/biblioteca\/pmbok$/);
});

test('el selector de enfoque cambia de biblioteca', async ({ page }) => {
  await page.goto('/biblioteca/scrum');
  await page.getByRole('navigation', { name: 'Enfoque' }).getByRole('link', { name: 'PMI/PMBOK' }).click();
  await expect(page).toHaveURL(/\/biblioteca\/pmbok$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Biblioteca de PMI/PMBOK');
});

test('un enfoque inválido muestra NotFound', async ({ page }) => {
  await page.goto('/biblioteca/kanban');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('No encontramos esta página');
});
