import { describe, expect, it } from 'vitest';
import { SUMMARY_MAX_LENGTH, validateCatalog } from '../../src/data/schema.js';
import { makeCatalog, makeTip } from './fixtures/catalog.js';

const rulesOf = (issues) => issues.map((issue) => issue.rule);

function catalogWith(tip) {
  const catalog = makeCatalog({ perFramework: 1 });
  catalog.tips[0] = tip;
  return catalog;
}

describe('validateCatalog', () => {
  it('un catálogo válido no tiene errores', () => {
    const { errors } = validateCatalog(makeCatalog());
    expect(errors).toEqual([]);
  });

  it('un catálogo válido y aprobado, con 12 por enfoque, pasa también en release', () => {
    const report = validateCatalog(makeCatalog({ perFramework: 12, approved: true }), { release: true });
    expect(report).toEqual({ errors: [], warnings: [] });
  });

  it.each([
    ['scr-1', 'id-formato'],
    ['SCR-001', 'id-formato'],
    ['ABC-01', 'id-formato'],
  ])('rechaza el id «%s»', (id, rule) => {
    const { errors } = validateCatalog(catalogWith(makeTip({ id })));
    expect(rulesOf(errors)).toContain(rule);
  });

  it('rechaza un id cuyo prefijo no coincide con el enfoque', () => {
    const { errors } = validateCatalog(catalogWith(makeTip({ id: 'PMI-07', framework: 'scrum' })));
    expect(errors).toContainEqual(expect.objectContaining({ tipId: 'PMI-07', rule: 'id-prefijo' }));
  });

  it('rechaza ids duplicados y nombra el tip original', () => {
    const catalog = makeCatalog();
    catalog.tips[1] = makeTip({ id: 'SCR-01', title: 'Otro título', summary: 'Otro resumen.' });
    const { errors } = validateCatalog(catalog);
    const duplicate = errors.find((issue) => issue.rule === 'id-duplicado');
    expect(duplicate.message).toContain('SCR-01');
  });

  it.each(['category', 'title', 'summary', 'knowledgeArea', 'action', 'explanation', 'commonMistake', 'example'])(
    'rechaza «%s» vacío',
    (field) => {
      const { errors } = validateCatalog(catalogWith(makeTip({ [field]: '   ' })));
      expect(errors).toContainEqual(
        expect.objectContaining({ tipId: 'SCR-01', rule: 'obligatorio', message: expect.stringContaining(`«${field}»`) }),
      );
    },
  );

  it('rechaza un campo obligatorio ausente', () => {
    const tip = makeTip();
    delete tip.example;
    const { errors } = validateCatalog(catalogWith(tip));
    expect(errors).toContainEqual(expect.objectContaining({ rule: 'obligatorio', message: expect.stringContaining('«example»') }));
  });

  it.each(['title', 'authors', 'edition', 'url'])('rechaza «source.%s» vacío', (field) => {
    const { errors } = validateCatalog(catalogWith(makeTip({ source: { [field]: '' } })));
    expect(errors).toContainEqual(expect.objectContaining({ message: expect.stringContaining(`«source.${field}»`) }));
  });

  it('rechaza «source.year» que no es número entero', () => {
    const { errors } = validateCatalog(catalogWith(makeTip({ source: { year: '2020' } })));
    expect(errors).toContainEqual(expect.objectContaining({ message: expect.stringContaining('source.year') }));
  });

  it('rechaza «tags» vacío y «version» inválida', () => {
    const { errors } = validateCatalog(catalogWith(makeTip({ tags: [], version: 0 })));
    const messages = errors.map((issue) => issue.message).join(' ');
    expect(messages).toContain('«tags»');
    expect(messages).toContain('«version»');
  });

  it('acepta vacíos en source.pages, reviewedBy y reviewedAt', () => {
    const { errors } = validateCatalog(catalogWith(makeTip({ source: { pages: '' }, reviewedBy: '', reviewedAt: '' })));
    expect(errors).toEqual([]);
  });

  it('rechaza un framework distinto de scrum o pmbok', () => {
    const { errors } = validateCatalog(catalogWith(makeTip({ framework: 'kanban' })));
    expect(rulesOf(errors)).toContain('framework');
  });

  it(`rechaza un summary de más de ${SUMMARY_MAX_LENGTH} caracteres`, () => {
    const { errors } = validateCatalog(catalogWith(makeTip({ summary: 'a'.repeat(SUMMARY_MAX_LENGTH + 1) })));
    expect(errors).toContainEqual(expect.objectContaining({ tipId: 'SCR-01', rule: 'summary-largo' }));
  });

  it(`acepta un summary de exactamente ${SUMMARY_MAX_LENGTH} caracteres`, () => {
    const { errors } = validateCatalog(catalogWith(makeTip({ summary: 'a'.repeat(SUMMARY_MAX_LENGTH) })));
    expect(rulesOf(errors)).not.toContain('summary-largo');
  });

  it.each(['http://example.org/fuente', 'example.org/fuente', 'https://'])('rechaza la URL «%s»', (url) => {
    const { errors } = validateCatalog(catalogWith(makeTip({ source: { url } })));
    expect(rulesOf(errors)).toContain('url');
  });

  it('rechaza títulos duplicados aunque cambien mayúsculas o espacios', () => {
    const catalog = makeCatalog();
    catalog.tips[1].title = `  ${catalog.tips[0].title.toUpperCase()} `;
    const { errors } = validateCatalog(catalog);
    expect(rulesOf(errors)).toContain('title-duplicado');
  });

  it('rechaza resúmenes duplicados', () => {
    const catalog = makeCatalog();
    catalog.tips[1].summary = catalog.tips[0].summary;
    const { errors } = validateCatalog(catalog);
    expect(rulesOf(errors)).toContain('summary-duplicado');
  });

  it.each(['1.0', 'v1.0.0', '01.0.0', ''])('rechaza catalogVersion «%s»', (catalogVersion) => {
    const { errors } = validateCatalog(makeCatalog({ catalogVersion }));
    expect(rulesOf(errors)).toContain('semver');
  });

  it('acepta catalogVersion con prerelease', () => {
    const { errors } = validateCatalog(makeCatalog({ catalogVersion: '1.0.0-rc.1' }));
    expect(errors).toEqual([]);
  });

  it('rechaza un catálogo sin lista de tips o que no es objeto', () => {
    expect(rulesOf(validateCatalog({ catalogVersion: '1.0.0' }).errors)).toContain('estructura');
    expect(rulesOf(validateCatalog(null).errors)).toContain('estructura');
  });

  describe('reglas de release', () => {
    it('sin --release, la falta de aprobación y de 12 por enfoque son advertencias', () => {
      const { errors, warnings } = validateCatalog(makeCatalog({ perFramework: 2 }));
      expect(errors).toEqual([]);
      expect(rulesOf(warnings)).toContain('minimo-por-enfoque');
      expect(warnings.filter((issue) => issue.rule === 'aprobacion')).toHaveLength(4);
    });

    it('con --release, la falta de aprobación es error', () => {
      const { errors } = validateCatalog(makeCatalog({ perFramework: 12 }), { release: true });
      expect(errors.filter((issue) => issue.rule === 'aprobacion')).toHaveLength(24);
    });

    it('con --release, menos de 12 por enfoque es error', () => {
      const { errors } = validateCatalog(makeCatalog({ perFramework: 11, approved: true }), { release: true });
      expect(errors.filter((issue) => issue.rule === 'minimo-por-enfoque')).toHaveLength(2);
    });

    it('con --release, falta solo reviewedAt también es error', () => {
      const catalog = makeCatalog({ perFramework: 12, approved: true });
      catalog.tips[3].reviewedAt = '';
      const { errors } = validateCatalog(catalog, { release: true });
      expect(errors).toEqual([expect.objectContaining({ tipId: 'SCR-04', rule: 'aprobacion' })]);
    });
  });
});
