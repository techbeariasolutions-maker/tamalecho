import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp.jsx';
import { createRepository, getBrowserRepository } from '../../src/services/storage.js';
import { buildShareData, shareTip } from '../../src/services/shareService.js';
import { getPrivacy } from '../../src/services/help.js';
import { getTipById } from '../../src/services/catalog.js';
import { createFakeStorage } from './fixtures/fakeStorage.js';

// WP-P3 (D-26): borrar historial (HU-08.1-B), favoritos (HU-08.2-A) y compartir (HU-08.2-B).
const at = (hours) => new Date(2026, 10, 9, hours);
const tip = getTipById('SCR-01');

describe('repositorio: favoritos y borrar historial', () => {
  it('toggleFavorite guarda y quita, sin repetidos, y persiste', () => {
    const storage = createFakeStorage();
    const repository = createRepository(storage);
    expect(repository.toggleFavorite('SCR-01')).toEqual({ saved: true, favorite: true });
    expect(repository.toggleFavorite('PMI-02')).toEqual({ saved: true, favorite: true });
    expect(createRepository(storage).getFavorites()).toEqual(['SCR-01', 'PMI-02']);
    expect(repository.toggleFavorite('SCR-01')).toEqual({ saved: true, favorite: false });
    expect(repository.getFavorites()).toEqual(['PMI-02']);
    expect(repository.toggleFavorite('nada').saved).toBe(false);
  });

  it('clearHistory borra solo las lecturas', () => {
    const repository = createRepository(createFakeStorage());
    repository.recordReading({ id: 'SCR-01', at: at(9) });
    repository.toggleFavorite('SCR-01');
    repository.markCompleted({ id: 'SCR-01', at: at(9) });
    repository.saveSettings({ paused: true });
    expect(repository.clearHistory()).toBe(true);
    expect(repository.getHistory()).toEqual([]);
    expect(repository.getFavorites()).toEqual(['SCR-01']);
    expect(Object.keys(repository.getCompleted())).toEqual(['SCR-01']);
    expect(repository.getSettings().paused).toBe(true);
  });
});

describe('shareTip (HU-08.2-B)', () => {
  const origin = 'https://tamalecho.test';

  it('solo comparte título, resumen y el enlace público del consejo', () => {
    expect(buildShareData(tip, origin)).toEqual({ title: tip.title, text: tip.summary, url: `${origin}/tip/SCR-01` });
  });

  it('usa la Web Share API si existe', async () => {
    const share = vi.fn(async () => {});
    expect(await shareTip(tip, { navigator: { share }, origin })).toBe('shared');
    expect(share).toHaveBeenCalledWith(buildShareData(tip, origin));
  });

  it('si la persona cancela, no copia nada', async () => {
    const writeText = vi.fn();
    const share = vi.fn(async () => {
      throw Object.assign(new Error('cancelado'), { name: 'AbortError' });
    });
    expect(await shareTip(tip, { navigator: { share, clipboard: { writeText } }, origin })).toBe('cancelled');
    expect(writeText).not.toHaveBeenCalled();
  });

  it('sin Web Share copia el enlace; sin portapapeles, «unavailable»', async () => {
    const writeText = vi.fn(async () => {});
    expect(await shareTip(tip, { navigator: { clipboard: { writeText } }, origin })).toBe('copied');
    expect(writeText).toHaveBeenCalledWith(`${origin}/tip/SCR-01`);
    expect(await shareTip(tip, { navigator: {}, origin })).toBe('unavailable');
  });
});

describe('ficha: favorito y compartir', () => {
  beforeEach(() => window.localStorage.clear());

  it('«Guardar en favoritos» es un interruptor con aria-pressed que persiste', async () => {
    await renderApp('/tip/SCR-01');
    const button = screen.getByRole('button', { name: /Guardar en favoritos/ });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.setup().click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(getBrowserRepository().getFavorites()).toEqual(['SCR-01']);
  });

  it('sin Web Share copia el enlace público y lo anuncia', async () => {
    await renderApp('/tip/SCR-01');
    // userEvent.setup() instala un portapapeles simulado; jsdom no tiene navigator.share.
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Compartir consejo' }));
    const status = await screen.findByText(/Copiamos el enlace del consejo/);
    expect(status.closest('[role="status"]')).toBeInTheDocument();
    expect(await window.navigator.clipboard.readText()).toBe(`${window.location.origin}/tip/SCR-01`);
  });
});

describe('Historial: favoritos y borrar', () => {
  beforeEach(() => window.localStorage.clear());

  it('lista los favoritos y permite quitarlos', async () => {
    getBrowserRepository().toggleFavorite('PMI-01');
    await renderApp('/historial');
    const favorites = screen.getByRole('list', { name: 'Favoritos' });
    const title = getTipById('PMI-01').title;
    expect(within(favorites).getByRole('link', { name: `Abrir ${title}` })).toHaveAttribute('href', '/tip/PMI-01');
    await userEvent.setup().click(within(favorites).getByRole('button', { name: `Quitar ${title} de favoritos` }));
    expect(screen.getByText(/Todavía no guardas favoritos/)).toBeInTheDocument();
    expect(getBrowserRepository().getFavorites()).toEqual([]);
  });

  it('«Borrar historial» pide confirmación en la página; cancelar no borra y confirmar sí', async () => {
    getBrowserRepository().recordReading({ id: 'SCR-01', at: at(9) });
    getBrowserRepository().toggleFavorite('SCR-01');
    await renderApp('/historial');
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: 'Borrar historial' }));
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveFocus();
    await user.click(screen.getByRole('button', { name: 'Cancelar' }));
    expect(screen.getByRole('button', { name: 'Borrar historial' })).toHaveFocus();
    expect(getBrowserRepository().getHistory()).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Borrar historial' }));
    await user.click(screen.getByRole('button', { name: 'Sí, borrar historial' }));
    expect(getBrowserRepository().getHistory()).toEqual([]);
    expect(screen.getByText('Todavía no abres ningún consejo.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Consejos abiertos' })).toHaveFocus();
    // Los favoritos no se tocan.
    expect(getBrowserRepository().getFavorites()).toEqual(['SCR-01']);
  });
});

describe('privacidad declara los favoritos', () => {
  it('el aviso los menciona y explica cómo borrarlos', () => {
    const text = getPrivacy()
      .sections.flatMap((section) => section.items)
      .join(' ');
    expect(text).toMatch(/consejos que guardas en favoritos/);
    expect(text).toMatch(/Borrar historial/);
  });
});
