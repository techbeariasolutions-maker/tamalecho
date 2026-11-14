import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import avatarCatalog from '../../src/data/avatarStates.json';
import Avatar from '../../src/features/avatar/Avatar.jsx';

// HT-05.1-B: un solo componente que cambia de expresión y frase según la franja.
const STATES = avatarCatalog.states;
const REACTIONS = avatarCatalog.reactions;
const ALL_EXPRESSIONS = [...Object.values(STATES), ...Object.values(REACTIONS)].map((state) => state.expression);

describe('Avatar', () => {
  for (const [dayPart, state] of Object.entries(STATES)) {
    it(`«${dayPart}» muestra su expresión, su texto alternativo y su frase`, () => {
      const { container } = render(<Avatar dayPart={dayPart} />);
      const image = screen.getByRole('img', { name: state.alt });
      expect(image.tagName.toLowerCase()).toBe('svg');
      expect(container.querySelector('figure')).toHaveAttribute('data-expression', state.expression);
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
    expect(container.querySelector('figure')).toHaveAttribute('data-expression', STATES.cansado.expression);
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

  // HU-05.1-A: las 4 expresiones viven en el mismo SVG; cambiar de estado no cambia los nodos.
  it('las 4 expresiones comparten el mismo SVG, las mismas cejas y los mismos ojos', () => {
    const { container, rerender } = render(<Avatar dayPart="despierto" />);
    const svg = container.querySelector('svg');
    const brows = [...container.querySelectorAll('.avatar__brow')];
    const eyes = [...container.querySelectorAll('.avatar__eye')];
    expect(brows).toHaveLength(2);
    expect(eyes).toHaveLength(4);

    for (const dayPart of ['hambre', 'atento', 'cansado', 'despierto']) {
      rerender(<Avatar dayPart={dayPart} />);
      expect(container.querySelector('svg')).toBe(svg);
      expect([...container.querySelectorAll('.avatar__brow')]).toEqual(brows);
      expect([...container.querySelectorAll('.avatar__eye')]).toEqual(eyes);
    }
  });

  it('tiene una boca y una pose por expresión, incluidas las reacciones (D-24)', () => {
    const { container } = render(<Avatar dayPart="despierto" />);
    const mouths = [...container.querySelectorAll('[data-mouth]')].map((node) => node.dataset.mouth);
    const poses = [...container.querySelectorAll('[data-pose]')].map((node) => node.dataset.pose);
    expect(mouths.sort()).toEqual([...ALL_EXPRESSIONS].sort());
    expect(poses.sort()).toEqual([...ALL_EXPRESSIONS].sort());
  });

  // Rediseño D-24: al completar una misión el personaje reacciona «orgulloso».
  it('la reacción «orgulloso» tiene prioridad sobre la franja y conserva la franja en data-day-part', () => {
    const { rerender } = render(<Avatar dayPart="atento" reaction="orgulloso" />);
    const figure = screen.getByRole('figure');
    expect(figure).toHaveAttribute('data-expression', 'orgulloso');
    expect(figure).toHaveAttribute('data-reaction', 'orgulloso');
    expect(figure).toHaveAttribute('data-day-part', 'atento');
    expect(screen.getByRole('img', { name: REACTIONS.orgulloso.alt })).toBeInTheDocument();
    expect(screen.getByText(REACTIONS.orgulloso.phrase)).toBeInTheDocument();

    // Sin reacción vuelve a la franja, con el mismo nodo.
    rerender(<Avatar dayPart="atento" />);
    expect(screen.getByRole('figure')).toBe(figure);
    expect(figure).not.toHaveAttribute('data-reaction');
    expect(figure).toHaveAttribute('data-expression', STATES.atento.expression);
  });

  it('una reacción desconocida se ignora', () => {
    render(<Avatar dayPart="hambre" reaction="inventada" />);
    expect(screen.getByRole('figure')).toHaveAttribute('data-expression', STATES.hambre.expression);
  });

  it('el tamaño «hero» agrega su clase', () => {
    render(<Avatar dayPart="despierto" size="hero" />);
    expect(screen.getByRole('figure')).toHaveClass('avatar--hero');
  });

  it('no usa imágenes externas', () => {
    const { container } = render(<Avatar dayPart="atento" />);
    expect(container.querySelector('img, image, use')).toBeNull();
  });
});
