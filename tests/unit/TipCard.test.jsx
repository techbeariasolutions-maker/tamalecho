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

  it('muestra título, resumen, área, acción y un enlace que dice a dónde lleva', () => {
    renderCard({ tip });
    expect(screen.getByRole('article', { name: 'Daily Scrum' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: 'Daily Scrum' })).toBeInTheDocument();
    expect(screen.getByText(tip.summary)).toBeInTheDocument();
    expect(screen.getByText('Eventos de Scrum')).toBeInTheDocument();
    expect(screen.getByText('Haz algo hoy.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver más sobre Daily Scrum' })).toHaveAttribute('href', '/tip/SCR-04');
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
