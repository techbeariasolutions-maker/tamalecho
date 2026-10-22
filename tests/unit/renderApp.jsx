import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import App from '../../src/app/App.jsx';

export function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}
