import { expect } from './fixtures.js';

// Presiona Tab hasta que el foco llegue a `locator`. Falla si no llega en `max` pasos.
// Lo usan keyboard.spec.js y help.spec.js.
export async function tabTo(page, locator, max = 40) {
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
