import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCatalog } from '../../src/hooks/useCatalog.js';
import * as service from '../../src/services/catalog.js';

describe('useCatalog', () => {
  it('expone las funciones del servicio sin envolverlas en estado', () => {
    const { result, rerender } = renderHook(() => useCatalog());
    const first = result.current;
    expect(first.getTips).toBe(service.getTips);
    expect(first.getTipById).toBe(service.getTipById);
    expect(first.getFeaturedTip).toBe(service.getFeaturedTip);
    rerender();
    expect(result.current).toBe(first);
  });
});
