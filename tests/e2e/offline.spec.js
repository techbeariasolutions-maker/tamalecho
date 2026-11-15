import { expect, test } from './fixtures.js';

// Lectura sin conexión y PWA (HU-12, HT-06.2; WP-P5, D-26). Corre contra el build (vite preview):
// el service worker real precarga lo publicado y Playwright corta la red.

test('después de una visita con red, una ficha se lee sin conexión y la página lo indica', async ({ page, context }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  // Espera a que el service worker esté activo y controle la página (la precarga terminó).
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
    }
  });

  await context.setOffline(true);
  await page.goto('/tip/SCR-02');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByText(/Sin conexión\. Puedes seguir leyendo/)).toBeVisible();

  // Volver la red quita el aviso.
  await context.setOffline(false);
  await expect(page.getByText(/Sin conexión/)).toBeHidden();
});

test('el build publica el manifest y la lista de precarga con su versión', async ({ request }) => {
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  const precache = await (await request.get('/precache-manifest.json')).json();
  expect(precache.version).toMatch(/^[0-9a-f]{12}$/);
  expect(precache.urls).toContain('/');
  expect(precache.urls.some((url) => url.startsWith('/assets/'))).toBe(true);
  expect(precache.urls.some((url) => url.startsWith('/api/'))).toBe(false);
});
