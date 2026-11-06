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

test.describe('HU-06.2-B: alternativa sin permiso', () => {
  // Estas pruebas necesitan que aparezca un aviso: sin la pausa del fixture común y con la hora fija.
  test.use({ noticesPaused: false });
  const at = (hours, minutes = 0) => new Date(2026, 10, 9, hours, minutes);

  test('T2-12: con el permiso denegado el aviso de la página aparece y la lectura funciona', async ({ page }) => {
    const problems = trackProblems(page);
    await simulatePermission(page, 'denied');
    await page.addInitScript(() => {
      // La ventana de las 08:00 ya se sirvió: el siguiente aviso es el de las 11:00.
      window.localStorage.setItem('tamalecho:v1', JSON.stringify({ schemaVersion: 1, servedWindows: ['2026-11-09@08:00'] }));
    });
    await page.clock.install({ time: at(10, 59) });
    await page.goto('/biblioteca/scrum');
    await page.clock.fastForward('01:00');

    const notice = page.getByRole('status').filter({ hasText: 'Consejo de ahora' });
    await expect(notice).toBeVisible();
    await notice.getByRole('link', { name: /^Ver consejo sobre / }).click();
    await expect(page).toHaveURL(/\/tip\//);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/ajustes');
    await expect(section(page)).toContainText('Bloqueaste las notificaciones de este sitio');
    await expect(section(page)).toContainText('Los avisos dentro de la página siguen funcionando.');
    await expect(section(page).getByRole('button')).toHaveCount(0);
    expect(await page.evaluate(() => window.__permissionRequests)).toBe(0);
    expect(problems).toEqual([]);
  });

  test('el enlace lleva a la sección de Web Push', async ({ page }) => {
    await simulatePermission(page, 'denied');
    await page.goto('/ajustes');
    await section(page).getByRole('link', { name: 'Ver «Avisos con la pestaña cerrada»' }).click();
    await expect(page).toHaveURL(/#avisos-pestana-cerrada$/);
    await expect(page.getByRole('heading', { name: 'Avisos con la pestaña cerrada' })).toBeInViewport();
  });

  test('sin soporte la sección lo explica y la página sigue funcionando', async ({ page }) => {
    const problems = trackProblems(page);
    await page.addInitScript(() => {
      delete window.Notification;
    });
    await page.goto('/ajustes');
    await expect(section(page)).toContainText('Tu navegador no permite notificaciones.');
    await expect(section(page).getByRole('button')).toHaveCount(0);
    await page.goto('/biblioteca/pmbok');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Biblioteca de PMI/PMBOK');
    expect(problems).toEqual([]);
  });
});
