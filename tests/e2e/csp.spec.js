import { readFileSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { ROUTES } from './routes.js';

// S-05: la Content-Security-Policy de vercel.json no debe romper ninguna ruta.
// `vite preview` no aplica los encabezados de vercel.json, así que aquí se agregan a cada respuesta
// del mismo sitio con page.route. Así un bloqueo se detecta en CI y no solo en Vercel.
const { headers: rules } = JSON.parse(readFileSync('vercel.json', 'utf8'));
const globalHeaders = Object.fromEntries(rules.find((rule) => rule.source === '/(.*)').headers.map(({ key, value }) => [key, value]));

async function applyVercelHeaders(page) {
  await page.route('**/*', async (route) => {
    const response = await route.fetch();
    await route.fulfill({ response, headers: { ...response.headers(), ...globalHeaders } });
  });
  // Registra cada violación de la política que el navegador detecte en la página.
  await page.addInitScript(() => {
    window.__cspViolations = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      window.__cspViolations.push(`${event.violatedDirective}: ${event.blockedURI}`);
    });
  });
}

const violations = (page) => page.evaluate(() => window.__cspViolations);

test.describe('Content-Security-Policy (S-05)', () => {
  test('la política llega en las respuestas y bloquea scripts en línea', async ({ page }) => {
    await applyVercelHeaders(page);
    const response = await page.goto('/');
    expect(response.headers()['content-security-policy']).toContain("script-src 'self'");

    // Control negativo: si la política no estuviera activa, este script se ejecutaría.
    const ran = await page.evaluate(() => {
      const script = document.createElement('script');
      script.textContent = 'window.__inlineRan = true';
      document.head.appendChild(script);
      return window.__inlineRan === true;
    });
    expect(ran).toBe(false);
    expect(await violations(page)).toEqual(expect.arrayContaining([expect.stringContaining('script-src')]));
  });

  for (const route of ROUTES.filter((entry) => !entry.seed)) {
    test(`${route.path} no tiene violaciones`, async ({ page }) => {
      await applyVercelHeaders(page);
      const consoleErrors = [];
      page.on('console', (message) => {
        if (/Content Security Policy|Refused to/i.test(message.text())) consoleErrors.push(message.text());
      });
      await page.goto(route.path);
      await page.waitForLoadState('networkidle');
      expect(await violations(page)).toEqual([]);
      expect(consoleErrors).toEqual([]);
    });
  }

  test('el service worker se registra con la política activa', async ({ page }) => {
    await applyVercelHeaders(page);
    await page.goto('/');
    // El registro del service worker (offline.js) usa solo el mismo origen: worker-src 'self'.
    const registered = await page.evaluate(async () => {
      if (!('serviceWorker' in navigator)) return false;
      const registration = await navigator.serviceWorker.ready;
      return Boolean(registration.active);
    });
    expect(registered).toBe(true);
    expect(await violations(page)).toEqual([]);
  });
});
