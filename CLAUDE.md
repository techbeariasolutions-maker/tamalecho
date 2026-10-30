# TamalEcho Tips — Instrucciones para agentes de código

> Va en la raíz del repositorio. Todo agente lo lee antes de trabajar.
> Versión del Sprint 2 (29/10/2026). Si algo aquí contradice la propuesta aprobada, gana la propuesta (ver `docs/DECISIONES.md`, D-01).

## 1. Orden de lectura obligatorio
1. Este archivo.
2. `docs/DECISIONES.md`: decisiones vigentes y pendientes (en especial D-19, D-20 y D-21).
3. `docs/sprint-2/PLAN.md`: alcance comprometido, calendario, puntos de control y Definition of Done del sprint actual.
4. El paquete de trabajo (WP) que te pidieron, en `docs/sprint-2/PROMPTS.md`.

## 2. Producto
TamalEcho Tips es una web en React + JavaScript (Vite) que enseña conceptos de Scrum y PMI/PMBOK con consejos breves. El Sprint 1 entregó las bibliotecas, las fichas y la accesibilidad (`v0.1.0`). El Sprint 2 agrega los avisos cada 2 o 3 horas, el personaje animado según la hora, los ajustes y Web Push.

**Sprint actual: Sprint 2 (24/10–13/11/2026; planeación efectiva 29/10, D-19).**
Meta de la propuesta: *completar el ciclo educativo de alertas cada 2/3 horas con personaje animado, preferencias, historial, búsqueda, microevaluaciones, PWA offline y Web Push probado en un navegador compatible.*
Compromiso real (D-20): 27 actividades y 47 puntos. Son motor horario, avisos en la página, ajustes con silencio y pausa, notificación nativa con permiso, personaje, registro de lecturas y **un aviso Web Push real con la pestaña cerrada**. Lo demás es recortable y solo se hace si el PLAN lo activa.

Reglas de producto (no negociables):
- Acceso público, sin registro ni inicio de sesión.
- Scrum y PMI/PMBOK son enfoques distintos. Nunca se presentan como equivalentes.
- Cada consejo tiene una fuente verificable con su edición. No se hace *release* con consejos sin aprobación del Product Owner.
- Texto de la interfaz en español de México.
- Avisos:
  - Uno por ventana, como máximo.
  - Nunca se acumulan los atrasados: al volver, aparece a lo sumo uno.
  - Silencio por defecto de 21:00 a 08:00.
  - Leer consejos siempre funciona, aunque los avisos estén pausados o en silencio.
- El permiso de notificaciones **solo** se pide después de una acción explícita del usuario (un clic). Rechazarlo no bloquea la lectura ni los avisos dentro de la página.
- Sin datos personales:
  - Preferencias, historial y progreso viven solo en el dispositivo.
  - El servidor guarda únicamente la suscripción push y lo mínimo para respetar el horario y el silencio (zona horaria y ajustes de horario).

## 3. Fuera de alcance en el Sprint 2 (NO implementar)
- Ayuda real, aviso de privacidad, canal de sugerencias y editor de contenidos (Sprint 3: HU-13 y HU-14).
- Cuentas, inicio de sesión, analítica, rastreo o cualquier dato personal.
- **Cualquier actividad del backlog del S2 que no esté en un WP de `docs/sprint-2/PROMPTS.md`.** Las actividades recortables (PLAN §6) solo se implementan si el PLAN las activa por escrito.
- Mientras no se active HT-06.2-A o HU-12: el caché sin conexión del service worker, el manifest y la instalación como PWA. El service worker del S2 solo atiende `push` y `notificationclick`.

Rutas que siguen como marcadores con mensaje honesto: Historial (mientras no entre HU-08.1-B), Progreso (HU-10, recortable) y Ayuda (S3).

## 4. Stack
- Node.js 22.13 o superior, npm. Los integrantes usan Windows + PowerShell.
- Vite + React + JavaScript (sin TypeScript).
- `react-router` v7 en modo librería (`BrowserRouter`).
- Pruebas:
  - Vitest + `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event` + jsdom.
  - Playwright + `@axe-core/playwright`. Para el horario, usa `page.clock`.
- ESLint (flat config) con `eslint-plugin-jsx-a11y` (recomendado) y reglas de React Hooks.
- CI: GitHub Actions. Despliegue: Vercel.
- **Nuevas en el S2:**
  - `web-push`, solo en el servidor.
  - El cliente del almacén de suscripciones que fije D-21 (propuesto: `@upstash/redis`).
  - Nada más sin justificarlo en la descripción del PR.
- **No se usan** `vite-plugin-pwa` ni Workbox en el S2: el service worker se escribe a mano en `public/sw.js`.

