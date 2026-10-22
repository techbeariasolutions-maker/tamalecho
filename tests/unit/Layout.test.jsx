import { lazy } from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import Layout from '../../src/app/Layout.jsx';

// Una página que nunca termina de cargar, para ver el estado de carga.
const NeverLoads = lazy(() => new Promise(() => {}));

describe('Layout', () => {
  it('mientras una página carga muestra «Cargando…» y conserva encabezado y menú', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<NeverLoads />} />
          </Route>
        </Routes>
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
  });
});
