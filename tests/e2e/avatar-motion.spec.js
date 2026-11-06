import { expect, test } from './fixtures.js';

// HT-05.2-A (T2-09, parte de la portada): con prefers-reduced-motion el personaje no se anima.
// Para no depender de tiempos, la prueba cambia data-expression a mano y cuenta las
// animaciones en el mismo instante: getAnimations() calcula los estilos y crea las
// transiciones que correspondan. El 9/11/2026 es lunes.
const at = (hours, minutes = 0, seconds = 0) => new Date(2026, 10, 9, hours, minutes, seconds);

// Cambia la expresión y devuelve cuántas animaciones hay justo después del cambio.
function animationsAfterChange(page, expression) {
  return page.evaluate((next) => {
    document.querySelector('.avatar').dataset.expression = next;
    return document.getAnimations().length;
  }, expression);
}

// Duraciones de transición calculadas para el personaje y sus rasgos.
function avatarTransitionDurations(page) {
  return page.evaluate(() =>
    [document.querySelector('.avatar'), ...document.querySelectorAll('.avatar *')].map(
      (node) => getComputedStyle(node).transitionDuration,
    ),
  );
}

test.describe('con movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('T2-09: el personaje no tiene animaciones ni transiciones en la portada', async ({ page }) => {
    await page.clock.setFixedTime(at(9));
    await page.goto('/');
    await expect(page.getByRole('figure')).toHaveAttribute('data-expression', 'sonriente');

    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    expect(new Set(await avatarTransitionDurations(page))).toEqual(new Set(['0s']));
    expect(await animationsAfterChange(page, 'somnoliento')).toBe(0);
  });

  test('al pasar la hora cambia de expresión sin animarse', async ({ page }) => {
    await page.clock.install({ time: at(11, 59, 30) });
    await page.goto('/');
    await expect(page.getByRole('figure')).toHaveAttribute('data-day-part', 'despierto');

    await page.clock.fastForward('00:31');
    await expect(page.getByRole('figure')).toHaveAttribute('data-day-part', 'hambre');
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });
});

test.describe('sin movimiento reducido (control)', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('el cambio de expresión sí tiene transición', async ({ page }) => {
    await page.clock.setFixedTime(at(9));
    await page.goto('/');
    await expect(page.getByRole('figure')).toHaveAttribute('data-expression', 'sonriente');

    expect(await animationsAfterChange(page, 'somnoliento')).toBeGreaterThan(0);
  });
});

// T2-09 con el aviso visible (pendiente de WP-S2-10, se completa con HU-06.1-A).
test.describe('con movimiento reducido y el aviso visible', () => {
  test.use({ reducedMotion: 'reduce', noticesPaused: false });

  test('T2-09: ni la portada ni el aviso tienen animaciones; el texto y los botones siguen ahí', async ({ page }) => {
    await page.clock.setFixedTime(at(14, 5));
    await page.goto('/');
    const notice = page.getByRole('status').filter({ hasText: 'Consejo de ahora' });
    await expect(notice).toBeVisible();
    await expect(notice.getByRole('figure')).toHaveAttribute('data-day-part', 'hambre');
    await expect(notice.getByRole('link', { name: /^Ver consejo sobre / })).toBeVisible();
    await expect(notice.getByRole('button', { name: 'Cerrar aviso' })).toBeVisible();
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  });
});
