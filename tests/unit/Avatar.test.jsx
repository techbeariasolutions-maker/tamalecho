import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import avatarCatalog from '../../src/data/avatarStates.json';
import Avatar from '../../src/features/avatar/Avatar.jsx';

// HT-05.1-B: un solo componente que cambia de expresión y frase según la franja.
const STATES = avatarCatalog.states;

describe('Avatar', () => {
  for (const [dayPart, state] of Object.entries(STATES)) {
    it(`«${dayPart}» muestra su expresión, su texto alternativo y su frase`, () => {
      const { container } = render(<Avatar dayPart={dayPart} />);
      const image = screen.getByRole('img', { name: state.alt });
      expect(image.tagName.toLowerCase()).toBe('svg');
      expect(container.querySelector('.avatar__face')).toHaveAttribute('data-expression', state.expression);
      expect(screen.getByRole('figure')).toHaveAttribute('data-day-part', dayPart);
      expect(screen.getByRole('figure').style.getPropertyValue('--avatar-bg')).toBe(`var(${state.colorToken})`);

      // La frase es texto visible fuera del SVG, en el figcaption de la figura.
      const phrase = screen.getByText(state.phrase);
      expect(phrase.tagName.toLowerCase()).toBe('figcaption');
      expect(image).not.toContainElement(phrase);
    });
  }

  it('el mismo componente cambia de expresión y frase al cambiar la franja', () => {
    const { container, rerender } = render(<Avatar dayPart="despierto" />);
    const figure = screen.getByRole('figure');
    rerender(<Avatar dayPart="cansado" />);
    expect(screen.getByRole('figure')).toBe(figure);
    expect(container.querySelector('.avatar__face')).toHaveAttribute('data-expression', STATES.cansado.expression);
    expect(screen.getByText(STATES.cansado.phrase)).toBeInTheDocument();
    expect(screen.queryByText(STATES.despierto.phrase)).not.toBeInTheDocument();
  });

  it('con una franja desconocida usa el estado de respaldo y no desaparece', () => {
    render(<Avatar dayPart="desconocida" />);
    expect(screen.getByRole('img', { name: STATES.despierto.alt })).toBeInTheDocument();
    expect(screen.getByText(STATES.despierto.phrase)).toBeInTheDocument();
  });

  it('la versión estática no declara animación y conserva el texto', () => {
    render(<Avatar dayPart="hambre" isStatic />);
    const figure = screen.getByRole('figure');
    expect(figure).toHaveClass('avatar--static');
    expect(figure).toHaveAttribute('data-animation', 'ninguna');
    expect(screen.getByRole('img', { name: STATES.hambre.alt })).toBeInTheDocument();
    expect(screen.getByText(STATES.hambre.phrase)).toBeInTheDocument();
  });

  it('no usa imágenes externas', () => {
    const { container } = render(<Avatar dayPart="atento" />);
    expect(container.querySelector('img, image, use')).toBeNull();
  });
});
