import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompareExample from '../../src/features/library/CompareExample.jsx';
import { getComparison, getTips } from '../../src/services/catalog.js';

const comparison = getComparison();

describe('compare.json', () => {
  it('tiene una perspectiva por enfoque, en orden Scrum y PMI/PMBOK', () => {
    expect(comparison.perspectives.map((perspective) => perspective.framework)).toEqual(['scrum', 'pmbok']);
  });

  it('cada texto cita una fuente que ya está en el catálogo, con su página', () => {
    for (const { framework, source, text } of comparison.perspectives) {
      expect(text.trim().length, framework).toBeGreaterThan(0);
      expect(source.pages.trim(), framework).not.toBe('');
      const sameSource = getTips({ framework }).some(
        (tip) =>
          tip.source.title === source.title &&
          tip.source.edition === source.edition &&
          tip.source.year === source.year &&
          tip.source.url === source.url,
      );
      expect(sameSource, `${framework}: la fuente debe ser una de las ya citadas en tips.json`).toBe(true);
    }
  });

  it('cada página citada ya fue verificada en algún consejo del mismo enfoque', () => {
    for (const { framework, source } of comparison.perspectives) {
      const verified = new Set(
        getTips({ framework })
          .filter((tip) => tip.source.title === source.title)
          .flatMap((tip) => tip.source.pages.split(',').map((page) => page.trim())),
      );
      for (const page of source.pages.split(',').map((item) => item.trim())) {
        expect(verified.has(page), `${framework}: página ${page}`).toBe(true);
      }
    }
  });
});

describe('CompareExample', () => {
  it('está cerrado al inicio y se abre con el resumen', async () => {
    const { container } = render(<CompareExample />);
    const details = container.querySelector('details');
    expect(details).not.toHaveAttribute('open');
    await userEvent.setup().click(screen.getByText('Ver ejemplo: mismo problema, dos enfoques'));
    expect(details).toHaveAttribute('open');
  });

  it('muestra la situación, la aclaración de que no son equivalentes y ambos enfoques con su fuente', () => {
    render(<CompareExample />);
    expect(screen.getByRole('heading', { level: 2, name: 'Mismo problema, dos enfoques' })).toBeInTheDocument();
    expect(screen.getByText(comparison.notEquivalent)).toBeInTheDocument();
    for (const perspective of comparison.perspectives) {
      const column = screen.getByRole('article', { name: perspective.title });
      expect(within(column).getByText(perspective.text)).toBeInTheDocument();
      expect(within(column).getByRole('region', { name: `Fuente: ${perspective.title}` })).toBeInTheDocument();
    }
  });
});
