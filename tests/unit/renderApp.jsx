import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from '../../src/app/App.jsx';

// entry: una ruta ('/ajustes') o una entrada con estado ({ pathname, search, state }).
export function renderApp(entry = '/') {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <App />
    </MemoryRouter>,
  );
}
