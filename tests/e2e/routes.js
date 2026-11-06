// Rutas que recorren las pruebas de 360 px y de accesibilidad.
// `file` es el nombre de la captura en docs/evidencias/sprint-2/360/.
// `seed` (opcional): datos locales con la forma del esquema v1 de storage.js. La prueba los guarda,
// recarga, revisa la ruta y después borra el almacenamiento para no afectar a las demás rutas.
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
  {
    // WP-S2-6: Ajustes con un horario guardado, la pausa activa y lecturas registradas.
    path: '/ajustes',
    file: 'ajustes-con-datos',
    seed: {
      schemaVersion: 1,
      settings: {
        intervalMinutes: 120,
        startTime: '09:00',
        quietStart: '22:00',
        quietEnd: '07:00',
        lunchStart: '13:00',
        lunchEnd: '15:00',
        activeDays: [1, 2, 3, 4, 5],
        paused: true,
      },
      history: [
        { id: 'SCR-01', at: '2026-11-04T15:00:00.000Z' },
        { id: 'PMI-02', at: '2026-11-04T16:00:00.000Z' },
      ],
    },
  },
  { path: '/ayuda', file: 'ayuda' },
  { path: '/ruta-que-no-existe', file: 'no-encontrada' },
];

export const STORAGE_KEY = 'tamalecho:v1';

// Abre la ruta; si tiene datos, los guarda en el almacenamiento y recarga para que la app los lea.
export async function openRoute(page, { path, seed }) {
  await page.goto(path);
  if (!seed) return;
  await page.evaluate(([key, value]) => window.localStorage.setItem(key, JSON.stringify(value)), [STORAGE_KEY, seed]);
  await page.reload();
}

// Borra los datos sembrados para que la siguiente ruta empiece con el almacenamiento vacío.
export async function clearSeed(page, { seed }) {
  if (seed) await page.evaluate(() => window.localStorage.clear());
}

// Las evidencias solo se escriben con `npm run evidence` (npm define npm_lifecycle_event
// en Windows, macOS y Linux). Así `npm run test:e2e` y el CI no modifican docs/.
export const WRITE_EVIDENCE = process.env.npm_lifecycle_event === 'evidence';
// Desde el Sprint 2 (WP-S2-6) las evidencias van a su propia carpeta; las del Sprint 1 no se tocan.
export const EVIDENCE_DIR = new URL('../../docs/evidencias/sprint-2/', import.meta.url);
