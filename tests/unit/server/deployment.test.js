// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import process from 'node:process';
import { describe, expect, it } from 'vitest';

describe('despliegue de las funciones', () => {
  // Vite y Vitest aceptan importaciones que Node rechaza, y Vercel corre api/ en Node sin Vite.
  // Por eso se importan en un proceso aparte: un error aquí solo se vería en producción.
  it.each(['api/push/subscribe.js', 'api/push/dispatch.js'])(
    '%s carga en Node sin Vite',
    (file) => {
      const script = `const { default: handler } = await import('./${file}');
        if (typeof handler.fetch !== 'function') throw new Error('Sin fetch');`;
      expect(() =>
        execFileSync(process.execPath, ['--input-type=module', '-e', script], { stdio: 'pipe' }),
      ).not.toThrow();
    },
    30_000,
  );

  it('vercel.json manda las páginas a la app y deja pasar /api/', () => {
    const { rewrites } = JSON.parse(readFileSync('vercel.json', 'utf8'));
    expect(rewrites).toHaveLength(1);
    const pattern = new RegExp(`^${rewrites[0].source}$`);
    expect(pattern.test('/biblioteca/scrum')).toBe(true);
    expect(pattern.test('/tip/SCR-01')).toBe(true);
    expect(pattern.test('/')).toBe(true);
    expect(pattern.test('/api/push/subscribe')).toBe(false);
    expect(pattern.test('/api/push/dispatch')).toBe(false);
  });

  // HT-08.2-A: encabezados de seguridad básicos en todas las respuestas.
  // S-05: la CSP se verifica en tests/e2e/csp.spec.js; aquí se fijan sus directivas.
  // WP-P5: el service worker y su manifiesto de precarga nunca quedan en la caché HTTP.
  it('vercel.json sirve sw.js y precache-manifest.json sin caché HTTP', () => {
    const { headers } = JSON.parse(readFileSync('vercel.json', 'utf8'));
    const rule = headers.find((entry) => entry.source === '/(sw\\.js|precache-manifest\\.json)');
    expect(rule.headers).toEqual([{ key: 'Cache-Control', value: 'no-cache' }]);
  });

  it('vercel.json agrega los encabezados de seguridad a todas las rutas', () => {
    const { headers } = JSON.parse(readFileSync('vercel.json', 'utf8'));
    expect(headers[0].source).toBe('/(.*)');
    const { 'Content-Security-Policy': csp, ...others } = Object.fromEntries(
      headers[0].headers.map(({ key, value }) => [key, value]),
    );
    expect(others).toEqual({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    });
    expect(csp).toBeTruthy();
  });

  it('la CSP solo permite el mismo origen y no admite scripts en línea ni eval', () => {
    const { headers } = JSON.parse(readFileSync('vercel.json', 'utf8'));
    const value = headers[0].headers.find((header) => header.key === 'Content-Security-Policy').value;
    const directives = Object.fromEntries(
      value.split(';').map((part) => {
        const [name, ...sources] = part.trim().split(/\s+/);
        return [name, sources];
      }),
    );
    expect(directives['default-src']).toEqual(["'self'"]);
    // Sin 'unsafe-inline' ni 'unsafe-eval' en los scripts (los estilos en línea sí, por los atributos style de React).
    expect(directives['script-src']).toEqual(["'self'"]);
    expect(directives['connect-src']).toEqual(["'self'"]);
    expect(directives['worker-src']).toEqual(["'self'"]);
    expect(directives['object-src']).toEqual(["'none'"]);
    expect(directives['frame-ancestors']).toEqual(["'none'"]);
    expect(directives['base-uri']).toEqual(["'self'"]);
    expect(directives['form-action']).toEqual(["'self'"]);
  });

  it('index.html no tiene scripts ni manejadores en línea (la CSP los bloquearía)', () => {
    const html = readFileSync('index.html', 'utf8');
    const scripts = [...html.matchAll(/<script\b([^>]*)>/g)];
    for (const [, attributes] of scripts) expect(attributes).toMatch(/\bsrc=/);
    expect(html).not.toMatch(/\son[a-z]+\s*=/i);
  });
});
