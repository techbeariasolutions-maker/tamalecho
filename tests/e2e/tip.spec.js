import { expect, test } from '@playwright/test';
import { catalog } from './catalog-data.js';

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
  }
  expect(errors).toEqual([]);
});
