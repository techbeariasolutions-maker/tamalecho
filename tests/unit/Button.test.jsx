import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../../src/components/Button.jsx';

describe('Button', () => {
  it('por defecto es primario y de tipo "button"', () => {
    render(<Button>Guardar</Button>);
    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button).toHaveClass('button', 'button--primary');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('renderiza la variante secundaria', () => {
    render(<Button variant="secondary">Cancelar</Button>);
    expect(screen.getByRole('button', { name: 'Cancelar' })).toHaveClass('button--secondary');
  });

  it('una variante desconocida cae en primaria', () => {
    render(<Button variant="rara">Probar</Button>);
    expect(screen.getByRole('button', { name: 'Probar' })).toHaveClass('button--primary');
  });

  it('llama a onClick al hacer clic', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Abrir</Button>);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Abrir' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