## 5. Scripts obligatorios de `package.json`
| Script | Comando |
|---|---|
| `dev` | `vite` |
| `build` | `vite build` |
| `preview` | `vite preview` |
| `lint` | `eslint .` |
| `test` | `vitest run` |
| `test:watch` | `vitest` |
| `test:e2e` | `playwright test` |
| `evidence` | capturas a 360 px y resumen de axe (ver `tests/e2e/routes.js`) |
| `validate:tips` | `node scripts/validate-tips.mjs` |
| `validate:tips:release` | `node scripts/validate-tips.mjs --release` |
| `check:links` | `node scripts/check-links.mjs` (solo local, usa red) |
| `check` | `npm run lint && npm run validate:tips && npm run test && npm run build` |

`npm run check` debe pasar antes de abrir cualquier PR. `npm run test:e2e` corre en CI y antes de cada *release*.

## 6. Estructura (propuesta §14 + lo que agrega el S2)
```
tamalecho/
├─ CLAUDE.md · README.md · vercel.json · .nvmrc · .env.example
├─ .github/workflows/         ci.yml · push-dispatch.yml (S2)
├─ docs/                      DECISIONES.md, sprint-1/, sprint-2/, evidencias/
├─ scripts/                   validate-tips.mjs, check-links.mjs
├─ api/                       S2 · funciones de Vercel: SOLO adaptadores HTTP (D-21)
│  └─ push/                   subscribe.js, dispatch.js
├─ server/                    S2 · lógica del backend, pura y probada: suscripciones, almacén, envío
├─ public/sw.js               S2 · service worker: push y notificationclick
├─ src/
│  ├─ main.jsx
│  ├─ app/                    App.jsx, routes.jsx, Layout.jsx
│  ├─ components/             Header, NavMenu, SkipLink, Button, Message, TipCard, SourceCitation
│  ├─ features/
│  │  ├─ home/ · library/ · tips/ · placeholders/ · notfound/     (S1)
│  │  ├─ scheduler/           S2 · SettingsPage (Ajustes), SchedulePreview, NoticeToast, NoticeHost
│  │  └─ avatar/              S2 · Avatar.jsx
│  ├─ hooks/                  useCatalog, useDocumentTitle; S2: useSettings, useNoticeScheduler
│  ├─ services/               catalog; S2: schedule, storage, tipPicker, notificationService, pushClient
│  ├─ data/                   tips.json, schema.js, compare.json; S2: avatarStates.json
│  └─ styles/                 tokens.css, global.css
└─ tests/
   ├─ unit/                   Vitest (S2: también unit/server/)
   └─ e2e/                    Playwright
```
Reglas de arquitectura:
- La lógica que no es de vista va en `src/services/` como funciones puras, con su prueba en `tests/unit/`.
- **El horario se calcula en un solo lugar:** `src/services/schedule.js`.
  - Sus funciones reciben la fecha como parámetro y nunca llaman a `Date.now()` ni a `new Date()` sin argumentos.
  - No usan APIs del navegador, para que `server/` también pueda importarlas.
- El catálogo se lee **solo** a través de `src/services/catalog.js`. Ningún componente importa `tips.json`.
- `localStorage` se usa **solo** dentro de `src/services/storage.js`, que recibe el almacenamiento por parámetro para poder probarlo.
- `Notification`, `PushManager` y `navigator.serviceWorker` se usan **solo** dentro de `notificationService.js` y `pushClient.js`.
- `src/data/schema.js` es la única definición de las reglas del tip. Lo usan el validador y las pruebas. No usa APIs de Node.
- `api/` no contiene lógica: valida el método, lee el cuerpo, llama a `server/` y responde. La lógica y sus pruebas viven en `server/`.
- Colores, espacios, tipografía, foco, radios, breakpoints y duraciones de animación salen de `tokens.css`, incluidos los del personaje. No escribas valores sueltos en los componentes.
- No crees carpetas fuera de esta lista sin explicar por qué en el PR. No crees carpetas del Sprint 3.

## 7. Rutas
| Ruta | Página | Historia |
|---|---|---|
| `/` | HomePage: consejo destacado, personaje (S2), «Próximo consejo» (S2) y accesos a Scrum y PMI/PMBOK | HU-01.1, HU-04.1, HU-05 |
| `/biblioteca` | Redirige a `/biblioteca/scrum` | HU-02.1 |
| `/biblioteca/:enfoque` | `scrum` o `pmbok`; categorías y filtro `?categoria=` | HU-02 |
| `/tip/:id` | Ficha completa, fuente, siguiente consejo, volver con filtro; registra la lectura (S2) | HU-03, HU-08.1-A |
| `/ajustes` | **S2:** horario, silencio, pausa, notificaciones, Web Push y restablecer datos | HU-07, HU-04.1-A, HU-06.2, HU-15.1-A, HT-04.2-B |
| `/historial` · `/progreso` · `/ayuda` | Marcadores con mensaje honesto | HU-01.2 |
| `/api/push/*` | Funciones del servidor (no son páginas) | HT-07 |
| `*` | NotFoundPage con enlace al inicio | HU-01.2 |

