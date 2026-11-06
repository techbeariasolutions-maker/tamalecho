import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useSettings } from '../../src/hooks/useSettings.js';
import { DEFAULT_SETTINGS } from '../../src/services/schedule.js';
import { createRepository } from '../../src/services/storage.js';
import { createFakeStorage } from './fixtures/fakeStorage.js';

describe('useSettings', () => {
  it('lee los ajustes del repositorio y actualiza el estado al guardar', () => {
    const storage = createFakeStorage();
    const repository = createRepository(storage);
    const { result } = renderHook(() => useSettings(repository));
    expect(result.current.settings.intervalMinutes).toBe(DEFAULT_SETTINGS.intervalMinutes);

    let saveResult;
    act(() => {
      saveResult = result.current.saveSettings({ intervalMinutes: 120 });
    });
    expect(saveResult.saved).toBe(true);
    expect(result.current.settings.intervalMinutes).toBe(120);
    expect(createRepository(storage).getSettings().intervalMinutes).toBe(120);
  });

  it('con un valor inválido conserva el estado y devuelve el error', () => {
    const repository = createRepository(createFakeStorage());
    const { result } = renderHook(() => useSettings(repository));
    let saveResult;
    act(() => {
      saveResult = result.current.saveSettings({ startTime: '8 am' });
    });
    expect(saveResult.errors.map((error) => error.field)).toEqual(['startTime']);
    expect(result.current.settings.startTime).toBe(DEFAULT_SETTINGS.startTime);
  });
});
