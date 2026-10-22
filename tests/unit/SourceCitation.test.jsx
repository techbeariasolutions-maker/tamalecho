import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SourceCitation from '../../src/components/SourceCitation.jsx';
import { makeTip } from './fixtures/catalog.js';

const citation = () => screen.getByText(/Autor, A\./);

describe('SourceCitation', () => {
  it('formatea la fuente sin página cuando no existe', () => {
    render(<SourceCitation source={makeTip().source} />);
    expect(citation()).toHaveTextContent('Fuente: Autor, A. (2020). Fuente de prueba, Primera edición.');
    expect(citation().textContent).not.toMatch(/\bpp?\./);
  });

  it.each([
    ['42', 'p. 42.'],
    ['9–10', 'pp. 9–10.'],
    ['6, 11', 'pp. 6, 11.'],
  ])('con la página «%s» muestra «%s»', (pages, expected) => {
    render(<SourceCitation source={makeTip({ source: { pages } }).source} />);
    expect(citation()).toHaveTextContent(`Primera edición. ${expected}`);
  });

  it('el enlace abre en otra pestaña y lo dice', () => {
    render(<SourceCitation source={makeTip().source} />);
    const link = screen.getByRole('link', { name: 'Consultar «Fuente de prueba» (se abre en otra pestaña)' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('sin URL muestra el texto de la fuente sin enlace', () => {
    render(<SourceCitation source={makeTip({ source: { url: '' } }).source} />);
    expect(citation()).toBeInTheDocument();
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('usa la etiqueta de región indicada', () => {
    render(<SourceCitation source={makeTip().source} label="Fuente: Desde Scrum" />);
    expect(screen.getByRole('region', { name: 'Fuente: Desde Scrum' })).toBeInTheDocument();
  });
});
