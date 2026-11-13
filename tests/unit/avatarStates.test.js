import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process from 'node:process';
import { describe, expect, it } from 'vitest';
import avatarCatalog from '../../src/data/avatarStates.json';
import { getDayPart } from '../../src/services/schedule.js';

// Vitest corre desde la raíz del repositorio. Se lee el archivo tal cual: Vite vacía los CSS en las pruebas.
const tokens = readFileSync(resolve(process.cwd(), 'src/styles/tokens.css'), 'utf8');

// Catálogo único del personaje (HT-05.1-A): franja del día → expresión, color, animación y texto alternativo.
const STATES = avatarCatalog.states;
const DAY_PARTS = ['despierto', 'hambre', 'atento', 'cansado'];
const FIELDS = ['expression', 'phrase', 'colorToken', 'animation', 'alt'];

describe('catálogo de estados del personaje', () => {
  it('tiene exactamente los 4 estados del motor de horario', () => {
    expect(Object.keys(STATES).sort()).toEqual([...DAY_PARTS].sort());
  });

  it('cubre todo lo que puede devolver getDayPart', () => {
    // 09:00, 14:00, 17:00 y 22:00 del 9/11/2026 con la franja de comida por defecto.
    const parts = [9, 14, 17, 22].map((hour) => getDayPart(new Date(2026, 10, 9, hour)));
    expect(parts).toEqual(DAY_PARTS);
    for (const part of parts) expect(STATES).toHaveProperty(part);
  });

  for (const part of DAY_PARTS) {
    it(`«${part}» tiene todos sus campos con texto`, () => {
      for (const field of FIELDS) {
        expect(typeof STATES[part][field], `${part}.${field}`).toBe('string');
        expect(STATES[part][field].trim(), `${part}.${field}`).not.toBe('');
      }
    });

    it(`el color de «${part}» es un token definido en tokens.css`, () => {
      const { colorToken } = STATES[part];
      expect(colorToken).toMatch(/^--avatar-color-/);
      expect(tokens).toContain(`${colorToken}:`);
    });

    it(`el texto alternativo de «${part}» nombra el estado`, () => {
      const label = part === 'hambre' ? 'con hambre' : part;
      expect(STATES[part].alt.toLowerCase()).toContain(label);
    });
  }

  // HU-05.1-B: las frases son las del backlog mientras el Product Owner no entregue las suyas.
  // La marca obliga a revisarlas antes del release (CLAUDE.md §8).
  it('declara si el Product Owner ya aprobó las frases', () => {
    expect(typeof avatarCatalog.phrasesApproved).toBe('boolean');
  });

  it('cada estado tiene una frase distinta', () => {
    const phrases = DAY_PARTS.map((part) => STATES[part].phrase);
    expect(new Set(phrases).size).toBe(DAY_PARTS.length);
  });

  // Rediseño D-24: reacciones a acciones del usuario (no dependen de la hora).
  it('la reacción «orgulloso» tiene sus campos, su token y una expresión que no usa ninguna franja', () => {
    const reaction = avatarCatalog.reactions.orgulloso;
    for (const field of FIELDS) expect(reaction[field].trim(), field).not.toBe('');
    expect(tokens).toContain(`${reaction.colorToken}:`);
    expect(reaction.alt.toLowerCase()).toContain('orgulloso');
    expect(DAY_PARTS.map((part) => STATES[part].expression)).not.toContain(reaction.expression);
  });

  it('cada estado tiene una expresión distinta', () => {
    const expressions = DAY_PARTS.map((part) => STATES[part].expression);
    expect(new Set(expressions).size).toBe(DAY_PARTS.length);
  });
});
