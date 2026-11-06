import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import avatarCatalog from '../../src/data/avatarStates.json' with { type: 'json' };

// HU-05.2-B · Expresividad accesible. Con movimiento reducido el personaje es estático, pero
// el estado y la frase se siguen entendiendo y la portada se sigue usando con teclado.
// La revisión con Narrador es manual (T2-10, Alan). El 9/11/2026 es lunes.
const STATES = avatarCatalog.states;
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];
const at = (hours, minutes = 0) => new Date(2026, 10, 9, hours, minutes);

const CASES = [
  { hour: 9, dayPart: 'despierto' },
  { hour: 14, dayPart: 'hambre' },
  { hour: 17, dayPart: 'atento' },
  { hour: 20, dayPart: 'cansado' },
];

// Siembra la franja de comida como la guardaría Ajustes (esquema v1 de storage.js).
async function seedLunch(page, lunchStart, lunchEnd) {
  await page.addInitScript(
    ([start, end]) => {
      window.localStorage.setItem(
        'tamalecho:v1',
        JSON.stringify({ schemaVersion: 1, settings: { lunchStart: start, lunchEnd: end } }),
      );
    },
    [lunchStart, lunchEnd],
  );
}

test.describe('con movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const { hour, dayPart } of CASES) {
    test(`a las ${hour}:00 el estado «${dayPart}» y su frase siguen disponibles y axe no reporta nada`, async ({
      page,
    }) => {
      await page.clock.setFixedTime(at(hour));
      await page.goto('/');

      const figure = page.getByRole('figure');
      await expect(figure.getByRole('img', { name: STATES[dayPart].alt })).toBeVisible();
      await expect(figure.getByText(STATES[dayPart].phrase, { exact: true })).toBeVisible();

      // Ninguna violación, de ningún nivel, dentro del personaje.
      const { violations } = await new AxeBuilder({ page }).include('.avatar').withTags(TAGS).analyze();
      expect(violations.map((violation) => `${violation.id} (${violation.impact})`)).toEqual([]);
    });
  }

  test('el personaje no agrega paradas de tabulación y la portada se recorre con teclado', async ({ page }) => {
    await page.clock.setFixedTime(at(14));
    await page.goto('/');
    await expect(page.getByRole('figure')).toBeVisible();

    // Nada dentro del personaje es enfocable.
    const focusable = await page
      .locator('.avatar')
      .evaluate((node) => node.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])').length);
    expect(focusable).toBe(0);

    // Con Tab se llega al consejo del día y a los accesos sin pasar por el personaje.
    const scrum = page.getByRole('link', { name: 'Explorar Scrum' });
    for (let step = 0; step < 15 && !(await scrum.evaluate((node) => node === document.activeElement)); step += 1) {
      await page.keyboard.press('Tab');
      const insideAvatar = await page.evaluate(() => Boolean(document.activeElement?.closest('.avatar')));
      expect(insideAvatar).toBe(false);
    }
    await expect(scrum).toBeFocused();
  });
});

test.describe('la franja de comida de Ajustes decide cuándo hay «hambre»', () => {
  for (const { time, dayPart } of [
    { time: [12, 30], dayPart: 'despierto' },
    { time: [13, 30], dayPart: 'hambre' },
    { time: [15, 0], dayPart: 'atento' },
  ]) {
    test(`con comida de 13:00 a 15:00, a las ${time.join(':').replace(/:0$/, ':00')} es «${dayPart}»`, async ({
      page,
    }) => {
      await seedLunch(page, '13:00', '15:00');
      await page.clock.setFixedTime(at(...time));
      await page.goto('/');
      await expect(page.getByRole('figure')).toHaveAttribute('data-day-part', dayPart);
      await expect(page.getByRole('figure').getByText(STATES[dayPart].phrase, { exact: true })).toBeVisible();
    });
  }
});
