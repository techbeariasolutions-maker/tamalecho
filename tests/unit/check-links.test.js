// @vitest-environment node
import { execFile } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import process from 'node:process';
import { promisify } from 'node:util';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { makeTip } from './fixtures/catalog.js';

const SCRIPT = join(process.cwd(), 'scripts', 'check-links.mjs');
const run = promisify(execFile);
let server;
let base;

beforeAll(async () => {
  server = createServer((request, response) => {
    if (request.url === '/ok') response.writeHead(200).end('ok');
    else if (request.url === '/solo-get' && request.method === 'HEAD') response.writeHead(405).end();
    else if (request.url === '/solo-get') response.writeHead(200).end('ok');
    else response.writeHead(404).end();
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

afterAll(() => new Promise((resolve) => server.close(resolve)));

function catalogWith(urls) {
  const tips = urls.map((url, index) => makeTip({ id: `SCR-0${index + 1}`, source: { url } }));
  const file = join(mkdtempSync(join(tmpdir(), 'tamalecho-')), 'tips.json');
  writeFileSync(file, JSON.stringify({ catalogVersion: '0.9.0', tips }));
  return file;
}

async function check(urls) {
  try {
    const { stdout } = await run(process.execPath, [SCRIPT, catalogWith(urls)]);
    return { code: 0, output: stdout };
  } catch (error) {
    return { code: error.code, output: `${error.stdout}${error.stderr}` };
  }
}

describe('scripts/check-links.mjs', () => {
  it('sale con 0 si todas las URL responden, y prueba con GET si HEAD falla', async () => {
    const { code, output } = await check([`${base}/ok`, `${base}/solo-get`]);
    expect(code).toBe(0);
    expect(output).toContain('Todos los enlaces responden');
  });

  it('sale con 1 y reporta el código HTTP y los tips afectados', async () => {
    const { code, output } = await check([`${base}/ok`, `${base}/no-existe`]);
    expect(code).toBe(1);
    expect(output).toMatch(/✖ .*\/no-existe {2}→ {2}HTTP 404 {2}\(SCR-02\)/);
  });

  it('revisa cada URL una sola vez aunque la usen varios tips', async () => {
    const { output } = await check([`${base}/ok`, `${base}/ok`]);
    expect(output).toContain('Revisando 1 URL distintas de 2 consejos');
    expect(output).toContain('(SCR-01, SCR-02)');
  });

  it('reporta un servidor que no responde', async () => {
    const { code, output } = await check(['http://127.0.0.1:1/']);
    expect(code).toBe(1);
    expect(output).toContain('sin respuesta');
  });
});
