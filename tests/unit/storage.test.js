import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, getCurrentWindow, idempotencyKey } from '../../src/services/schedule.js';
import {
  MAX_HISTORY_ENTRIES,
  MAX_SERVED_WINDOWS,
  SCHEMA_VERSION,
  STORAGE_KEY,
  createEmptyData,
  createRepository,
  migrate,
} from '../../src/services/storage.js';
import { createFakeStorage, createFailingStorage } from './fixtures/fakeStorage.js';

// Fechas construidas a mano (CLAUDE.md §11). El 4/11/2026 es miércoles.
const at = (day, hours, minutes = 0) => new Date(2026, 10, day, hours, minutes);
const stored = (storage) => JSON.parse(storage.getItem(STORAGE_KEY));

describe('repositorio local (HT-04.2-A)', () => {
  describe('migrate', () => {
    it('sin datos usa los valores seguros', () => {
      expect(migrate(null)).toEqual(createEmptyData());
      expect(migrate(undefined)).toEqual(createEmptyData());
    });

    it('con JSON corrupto usa los valores seguros sin lanzar errores', () => {
      expect(() => migrate('{"schemaVersion":1,')).not.toThrow();
      expect(migrate('{"schemaVersion":1,')).toEqual(createEmptyData());
      expect(migrate('no es json')).toEqual(createEmptyData());
    });

    it('con una versión desconocida o sin versión usa los valores seguros', () => {
      const future = { schemaVersion: 2, settings: { intervalMinutes: 120 } };
      expect(migrate(JSON.stringify(future))).toEqual(createEmptyData());
      expect(migrate({ settings: { intervalMinutes: 120 } })).toEqual(createEmptyData());
      expect(migrate({ schemaVersion: '1' })).toEqual(createEmptyData());
    });

    it('con algo que no es un objeto usa los valores seguros', () => {
      for (const value of ['42', '"texto"', '[1,2]', 'null', 'true']) {
        expect(migrate(value)).toEqual(createEmptyData());
      }
    });

    it('los datos iniciales tienen la forma del WP-S2-4 y los ajustes recomendados', () => {
      expect(createEmptyData()).toEqual({
        schemaVersion: SCHEMA_VERSION,
        settings: { ...DEFAULT_SETTINGS, activeDays: [...DEFAULT_SETTINGS.activeDays] },
        history: [],
        favorites: [],
        progress: {},
        servedWindows: [],
        push: null,
      });
    });

    it('conserva los datos válidos de la versión 1', () => {
      const data = {
        schemaVersion: 1,
        settings: { ...DEFAULT_SETTINGS, intervalMinutes: 120, paused: true },
        history: [{ id: 'SCR-01', at: '2026-11-04T15:00:00.000Z' }],
        favorites: ['PMI-03'],
        progress: { answered: 2 },
        push: { status: 'off' },
      };
      const result = migrate(JSON.stringify(data));
      expect(result.settings.intervalMinutes).toBe(120);
      expect(result.settings.paused).toBe(true);
      expect(result.history).toEqual(data.history);
      expect(result.favorites).toEqual(['PMI-03']);
      expect(result.progress).toEqual({ answered: 2 });
      expect(result.push).toEqual({ status: 'off' });
    });

    it('descarta campo por campo lo que no es válido', () => {
      const result = migrate({
        schemaVersion: 1,
        settings: { intervalMinutes: 45, startTime: '07:00' },
        history: [{ id: 'SCR-01', at: 'ayer' }, { id: 'XYZ', at: '2026-11-04T15:00:00.000Z' }, 'SCR-02', null],
        favorites: ['SCR-01', 'SCR-01', 'nada', 3],
        progress: [1, 2],
        push: 'on',
      });
      // El intervalo inválido vuelve al recomendado; la hora de inicio válida se conserva.
      expect(result.settings.intervalMinutes).toBe(DEFAULT_SETTINGS.intervalMinutes);
      expect(result.settings.startTime).toBe('07:00');
      expect(result.history).toEqual([]);
      expect(result.favorites).toEqual(['SCR-01']);
      expect(result.progress).toEqual({});
      expect(result.push).toBeNull();
    });

    it('si el historial guardado excede el límite, conserva las más recientes', () => {
      const history = Array.from({ length: 60 }, (_, index) => ({
        id: `SCR-${String((index % 12) + 1).padStart(2, '0')}`,
        at: at(1, 8, index).toISOString(),
      }));
      const result = migrate({ schemaVersion: 1, history });
      expect(result.history).toHaveLength(MAX_HISTORY_ENTRIES);
      expect(result.history[0]).toEqual(history[10]);
      expect(result.history.at(-1)).toEqual(history[59]);
    });
  });

  describe('ajustes', () => {
    it('sin datos guardados devuelve los recomendados', () => {
      const repository = createRepository(createFakeStorage());
      expect(repository.getSettings()).toEqual({ ...DEFAULT_SETTINGS, activeDays: [...DEFAULT_SETTINGS.activeDays] });
    });

    it('guarda un cambio parcial sin tocar los demás ajustes y lo conserva al «recargar»', () => {
      const storage = createFakeStorage();
      const repository = createRepository(storage);
      expect(repository.saveSettings({ startTime: '09:00' }).saved).toBe(true);
      const result = repository.saveSettings({ intervalMinutes: 120 });
      expect(result).toEqual({
        saved: true,
        settings: expect.objectContaining({ intervalMinutes: 120, startTime: '09:00' }),
        errors: [],
      });

      // Un repositorio nuevo sobre el mismo almacenamiento equivale a recargar la página.
      const reloaded = createRepository(storage);
      expect(reloaded.getSettings()).toEqual(expect.objectContaining({ intervalMinutes: 120, startTime: '09:00' }));
      expect(stored(storage).schemaVersion).toBe(1);
    });

    it('con un valor inválido no guarda nada y devuelve el error', () => {
      const storage = createFakeStorage();
      const repository = createRepository(storage);
      repository.saveSettings({ intervalMinutes: 120 });

      const result = repository.saveSettings({ intervalMinutes: 90, startTime: '10:00' });
      expect(result.saved).toBe(false);
      expect(result.errors.map((error) => error.field)).toEqual(['intervalMinutes']);
      // Se conservan los valores válidos anteriores, no se cambian por los recomendados.
      expect(result.settings.intervalMinutes).toBe(120);
      expect(repository.getSettings().intervalMinutes).toBe(120);
      expect(repository.getSettings().startTime).toBe(DEFAULT_SETTINGS.startTime);
    });

    it('la pausa se conserva al «recargar»', () => {
      const storage = createFakeStorage();
      createRepository(storage).saveSettings({ paused: true });
      expect(createRepository(storage).getSettings().paused).toBe(true);
    });

    it('ajustes guardados con valores inválidos se leen ya validados', () => {
      const storage = createFakeStorage({
        [STORAGE_KEY]: JSON.stringify({ schemaVersion: 1, settings: { intervalMinutes: 5, quietStart: '25:00' } }),
      });
      const settings = createRepository(storage).getSettings();
      expect(settings.intervalMinutes).toBe(DEFAULT_SETTINGS.intervalMinutes);
      expect(settings.quietStart).toBe(DEFAULT_SETTINGS.quietStart);
    });

    it('una entrada que no es objeto no cambia los ajustes', () => {
      const repository = createRepository(createFakeStorage());
      expect(repository.saveSettings(null).settings).toEqual(repository.getSettings());
      expect(repository.saveSettings('120').errors).toEqual([]);
    });
  });

  describe('historial', () => {
    it('agrega lecturas en orden y guarda la fecha en ISO', () => {
      const repository = createRepository(createFakeStorage());
      expect(repository.addHistoryEntry({ id: 'SCR-01', at: at(4, 9) })).toBe(true);
      expect(repository.addHistoryEntry({ id: 'PMI-02', at: at(4, 10).toISOString() })).toBe(true);
      expect(repository.getHistory()).toEqual([
        { id: 'SCR-01', at: at(4, 9).toISOString() },
        { id: 'PMI-02', at: at(4, 10).toISOString() },
      ]);
    });

    it('conserva como máximo 50 entradas, las más recientes', () => {
      const repository = createRepository(createFakeStorage());
      for (let minute = 0; minute < MAX_HISTORY_ENTRIES + 5; minute += 1) {
        repository.addHistoryEntry({ id: 'SCR-01', at: at(4, 9, minute) });
      }
      const history = repository.getHistory();
      expect(history).toHaveLength(50);
      expect(history[0].at).toBe(at(4, 9, 5).toISOString());
      expect(history.at(-1).at).toBe(at(4, 9, 54).toISOString());
    });

    it('rechaza entradas sin ID válido o sin fecha válida', () => {
      const repository = createRepository(createFakeStorage());
      expect(repository.addHistoryEntry({ id: 'SCR-1', at: at(4, 9) })).toBe(false);
      expect(repository.addHistoryEntry({ id: 'SCR-01', at: 'mañana' })).toBe(false);
      expect(repository.addHistoryEntry({ id: 'SCR-01' })).toBe(false);
      expect(repository.addHistoryEntry()).toBe(false);
      expect(repository.getHistory()).toEqual([]);
    });

    it('no quita duplicados consecutivos (eso es del registro de lecturas, WP-S2-11)', () => {
      const repository = createRepository(createFakeStorage());
      repository.addHistoryEntry({ id: 'SCR-01', at: at(4, 9) });
      repository.addHistoryEntry({ id: 'SCR-01', at: at(4, 9, 1) });
      expect(repository.getHistory()).toHaveLength(2);
    });
  });

  describe('almacenamiento que falla', () => {
    it('sin almacenamiento lee valores seguros y no lanza errores al escribir', () => {
      const repository = createRepository(null);
      expect(repository.getSettings().intervalMinutes).toBe(DEFAULT_SETTINGS.intervalMinutes);
      expect(repository.saveSettings({ intervalMinutes: 120 })).toEqual({
        saved: false,
        settings: expect.objectContaining({ intervalMinutes: DEFAULT_SETTINGS.intervalMinutes }),
        errors: [],
      });
      expect(repository.addHistoryEntry({ id: 'SCR-01', at: at(4, 9) })).toBe(false);
    });

    it('si leer o escribir lanza (modo privado, cuota llena) responde sin lanzar', () => {
      const repository = createRepository(createFailingStorage());
      expect(() => repository.getSettings()).not.toThrow();
      expect(repository.saveSettings({ paused: true }).saved).toBe(false);
      expect(repository.getHistory()).toEqual([]);
    });
  });
});

