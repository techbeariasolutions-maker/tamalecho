import { expect, test } from './fixtures.js';

// Notificaciones del navegador (HU-06.2-A, HU-06.2-B). El permiso se simula con addInitScript:
// el permiso inicial real depende del binario de Chromium (ver push.spec.js).
const section = (page) => page.getByRole('region', { name: 'Notificaciones del navegador' });

function trackProblems(page) {
  const problems = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));
  return problems;
}

// Permiso simulado: `initial` al cargar y `answer` si se pide. Cuenta las veces que se pide.
async function simulatePermission(page, initial, answer = initial) {
  await page.addInitScript(
    ([start, reply]) => {
      let current = start;
      window.__permissionRequests = 0;
      Object.defineProperty(Notification, 'permission', { get: () => current });
      Notification.requestPermission = async () => {
        window.__permissionRequests += 1;
        current = reply;
        return reply;
      };
    },
    [initial, answer],
  );
}

test.describe('HU-06.2-A: permiso explícito', () => {
  test('T2-13: recorrer la app no pide el permiso de notificaciones', async ({ page }) => {
    await simulatePermission(page, 'default', 'granted');
    for (const path of ['/', '/biblioteca/scrum', '/tip/SCR-01', '/ajustes']) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => window.__permissionRequests)).toBe(0);
    }
    await expect(section(page).getByRole('button', { name: 'Activar notificaciones' })).toBeVisible();
  });

  test('el permiso se pide solo al pulsar «Activar notificaciones» (con teclado)', async ({ page }) => {
    const problems = trackProblems(page);
    await simulatePermission(page, 'default', 'granted');
    await page.goto('/ajustes');
    const button = section(page).getByRole('button', { name: 'Activar notificaciones' });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(section(page).getByRole('status')).toHaveText('Listo: las notificaciones quedaron permitidas.');
    expect(await page.evaluate(() => window.__permissionRequests)).toBe(1);
    await expect(section(page).getByRole('button')).toHaveCount(0);
    expect(problems).toEqual([]);
  });
});
