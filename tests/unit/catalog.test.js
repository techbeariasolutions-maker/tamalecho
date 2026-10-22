import { describe, expect, it } from 'vitest';
import {
  createCatalog,
  dayOfYear,
  getCatalogVersion,
  getTips,
  isFramework,
} from '../../src/services/catalog.js';
import { makeTip } from './fixtures/catalog.js';

const FIXTURE = {
  catalogVersion: '2.3.4',
  tips: [
    makeTip({ id: 'SCR-01', framework: 'scrum', category: 'A' }),
    makeTip({ id: 'SCR-02', framework: 'scrum', category: 'B' }),
    makeTip({ id: 'SCR-03', framework: 'scrum', category: 'A' }),
    makeTip({ id: 'SCR-04', framework: 'scrum', category: 'A' }),
    makeTip({ id: 'PMI-01', framework: 'pmbok', category: 'C' }),
  ],
};
const catalog = createCatalog(FIXTURE);
const ids = (tips) => tips.map((tip) => tip.id);

describe('servicio del catálogo', () => {
  it('getCatalogVersion devuelve la versión', () => {
    expect(catalog.getCatalogVersion()).toBe('2.3.4');
  });

  describe('getTips', () => {
    it('sin filtros devuelve todos en el orden del catálogo', () => {
      expect(ids(catalog.getTips())).toEqual(['SCR-01', 'SCR-02', 'SCR-03', 'SCR-04', 'PMI-01']);
    });

    it('filtra por enfoque', () => {
      expect(ids(catalog.getTips({ framework: 'pmbok' }))).toEqual(['PMI-01']);
    });

    it('filtra por enfoque y categoría', () => {
      expect(ids(catalog.getTips({ framework: 'scrum', category: 'A' }))).toEqual(['SCR-01', 'SCR-03', 'SCR-04']);
    });

    it('una categoría inexistente o de otro enfoque devuelve una lista vacía', () => {
      expect(catalog.getTips({ framework: 'scrum', category: 'Z' })).toEqual([]);
      expect(catalog.getTips({ framework: 'scrum', category: 'C' })).toEqual([]);
    });
  });

  describe('getTipById', () => {
    it('encuentra un tip existente', () => {
      expect(catalog.getTipById('SCR-02').category).toBe('B');
    });

    it('devuelve null para un id inexistente', () => {
      expect(catalog.getTipById('SCR-99')).toBeNull();
    });
  });

  describe('getCategories', () => {
    it('devuelve las categorías sin repetir, en orden de aparición', () => {
      expect(catalog.getCategories('scrum')).toEqual(['A', 'B']);
    });

    it('un enfoque sin tips devuelve una lista vacía', () => {
      expect(createCatalog({ tips: [] }).getCategories('scrum')).toEqual([]);
    });
  });

  describe('getNextTip', () => {
    it('devuelve el siguiente de la misma categoría y enfoque', () => {
      expect(catalog.getNextTip('SCR-01').id).toBe('SCR-03');
      expect(catalog.getNextTip('SCR-03').id).toBe('SCR-04');
    });

    it('da la vuelta al llegar al último', () => {
      expect(catalog.getNextTip('SCR-04').id).toBe('SCR-01');
    });

    it('devuelve null si es el único de su categoría', () => {
      expect(catalog.getNextTip('SCR-02')).toBeNull();
      expect(catalog.getNextTip('PMI-01')).toBeNull();
    });

    it('devuelve null para un id inexistente', () => {
      expect(catalog.getNextTip('SCR-99')).toBeNull();
    });
  });

  describe('getFeaturedTip', () => {
    it('es determinista: la misma fecha da el mismo tip', () => {
      const date = new Date(2026, 9, 21, 9, 0);
      const later = new Date(2026, 9, 21, 23, 59);
      expect(catalog.getFeaturedTip(date)).toBe(catalog.getFeaturedTip(later));
    });

    it('avanza un tip por día y da la vuelta', () => {
      expect(catalog.getFeaturedTip(new Date(2026, 0, 1)).id).toBe('SCR-01');
      expect(catalog.getFeaturedTip(new Date(2026, 0, 2)).id).toBe('SCR-02');
      expect(catalog.getFeaturedTip(new Date(2026, 0, 6)).id).toBe('SCR-01');
    });

    it('devuelve null si el catálogo está vacío', () => {
      expect(createCatalog({ tips: [] }).getFeaturedTip(new Date())).toBeNull();
    });
  });

  it('dayOfYear cuenta desde 1 y considera años bisiestos', () => {
    expect(dayOfYear(new Date(2026, 0, 1))).toBe(1);
    expect(dayOfYear(new Date(2026, 11, 31))).toBe(365);
    expect(dayOfYear(new Date(2028, 11, 31))).toBe(366);
  });

  it('isFramework solo acepta scrum y pmbok', () => {
    expect(isFramework('scrum')).toBe(true);
    expect(isFramework('pmbok')).toBe(true);
    expect(isFramework('kanban')).toBe(false);
    expect(isFramework(undefined)).toBe(false);
  });

  it('las funciones exportadas leen el catálogo real (tips.json)', () => {
    expect(getCatalogVersion()).toMatch(/^\d+\.\d+\.\d+/);
    expect(getTips().length).toBeGreaterThan(0);
  });
});