- El filtro activo vive en la URL, para que «Volver a la biblioteca» lo conserve.
- Cada página define `document.title` y tiene un único `<h1>`.
- `vercel.json` reescribe a `/index.html` todas las rutas **excepto `/api/`**.

## 8. Catálogo de consejos (`src/data/tips.json`)
Sin cambios respecto al Sprint 1: catálogo `1.0.0` con 24 consejos aprobados. Su estructura y las reglas del validador están en `src/data/schema.js` y en `scripts/validate-tips.mjs`.
- No modifiques el contenido de los consejos en el S2.
- Si una función nueva necesita datos de un consejo, los obtiene con `catalog.js`.
- Cualquier texto educativo nuevo (por ejemplo, las frases del personaje) lo aprueba el Product Owner antes del *release*.

## 9. Git
- `main` protegida: solo entra por PR con CI en verde (D-05).
- **Revisión cruzada (D-19):** cada PR lo aprueba un integrante distinto de quien lo abrió antes del merge.
- Una rama por WP: `feat/HT-04-motor`, `feat/HT-07-push-backend`, `fix/HU-07-silencio`.
  - Las ramas `spike/...` son desechables: **no se integran**; su resultado va a `docs/`.
- Commits con ID de actividad: `feat(HT-04.1-A): motor de ventanas con fecha local`.
- PR:
  - Título con los IDs.
  - La descripción incluye qué cambió, **cómo probarlo paso a paso**, el checklist de DoD (PLAN §7) y una captura si hay interfaz.
- Squash merge y borrar la rama.
- Código, ramas y commits en inglés (salvo los IDs); interfaz en español de México.
- **Secretos:**
  - Nunca entran al repositorio. `.env` y `.env.*` ya están ignorados.
  - `.env.example` lleva solo los nombres de las variables.
  - La clave privada VAPID y el secreto del disparador viven solo en Vercel y en GitHub Secrets.

## 10. Accesibilidad mínima (WCAG 2.2 AA)
- HTML semántico: `header`, `nav`, `main`, `footer`, encabezados en orden, listas reales.
- Enlace «Saltar al contenido» como primer elemento enfocable.
- Todo control tiene nombre accesible; los enlaces dicen a dónde llevan («Ver más sobre Product Backlog», no «Ver más» a secas).
- Foco visible en todos los elementos interactivos, con el color de `tokens.css`.
- Contraste de texto ≥ 4.5:1. Objetivos táctiles ≥ 44 × 44 px. Texto base ≥ 16 px.
- Se respeta `prefers-reduced-motion`. Sin desplazamiento horizontal a 360 px.
- Los enlaces externos indican que se abren en otra pestaña.
- **S2:**
  - Aviso emergente:
    - Se anuncia con una región `role="status"` y no roba el foco.
    - Se cierra con su botón o con Escape.
    - Solo hay un aviso a la vez.
  - Formularios de Ajustes: `fieldset` y `legend`, etiquetas visibles y errores asociados con `aria-describedby`.
  - Personaje: tiene texto alternativo con su estado y su frase. Con movimiento reducido es estático y no oculta el texto.

## 11. Cómo trabajas
1. Trabaja **un solo WP a la vez**. Antes de empezar, confirma que sus dependencias ya están en `main`.
2. Antes de escribir código, resume en 5 líneas o menos qué harás y qué archivos tocarás.
3. Respeta la estructura de la §6 y no implementes nada de la §3.
4. Toda lógica nueva lleva su prueba. Toda pantalla nueva lleva al menos una prueba de renderizado. Toda lógica de horario se prueba con fechas fijas.
5. Al terminar, corre `npm run check` (y `npm run test:e2e` si tocaste interfaz) y muestra la salida. Si algo falla, corrígelo antes de dar el WP por terminado.
6. **No inventes nada:** ni números de página, ni URLs, ni ediciones, ni citas, ni límites de servicios externos. Si dudas, dilo y anótalo en el PR.
7. Parafrasea; nunca copies texto de las guías.
8. **Nunca** llenes `reviewedBy` ni `reviewedAt` por iniciativa propia. Solo lo haces cuando una persona te da el nombre de quien aprobó cada consejo.
9. **Nunca** escribas en ningún `DAILY.md`, en actas ni en retrospectivas: esos registros los escribe una persona. Tampoco registres actividades, horas ni aprobaciones a nombre de alguien que no las hizo (D-19).
10. Termina con un resumen: archivos cambiados, cómo probar a mano (pasos numerados), qué criterio de aceptación se cumple y cuál no.
