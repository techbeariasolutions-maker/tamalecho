# TamalEcho Tips — Instrucciones para agentes de código

> Va en la raíz del repositorio. Todo agente lo lee antes de trabajar.
> Reemplaza al CLAUDE.md anterior. Si algo aquí contradice la propuesta aprobada, gana la propuesta (ver `docs/DECISIONES.md`, D-01).

## 1. Orden de lectura obligatorio
1. Este archivo.
2. `docs/DECISIONES.md`: decisiones vigentes y pendientes.
3. `docs/sprint-1/PLAN.md`: backlog, prioridades y Definition of Done del sprint actual.
4. El paquete de trabajo (WP) que te pidieron, en `docs/sprint-1/PROMPTS.md`.

## 2. Producto
TamalEcho Tips es una web en React + JavaScript (Vite) que enseña conceptos de Scrum y PMI/PMBOK con consejos breves. En sprints posteriores habrá avisos cada 2 o 3 horas, un personaje animado según la hora, PWA y Web Push.

**Sprint actual: Sprint 1 (19–23/10/2026).** Meta: *disponer de una plataforma pública navegable en móvil y escritorio, con dos bibliotecas y 24 consejos revisados y enlazados a sus fuentes.*

Reglas de producto (no negociables):
- Acceso público, sin registro ni inicio de sesión.
- Scrum y PMI/PMBOK son enfoques distintos. Nunca se presentan como equivalentes.
- Cada consejo tiene una fuente verificable con su edición. No se hace *release* con consejos sin aprobación del Product Owner.
- Texto de la interfaz en español de México.

## 3. Fuera de alcance en el Sprint 1 (NO implementar)
Avisos automáticos, motor horario, temporizadores, personaje animado, preferencias, almacenamiento local, historial real, favoritos, compartir, búsqueda, microquiz, progreso, PWA, service worker, Notification API, Web Push, carpeta `server/` y editor de contenidos.
Las rutas Historial, Progreso, Ajustes y Ayuda existen solo como marcadores con un mensaje honesto.

## 4. Stack
- Node.js 22 LTS o superior, npm. Los integrantes usan Windows + PowerShell.
- Vite + React + JavaScript (sin TypeScript).
- `react-router` v7 en modo librería (`BrowserRouter`).
- Pruebas: Vitest + `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event` + jsdom; Playwright + `@axe-core/playwright`.
- ESLint (flat config) con `eslint-plugin-jsx-a11y` (recomendado) y reglas de React Hooks.
- CI: GitHub Actions. Despliegue: Vercel.
- No agregues dependencias fuera de esta lista sin justificarlo en la descripción del PR.

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
| `validate:tips` | `node scripts/validate-tips.mjs` |
| `validate:tips:release` | `node scripts/validate-tips.mjs --release` |
| `check:links` | `node scripts/check-links.mjs` (solo local, usa red) |
| `check` | `npm run lint && npm run validate:tips && npm run test && npm run build` |

`npm run check` debe pasar antes de abrir cualquier PR. `npm run test:e2e` corre en CI y antes de cada *release*.

## 6. Estructura (propuesta §14, solo lo que necesita el S1)
```
tamalecho/
├─ CLAUDE.md · README.md · vercel.json · .nvmrc
├─ .github/workflows/ci.yml
├─ docs/                      DECISIONES.md, sprint-1/, evidencias/
├─ scripts/                   validate-tips.mjs, check-links.mjs
├─ src/
│  ├─ main.jsx
│  ├─ app/                    App.jsx, routes.jsx, Layout.jsx
│  ├─ components/             Header, NavMenu, SkipLink, Button, Message, TipCard
│  ├─ features/
│  │  ├─ home/                HomePage.jsx
│  │  ├─ library/             LibraryPage, FrameworkSwitch, CategoryFilter, CompareExample
│  │  ├─ tips/                TipDetailPage.jsx
│  │  ├─ placeholders/        PlaceholderPage.jsx
│  │  └─ notfound/            NotFoundPage.jsx
│  ├─ hooks/                  useCatalog.js
│  ├─ services/               catalog.js (funciones puras)
│  ├─ data/                   tips.json, schema.js, compare.json
│  └─ styles/                 tokens.css, global.css
└─ tests/
   ├─ unit/                   Vitest
   └─ e2e/                    Playwright
```
Reglas de arquitectura:
- La lógica que no es de vista va en `src/services/` como funciones puras, con su prueba en `tests/unit/`.
- El catálogo se lee **solo** a través de `src/services/catalog.js`. Ningún componente importa `tips.json`.
- `src/data/schema.js` es la única definición de las reglas del tip. Lo usan el validador y las pruebas. No usa APIs de Node.
- Colores, espacios, tipografía, foco, radios, breakpoints y duraciones de animación salen de `tokens.css`. No escribas valores sueltos en los componentes.
- No crees carpetas nuevas sin explicar por qué en el PR. No crees carpetas de sprints futuros.

## 7. Rutas
| Ruta | Página | Historia |
|---|---|---|
| `/` | HomePage: descripción breve, consejo destacado y accesos a Scrum y PMI/PMBOK | HU-01.1 |
| `/biblioteca` | Redirige a `/biblioteca/scrum` | HU-02.1 |
| `/biblioteca/:enfoque` | `scrum` o `pmbok`; categorías y filtro `?categoria=` | HU-02 |
| `/tip/:id` | Ficha completa, fuente, siguiente consejo, volver con filtro | HU-03 |
| `/historial` · `/progreso` · `/ajustes` · `/ayuda` | Marcadores (S2, S2, S2, S3) | HU-01.2 |
| `*` | NotFoundPage con enlace al inicio | HU-01.2 |

