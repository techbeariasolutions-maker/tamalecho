// Rutas que recorren las pruebas de 360 px y de accesibilidad.
// `file` es el nombre de la captura en docs/evidencias/sprint-1/360/.
export const ROUTES = [
  { path: '/', file: 'inicio' },
  { path: '/biblioteca/scrum', file: 'biblioteca-scrum' },
  { path: '/biblioteca/pmbok', file: 'biblioteca-pmbok' },
  { path: '/biblioteca/scrum?categoria=Eventos', file: 'biblioteca-scrum-filtrada' },
  { path: '/tip/SCR-01', file: 'tip-SCR-01' },
  { path: '/tip/PMI-01', file: 'tip-PMI-01' },
  { path: '/tip/SCR-99', file: 'tip-inexistente' },
  { path: '/historial', file: 'historial' },
  { path: '/progreso', file: 'progreso' },
  { path: '/ajustes', file: 'ajustes' },
  { path: '/ayuda', file: 'ayuda' },
  { path: '/ruta-que-no-existe', file: 'no-encontrada' },
];

// Las evidencias solo se escriben con `npm run evidence` (npm define npm_lifecycle_event
// en Windows, macOS y Linux). Así `npm run test:e2e` y el CI no modifican docs/.
export const WRITE_EVIDENCE = process.env.npm_lifecycle_event === 'evidence';
export const EVIDENCE_DIR = new URL('../../docs/evidencias/sprint-1/', import.meta.url);
