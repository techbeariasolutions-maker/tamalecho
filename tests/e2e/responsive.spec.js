import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
import { EVIDENCE_DIR, ROUTES, WRITE_EVIDENCE } from './routes.js';

const SCREENSHOT_DIR = fileURLToPath(new URL('360/', EVIDENCE_DIR));
const MIN_TARGET = 44;

test.describe('T-10: cada ruta a 360 px', () => {
  test.skip(({ isMobile }) => !isMobile, 'Solo se revisa en el proyecto mobile-360');

  for (const { path, file } of ROUTES) {
    test(`${path} sin desplazamiento horizontal y con objetivos táctiles ≥ 44 px`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, 'scrollWidth − innerWidth').toBeLessThanOrEqual(0);

      // Todo control visible (enlace, botón o resumen) mide al menos 44 × 44 px.
      const small = await page.evaluate((min) => {
        const controls = [...document.querySelectorAll('a[href], button, summary')];
        return controls
          .filter((element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== 'hidden')
          .filter((element) => !element.classList.contains('skip-link'))
          .map((element) => ({ text: element.textContent.trim().slice(0, 40), box: element.getBoundingClientRect() }))
          .filter(({ box }) => box.width < min || box.height < min)
          .map(({ text, box }) => `«${text}» ${Math.round(box.width)}×${Math.round(box.height)}`);
      }, MIN_TARGET);
      expect(small, small.join('\n')).toEqual([]);

      const fontSize = await page.evaluate(() => parseFloat(getComputedStyle(document.body).fontSize));
      expect(fontSize, 'texto base').toBeGreaterThanOrEqual(16);

      if (WRITE_EVIDENCE) {
        mkdirSync(SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: `${SCREENSHOT_DIR}${file}.png`, fullPage: true });
      }
    });
  }
});
