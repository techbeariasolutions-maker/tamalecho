import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { filterTips, searchTips } from '../../src/services/search.js';
import { getTips } from '../../src/services/catalog.js';
import ConceptFilter from '../../src/features/library/ConceptFilter.jsx';

// WP-P4 (D-26): filtros combinados (HU-09.2-A) y sus pruebas (HU-09.2-B).
const all = getTips();

// Congela la lista y cada consejo: si alguna función intentara modificarlos, la prueba fallaría.
function frozenCatalog() {
  return Object.freeze(all.map((tip) => Object.freeze({ ...tip, tags: Object.freeze([...tip.tags]) })));
}

describe('filterTips', () => {
  it('sin criterios devuelve todos los consejos', () => {
    expect(filterTips(all)).toHaveLength(all.length);
  });

  it('combina enfoque, tema y texto', () => {
    const scrum = filterTips(all, { framework: 'scrum' });
    expect(scrum.every((tip) => tip.framework === 'scrum')).toBe(true);

    const events = filterTips(all, { framework: 'scrum', category: 'Eventos' });
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((tip) => tip.framework === 'scrum' && tip.category === 'Eventos')).toBe(true);

    const sprint = filterTips(all, { framework: 'scrum', category: 'Eventos', query: 'sprint' });
    expect(sprint.length).toBeGreaterThan(0);
    expect(sprint.length).toBeLessThanOrEqual(events.length);
    expect(sprint).toEqual(searchTips(events, 'sprint'));
  });

  it('un tema que no es del enfoque no devuelve nada (no mezcla enfoques)', () => {
    const pmbokCategory = all.find((tip) => tip.framework === 'pmbok').category;
    expect(filterTips(all, { framework: 'scrum', category: pmbokCategory })).toEqual([]);
  });

  it('no distingue mayúsculas ni acentos', () => {
    const plain = filterTips(all, { framework: 'pmbok', query: 'gestion' });
    expect(plain.length).toBeGreaterThan(0);
    expect(filterTips(all, { framework: 'pmbok', query: 'GESTIÓN' })).toEqual(plain);
  });

  it('no modifica el catálogo original: ni lo reordena ni le quita consejos', () => {
    const catalog = frozenCatalog();
    const before = JSON.stringify(catalog);
    expect(() => filterTips(catalog, { framework: 'scrum', category: 'Eventos', query: 'sprint' })).not.toThrow();
    expect(() => searchTips(catalog, 'backlog valor')).not.toThrow();
    expect(JSON.stringify(catalog)).toBe(before);
    expect(getTips()).toHaveLength(all.length);
  });
});

describe('ConceptFilter: selector único reutilizable', () => {
  it('nombra el campo con el enfoque y avisa cada cambio', async () => {
    const onQueryChange = vi.fn();
    const onCategoryChange = vi.fn();
    render(
      <ConceptFilter
        label="Scrum"
        query=""
        categories={['Eventos', 'Responsabilidades']}
        selected="Eventos"
        onQueryChange={onQueryChange}
        onCategoryChange={onCategoryChange}
      />,
    );
    const user = userEvent.setup();
    await user.type(screen.getByRole('searchbox', { name: 'Buscar en Scrum' }), 'a');
    expect(onQueryChange).toHaveBeenCalledWith('a');

    const group = screen.getByRole('group', { name: 'Filtrar por categoría' });
    expect(within(group).getByRole('button', { name: 'Eventos' })).toHaveAttribute('aria-pressed', 'true');
    await user.click(within(group).getByRole('button', { name: 'Responsabilidades' }));
    expect(onCategoryChange).toHaveBeenCalledWith('Responsabilidades');
  });
});
