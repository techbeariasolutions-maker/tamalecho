import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router';
import userEvent from '@testing-library/user-event';
import TipCard from '../../src/components/TipCard.jsx';
import { makeTip } from './fixtures/catalog.js';

function ShowState() {
  const location = useLocation();
  return <p>Destino con estado: {location.state?.from}</p>;
}

function renderCard(props, path = '/biblioteca/scrum?categoria=Eventos') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/biblioteca/:enfoque" element={<TipCard {...props} />} />
        <Route path="/tip/:id" element={<ShowState />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TipCard', () => {
  const tip = makeTip({ id: 'SCR-04', title: 'Daily Scrum', knowledgeArea: 'Eventos de Scrum', action: 'Haz algo hoy.' });

  // Tarjeta compacta (rediseño D-24): el área y la acción práctica pasan a la ficha.
  it('muestra categoría, título, resumen y un enlace que dice a dónde lleva; sin área ni acción', () => {
    renderCard({ tip });
    expect(screen.getByRole('article', { name: 'Daily Scrum' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Daily Scrum' })).toBeInTheDocument();
    expect(screen.getByText(tip.category)).toBeInTheDocument();
    expect(screen.getByText(tip.summary)).toBeInTheDocument();
    expect(screen.queryByText('Eventos de Scrum')).not.toBeInTheDocument();
    expect(screen.queryByText('Haz algo hoy.')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver más sobre Daily Scrum' })).toHaveAttribute('href', '/tip/SCR-04');
  });

  it.each([
    ['nuevo', 'Nuevo'],
    ['leido', '✓ Leído'],
    ['completado', '✓ Completado'],
  ])('con estado «%s» lo dice con texto', (status, text) => {
    renderCard({ tip, status });
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('sin estado no muestra la etiqueta de estado', () => {
    renderCard({ tip });
    expect(screen.queryByText(/^(Nuevo|✓ Leído|✓ Completado)$/)).not.toBeInTheDocument();
  });

  it('usa el nivel de encabezado indicado', () => {
    renderCard({ tip, headingLevel: 3 });
    expect(screen.getByRole('heading', { level: 3, name: 'Daily Scrum' })).toBeInTheDocument();
  });

  it('pasa en state la URL actual de la biblioteca, con su filtro', async () => {
    renderCard({ tip });
    await userEvent.setup().click(screen.getByRole('link', { name: 'Ver más sobre Daily Scrum' }));
    expect(screen.getByText('Destino con estado: /biblioteca/scrum?categoria=Eventos')).toBeInTheDocument();
  });
});