describe('último aviso y restablecer (HT-04.2-B)', () => {
  // Claves reales del motor: ventanas de 3 h del 1 al 4 de noviembre.
  const keyAt = (day, hours) => idempotencyKey(at(day, hours));

  describe('ventanas servidas', () => {
    it('una ventana servida no se vuelve a servir, ni después de «recargar»', () => {
      const storage = createFakeStorage();
      const repository = createRepository(storage);
      const current = idempotencyKey(getCurrentWindow(at(4, 14, 30)));
      expect(current).toBe('2026-11-04@14:00');
      expect(repository.wasWindowServed(current)).toBe(false);

      expect(repository.markWindowServed(current)).toBe(true);
      expect(repository.wasWindowServed(current)).toBe(true);
      expect(createRepository(storage).wasWindowServed(current)).toBe(true);
      // Otra ventana del mismo día sigue disponible.
      expect(repository.wasWindowServed(keyAt(4, 17))).toBe(false);
    });

    it('conserva solo las 20 claves más recientes', () => {
      const storage = createFakeStorage();
      const repository = createRepository(storage);
      const keys = [];
      for (const day of [1, 2, 3, 4, 5]) {
        for (const hours of [8, 11, 14, 17, 20]) keys.push(keyAt(day, hours));
      }
      keys.forEach((key) => repository.markWindowServed(key));

      expect(keys).toHaveLength(25);
      expect(stored(storage).servedWindows).toEqual(keys.slice(-MAX_SERVED_WINDOWS));
      expect(repository.wasWindowServed(keys[4])).toBe(false);
      expect(repository.wasWindowServed(keys[5])).toBe(true);
      expect(repository.wasWindowServed(keys[24])).toBe(true);
    });

    it('marcar dos veces la misma clave no la duplica y la vuelve la más reciente', () => {
      const storage = createFakeStorage();
      const repository = createRepository(storage);
      repository.markWindowServed(keyAt(4, 8));
      repository.markWindowServed(keyAt(4, 11));
      repository.markWindowServed(keyAt(4, 8));
      expect(stored(storage).servedWindows).toEqual([keyAt(4, 11), keyAt(4, 8)]);
    });

    it('rechaza claves que no tienen el formato de idempotencyKey', () => {
      const repository = createRepository(createFakeStorage());
      for (const key of ['', '2026-11-04', '04/11/2026@14:00', 14, null]) {
        expect(repository.markWindowServed(key)).toBe(false);
      }
      expect(repository.wasWindowServed('2026-11-04')).toBe(false);
    });

    it('migrate limpia las claves guardadas: formato, repetidos y límite', () => {
      const keys = Array.from({ length: 22 }, (_, index) => `2026-11-${String(index + 1).padStart(2, '0')}@08:00`);
      const result = migrate({ schemaVersion: 1, servedWindows: ['basura', keys[0], ...keys, 7] });
      expect(result.servedWindows).toEqual(keys.slice(-MAX_SERVED_WINDOWS));
    });

    it('sin almacenamiento no lanza errores', () => {
      const repository = createRepository(createFailingStorage());
      expect(repository.markWindowServed(keyAt(4, 8))).toBe(false);
      expect(repository.wasWindowServed(keyAt(4, 8))).toBe(false);
    });
  });

  describe('resetAll', () => {
    function seeded() {
      const storage = createFakeStorage();
      const repository = createRepository(storage);
      repository.saveSettings({ intervalMinutes: 120, startTime: '09:00', paused: true });
      repository.addHistoryEntry({ id: 'SCR-01', at: at(4, 9) });
      repository.addHistoryEntry({ id: 'PMI-02', at: at(4, 10) });
      repository.markWindowServed(keyAt(4, 14));
      storage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...stored(storage), favorites: ['SCR-03'], progress: { answered: 1 }, push: { status: 'on' } }),
      );
      return { storage, repository };
    }

    it('deja los ajustes recomendados y vacía historial, favoritos, progreso y push', () => {
      const { storage, repository } = seeded();
      expect(repository.resetAll()).toBe(true);

      expect(repository.getSettings()).toEqual({ ...DEFAULT_SETTINGS, activeDays: [...DEFAULT_SETTINGS.activeDays] });
      expect(repository.getHistory()).toEqual([]);
      const data = stored(storage);
      expect(data.favorites).toEqual([]);
      expect(data.progress).toEqual({});
      expect(data.push).toBeNull();
      expect(data.schemaVersion).toBe(1);
      // Persiste: un repositorio nuevo («recargar») ve lo mismo.
      expect(createRepository(storage).getHistory()).toEqual([]);
    });

    it('conserva las ventanas ya servidas para no repetir el aviso actual (supuesto declarado en el PR)', () => {
      const { repository } = seeded();
      repository.resetAll();
      expect(repository.wasWindowServed(keyAt(4, 14))).toBe(true);
    });

    it('con datos corruptos también deja valores seguros', () => {
      const storage = createFakeStorage({ [STORAGE_KEY]: '{corrupto' });
      expect(createRepository(storage).resetAll()).toBe(true);
      expect(stored(storage)).toEqual(createEmptyData());
    });

    it('si el navegador no deja guardar devuelve false sin lanzar', () => {
      expect(createRepository(createFailingStorage()).resetAll()).toBe(false);
      expect(createRepository(null).resetAll()).toBe(false);
    });
  });
});

