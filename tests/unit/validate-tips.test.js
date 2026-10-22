// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { describe, expect, it } from 'vitest';
import { makeCatalog } from './fixtures/catalog.js';

const SCRIPT = join(process.cwd(), 'scripts', 'validate-tips.mjs');

function run(args) {
  try {
    const stdout = execFileSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8', stdio: 'pipe' });
    return { code: 0, output: stdout };
  } catch (error) {
    return { code: error.status, output: `${error.stdout}${error.stderr}` };
  }
}

function writeCatalog(catalog) {
  const file = join(mkdtempSync(join(tmpdir(), 'tamalecho-')), 'tips.json');
  writeFileSync(file, typeof catalog === 'string' ? catalog : JSON.stringify(catalog));
  return file;
}

describe('scripts/validate-tips.mjs', () => {
  it('sale con 0 si el catálogo es válido', () => {
    const { code, output } = run([writeCatalog(makeCatalog())]);
    expect(code).toBe(0);
    expect(output).toContain('El catálogo es válido');
  });

  it('sale con 1 y nombra el tip y la regla si hay un error', () => {
    const catalog = makeCatalog();
    catalog.tips[1].source.url = 'http://example.org';
    const { code, output } = run([writeCatalog(catalog)]);
    expect(code).toBe(1);
    expect(output).toContain('[SCR-02]');
    expect(output).toContain('https://');
  });

  it('con --release, la falta de aprobación hace fallar', () => {
    const file = writeCatalog(makeCatalog({ perFramework: 12 }));
    expect(run([file]).code).toBe(0);
    expect(run(['--release', file]).code).toBe(1);
  });

  it('sale con 1 si el archivo no es JSON válido', () => {
    const { code, output } = run([writeCatalog('{ esto no es json')]);
    expect(code).toBe(1);
    expect(output).toContain('No se pudo leer el catálogo');
  });
});
