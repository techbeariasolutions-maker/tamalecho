import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './fixtures.js';

// Tarjeta del aviso dentro de la página (HU-06.1-A).
// La hora se fija con page.clock: lunes 9/11/2026, hora local del sistema (la misma del navegador).
// Ajustes recomendados: cada 3 h desde las 08:00 (08, 11, 14, 17 y 20 h), silencio de 21:00 a 08:00.
test.use({ noticesPaused: false });

const at = (day, hours, minutes = 0) => new Date(2026, 10, day, hours, minutes);
const notice = (page) => page.getByRole('status').filter({ hasText: 'Consejo de ahora' });
const noticeCards = (page) => page.locator('.notice');

test.describe('HU-06.1-A: tarjeta emergente', () => {
  test('el aviso se anuncia sin robar el foco y muestra el personaje, el título y el resumen', async ({ page }) => {
    await page.clock.setFixedTime(at(9, 14, 5));
    await page.goto('/');
    await expect(notice(page)).toBeVisible();
    await expect(notice(page).getByRole('figure')).toHaveAttribute('data-day-part', 'hambre');
    await expect(notice(page).getByRole('link', { name: /^Ver consejo sobre / })).toBeVisible();
    await expect(notice(page).getByRole('button', { name: 'Cerrar aviso' })).toBeVisible();
    expect(await page.evaluate(() => document.activeElement === document.body)).toBe(true);
  });

  test('T2-11: «Ver consejo» abre la ficha del consejo del aviso', async ({ page }) => {
    await page.clock.setFixedTime(at(9, 14, 5));
    await page.goto('/');
    const link = notice(page).getByRole('link', { name: /^Ver consejo sobre / });
    const title = (await link.getAttribute('aria-label')).replace('Ver consejo sobre ', '');
    await link.click();
    await expect(page).toHaveURL(/\/tip\//);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(noticeCards(page)).toHaveCount(0);
  });

  test('T2-11: «Cerrar» deja la página como estaba', async ({ page }) => {
    await page.clock.setFixedTime(at(9, 14, 5));
    await page.goto('/biblioteca/scrum?categoria=Eventos');
    await expect(notice(page)).toBeVisible();
    const cards = await page.getByRole('list', { name: /^Consejos de / }).getByRole('article').count();
    await notice(page).getByRole('button', { name: 'Cerrar aviso' }).click();
    await expect(noticeCards(page)).toHaveCount(0);
    await expect(page).toHaveURL(/\/biblioteca\/scrum\?categoria=Eventos$/);
    await expect(page.getByRole('button', { name: 'Eventos' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('list', { name: /^Consejos de / }).getByRole('article')).toHaveCount(cards);
  });

  test('T2-11: Escape cierra el aviso sin mover lo que se está leyendo', async ({ page }) => {
    await page.clock.setFixedTime(at(9, 14, 5));
    await page.goto('/biblioteca/scrum');
    await expect(notice(page)).toBeVisible();
    // Se baja hasta que el aviso queda fuera de la vista (en 360 px está en el flujo, arriba).
    await page.mouse.wheel(0, 900);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(600);

    // La primera tarjeta visible y su posición en la pantalla, antes y después de cerrar.
    const firstVisibleCard = () =>
      page.evaluate(() => {
        const card = [...document.querySelectorAll('article')].find((item) => item.getBoundingClientRect().top >= 0);
        return { id: card.getAttribute('aria-labelledby'), top: Math.round(card.getBoundingClientRect().top) };
      });
    const before = await firstVisibleCard();
    await page.keyboard.press('Escape');
    await expect(noticeCards(page)).toHaveCount(0);
    const after = await firstVisibleCard();
    expect(after.id).toBe(before.id);
    expect(Math.abs(after.top - before.top)).toBeLessThanOrEqual(1);
  });

  test('T2-23: a 360 px el aviso no tapa el contenido ni provoca desplazamiento horizontal', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 });
    await page.clock.setFixedTime(at(9, 14, 5));
    await page.goto('/');
    await expect(notice(page)).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    // El aviso va en el flujo: el h1 queda debajo, no detrás.
    const card = await noticeCards(page).boundingBox();
    const heading = await page.getByRole('heading', { level: 1 }).boundingBox();
    expect(heading.y).toBeGreaterThanOrEqual(card.y + card.height);
  });

  test('T2-24: axe sin violaciones con el aviso visible', async ({ page }) => {
    await page.clock.setFixedTime(at(9, 14, 5));
    await page.goto('/');
    await expect(notice(page)).toBeVisible();
    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
      .analyze();
    const blocking = violations.filter((violation) => ['serious', 'critical'].includes(violation.impact));
    expect(blocking.map((violation) => `${violation.id}: ${violation.help}`)).toEqual([]);
  });
});
