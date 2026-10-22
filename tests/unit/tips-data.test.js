import { describe, expect, it } from 'vitest';
import { validateCatalog } from '../../src/data/schema.js';
import { getCategories, getTips } from '../../src/services/catalog.js';
import catalog from '../../src/data/tips.json';

// Protege en CI el catálogo real: si alguien rompe un tip, falla aquí además del validador.
describe('catálogo real (src/data/tips.json)', () => {
  it('no tiene errores de validación', () => {
    expect(validateCatalog(catalog).errors).toEqual([]);
  });

  it('tiene 12 consejos por enfoque (D-02)', () => {
    expect(getTips({ framework: 'scrum' })).toHaveLength(12);
    expect(getTips({ framework: 'pmbok' })).toHaveLength(12);
  });

  it('cada enfoque tiene sus propias categorías', () => {
    const scrum = getCategories('scrum');
    const pmbok = getCategories('pmbok');
    expect(scrum.length).toBeGreaterThan(0);
    expect(pmbok.length).toBeGreaterThan(0);
    expect(scrum.filter((category) => pmbok.includes(category))).toEqual([]);
  });

  it('cada consejo tiene fuente con edición y al menos una etiqueta', () => {
    for (const tip of getTips()) {
      expect(tip.source.edition, tip.id).not.toBe('');
      expect(tip.tags.length, tip.id).toBeGreaterThan(0);
    }
  });
});
