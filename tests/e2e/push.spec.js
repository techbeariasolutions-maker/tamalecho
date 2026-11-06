import { expect, test } from '@playwright/test';

// HU-15.1-A en el navegador. La suscripción real no se puede probar aquí: suscribirse necesita el
// servicio de push real, y el permiso inicial depende del binario (el headless shell de Chromium
// reporta «denied» aunque se conceda; el Chromium completo, «default»). Por eso cada prueba fija
// el permiso que necesita. La prueba real es manual (PRUEBAS T2-21).

function trackProblems(page) {
  const problems = [];
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(message.text());
  });
  page.on('pageerror', (error) => problems.push(error.message));
  return problems;
}

const pushSection = (page) => page.getByRole('region', { name: 'Avisos con la pestaña cerrada' });
const registrations = (page) =>
  page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length);

test('sin permiso: la sección lo explica, no hay botón y la página sigue funcionando', async ({ page }) => {
  const problems = trackProblems(page);
  await page.addInitScript(() => {
    Object.defineProperty(Notification, 'permission', { get: () => 'denied' });
  });
  await page.goto('/ajustes');
  await expect(pushSection(page)).toContainText('Bloqueaste las notificaciones de este sitio');
  await expect(pushSection(page).getByRole('button')).toHaveCount(0);

  // La lectura sigue funcionando.
  await page.goto('/tip/SCR-01');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Product Backlog');
  expect(problems).toEqual([]);
});

test('cargar Ajustes no registra el service worker ni pide permiso (HU-06.2-A)', async ({ page }) => {
  await page.addInitScript(() => {
    window.__permissionRequests = 0;
    const original = Notification.requestPermission.bind(Notification);
    Notification.requestPermission = (...args) => {
      window.__permissionRequests += 1;
      return original(...args);
    };
  });
  await page.goto('/ajustes');
  await expect(pushSection(page).locator('.push-state')).not.toHaveText(/Comprobando/);
  expect(await registrations(page)).toBe(0);
  expect(await page.evaluate(() => window.__permissionRequests)).toBe(0);
});

test('sin soporte: mensaje honesto y la página sigue funcionando', async ({ page }) => {
  const problems = trackProblems(page);
  await page.addInitScript(() => {
    delete window.PushManager;
  });
  await page.goto('/ajustes');
  await expect(pushSection(page)).toContainText(
    'Tu navegador no permite avisos con la pestaña cerrada; los avisos dentro de la página siguen funcionando.',
  );
  await expect(pushSection(page)).toContainText('En iPhone y iPad');
  await expect(pushSection(page).getByRole('button')).toHaveCount(0);
  await page.goto('/biblioteca/scrum');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Biblioteca de Scrum');
  expect(problems).toEqual([]);
});

test('desactivado: «Activar avisos» con teclado; si no se activa, la página no se rompe', async ({ page }) => {
  const problems = trackProblems(page);
  // Se simula un navegador que aún no ha decidido el permiso y que el usuario cierra el diálogo.
  await page.addInitScript(() => {
    Object.defineProperty(Notification, 'permission', { get: () => 'default' });
    Notification.requestPermission = async () => 'default';
  });
  await page.goto('/ajustes');
  const button = pushSection(page).getByRole('button', { name: 'Activar avisos' });
  await expect(pushSection(page)).toContainText('Estado: desactivados en este navegador.');

  await button.focus();
  await page.keyboard.press('Enter');
  // Sin VITE_VAPID_PUBLIC_KEY en el build (CI) responde «falta la configuración»; con la clave,
  // el diálogo cerrado deja «No diste permiso». En ambos casos sigue desactivado.
  await expect(pushSection(page).getByRole('status')).toHaveText(/falta la configuración|No diste permiso/);
  await expect(button).toBeVisible();
  expect(await registrations(page)).toBe(0);
  expect(problems).toEqual([]);
});

test('a 360 px la sección no provoca desplazamiento horizontal', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  await page.addInitScript(() => {
    Object.defineProperty(Notification, 'permission', { get: () => 'default' });
  });
  await page.goto('/ajustes');
  await expect(pushSection(page).getByRole('button', { name: 'Activar avisos' })).toBeVisible();
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  const box = await pushSection(page).getByRole('button', { name: 'Activar avisos' }).boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
});

test('el service worker se publica en /sw.js sin manejador de fetch', async ({ request }) => {
  const response = await request.get('/sw.js');
  expect(response.ok()).toBe(true);
  expect(response.headers()['content-type']).toMatch(/javascript/);
  const source = await response.text();
  expect(source).toContain("addEventListener('push'");
  expect(source).not.toContain("addEventListener('fetch'");
});
