import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from './fixtures.js';
import avatarCatalog from '../../src/data/avatarStates.json' with { type: 'json' };
import { WRITE_EVIDENCE } from './routes.js';

// T2-08 (HT-05.1, HU-05.1-B): a las 09:00, 14:00, 17:00 y 20:00 la portada muestra el estado
// y la frase correctos. Las horas se construyen como hora local del sistema, la misma que usa
// el navegador de Playwright. El 9/11/2026 es lunes.
const STATES = avatarCatalog.states;
const EVIDENCE_DIR = fileURLToPath(new URL('../../docs/evidencias/sprint-2/T2-08/', import.meta.url));
const at = (hours, minutes = 0, seconds = 0) => new Date(2026, 10, 9, hours, minutes, seconds);

const CASES = [
  { hour: 9, dayPart: 'despierto' },
  { hour: 14, dayPart: 'hambre' },
  { hour: 17, dayPart: 'atento' },
  { hour: 20, dayPart: 'cansado' },
];

async function expectAvatar(page, dayPart) {
  const { alt, phrase } = STATES[dayPart];
  const figure = page.getByRole('figure');
  await expect(figure).toHaveAttribute('data-day-part', dayPart);
  await expect(figure.getByRole('img', { name: alt })).toBeVisible();
  await expect(figure.getByText(phrase, { exact: true })).toBeVisible();
}

for (const { hour, dayPart } of CASES) {
  const label = `${String(hour).padStart(2, '0')}:00`;

  test(`T2-08: a las ${label} el personaje está «${dayPart}» con su frase`, async ({ page, isMobile }) => {
    await page.clock.setFixedTime(at(hour));
    await page.goto('/');
    await expectAvatar(page, dayPart);

    if (WRITE_EVIDENCE && isMobile) {
      mkdirSync(EVIDENCE_DIR, { recursive: true });
      await page.screenshot({ path: `${EVIDENCE_DIR}${label.replace(':', '')}-${dayPart}.png` });
    }
  });
}

// HU-05.1-A: en el navegador real solo se ve la boca del estado y las cejas cambian de forma.
test('cada hora muestra solo la boca de su expresión y mueve las cejas', async ({ page }) => {
  const browTransforms = new Set();
  for (const { hour, dayPart } of CASES) {
    await page.clock.setFixedTime(at(hour));
    await page.goto('/');
    await expectAvatar(page, dayPart);
    const visible = await page.evaluate(() =>
      [...document.querySelectorAll('[data-mouth]')]
        .filter((node) => getComputedStyle(node).opacity === '1')
        .map((node) => node.dataset.mouth),
    );
    expect(visible).toEqual([STATES[dayPart].expression]);
    browTransforms.add(
      await page.locator('.avatar__brow--left').evaluate((node) => getComputedStyle(node).transform),
    );
  }
  // Despierto, hambre, atento y cansado ponen las cejas en 4 posiciones distintas.
  expect(browTransforms.size).toBe(4);
});

test('el mismo personaje cambia de expresión y frase al pasar la hora, sin recargar', async ({ page }) => {
  await page.clock.install({ time: at(11, 59, 30) });
  await page.goto('/');
  await expectAvatar(page, 'despierto');
  const figure = await page.getByRole('figure').elementHandle();

  await page.clock.fastForward('00:31');
  await expectAvatar(page, 'hambre');
  // Es el mismo nodo: el componente se actualizó, no se volvió a montar la página.
  expect(await figure.evaluate((node) => node.isConnected)).toBe(true);
});