- El filtro activo vive en la URL, para que «Volver a la biblioteca» lo conserve.
- Cada página define `document.title` y tiene un único `<h1>`.
- `vercel.json` reescribe todas las rutas a `/index.html`.

## 8. Catálogo de consejos (`src/data/tips.json`)
```json
{
  "catalogVersion": "0.9.0",
  "updatedAt": "2026-10-21",
  "tips": [
    {
      "id": "SCR-01",
      "framework": "scrum",
      "category": "Artefactos y compromisos",
      "title": "Product Backlog",
      "summary": "Máximo 160 caracteres.",
      "knowledgeArea": "Artefactos de Scrum",
      "action": "Una acción concreta que el estudiante puede hacer hoy.",
      "explanation": "Paráfrasis de 2 a 4 oraciones.",
      "commonMistake": "Error frecuente.",
      "example": "Ejemplo breve aplicado.",
      "source": {
        "title": "La Guía de Scrum",
        "authors": "Schwaber, K. y Sutherland, J.",
        "edition": "Noviembre 2020",
        "year": 2020,
        "url": "https://scrumguides.org/scrum-guide.html",
        "pages": ""
      },
      "tags": ["backlog", "artefacto"],
      "reviewedBy": "",
      "reviewedAt": "",
      "version": 1
    }
  ]
}
```
Reglas del validador (`scripts/validate-tips.mjs` usa `validateCatalog` de `schema.js`; sale con código 1 y un mensaje claro en español si hay errores):
1. `id` único con formato `^(SCR|PMI)-\d{2}$`; el prefijo coincide con `framework` (`SCR`↔`scrum`, `PMI`↔`pmbok`).
2. Todos los campos del ejemplo son obligatorios y no vacíos, **salvo** `source.pages`, `reviewedBy` y `reviewedAt`.
3. `framework` solo puede ser `scrum` o `pmbok`. `summary` ≤ 160 caracteres.
4. `source.url` es una URL `https://` válida.
5. No hay `title` ni `summary` duplicados.
6. `catalogVersion` es semver.
7. **Solo en `--release`** se vuelven errores (antes son advertencias): al menos 12 consejos por enfoque, y `reviewedBy` + `reviewedAt` presentes en todos.

## 9. Git
- `main` protegida: solo entra por PR con CI en verde (D-05).
- Una rama por WP: `chore/HT-01-base`, `feat/HU-02-biblioteca`, `content/HT-03-tips`, `fix/HU-03-enlaces`.
- Commits con ID de actividad: `feat(HU-02.1-A): selector de enfoque con categorías`.
- PR: título con los IDs. La descripción incluye qué cambió, **cómo probarlo paso a paso**, el checklist de DoD (PLAN §7) y una captura si hay interfaz.
- Squash merge y borrar la rama.
- Código, ramas y commits en inglés (salvo los IDs); interfaz en español de México.

## 10. Accesibilidad mínima (WCAG 2.2 AA)
- HTML semántico: `header`, `nav`, `main`, `footer`, encabezados en orden, listas reales.
- Enlace «Saltar al contenido» como primer elemento enfocable.
- Todo control tiene nombre accesible; los enlaces dicen a dónde llevan («Ver más sobre Product Backlog», no «Ver más» a secas).
- Foco visible en todos los elementos interactivos, con el color de `tokens.css`.
- Contraste de texto ≥ 4.5:1. Objetivos táctiles ≥ 44 × 44 px. Texto base ≥ 16 px.
- Se respeta `prefers-reduced-motion`. Sin desplazamiento horizontal a 360 px.
- Los enlaces externos indican que se abren en otra pestaña.

## 11. Cómo trabajas
1. Trabaja **un solo WP a la vez**. Antes de empezar, confirma que sus dependencias ya están en `main`.
2. Antes de escribir código, resume en 5 líneas o menos qué harás y qué archivos tocarás.
3. Respeta la estructura de la §6 y no implementes nada de la §3.
4. Toda lógica nueva lleva su prueba. Toda pantalla nueva lleva al menos una prueba de renderizado.
5. Al terminar, corre `npm run check` (y `npm run test:e2e` si tocaste interfaz) y muestra la salida. Si algo falla, corrígelo antes de dar el WP por terminado.
6. **No inventes nada:** ni números de página, ni URLs, ni ediciones, ni citas. Si dudas, deja el campo vacío y anótalo en `docs/sprint-1/REVISION_TIPS.md`.
7. Parafrasea; nunca copies texto de las guías.
8. **Nunca** llenes `reviewedBy` ni `reviewedAt` por iniciativa propia. Solo lo haces cuando una persona te da el nombre de quien aprobó cada consejo.
9. **Nunca** escribas en `docs/sprint-1/DAILY.md`, en actas ni en retrospectivas: esos registros los escribe una persona.
10. Termina con un resumen: archivos cambiados, cómo probar a mano (pasos numerados), qué criterio de aceptación se cumple y cuál no.
