// @vitest-environment node
// Flujo editorial por repositorio (HU-14, D-23): esquema versionado, bitácora de publicaciones
// y reversión del catálogo.
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { describe, expect, it } from 'vitest';
import tipsData from '../../src/data/tips.json' with { type: 'json' };
import changelogData from '../../src/data/catalog-changelog.json' with { type: 'json' };
import { compareSemver, isIsoDate, validateCatalog, validateChangelog } from '../../src/data/schema.js';
import { createCatalog } from '../../src/services/catalog.js';
import { makeCatalog } from './fixtures/catalog.js';

const clone = (value) => structuredClone(value);
const rulesOf = (issues) => issues.map((issue) => issue.rule);

// Una entrada válida para el catálogo de prueba (versión 0.9.0, fecha 2026-10-22).
function makeChangelog(overrides = {}) {
  return {
    entries: [
      {
        version: '0.9.0',
        date: '2026-10-22',
        author: 'Autor de prueba',
        tips: ['SCR-01'],
        summary: 'Cambio de prueba.',
        approvedBy: 'Aprobador de prueba',
        ...overrides,
      },
    ],
  };
}

describe('utilidades de versión y fecha (HU-14.1-B)', () => {
  it('isIsoDate acepta solo fechas reales AAAA-MM-DD', () => {
    expect(isIsoDate('2026-11-13')).toBe(true);
    expect(isIsoDate('2024-02-29')).toBe(true);
    for (const value of ['2026-02-30', '2026-13-01', '13/11/2026', '2026-1-1', '', null, 20261113]) {
      expect(isIsoDate(value), String(value)).toBe(false);
    }
  });

  it('compareSemver ordena versiones y pone la prerelease antes de la final', () => {
    expect(compareSemver('1.0.0', '0.9.0')).toBeGreaterThan(0);
    expect(compareSemver('1.0.0', '1.0.10')).toBeLessThan(0);
    expect(compareSemver('1.0.0-rc.1', '1.0.0')).toBeLessThan(0);
    expect(compareSemver('1.2.3', '1.2.3')).toBe(0);
  });

  it.each(['2026-02-30', '22/10/2026', '', undefined])('el catálogo rechaza updatedAt «%s»', (updatedAt) => {
    const catalog = makeCatalog();
    catalog.updatedAt = updatedAt;
    expect(rulesOf(validateCatalog(catalog).errors)).toContain('fecha');
  });
});

describe('bitácora del catálogo (HU-14.2-A)', () => {
  it('la bitácora del repositorio es válida para el catálogo publicado, también en modo release', () => {
    expect(validateChangelog(changelogData, tipsData)).toEqual({ errors: [], warnings: [] });
    expect(validateChangelog(changelogData, tipsData, { release: true }).errors).toEqual([]);
  });

  it('falla si la versión publicada no tiene entrada', () => {
    const catalog = makeCatalog({ catalogVersion: '1.0.0' });
    expect(rulesOf(validateChangelog(makeChangelog(), catalog).errors)).toContain('sin-registro');
  });

  it('falla si la fecha de la entrada no coincide con updatedAt', () => {
    expect(rulesOf(validateChangelog(makeChangelog({ date: '2026-10-23' }), makeCatalog()).errors)).toContain('fecha');
  });

  it('falla si faltan autor, motivo o consejos, o si un consejo no existe', () => {
    const catalog = makeCatalog();
    expect(validateChangelog(makeChangelog({ author: '' }), catalog).errors.length).toBeGreaterThan(0);
    expect(validateChangelog(makeChangelog({ summary: ' ' }), catalog).errors.length).toBeGreaterThan(0);
    expect(validateChangelog(makeChangelog({ tips: [] }), catalog).errors.length).toBeGreaterThan(0);
    expect(rulesOf(validateChangelog(makeChangelog({ tips: ['SCR-99'] }), catalog).errors)).toContain('tip-desconocido');
  });

  it('falla con versiones repetidas, fuera de orden o si la publicada no es la última', () => {
    const catalog = makeCatalog();
    const entry = makeChangelog().entries[0];
    const repeated = { entries: [entry, { ...entry }] };
    expect(rulesOf(validateChangelog(repeated, catalog).errors)).toContain('version-duplicada');
    const newerFirst = { entries: [entry, { ...entry, version: '0.8.0' }] };
    expect(rulesOf(validateChangelog(newerFirst, catalog).errors)).toContain('orden');
  });

  it('sin aprobación es advertencia antes del release y error en el release', () => {
    const changelog = makeChangelog({ approvedBy: '' });
    const catalog = makeCatalog();
    expect(rulesOf(validateChangelog(changelog, catalog).warnings)).toEqual(['aprobacion']);
    expect(rulesOf(validateChangelog(changelog, catalog, { release: true }).errors)).toEqual(['aprobacion']);
  });

  it('rechaza una bitácora sin lista de entradas', () => {
    expect(rulesOf(validateChangelog({}, makeCatalog()).errors)).toEqual(['estructura']);
  });
});

