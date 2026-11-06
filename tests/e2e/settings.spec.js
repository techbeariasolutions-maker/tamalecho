import { expect, test } from '@playwright/test';

// HT-04.2-A / HT-04.2-B (T2-03 en su parte de datos locales, T2-04).
// Todavía no hay formulario de horario (llega en WP-S2-6): los datos «guardados» se siembran
// directamente en el almacenamiento con la forma del esquema v1, como los dejaría la app.
const STORAGE_KEY = 'tamalecho:v1';
const SEEDED = {
  schemaVersion: 1,
  settings: {
    intervalMinutes: 120,
    startTime: '09:00',
    quietStart: '21:00',
    quietEnd: '08:00',
    lunchStart: '12:00',
    lunchEnd: '16:00',
    activeDays: [1, 2, 3, 4, 5],
    paused: true,
  },
  history: [
    { id: 'SCR-01', at: '2026-11-04T15:00:00.000Z' },
    { id: 'PMI-02', at: '2026-11-04T16:00:00.000Z' },
  ],
  favorites: [],
  progress: {},
  servedWindows: ['2026-11-04@14:00'],
  push: null,
};

function trackProblems(page) {
  const problems = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));
  // La confirmación es dentro de la página: cualquier diálogo nativo es un defecto.
  page.on('dialog', async (dialog) => {
    problems.push(`diálogo nativo: ${dialog.type()}`);
    await dialog.dismiss();
  });
  return problems;
}

const readStored = (page) => page.evaluate((key) => JSON.parse(window.localStorage.getItem(key)), STORAGE_KEY);

async function seed(page) {
  await page.goto('/ajustes');
  await page.evaluate(([key, value]) => window.localStorage.setItem(key, value), [STORAGE_KEY, JSON.stringify(SEEDED)]);
  await page.reload();
}

test('T2-03 (datos locales): al recargar se conservan los datos guardados', async ({ page }) => {
  const problems = trackProblems(page);
  await seed(page);

  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ajustes');
  await expect(page.getByText('Ahora hay 2 lecturas registradas.', { exact: false })).toBeVisible();

  // Navegar por la app y recargar no reescribe ni pierde los datos.
  await page.goto('/biblioteca/scrum');
  await page.goto('/ajustes');
  await page.reload();
  await expect(page.getByText('Ahora hay 2 lecturas registradas.', { exact: false })).toBeVisible();
  expect(await readStored(page)).toEqual(SEEDED);
  expect(problems).toEqual([]);
});

test('con datos corruptos la página carga sin errores y con valores seguros', async ({ page }) => {
  const problems = trackProblems(page);
  await page.goto('/ajustes');
  await page.evaluate((key) => window.localStorage.setItem(key, '{corrupto'), STORAGE_KEY);
  await page.reload();
  await expect(page.getByText('Ahora no hay lecturas registradas.', { exact: false })).toBeVisible();
  expect(problems).toEqual([]);
});

test('T2-04: restablecer pide confirmación en la página y deja los valores recomendados', async ({ page }) => {
  const problems = trackProblems(page);
  await seed(page);

  await page.getByRole('button', { name: 'Restablecer mis datos' }).click();
  const group = page.getByRole('group', { name: /¿Restablecer tus datos\?/ });
  await expect(group).toBeVisible();
  await expect(group.getByRole('button', { name: 'Cancelar' })).toBeFocused();

  // Cancelar no borra nada.
  await group.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByRole('button', { name: 'Restablecer mis datos' })).toBeFocused();
  expect(await readStored(page)).toEqual(SEEDED);

  await page.getByRole('button', { name: 'Restablecer mis datos' }).click();
  await page.getByRole('button', { name: 'Sí, restablecer' }).click();
  await expect(page.getByRole('status').filter({ hasText: 'Listo' })).toHaveText(/tus datos se restablecieron/);
  await expect(page.getByText('Ahora no hay lecturas registradas.', { exact: false })).toBeVisible();

  const afterReset = await readStored(page);
  expect(afterReset.settings).toEqual({
    intervalMinutes: 180,
    startTime: '08:00',
    quietStart: '21:00',
    quietEnd: '08:00',
    lunchStart: '12:00',
    lunchEnd: '16:00',
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    paused: false,
  });
  expect(afterReset.history).toEqual([]);
  // La ventana ya servida se conserva para no repetir el aviso (supuesto declarado en el PR).
  expect(afterReset.servedWindows).toEqual(['2026-11-04@14:00']);

  // Y se conserva al recargar.
  await page.reload();
  await expect(page.getByText('Ahora no hay lecturas registradas.', { exact: false })).toBeVisible();
  expect(problems).toEqual([]);
});

test('T2-04 con teclado: restablecer y cancelar sin ratón', async ({ page }) => {
  const problems = trackProblems(page);
  await seed(page);

  const reset = page.getByRole('button', { name: 'Restablecer mis datos' });
  // Llegar con Tab desde el h1 de la página.
  await page.locator('main#contenido').focus();
  for (let tries = 0; tries < 10 && !(await reset.evaluate((node) => node === document.activeElement)); tries += 1) {
    await page.keyboard.press('Tab');
  }
  await expect(reset).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Cancelar' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Sí, restablecer' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: 'Restablecer mis datos' })).toBeFocused();
  expect((await readStored(page)).history).toEqual([]);
  expect(problems).toEqual([]);
});

test('a 360 px la confirmación no provoca desplazamiento horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.goto('/ajustes');
  await page.getByRole('button', { name: 'Restablecer mis datos' }).click();
  await expect(page.getByRole('button', { name: 'Sí, restablecer' })).toBeVisible();
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  for (const name of ['Sí, restablecer', 'Cancelar']) {
    const box = await page.getByRole('button', { name }).boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
  }
});
