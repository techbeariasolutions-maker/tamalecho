import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import HelpPage from '../../src/features/help/HelpPage.jsx';
import { createHelp, getHelpItems, getLimitations } from '../../src/services/help.js';

function renderHelp() {
  return render(
    <MemoryRouter>
      <HelpPage />
    </MemoryRouter>,
  );
}

describe('help.json (HU-13.1-A, HU-13.1-B)', () => {
  it('cada pregunta tiene id único, pregunta y al menos un párrafo', () => {
    const items = getHelpItems();
    expect(new Set(items.map((item) => item.id)).size).toBe(items.length);
    for (const item of items) {
      expect(item.question.trim(), item.id).not.toBe('');
      expect(item.answer.length, item.id).toBeGreaterThan(0);
      for (const paragraph of item.answer) expect(paragraph.trim(), item.id).not.toBe('');
    }
  });

  // Criterio de la propuesta: «La Ayuda resuelve el permiso rechazado y la pestaña cerrada»,
  // más los temas de HU-13.1-A: cadencia, permisos, pausa, sin conexión y compatibilidad.
  it('cubre los temas mínimos de la propuesta', () => {
    const ids = getHelpItems().map((item) => item.id);
    expect(ids).toEqual(
      expect.arrayContaining(['cadencia', 'permiso-rechazado', 'pausa-silencio', 'pestana-cerrada', 'compatibilidad', 'sin-conexion']),
    );
  });

  it('los enlaces internos apuntan a rutas que existen', () => {
    for (const item of getHelpItems().filter((entry) => entry.link)) {
      expect(['/ajustes', '/biblioteca', '/']).toContain(item.link.to);
      expect(item.link.label.trim(), item.id).not.toBe('');
    }
  });

  it('las limitaciones dicen de qué depende la precisión fuera de la página', () => {
    const text = getLimitations().join(' ');
    expect(text).toMatch(/servicio externo/);
    expect(text).toMatch(/navegador/);
    expect(text).toMatch(/permisos/);
    // El envío programado (HT-07.2-A) no entró: la página no debe prometerlo.
    expect(text).toMatch(/no está activo el envío automático/);
  });

  it('isHelpDraft es true si falta cualquiera de las dos aprobaciones', () => {
    const data = (help, limitations) => ({
      help: { approved: help, items: [] },
      limitations: { approved: limitations, items: [] },
    });
    expect(createHelp(data(true, true)).isHelpDraft()).toBe(false);
    expect(createHelp(data(true, false)).isHelpDraft()).toBe(true);
    expect(createHelp(data(false, true)).isHelpDraft()).toBe(true);
  });
});

describe('HelpPage', () => {
  it('muestra un único h1, las preguntas como h3 y la sección de limitaciones', () => {
    renderHelp();
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    for (const item of getHelpItems()) {
      expect(screen.getByRole('heading', { level: 3, name: item.question })).toBeInTheDocument();
    }
    const limits = screen.getByRole('region', { name: 'Limitaciones' });
    expect(within(limits).getAllByRole('listitem')).toHaveLength(getLimitations().length);
  });

  it('los enlaces a Ajustes tienen nombres distintos y descriptivos', () => {
    renderHelp();
    const links = screen.getAllByRole('link', { name: /^Ir a Ajustes para/ });
    const names = links.map((link) => link.textContent);
    expect(new Set(names).size).toBe(names.length);
    for (const link of links) expect(link).toHaveAttribute('href', '/ajustes');
  });

  it('muestra la marca de borrador mientras el texto no está aprobado', () => {
    renderHelp();
    // help.json está en borrador hasta que el PO lo apruebe (CLAUDE.md §8).
    expect(screen.getByText('Borrador')).toBeInTheDocument();
  });

  it('no muestra la marca de borrador cuando ambos textos están aprobados', async () => {
    vi.resetModules();
    vi.doMock('../../src/services/help.js', async (importOriginal) => {
      const original = await importOriginal();
      return { ...original, isHelpDraft: () => false };
    });
    const { default: ApprovedHelpPage } = await import('../../src/features/help/HelpPage.jsx');
    render(
      <MemoryRouter>
        <ApprovedHelpPage />
      </MemoryRouter>,
    );
    expect(screen.queryByText('Borrador')).not.toBeInTheDocument();
    vi.doUnmock('../../src/services/help.js');
  });
});
