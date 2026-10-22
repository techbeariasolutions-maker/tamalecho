import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { EVIDENCE_DIR, ROUTES, WRITE_EVIDENCE } from './routes.js';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'];
const BLOCKING = ['serious', 'critical'];
const SUMMARY_FILE = fileURLToPath(new URL('axe-resumen.json', EVIDENCE_DIR));

function summarize(violations) {
  return violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.length,
  }));
}

// Con `npm run evidence` corre con un solo worker, así que leer y escribir el archivo es seguro.
function saveSummary(project, results) {
  let summary = { tags: TAGS, projects: {} };
  try {
    summary = JSON.parse(readFileSync(SUMMARY_FILE, 'utf8'));
  } catch {
    // Primera corrida: el archivo todavía no existe.
  }
  summary.projects[project] = { generatedAt: new Date().toISOString(), routes: results };
  mkdirSync(fileURLToPath(EVIDENCE_DIR), { recursive: true });
  writeFileSync(SUMMARY_FILE, `${JSON.stringify(summary, null, 2)}\n`);
}

test('T-12: axe sin violaciones serias ni críticas en cada ruta', async ({ page }, testInfo) => {
  const results = [];
  const blocking = [];

  const audit = async (label) => {
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    results.push({ route: label, violations: summarize(violations) });
    for (const violation of violations.filter((item) => BLOCKING.includes(item.impact))) {
      blocking.push(`${label}: ${violation.id} (${violation.impact}) — ${violation.help}`);
    }
  };

  for (const { path } of ROUTES) {
    await page.goto(path);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await audit(path);
  }

  // El ejemplo comparativo abierto y el menú móvil abierto también se revisan.
  await page.goto('/biblioteca/scrum');
  await page.getByText('Ver ejemplo: mismo problema, dos enfoques').click();
  await audit('/biblioteca/scrum (comparación abierta)');

  const toggle = page.getByRole('button', { name: 'Menú' });
  if (await toggle.isVisible()) {
    await toggle.click();
    await audit('/biblioteca/scrum (menú móvil abierto)');
  }

  if (WRITE_EVIDENCE) saveSummary(testInfo.project.name, results);
  expect(blocking, blocking.join('\n')).toEqual([]);
});
