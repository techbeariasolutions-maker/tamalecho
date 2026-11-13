import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { cwd } from 'node:process';
import PrivacyPage from '../../src/features/help/PrivacyPage.jsx';
import HelpPage from '../../src/features/help/HelpPage.jsx';
import { getPrivacy, getSuggestions } from '../../src/services/help.js';
import { createEmptyData, MAX_HISTORY_ENTRIES, MAX_SERVED_WINDOWS } from '../../src/services/storage.js';
import { validateSubscription } from '../../server/subscriptions.js';
import { renderApp } from './renderApp.jsx';

const sectionText = (id) => {
  const section = getPrivacy().sections.find((entry) => entry.id === id);
  return [...(section.paragraphs ?? []), ...section.items].join(' ');
};

function renderWithRouter(element) {
  return render(<MemoryRouter>{element}</MemoryRouter>);
}

// El aviso debe describir lo que el código guarda de verdad (PLAN S3 §8). Si storage.js o
// server/subscriptions.js cambian, estas pruebas obligan a revisar el texto.
describe('aviso de privacidad contra el código (HU-13.2-A)', () => {
  it('menciona cada dato que se guarda en el navegador, con los mismos límites', () => {
    const text = sectionText('en-tu-navegador');
    const stored = Object.keys(createEmptyData());
    // favorites y progress existen en el esquema, pero ninguna función los llena todavía.
    expect(stored).toEqual(
      expect.arrayContaining(['settings', 'history', 'servedWindows', 'push', 'favorites', 'progress']),
    );
    expect(text).toMatch(/ajustes de los avisos/);
    expect(text).toMatch(/historial de lecturas/);
    expect(text).toContain(`${MAX_HISTORY_ENTRIES} más recientes`);
    expect(text).toMatch(/avisos que ya te mostramos/);
    expect(text).toContain(`${MAX_SERVED_WINDOWS} más recientes`);
    expect(text).toMatch(/dirección de tu suscripción/);
  });

  it('menciona cada campo que guarda el servidor y nada más', () => {
    const { value } = validateSubscription({
      subscription: { endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys: { p256dh: 'p', auth: 'a' } },
      timeZone: 'America/Monterrey',
      settings: {},
    });
    // id es un hash del endpoint: no es un dato nuevo.
    expect(Object.keys(value).sort()).toEqual(['id', 'settings', 'subscription', 'timeZone']);
    const text = sectionText('en-el-servidor');
    expect(text).toMatch(/suscripción de tu navegador/);
    expect(text).toMatch(/zona horaria/);
    expect(text).toMatch(/horario de avisos/);
    expect(text).toMatch(/Solo si activas los avisos con la pestaña cerrada/);
  });

  it('explica cómo borrar los datos y cancelar la suscripción con los nombres reales de los botones', () => {
    const text = sectionText('como-borrar');
    expect(text).toContain('«Desactivar avisos»');
    expect(text).toContain('«Restablecer mis datos»');
    expect(getPrivacy().intro).toMatch(/no usamos analítica ni rastreo/);
  });
});

describe('PrivacyPage', () => {
  it('muestra un único h1, una sección por tema y el enlace a Ajustes', () => {
    renderWithRouter(<PrivacyPage />);
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1);
    for (const section of getPrivacy().sections) {
      expect(screen.getByRole('heading', { level: 2, name: section.title })).toBeInTheDocument();
    }
    expect(screen.getByRole('link', { name: 'Ir a Ajustes para borrar tus datos' })).toHaveAttribute('href', '/ajustes');
  });

  it('muestra la marca de borrador mientras el aviso no está aprobado', () => {
    renderWithRouter(<PrivacyPage />);
    expect(screen.getByText('Borrador')).toBeInTheDocument();
  });

  it('el pie de página enlaza al aviso desde cualquier ruta', async () => {
    await renderApp('/biblioteca/scrum');
    const footer = screen.getByRole('contentinfo');
    expect(footer).toContainElement(screen.getByRole('link', { name: 'Aviso de privacidad' }));
    expect(screen.getByRole('link', { name: 'Aviso de privacidad' })).toHaveAttribute('href', '/privacidad');
  });
});

describe('canal de sugerencias (HU-13.2-B)', () => {
  it('la Ayuda enlaza al formulario en otra pestaña, avisado, sin filtrar el origen', () => {
    renderWithRouter(<HelpPage />);
    const link = screen.getByRole('link', { name: /Enviar una sugerencia en GitHub/ });
    expect(link).toHaveAttribute('href', getSuggestions().url);
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    expect(link).toHaveTextContent('(se abre en otra pestaña)');
  });

  it('avisa que se necesita cuenta y que no se incluyan datos personales', () => {
    expect(getSuggestions().text).toMatch(/cuenta de GitHub/);
    expect(getSuggestions().text).toMatch(/no incluyas datos personales/);
  });

  it('la plantilla del formulario existe, coincide con el enlace y no pide datos personales', () => {
    // jsdom cambia import.meta.url; Vitest corre desde la raíz del repositorio.
    const template = readFileSync(resolve(cwd(), '.github/ISSUE_TEMPLATE/sugerencia.yml'), 'utf8');
    expect(getSuggestions().url).toContain('template=sugerencia.yml');
    expect(template).toMatch(/no incluyas tu nombre completo, correo, teléfono/);
    expect(template).not.toMatch(/type: input\s+id: (correo|email|nombre|telefono)/);
  });

  it('la Ayuda enlaza al aviso de privacidad', () => {
    renderWithRouter(<HelpPage />);
    expect(screen.getByRole('link', { name: 'Leer el aviso de privacidad' })).toHaveAttribute('href', '/privacidad');
  });
});
