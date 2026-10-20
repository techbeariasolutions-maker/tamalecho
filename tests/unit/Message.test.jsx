import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Message from '../../src/components/Message.jsx';

describe('Message', () => {
  it.each([
    ['loading', 'status'],
    ['empty', 'status'],
    ['error', 'alert'],
  ])('la variante %s usa role="%s"', (variant, role) => {
    render(
      <Message variant={variant} title="Título">
        <p>Detalle</p>
      </Message>,
    );
    const message = screen.getByRole(role);
    expect(message).toHaveClass(`message--${variant}`);
    expect(message).toHaveTextContent('Título');
    expect(message).toHaveTextContent('Detalle');
  });

  it('el título es opcional', () => {
    render(<Message variant="empty">Sin consejos en esta categoría.</Message>);
    expect(screen.getByRole('status')).toHaveTextContent('Sin consejos en esta categoría.');
  });
});
