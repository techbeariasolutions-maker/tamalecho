import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from './renderApp.jsx';

describe('App', () => {
  it('renderiza la portada con su encabezado principal', () => {
    renderApp('/');
    expect(screen.getByRole('heading', { level: 1, name: 'TamalEcho Tips' })).toBeInTheDocument();
  });

  it('tiene los landmarks del Layout', () => {
    renderApp('/');
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveAttribute('id', 'contenido');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('pone «Saltar al contenido» como primer enlace, apuntando a main', () => {
    renderApp('/');
    const [firstLink] = screen.getAllByRole('link');
    expect(firstLink).toHaveTextContent('Saltar al contenido');
    expect(firstLink).toHaveAttribute('href', '#contenido');
  });
});
