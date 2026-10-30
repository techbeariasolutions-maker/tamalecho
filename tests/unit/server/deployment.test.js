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
});