describe('estado de push en el repositorio (HU-15.1-A)', () => {
  it('guarda y lee el estado; se conserva al «recargar»', () => {
    const storage = createFakeStorage();
    const repository = createRepository(storage);
    expect(repository.getPushState()).toBeNull();
    expect(repository.savePushState({ status: 'on', endpoint: 'https://fcm.googleapis.com/fcm/send/x' })).toBe(true);
    expect(createRepository(storage).getPushState()).toEqual({
      status: 'on',
      endpoint: 'https://fcm.googleapis.com/fcm/send/x',
    });
    expect(repository.savePushState({ status: 'off' })).toBe(true);
    expect(repository.getPushState()).toEqual({ status: 'off' });
  });

  it('rechaza estados inválidos y descarta un endpoint que no es https', () => {
    const repository = createRepository(createFakeStorage());
    expect(repository.savePushState({ status: 'activo' })).toBe(false);
    expect(repository.savePushState(null)).toBe(false);
    expect(repository.getPushState()).toBeNull();
    repository.savePushState({ status: 'on', endpoint: 'http://inseguro.example' });
    expect(repository.getPushState()).toEqual({ status: 'on' });
  });

  it('guardar el estado de push no cambia los ajustes', () => {
    const repository = createRepository(createFakeStorage());
    repository.saveSettings({ intervalMinutes: 120 });
    repository.savePushState({ status: 'on' });
    expect(repository.getSettings().intervalMinutes).toBe(120);
  });
});
