// Revisa que cada source.url distinta del catálogo responda. Usa la red: solo local, no va en CI.
// Uso: node scripts/check-links.mjs [ruta/al/catalogo.json]
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const CATALOG_PATH = process.argv[2] ?? fileURLToPath(new URL('../src/data/tips.json', import.meta.url));
const TIMEOUT_MS = 15_000;
const HEADERS = { 'user-agent': 'TamalEcho-check-links/1.0 (+https://github.com/techbeariasolutions-maker/tamalecho)' };

async function request(url, method) {
  return fetch(url, { method, redirect: 'follow', headers: HEADERS, signal: AbortSignal.timeout(TIMEOUT_MS) });
}

// Algunos servidores no aceptan HEAD: si falla, se intenta con GET.
async function check(url) {
  try {
    let response = await request(url, 'HEAD');
    if (!response.ok) response = await request(url, 'GET');
    return { url, ok: response.ok, detail: `HTTP ${response.status}` };
  } catch (error) {
    const cause = error.cause;
    return { url, ok: false, detail: `sin respuesta (${cause?.code || cause?.message || error.message})` };
  }
}

const catalog = JSON.parse(await readFile(CATALOG_PATH, 'utf8'));
const usage = new Map();
for (const tip of catalog.tips) {
  const url = tip.source?.url;
  if (!url) continue;
  usage.set(url, [...(usage.get(url) ?? []), tip.id]);
}

console.log(`Revisando ${usage.size} URL distintas de ${catalog.tips.length} consejos…\n`);
const results = await Promise.all([...usage.keys()].map(check));

for (const result of results) {
  const ids = usage.get(result.url).join(', ');
  console.log(`${result.ok ? '✔' : '✖'} ${result.url}  →  ${result.detail}  (${ids})`);
}

const broken = results.filter((result) => !result.ok);
if (broken.length > 0) {
  console.error(`\n${broken.length} enlace(s) con problema. Ábrelos a mano antes de darlos por rotos: algunos sitios bloquean scripts.`);
  process.exit(1);
}
console.log('\nTodos los enlaces responden.');