// Simula el ciclo editorial completo de docs/EDITORIAL.md sobre el catálogo real:
// publicar un cambio y después revertirlo con un `git revert` (que regresa ambos archivos).
describe('publicación y reversión del catálogo (HU-14.2-B)', () => {
  function publishChange(catalog, changelog) {
    const nextCatalog = clone(catalog);
    const tip = nextCatalog.tips.find((entry) => entry.id === 'SCR-01');
    tip.summary = 'Resumen corregido de prueba.';
    tip.version += 1;
    nextCatalog.catalogVersion = '1.0.1';
    nextCatalog.updatedAt = '2026-11-18';
    const nextChangelog = clone(changelog);
    nextChangelog.entries.push({
      version: '1.0.1',
      date: '2026-11-18',
      author: 'Autor de prueba',
      tips: ['SCR-01'],
      summary: 'Corrección de prueba.',
      approvedBy: '',
    });
    return { nextCatalog, nextChangelog };
  }

  it('un cambio con su entrada en la bitácora es válido; sin la entrada, no', () => {
    const { nextCatalog, nextChangelog } = publishChange(tipsData, changelogData);
    expect(validateCatalog(nextCatalog).errors).toEqual([]);
    expect(validateChangelog(nextChangelog, nextCatalog).errors).toEqual([]);
    expect(rulesOf(validateChangelog(changelogData, nextCatalog).errors)).toContain('sin-registro');
  });

  it('el release no deja publicar el cambio sin aprobación registrada', () => {
    const { nextCatalog, nextChangelog } = publishChange(tipsData, changelogData);
    expect(rulesOf(validateChangelog(nextChangelog, nextCatalog, { release: true }).errors)).toContain('aprobacion');
  });

  it('al revertir vuelve el catálogo anterior completo, válido, y la app lo lee', () => {
    const before = clone(tipsData);
    const { nextCatalog } = publishChange(tipsData, changelogData);
    expect(createCatalog(nextCatalog).getTipById('SCR-01').summary).toBe('Resumen corregido de prueba.');

    // Revertir = volver a los archivos de antes (git revert del PR editorial).
    const reverted = clone(before);
    expect(validateCatalog(reverted, { release: true }).errors).toEqual([]);
    expect(validateChangelog(changelogData, reverted, { release: true }).errors).toEqual([]);
    const catalog = createCatalog(reverted);
    expect(catalog.getCatalogVersion()).toBe('1.0.0');
    expect(catalog.getTips()).toHaveLength(before.tips.length);
    expect(catalog.getTipById('SCR-01').summary).toBe(before.tips.find((tip) => tip.id === 'SCR-01').summary);
  });
});

describe('scripts/validate-tips.mjs con bitácora', () => {
  const SCRIPT = join(process.cwd(), 'scripts', 'validate-tips.mjs');
  const dir = mkdtempSync(join(tmpdir(), 'tamalecho-bitacora-'));
  const write = (name, value) => {
    const file = join(dir, name);
    writeFileSync(file, JSON.stringify(value));
    return file;
  };
  const run = (args) => {
    try {
      return { code: 0, output: execFileSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', stdio: 'pipe' }) };
    } catch (error) {
      return { code: error.status, output: `${error.stdout}${error.stderr}` };
    }
  };

  it('sin argumentos valida el catálogo y la bitácora del repositorio', () => {
    const { code, output } = run([]);
    expect(code).toBe(0);
    expect(output).toContain('con bitácora');
  });

  it('con --changelog falla si la versión publicada no está registrada', () => {
    const catalog = write('tips.json', makeCatalog({ catalogVersion: '1.0.0' }));
    const changelog = write('changelog.json', makeChangelog());
    const { code, output } = run([`--changelog=${changelog}`, catalog]);
    expect(code).toBe(1);
    expect(output).toContain('falta la entrada de la versión publicada 1.0.0');
  });
});
