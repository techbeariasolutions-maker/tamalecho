// Genera los íconos de la PWA (HU-12.1-A) a partir del dibujo del personaje, con el Chromium de
// Playwright que ya usan las pruebas E2E. Se corre a mano cuando cambie el personaje:
//   node scripts/generate-icons.mjs
// Escribe public/icons/icon-192.png, icon-512.png e icon-maskable-512.png. Los colores salen de
// tokens.css (personaje, D-24); se repiten aquí porque el ícono es una imagen fija.
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const OUT = fileURLToPath(new URL('../public/icons/', import.meta.url));

const COLORS = {
  ink: '#17302a',
  masa: '#f6cf55',
  dorado: '#e3a83a',
  hoja: '#a8d08d',
  mejilla: '#f29c84',
  fondo: '#fff1b8',
  crema: '#fdf7ea',
};

// Personaje «despierto» (mismo dibujo que Avatar.jsx, sin animación). `maskable` deja margen
// seguro (80 % central) para íconos que el sistema recorta en círculo o en otra forma.
function svg({ maskable }) {
  const scale = maskable ? 0.72 : 0.9;
  const offset = (120 - 120 * scale) / 2;
  const background = maskable
    ? `<rect width="120" height="120" fill="${COLORS.fondo}"/>`
    : `<circle cx="60" cy="60" r="58" fill="${COLORS.fondo}" stroke="${COLORS.ink}" stroke-width="3"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
  ${background}
  <g transform="translate(${offset} ${offset}) scale(${scale})" stroke="${COLORS.ink}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
    <path d="M50 96 L48 110" stroke-width="4.8" fill="none"/>
    <path d="M70 96 L72 110" stroke-width="4.8" fill="none"/>
    <path d="M60 6 C90 22 98 76 60 104 C22 76 30 22 60 6 Z" fill="${COLORS.hoja}"/>
    <path d="M60 20 C80 20 86 38 86 60 C86 84 76 98 60 98 C44 98 34 84 34 60 C34 38 40 20 60 20 Z" fill="${COLORS.masa}"/>
    <path d="M42 34 Q60 42 78 34" stroke="${COLORS.dorado}" fill="none"/>
    <path d="M40 86 Q60 94 80 86" stroke="${COLORS.dorado}" fill="none"/>
    <path d="M34 64 Q26 70 25 78" stroke-width="4.8" fill="none"/>
    <path d="M86 62 Q97 54 96 41" stroke-width="4.8" fill="none"/>
    <circle cx="96" cy="39" r="4" fill="${COLORS.masa}"/>
    <ellipse cx="44" cy="66" rx="5" ry="3" fill="${COLORS.mejilla}" stroke="none"/>
    <ellipse cx="76" cy="66" rx="5" ry="3" fill="${COLORS.mejilla}" stroke="none"/>
    <path d="M43 46 Q49 42 55 46" fill="none"/>
    <path d="M65 46 Q71 42 77 46" fill="none"/>
    <circle cx="49" cy="56" r="5" fill="${COLORS.ink}" stroke="none"/>
    <circle cx="71" cy="56" r="5" fill="${COLORS.ink}" stroke="none"/>
    <path d="M51 70 Q60 78 69 70" fill="none"/>
  </g>
</svg>`;
}

const ICONS = [
  { file: 'icon-192.png', size: 192, maskable: false },
  { file: 'icon-512.png', size: 512, maskable: false },
  { file: 'icon-maskable-512.png', size: 512, maskable: true },
];

mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch();
for (const { file, size, maskable } of ICONS) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  const transparent = maskable ? '' : 'background: transparent;';
  await page.setContent(
    `<html><body style="margin:0;${transparent}"><div style="width:${size}px;height:${size}px">${svg({ maskable })}</div></body></html>`,
  );
  await page.locator('svg').evaluate((node, px) => {
    node.setAttribute('width', px);
    node.setAttribute('height', px);
  }, size);
  await page.locator('div').screenshot({ path: `${OUT}${file}`, omitBackground: !maskable });
  await page.close();
  console.log(`✓ ${file} (${size} × ${size})`);
}
await browser.close();
