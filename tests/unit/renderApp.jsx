import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from '../../src/app/App.jsx';

// entry: una ruta ('/ajustes') o una entrada con estado ({ pathname, search, state }).
// Las páginas se cargan con React.lazy: se espera a que aparezca el h1 de la página.
export async function renderApp(entry = '/') {
  const result = render(
    <MemoryRouter initialEntries={[entry]}>
      <App />
    </MemoryRouter>,
  );
  await screen.findByRole('heading', { level: 1 });
  return result;
}
