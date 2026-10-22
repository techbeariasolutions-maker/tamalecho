// Valida el catálogo de consejos con las reglas de src/data/schema.js.
// Uso: node scripts/validate-tips.mjs [--release] [ruta/al/catalogo.json]
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateCatalog } from '../src/data/schema.js';

const DEFAULT_PATH = fileURLToPath(new URL('../src/data/tips.json', import.meta.url));

const args = process.argv.slice(2);
const release = args.includes('--release');
const path = args.find((arg) => !arg.startsWith('--')) ?? DEFAULT_PATH;

let catalog;
try {
  catalog = JSON.parse(await readFile(path, 'utf8'));
} catch (error) {
  console.error(`✖ No se pudo leer el catálogo «${path}»: ${error.message}`);
  process.exit(1);
}

const { errors, warnings } = validateCatalog(catalog, { release });
const tips = Array.isArray(catalog.tips) ? catalog.tips : [];
const byFramework = (framework) => tips.filter((tip) => tip?.framework === framework).length;

console.log(
  `Catálogo ${catalog.catalogVersion ?? '(sin versión)'}: ${tips.length} consejos ` +
    `(scrum ${byFramework('scrum')}, pmbok ${byFramework('pmbok')})` +
    (release ? ' · modo release' : ''),
);

for (const warning of warnings) console.warn(`⚠ [${warning.tipId}] ${warning.message}`);
for (const error of errors) console.error(`✖ [${error.tipId}] ${error.message}`);

if (errors.length > 0) {
  console.error(`\nEl catálogo NO es válido: ${errors.length} error(es), ${warnings.length} advertencia(s).`);
  process.exit(1);
}

console.log(`\nEl catálogo es válido: 0 errores, ${warnings.length} advertencia(s).`);
