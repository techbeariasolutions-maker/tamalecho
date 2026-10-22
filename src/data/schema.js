// Contrato del tip (CLAUDE.md §8). Única definición de las reglas del catálogo:
// la usan scripts/validate-tips.mjs y las pruebas. Sin APIs de Node.

export const FRAMEWORKS = ['scrum', 'pmbok'];
export const ID_PREFIX_BY_FRAMEWORK = { scrum: 'SCR', pmbok: 'PMI' };
export const ID_PATTERN = /^(SCR|PMI)-\d{2}$/;
export const SUMMARY_MAX_LENGTH = 160;
export const MIN_TIPS_PER_FRAMEWORK = 12;

// Semver 2.0.0 (expresión oficial de semver.org).
const SEMVER_PATTERN =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

export const REQUIRED_TEXT_FIELDS = [
  'id',
  'framework',
  'category',
  'title',
  'summary',
  'knowledgeArea',
  'action',
  'explanation',
  'commonMistake',
  'example',
];
export const REQUIRED_SOURCE_TEXT_FIELDS = ['title', 'authors', 'edition', 'url'];
// Pueden ir vacíos: source.pages, reviewedBy y reviewedAt.
export const OPTIONAL_FIELDS = ['source.pages', 'reviewedBy', 'reviewedAt'];

const isNonEmptyString = (value) => typeof value === 'string' && value.trim() !== '';
const isPositiveInteger = (value) => Number.isInteger(value) && value > 0;
const normalize = (text) => text.trim().toLocaleLowerCase('es-MX');

function isHttpsUrl(value) {
  if (!isNonEmptyString(value)) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}

function tipLabel(tip, index) {
  return isNonEmptyString(tip?.id) ? tip.id : `consejo #${index + 1}`;
}

function checkTip(tip, index, report) {
  const label = tipLabel(tip, index);
  const error = (rule, message) => report.errors.push({ tipId: label, rule, message });

  if (tip === null || typeof tip !== 'object' || Array.isArray(tip)) {
    error('estructura', 'no es un objeto.');
    return;
  }

  for (const field of REQUIRED_TEXT_FIELDS) {
    if (!isNonEmptyString(tip[field])) error('obligatorio', `el campo «${field}» falta o está vacío.`);
  }

  if (isNonEmptyString(tip.id) && !ID_PATTERN.test(tip.id)) {
    error('id-formato', `el id «${tip.id}» no cumple el formato SCR-00 o PMI-00.`);
  }

  if (isNonEmptyString(tip.framework) && !FRAMEWORKS.includes(tip.framework)) {
    error('framework', `«framework» debe ser «scrum» o «pmbok»; tiene «${tip.framework}».`);
  }

  const expectedPrefix = ID_PREFIX_BY_FRAMEWORK[tip.framework];
  if (expectedPrefix && ID_PATTERN.test(tip.id ?? '') && !tip.id.startsWith(`${expectedPrefix}-`)) {
    error('id-prefijo', `el prefijo del id no coincide con «${tip.framework}»; debe empezar con ${expectedPrefix}-.`);
  }

  if (isNonEmptyString(tip.summary) && tip.summary.length > SUMMARY_MAX_LENGTH) {
    error(
      'summary-largo',
      `«summary» tiene ${tip.summary.length} caracteres; el máximo es ${SUMMARY_MAX_LENGTH}.`,
    );
  }

  if (!Array.isArray(tip.tags) || tip.tags.length === 0 || !tip.tags.every(isNonEmptyString)) {
    error('obligatorio', '«tags» debe ser una lista con al menos una etiqueta no vacía.');
  }

  if (!isPositiveInteger(tip.version)) {
    error('obligatorio', '«version» debe ser un número entero mayor que 0.');
  }

  const source = tip.source;
  if (source === null || typeof source !== 'object' || Array.isArray(source)) {
    error('obligatorio', 'el campo «source» falta o no es un objeto.');
  } else {
    for (const field of REQUIRED_SOURCE_TEXT_FIELDS) {
      if (!isNonEmptyString(source[field])) {
        error('obligatorio', `el campo «source.${field}» falta o está vacío.`);
      }
    }
    if (!isPositiveInteger(source.year)) {
      error('obligatorio', '«source.year» debe ser un año (número entero).');
    }
    if (isNonEmptyString(source.url) && !isHttpsUrl(source.url)) {
      error('url', `«source.url» debe ser una URL https:// válida; tiene «${source.url}».`);
    }
  }
}

function checkDuplicates(tips, field, rule, report) {
  const seen = new Map();
  tips.forEach((tip, index) => {
    const value = tip?.[field];
    if (!isNonEmptyString(value)) return;
    const key = field === 'id' ? value : normalize(value);
    const label = tipLabel(tip, index);
    if (seen.has(key)) {
      report.errors.push({
        tipId: label,
        rule,
        message: `«${field}» repetido: «${value}» ya lo usa ${seen.get(key)}.`,
      });
    } else {
      seen.set(key, label);
    }
  });
}

/**
 * Valida el catálogo completo.
 * @param {object} catalog contenido de tips.json
 * @param {{ release?: boolean }} options con release, las advertencias de aprobación
 *   y de «12 por enfoque» se vuelven errores
 * @returns {{ errors: Array<{tipId: string, rule: string, message: string}>, warnings: Array<{tipId: string, rule: string, message: string}> }}
 */
export function validateCatalog(catalog, { release = false } = {}) {
  const report = { errors: [], warnings: [] };
  const catalogIssue = (rule, message) => report.errors.push({ tipId: 'catálogo', rule, message });

  if (catalog === null || typeof catalog !== 'object' || Array.isArray(catalog)) {
    catalogIssue('estructura', 'el catálogo no es un objeto JSON.');
    return report;
  }

  if (!isNonEmptyString(catalog.catalogVersion) || !SEMVER_PATTERN.test(catalog.catalogVersion)) {
    catalogIssue('semver', `«catalogVersion» debe ser semver (por ejemplo 1.0.0); tiene «${catalog.catalogVersion ?? ''}».`);
  }

  if (!Array.isArray(catalog.tips)) {
    catalogIssue('estructura', '«tips» debe ser una lista.');
    return report;
  }

  const tips = catalog.tips;
  tips.forEach((tip, index) => checkTip(tip, index, report));
  checkDuplicates(tips, 'id', 'id-duplicado', report);
  checkDuplicates(tips, 'title', 'title-duplicado', report);
  checkDuplicates(tips, 'summary', 'summary-duplicado', report);

  // Reglas de release: antes del release son advertencias.
  const releaseTarget = release ? report.errors : report.warnings;

  for (const framework of FRAMEWORKS) {
    const count = tips.filter((tip) => tip?.framework === framework).length;
    if (count < MIN_TIPS_PER_FRAMEWORK) {
      releaseTarget.push({
        tipId: 'catálogo',
        rule: 'minimo-por-enfoque',
        message: `«${framework}» tiene ${count} consejos; el release exige al menos ${MIN_TIPS_PER_FRAMEWORK}.`,
      });
    }
  }

  tips.forEach((tip, index) => {
    if (tip === null || typeof tip !== 'object') return;
    if (!isNonEmptyString(tip.reviewedBy) || !isNonEmptyString(tip.reviewedAt)) {
      releaseTarget.push({
        tipId: tipLabel(tip, index),
        rule: 'aprobacion',
        message: 'sin aprobación del Product Owner: falta «reviewedBy» o «reviewedAt».',
      });
    }
  });

  return report;
}
