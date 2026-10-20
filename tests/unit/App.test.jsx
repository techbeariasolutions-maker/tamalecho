import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../../src/app/App.jsx';

describe('App', () => {
  it('renderiza el encabezado principal', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1, name: 'TamalEcho Tips' })).toBeInTheDocument();
  });
});
