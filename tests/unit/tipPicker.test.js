import { describe, expect, it } from 'vitest';
import { getTips } from '../../src/services/catalog.js';
import { pickTipForWindow } from '../../src/services/tipPicker.js';

// Elección del consejo de un aviso (HU-04.2-A).
const tips = getTips();

describe('pickTipForWindow', () => {
  it('es determinista: la misma ventana siempre da el mismo consejo', () => {
    const first = pickTipForWindow('2026-11-09@14:00', [], tips);
    for (let attempt = 0; attempt < 5; attempt += 1) {
      expect(pickTipForWindow('2026-11-09@14:00', [], tips)).toBe(first);
    }
  });

  it('ventanas distintas del mismo día no dan siempre el mismo consejo', () => {
    const keys = ['08:00', '11:00', '14:00', '17:00', '20:00'].map((time) => `2026-11-09@${time}`);
    const ids = new Set(keys.map((key) => pickTipForWindow(key, [], tips).id));
    expect(ids.size).toBeGreaterThan(1);
  });

  it('evita los consejos leídos recientemente mientras haya otros', () => {
    const key = '2026-11-09@14:00';
    const chosen = pickTipForWindow(key, [], tips);
    const next = pickTipForWindow(key, [chosen.id], tips);
    expect(next.id).not.toBe(chosen.id);

    const allButOne = tips.slice(1).map((tip) => tip.id);
    expect(pickTipForWindow(key, allButOne, tips).id).toBe(tips[0].id);
  });

  it('si todos son recientes elige entre todos y sin catálogo devuelve null', () => {
    const all = tips.map((tip) => tip.id);
    expect(tips).toContain(pickTipForWindow('2026-11-09@14:00', all, tips));
    expect(pickTipForWindow('2026-11-09@14:00', [], [])).toBeNull();
  });
});
