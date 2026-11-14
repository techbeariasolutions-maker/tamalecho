import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import { describe, expect, it } from 'vitest';

// HT-05.2-B (WP-P2): peso del personaje ≤ 100 KB y sin JavaScript de animación.
// HU-05.2-A: gestos breves que terminan solos. Vitest corre desde la raíz del repositorio.
const read = (path) => readFileSync(resolve(process.cwd(), path), 'utf8');
const component = read('src/features/avatar/Avatar.jsx');
const states = read('src/data/avatarStates.json');
const css = read('src/styles/global.css');
const avatarCss = css.slice(css.indexOf('/* ── Personaje'), css.indexOf('/* ── Biblioteca'));

describe('presupuesto del personaje (HT-05.2-B)', () => {
  it('el componente, sus estados y su CSS suman 100 KB o menos', () => {
    const bytes = [component, states, avatarCss].reduce((total, text) => total + Buffer.byteLength(text, 'utf8'), 0);
    expect(avatarCss.length).toBeGreaterThan(0);
    expect(bytes).toBeLessThanOrEqual(100 * 1024);
  });

  it('no usa JavaScript de animación ni imágenes externas: todo es SVG y CSS', () => {
    for (const api of ['requestAnimationFrame', 'setInterval', 'setTimeout', '.animate(', '<img', 'url(']) {
      expect(component, api).not.toContain(api);
    }
  });
});

describe('gestos del personaje (HU-05.2-A)', () => {
  it('estiramiento, gesto de comida y bostezo existen y se ejecutan un número finito de veces', () => {
    expect(avatarCss).toMatch(/avatar-stretch var\(--avatar-gesture-duration\) ease-in-out var\(--avatar-gesture-delay\) 1/);
    expect(avatarCss).toMatch(/avatar-rub var\(--avatar-rub-duration\) ease-in-out var\(--avatar-gesture-delay\) 4 alternate/);
    expect(avatarCss).toMatch(/avatar-yawn var\(--avatar-gesture-duration\) ease-in-out var\(--avatar-gesture-delay\) 1/);
  });

  it('ninguna animación del personaje se repite sin fin (WCAG 2.2.2)', () => {
    expect(avatarCss).not.toContain('infinite');
  });

  it('las duraciones salen de tokens.css y valen 0 con movimiento reducido', () => {
    const tokens = read('src/styles/tokens.css');
    const reduced = tokens.slice(tokens.indexOf('@media (prefers-reduced-motion: reduce)'));
    for (const token of ['--avatar-gesture-duration', '--avatar-rub-duration']) {
      expect(tokens).toContain(`${token}:`);
      expect(reduced).toContain(`${token}: 0ms`);
    }
  });
});
