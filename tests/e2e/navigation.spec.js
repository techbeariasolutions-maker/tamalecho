import { expect, test } from '@playwright/test';

const SECTIONS = [
  { label: 'Inicio', url: /\/$/, h1: 'TamalEcho Tips' },
  { label: 'Biblioteca', url: /\/biblioteca\/scrum$/, h1: 'Biblioteca de Scrum' },
  { label: 'Historial', url: /\/historial$/, h1: 'Historial' },
  { label: 'Progreso', url: /\/progreso$/, h1: 'Progreso' },
  { label: 'Ajustes', url: /\/ajustes$/, h1: 'Ajustes' },
  { label: 'Ayuda', url: /\/ayuda$/, h1: 'Ayuda' },
];

function trackConsoleErrors(page) {
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

for (const section of SECTIONS) {
  test(`desde la portada se llega a ${section.label} en 3 clics o menos`, async ({ page }) => {
    const errors = trackConsoleErrors(page);
    let clicks = 0;
    await page.goto('/');

    const nav = page.getByRole('navigation', { name: 'Principal' });
    const toggle = nav.getByRole('button', { name: 'Menú' });
    if (await toggle.isVisible()) {
      await toggle.click();
      clicks += 1;
    }
    await nav.getByRole('link', { name: section.label, exact: true }).click();
    clicks += 1;

    await expect(page).toHaveURL(section.url);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(section.h1);
    expect(clicks).toBeLessThanOrEqual(3);
    expect(errors).toEqual([]);
  });
}

test('el menú es una barra visible en escritorio y un botón en móvil', async ({ page, isMobile }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Principal' });
  const toggle = nav.getByRole('button', { name: 'Menú' });
  const firstLink = nav.getByRole('link', { name: 'Inicio' });

  if (isMobile) {
    await expect(toggle).toBeVisible();
    await expect(firstLink).toBeHidden();
  } else {
    await expect(toggle).toBeHidden();
    await expect(firstLink).toBeVisible();
  }
});

test('«Saltar al contenido» es el primer elemento enfocable y mueve el foco a main', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skipLink = page.getByRole('link', { name: 'Saltar al contenido' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();

  await page.keyboard.press('Enter');
  await expect(page.locator('main#contenido')).toBeFocused();
});

test.describe('menú móvil solo con teclado', () => {
  test.skip(({ isMobile }) => !isMobile, 'El botón de menú solo existe en móvil');

  test('abre, recorre, cierra con Escape y navega', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Principal' });
    const toggle = nav.getByRole('button', { name: 'Menú' });

    // Saltar al contenido → marca → botón Menú
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(toggle).toBeFocused();

    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await page.keyboard.press('Tab');
    await expect(nav.getByRole('link', { name: 'Inicio' })).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
    await expect(nav.getByRole('link', { name: 'Inicio' })).toBeHidden();

    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await expect(nav.getByRole('link', { name: 'Biblioteca' })).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page).toHaveURL(/\/biblioteca\/scrum$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Biblioteca de Scrum');
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await expect(toggle).toBeFocused();
  });
});

test('una ruta inexistente muestra NotFound con enlace al inicio', async ({ page }) => {
  await page.goto('/esto-no-existe');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('No encontramos esta página');
  await page.getByRole('link', { name: 'Volver al inicio' }).click();
  await expect(page).toHaveURL(/\/$/);
});
