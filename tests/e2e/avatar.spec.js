import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { expect, test } from '@playwright/test';
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

test('la franja de comida guardada en Ajustes mueve «hambre»', async ({ page }) => {
  await page.clock.setFixedTime(at(12, 30));
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'tamalecho:v1',
      JSON.stringify({ schemaVersion: 1, settings: { lunchStart: '13:00', lunchEnd: '15:00' } }),
    );
  });
  await page.goto('/');
  await expectAvatar(page, 'despierto');
});
