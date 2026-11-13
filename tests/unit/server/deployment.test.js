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

  // HT-08.2-A: encabezados de seguridad básicos en todas las respuestas. No se incluye CSP todavía:
  // se propone en docs/sprint-3/SEGURIDAD.md y debe probarse en una vista previa antes de activarla.
  it('vercel.json agrega los encabezados de seguridad a todas las rutas', () => {
    const { headers } = JSON.parse(readFileSync('vercel.json', 'utf8'));
    expect(headers).toHaveLength(1);
    expect(headers[0].source).toBe('/(.*)');
    const values = Object.fromEntries(headers[0].headers.map(({ key, value }) => [key, value]));
    expect(values).toEqual({
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Frame-Options': 'DENY',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    });
  });
});
