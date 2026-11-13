// Valida el catálogo de consejos con las reglas de src/data/schema.js y, si corresponde, su
// bitácora de publicaciones (HU-14.2-A).
// Uso: node scripts/validate-tips.mjs [--release] [--changelog=ruta] [ruta/al/catalogo.json]
// - Sin ruta de catálogo se validan tips.json y catalog-changelog.json del repositorio.
// - Con una ruta de catálogo (pruebas con fixtures), la bitácora solo se valida si se da --changelog.
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { validateCatalog, validateChangelog } from '../src/data/schema.js';

const DEFAULT_PATH = fileURLToPath(new URL('../src/data/tips.json', import.meta.url));
const DEFAULT_CHANGELOG_PATH = fileURLToPath(new URL('../src/data/catalog-changelog.json', import.meta.url));

const args = process.argv.slice(2);
const release = args.includes('--release');
const changelogArg = args.find((arg) => arg.startsWith('--changelog='));
const catalogArg = args.find((arg) => !arg.startsWith('--'));
const path = catalogArg ?? DEFAULT_PATH;
const changelogPath = changelogArg ? changelogArg.slice('--changelog='.length) : catalogArg ? null : DEFAULT_CHANGELOG_PATH;

async function readJson(file, what) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch (error) {
    console.error(`✖ No se pudo leer ${what} «${file}»: ${error.message}`);
    process.exit(1);
  }
}

const catalog = await readJson(path, 'el catálogo');
const report = validateCatalog(catalog, { release });
if (changelogPath) {
  const changelog = await readJson(changelogPath, 'la bitácora');
  const changelogReport = validateChangelog(changelog, catalog, { release });
  report.errors.push(...changelogReport.errors);
  report.warnings.push(...changelogReport.warnings);
}
const { errors, warnings } = report;
const tips = Array.isArray(catalog.tips) ? catalog.tips : [];
const byFramework = (framework) => tips.filter((tip) => tip?.framework === framework).length;

console.log(
  `Catálogo ${catalog.catalogVersion ?? '(sin versión)'}: ${tips.length} consejos ` +
    `(scrum ${byFramework('scrum')}, pmbok ${byFramework('pmbok')})` +
    (changelogPath ? ' · con bitácora' : '') +
    (release ? ' · modo release' : ''),
);

for (const warning of warnings) console.warn(`⚠ [${warning.tipId}] ${warning.message}`);
for (const error of errors) console.error(`✖ [${error.tipId}] ${error.message}`);

if (errors.length > 0) {
  console.error(`\nEl catálogo NO es válido: ${errors.length} error(es), ${warnings.length} advertencia(s).`);
  process.exit(1);
}

console.log(`\nEl catálogo es válido: 0 errores, ${warnings.length} advertencia(s).`);
