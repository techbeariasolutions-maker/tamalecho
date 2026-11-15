import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import App from './app/App.jsx';
import { registerOfflineSupport } from './services/offline.js';
import './styles/tokens.css';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

// Lectura sin conexión (HU-12, WP-P5): se registra después de cargar para no competir con la página.
// No pide ningún permiso.
window.addEventListener('load', () => {
  registerOfflineSupport();
});
