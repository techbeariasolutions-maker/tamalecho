// Único punto de lectura del catálogo (CLAUDE.md §6). Ningún componente importa tips.json.
import tipsData from '../data/tips.json';
import { FRAMEWORKS } from '../data/schema.js';

export const FRAMEWORK_LABELS = { scrum: 'Scrum', pmbok: 'PMI/PMBOK' };

export function isFramework(value) {
  return FRAMEWORKS.includes(value);
}

// Día del año (1–366) según la fecha local, sin depender del horario de verano.
export function dayOfYear(date) {
  const start = Date.UTC(date.getFullYear(), 0, 1);
  const today = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((today - start) / 86_400_000) + 1;
}

// Crea las funciones de consulta sobre un catálogo. Son funciones puras sobre `catalog`;
// las pruebas la usan con fixtures propios.
export function createCatalog(catalog) {
  const tips = catalog.tips;

  function getCatalogVersion() {
    return catalog.catalogVersion;
  }

  function getTips({ framework, category } = {}) {
    return tips.filter(
      (tip) => (!framework || tip.framework === framework) && (!category || tip.category === category),
    );
  }

  function getTipById(id) {
    return tips.find((tip) => tip.id === id) ?? null;
  }

  // Categorías en el orden en que aparecen en el catálogo.
  function getCategories(framework) {
    return [...new Set(getTips({ framework }).map((tip) => tip.category))];
  }

  // Siguiente tip de la misma categoría y enfoque, con vuelta circular.
  // null si el tip no existe o es el único de su categoría.
  function getNextTip(id) {
    const tip = getTipById(id);
    if (!tip) return null;
    const group = getTips({ framework: tip.framework, category: tip.category });
    if (group.length < 2) return null;
    const index = group.findIndex((item) => item.id === id);
    return group[(index + 1) % group.length];
  }

  // Determinista por día del año (sin Math.random): el mismo día siempre da el mismo tip.
  function getFeaturedTip(date = new Date()) {
    if (tips.length === 0) return null;
    return tips[(dayOfYear(date) - 1) % tips.length];
  }

  return { getCatalogVersion, getTips, getTipById, getCategories, getNextTip, getFeaturedTip };
}

export const { getCatalogVersion, getTips, getTipById, getCategories, getNextTip, getFeaturedTip } =
  createCatalog(tipsData);
