import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import NoticeToast from '../../src/features/scheduler/NoticeToast.jsx';
import { getTipById } from '../../src/services/catalog.js';

// HU-06.1-A. tests/setup.js reemplaza NoticeHost por un componente vacío; aquí se usa el real.
const { default: NoticeHost } = await vi.importActual('../../src/features/scheduler/NoticeHost.jsx');

const at = (hours, minutes = 0) => new Date(2026, 10, 9, hours, minutes);

// NoticeHost dentro de un <main id="contenido">, como en el Layout, con una ruta de ficha.
function renderHost() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <main id="contenido" tabIndex={-1}>
        <NoticeHost />
        <Routes>
          <Route path="/" element={<button type="button">Otro control</button>} />
          <Route path="/tip/:id" element={<h1>Ficha abierta</h1>} />
        </Routes>
      </main>
    </MemoryRouter>,
  );
}

const host = () => document.querySelector('.notice-host');

describe('NoticeToast', () => {
  it('muestra el personaje, el título, el resumen y las dos acciones con nombres claros', () => {
    const tip = getTipById('SCR-01');
    render(
      <MemoryRouter>
        <NoticeToast notice={{ key: '2026-11-09@14:00', tip, dayPart: 'hambre' }} onClose={() => {}} />
      </MemoryRouter>,
    );
    expect(screen.getByRole('img', { name: /^Personaje con hambre/ })).toBeInTheDocument();
    expect(screen.getByText(tip.title)).toBeInTheDocument();
    expect(screen.getByText(tip.summary)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: `Ver consejo sobre ${tip.title}` })).toHaveAttribute('href', `/tip/${tip.id}`);
    expect(screen.getByRole('button', { name: 'Cerrar aviso' })).toBeInTheDocument();
  });
});

describe('NoticeHost (HU-06.1-A)', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(at(9, 30));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('anuncia el aviso en una región role="status" sin robar el foco', () => {
    renderHost();
    const region = screen.getByRole('status');
    expect(region).toBe(host());
    expect(within(region).getByText('Consejo de ahora')).toBeInTheDocument();
    expect(within(region).getByRole('figure')).toHaveAttribute('data-day-part', 'despierto');
    expect(document.body).toHaveFocus();
  });

  it('«Cerrar» quita el aviso y deja la región lista para el siguiente', () => {
    renderHost();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }));
    expect(screen.queryByText('Consejo de ahora')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    expect(screen.getByRole('button', { name: 'Otro control' })).toBeInTheDocument();
  });

  it('Escape cierra el aviso', () => {
    renderHost();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Consejo de ahora')).not.toBeInTheDocument();
  });

  it('si el foco estaba en el aviso, al cerrarlo pasa al contenido principal', () => {
    renderHost();
    const close = screen.getByRole('button', { name: 'Cerrar aviso' });
    close.focus();
    fireEvent.click(close);
    expect(document.getElementById('contenido')).toHaveFocus();
  });

  it('si el foco estaba en otro control, cerrarlo con Escape no lo mueve', () => {
    renderHost();
    const other = screen.getByRole('button', { name: 'Otro control' });
    other.focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(other).toHaveFocus();
  });

  it('«Ver consejo» abre la ficha y cierra el aviso', () => {
    renderHost();
    fireEvent.click(screen.getByRole('link', { name: /^Ver consejo sobre / }));
    expect(screen.getByRole('heading', { name: 'Ficha abierta' })).toBeInTheDocument();
    expect(screen.queryByText('Consejo de ahora')).not.toBeInTheDocument();
  });

  it('en silencio no aparece ningún aviso', () => {
    vi.setSystemTime(at(22));
    renderHost();
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });
});
