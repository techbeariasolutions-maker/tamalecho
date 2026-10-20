# Sprint 1 — Paquetes de trabajo (WP) para agentes

## Cómo usar este archivo
- **Un WP a la vez, en orden.** No abras otro chat de agente en paralelo sobre el mismo repo.
- Para pedir un WP al agente basta una línea:
  > `Ejecuta el WP-3 de docs/sprint-1/PROMPTS.md siguiendo CLAUDE.md. Antes de escribir código, dime en 5 líneas qué harás.`
- Cuando el agente termine: revisa con el PLAN §8, haz el merge, mueve las tarjetas del tablero y anota las horas en `DAILY.md`.
- Si el agente propone algo fuera del WP, la respuesta es «no, solo el WP».

---

## WP-0 · Preparación manual · martes · 45 min
Lo haces tú, en PowerShell:
1. Verifica las herramientas: `node -v` (≥ 22), `npm -v` y `git --version`. Si falta alguna, instala Node LTS desde nodejs.org y Git desde git-scm.com.
2. Instala GitHub CLI con `winget install --id GitHub.cli` y luego autentícate con `gh auth login` y `gh auth refresh -s project`. Esto último da el permiso que necesita el tablero.
3. Crea el repo: `gh repo create tamalecho --public --clone` y luego `cd tamalecho`.
   - **¿Público?** Sí, salvo que la ingeniera lo prohíba: así la protección de `main` es gratuita. Si debe ser privado, primero activa GitHub Pro con el *Student Developer Pack*.
4. Copia en el repo **todo el contenido del kit**: `CLAUDE.md`, `docs/` y `src/data/tips.json`. Luego: `git add .`, `git commit -m "docs: plan, decisiones y borrador del catálogo"` y `git push`.
5. Invita a los 5 compañeros como colaboradores (Settings → Collaborators). Esto también es evidencia.
6. Crea tu cuenta de Vercel **iniciando sesión con GitHub**. Todavía no importes el proyecto.
7. Instala tu agente de código siguiendo su documentación oficial y ábrelo en la carpeta `tamalecho`.

**Hecho cuando:** el repo existe en GitHub con `CLAUDE.md` y `docs/`, y el agente puede leerlos.

---

## WP-1 · Base ejecutable · HT-01.1-A, HT-01.1-B · martes · 45 min
**Rama:** `chore/HT-01-base` · **Depende de:** WP-0
**Construir:**
- Proyecto Vite + React + JavaScript **en la raíz del repo**, conservando `CLAUDE.md` y `docs/`.
- Las dependencias de CLAUDE.md §4 y los scripts de §5.
- `scripts/validate-tips.mjs` y `scripts/check-links.mjs` como *stubs*: imprimen «Pendiente: WP-3» o «Pendiente: WP-7» y salen con código 0.
- ESLint en flat config con `jsx-a11y` recomendado y reglas de React Hooks.
- Vitest: entorno jsdom, archivo de setup con `jest-dom` e `include: ['tests/unit/**/*.test.{js,jsx}']`.
- Playwright: `testDir: 'tests/e2e'`. El `webServer` corre `npm run build && npm run preview -- --port 4173`. Dos proyectos: `desktop` (Chromium a 1280 × 800) y `mobile-360` (Chromium a 360 × 740).
- `.nvmrc` con `22`, y un `.gitignore` que incluya `node_modules`, `dist`, `test-results` y `playwright-report`.
- Una prueba de humo unitaria (la App renderiza) y una E2E (la portada carga).
- README en español: requisitos, instalación en PowerShell, tabla de scripts y resumen del flujo Git de CLAUDE.md §9. Deja una sección «Despliegue y rollback» vacía para WP-4.

**Aceptación:** en una carpeta nueva, `git clone` → `npm ci` → `npm run check` → `npx playwright install chromium` → `npm run test:e2e` pasan; `npm run dev` abre en `http://localhost:5173`.
**Revisión:** clona el repo en *otra* carpeta y corre exactamente esos comandos. Esa es literalmente la demostración de HT-01.1 («otro integrante clona y ejecuta sin ajustes secretos»).

---

## WP-B · Tablero en GitHub Projects · gestión · martes · 15 min
**Depende de:** WP-0 (permiso `project`)
**Hacer con `gh`:**
- Etiquetas: `HU`, `HT`, `Debe`, `Debería`, `sprint-1` y `WP-1` … `WP-10`.
- Milestone «Sprint 1 · 23/10/2026».
- 28 issues, una por fila de PLAN §5:
  - Título: `HU-01.1-A · Crear HomePage con tip destacado y accesos`.
  - Cuerpo: subhistoria, criterio de aceptación tomado de la propuesta (se copia del PLAN), prioridad y WP.
  - Etiquetas y milestone.
- Proyecto «TamalEcho» con el campo Status: Pendiente / En curso / En prueba / Terminado. Agrega las 28 issues con estado Pendiente.

**Aceptación:** el tablero muestra 28 tarjetas en Pendiente. Captura de pantalla a `docs/evidencias/sprint-1/tablero-inicio.png`.

---

## WP-4 · CI y despliegue · HT-01.2-A, HT-01.2-B · martes · 45 min
**Rama:** `chore/HT-01-ci` · **Depende de:** WP-1
**El agente construye:**
- `.github/workflows/ci.yml`, con el nombre de job `CI`, que corre en `pull_request` y en `push` a `main`:
  1. `actions/checkout` y `actions/setup-node` con `node-version-file: .nvmrc` y caché de npm.
  2. `npm ci`, `npm run lint`, `npm run validate:tips`, `npm run test` y `npm run build`.
  3. `npx playwright install --with-deps chromium` y `npm run test:e2e`.
  4. Si falla, sube `playwright-report` como artefacto.
- `vercel.json` con *rewrite* de todas las rutas a `/index.html`.
- Sección «Despliegue y rollback» del README:
  - Producción = `main`; cada PR tiene una vista previa.
  - Rollback en Vercel: Deployments → despliegue anterior → *Instant Rollback* / *Promote to Production*.
  - Rollback en Git: `git revert <sha>` mediante un PR.

**A mano, después del merge:**
1. Vercel → Add New → Project → importa `tamalecho`. Vite se detecta solo. Haz clic en Deploy.
2. GitHub → Settings → Branches (o Rules) → regla para `main`: exigir PR, exigir el check `CI` en verde y **0 aprobaciones** (D-05).

**Aceptación:**
- El PR muestra el check verde y la vista previa de Vercel.
- `main` está desplegado en una URL `https://` pública.
- Abrir directamente `https://<tu-url>/biblioteca` no da 404 (esto prueba el *rewrite*).

**Evidencia:** captura del pipeline en verde → `docs/evidencias/sprint-1/ci-verde.png`.

---

## WP-2 · Esqueleto de navegación · HT-02.1-A, HT-02.2-A, HT-02.2-B, HU-01.2-A · martes · 60 min
**Rama:** `feat/HT-02-layout` · **Depende de:** WP-1
**Construir:**
- `src/app/routes.jsx` con todas las rutas de CLAUDE.md §7. Las páginas aún no construidas se muestran como marcadores.
- `Layout.jsx`: `SkipLink` («Saltar al contenido») → `Header` (nombre del producto, enlace a `/`) → `NavMenu` → `<main id="contenido">` con `<Outlet />` → `footer` breve.
- `NavMenu` con Inicio, Biblioteca, Historial, Progreso, Ajustes y Ayuda (D-11):
  - En escritorio, horizontal.
  - En móvil, botón con `aria-expanded` y `aria-controls`. Se cierra al navegar y con Escape, y el foco regresa al botón.
  - El enlace activo lleva `aria-current="page"`.
- `PlaceholderPage`: recibe un título y un sprint, y muestra «Esta sección estará disponible en el Sprint N» con un enlace a la biblioteca.
- `NotFoundPage`: «No encontramos esta página», con enlace al inicio.
- `tokens.css`:
  - Colores con contraste ≥ 4.5:1. Anota en un comentario el par de colores y su razón de contraste.
  - Escala tipográfica con base 16 px, escala de espacios, radios y anillo de foco.
  - Breakpoints documentados en comentarios.
  - `--motion-duration`, que vale `0ms` bajo `prefers-reduced-motion: reduce`.
- `global.css` mobile-first que solo usa tokens.
- `Button` (variantes primaria y secundaria; mínimo 44 × 44 px) y `Message` (variantes `loading`, `error` y `empty`, con `role="status"` o `role="alert"` según corresponda).
- Cada página define su `document.title`.

**Pruebas:**
- Unitarias: cada ruta renderiza su `h1` (con `MemoryRouter`); una ruta desconocida muestra NotFound; `Button` y `Message` renderizan sus variantes.
- E2E: desde `/`, cada sección del menú se alcanza en 3 clics o menos, en `desktop` y en `mobile-360`.

**Aceptación:** todas las rutas cargan su página; el menú móvil funciona solo con teclado; cambiar `--color-primary` en `tokens.css` cambia todas las pantallas.

---

## WP-3 · Catálogo: contrato, validador y servicio · HT-03.1-A, HT-03.1-B, HT-02.1-B · miércoles · 45 min
**Rama:** `feat/HT-03-catalogo` · **Depende de:** WP-2
**Construir:**
- `src/data/schema.js`: lista de campos y `validateCatalog(catalog, { release })`, que devuelve `{ errors, warnings }` con las reglas de CLAUDE.md §8. Funciones puras, sin APIs de Node.
- `scripts/validate-tips.mjs`: lee `src/data/tips.json` y llama a `validateCatalog`.
  - Imprime los errores y advertencias en español, cada uno con el ID del tip.
  - Sale con código 1 si hay errores.
  - Con `--release`, las advertencias de aprobación y de «12 por enfoque» se vuelven errores.
- **No crees ni sobrescribas `src/data/tips.json`**: ya existe en el repo (viene en el kit, con 24 tips). Tu validador y tus pruebas deben funcionar con ese archivo; para las pruebas usa *fixtures* propios en `tests/unit/fixtures/`.
- `src/services/catalog.js`, funciones puras:
  - `getCatalogVersion()`
  - `getTips({ framework, category })`
  - `getTipById(id)`
  - `getCategories(framework)`
  - `getNextTip(id)`: siguiente de la misma categoría y enfoque, con vuelta circular; `null` si es el único.
  - `getFeaturedTip(date)`: determinista por día del año, sin `Math.random`, para que sea comprobable.
- `src/hooks/useCatalog.js`: envuelve el servicio para los componentes. Sin estado global y sin temporizadores.

**Pruebas:**
- `tests/unit/schema.test.js`: un *fixture* que falle por cada regla, más uno válido.
- `tests/unit/catalog.test.js`: cada función, incluidos los bordes (ID inexistente, categoría vacía, un único tip).

**Aceptación:** `npm run validate:tips` pasa con los 24 tips del kit (solo advertencias de aprobación). Si rompes uno (ID duplicado, URL con `http://`, `summary` de más de 160 caracteres), falla con un mensaje que dice qué tip y qué regla. Esa es la demostración de HT-03.

---

## WP-5 · Integrar el borrador de los 24 tips · HT-03.2-A · miércoles · 10 min
**Rama:** `content/HT-03-tips` · **Depende de:** WP-3
**Estado:** el contenido **ya está redactado** en el kit (`src/data/tips.json`, catálogo `0.9.0`), con la guía de revisión en `docs/sprint-1/REVISION_TIPS.md`. Ediciones según D-03: Guía Scrum 2020, Kniberg 2007 y PMBOK 6.ª ed.
**Instrucciones al agente:**
- Confirma que `src/data/tips.json` del kit está en el repo y pasa `npm run validate:tips` sin errores. Las advertencias de aprobación son esperadas.
- Si el validador marca un error de **formato**, corrige solo el formato. **No reescribas el contenido** ni cambies fuentes, URLs o categorías.
- No toques componentes.

**Después, revisión editorial (HT-03.2-B):** se revisa cada tip siguiendo `REVISION_TIPS.md`: los 12 de Scrum el miércoles y los 12 de PMI el jueves. Al terminar, se le pide al agente: «Marca como aprobados los tips de REVISION_TIPS.md que tienen nombre y fecha; usa exactamente esos datos y las páginas verificadas».

**Aceptación:** 24 tips (12 + 12) en `main`; `npm run validate:tips` sin errores.

---

## WP-6 · Portada, tarjeta y biblioteca · HU-03.1-A, HU-01.1-A, HU-02.1-A, HU-02.1-B · miércoles · 75 min
**Rama:** `feat/HU-01-02-portada-biblioteca` · **Depende de:** WP-3 y WP-5
**Construir:**
- `TipCard`: un `<article>` con título (encabezado), resumen, área de conocimiento, acción y el enlace «Ver más sobre {título}» a `/tip/:id`. El enlace pasa en `state` la URL actual de la biblioteca.
- `HomePage`:
  - `h1` y una descripción de dos líneas como máximo.
  - El tip destacado (`getFeaturedTip`) en un `TipCard`.
  - Dos accesos grandes: «Explorar Scrum» y «Explorar PMI/PMBOK».
  - Enlaces visibles a Biblioteca, Ajustes y Ayuda.
- `LibraryPage` en `/biblioteca/:enfoque`:
  - `FrameworkSwitch`: dos enlaces con aspecto de control segmentado y `aria-current`.
  - Una línea que describe el enfoque, sin compararlo con el otro.
  - `CategoryFilter`: botones con `aria-pressed`, más la opción «Todas». El estado vive en `?categoria=`.
  - Contador («12 consejos») y lista `ul` > `li` de `TipCard`.
- Rutas especiales: `/biblioteca` → `/biblioteca/scrum`. Un enfoque inválido muestra NotFound.

**Pruebas:**
- Unitarias de renderizado de las tres piezas.
- E2E:
  - `/` muestra un tip y ambos accesos.
  - En `pmbok` se ven sus categorías y tantos tips como tenga el catálogo para ese enfoque (no escribas el 12 a mano).
  - El filtro cambia la URL.

**Aceptación:** sin cuenta, `/` muestra un tip y desde ahí se llega a ambos enfoques; cada enfoque lista sus categorías y sus tips.

---

## WP-7 · Ficha, siguiente tip y estados alternos · HU-03.1-B, HU-03.2-A, HU-03.2-B · miércoles · 60 min
**Rama:** `feat/HU-03-ficha` · **Depende de:** WP-6
**Construir:**
- `TipDetailPage`:
  - Título (`h1`), enfoque y categoría, resumen, explicación, error frecuente, ejemplo y acción.
  - Bloque de fuente: «Fuente: {authors} ({year}). *{title}*, {edition}.», más «p. {pages}» solo si existe.
  - El enlace externo lleva `target="_blank"`, `rel="noopener noreferrer"` y el texto visible «(se abre en otra pestaña)».
  - ID y versión del tip, en pequeño.
- «Siguiente consejo» con `getNextTip`.
- «Volver a la biblioteca»: usa el `state` recibido. Si no existe, va a `/biblioteca/{framework}?categoria={category}`.
- Estados alternos:
  - ID inexistente → `Message` «Este consejo no existe o fue retirado», con enlace a la biblioteca.
  - Fuente sin URL → se muestra el texto de la fuente sin enlace.
- `scripts/check-links.mjs`: pide cada `source.url` distinta y reporta el código HTTP; sale con 1 si alguna falla. Es solo local (necesita red), no va en CI.

**Pruebas:**
- E2E: desde la biblioteca filtrada → abrir un tip → «Siguiente» → «Volver» → el filtro sigue aplicado.
- E2E: `/tip/SCR-99` muestra el estado alterno.
- E2E que recorre **todos** los tips y verifica que cada ficha muestre la fuente.

**Aceptación:** cada consejo abre su ficha con concepto, aplicación y referencia consultable; la navegación entre consejos funciona; `npm run check:links` no reporta enlaces rotos.

---

## WP-8 · Comparación y cambio de enfoque · HU-02.2-A, HU-02.2-B, HU-01.1-B · jueves · 45 min · **DEBERÍA: primer recorte**
**Rama:** `feat/HU-02-comparacion` · **Depende de:** WP-7
**Construir:**
- `src/data/compare.json`: **una** situación («el cliente pide un cambio a mitad del proyecto») explicada desde Scrum y desde PMI/PMBOK, cada parte con su fuente. Sus textos se agregan a `REVISION_TIPS.md` en una sección «Textos de comparación» para que los apruebe el PO.
- `CompareExample`: dos columnas en escritorio y apiladas en móvil, con el encabezado «Mismo problema, dos enfoques». Debe dejar claro que **no son equivalentes**. Accesible desde ambas bibliotecas.
- Sugerencia inicial (texto estático en la portada): «¿Por dónde empezar? Si tu equipo trabaja en iteraciones cortas, empieza por Scrum; si necesitas planear todo el ciclo del proyecto, empieza por PMI/PMBOK». Sin persistencia (eso es del S2).
- `FrameworkSwitch` también visible en la ficha: cambiar de enfoque no obliga a volver al inicio.
- HU-01.1-B: las rutas se cargan con `React.lazy` + `Suspense`, y el *fallback* es `<Message variant="loading">`. Así ninguna pantalla queda en blanco.

**Aceptación:** el usuario cambia de enfoque sin volver al inicio y abre el ejemplo comparativo desde la biblioteca.

---

## WP-9 · Responsive, accesibilidad y suite E2E · HU-11.1-A/B, HU-11.2-A/B, HU-01.2-B · jueves · 90 min
**Rama:** `feat/HU-11-accesibilidad` · **Depende de:** WP-7 (y WP-8 si no se recortó)
**Construir y corregir:**
- Revisión mobile-first:
  - Objetivos táctiles ≥ 44 × 44 px y texto ≥ 16 px.
  - Palabras largas que se parten (`overflow-wrap`).
  - Sin desplazamiento horizontal a 360 px.
- Revisión de accesibilidad: landmarks, orden de encabezados, nombres accesibles, foco visible, *skip link* funcional y regla global de movimiento reducido.
- Suite E2E en `tests/e2e/`:
  - `navigation.spec`: 3 clics o menos, botón «atrás», ruta inexistente y menú móvil abre/cierra.
  - `library.spec` y `tip.spec`: complementan WP-6 y WP-7.
  - `responsive.spec`: en cada ruta a 360 px, `document.documentElement.scrollWidth <= window.innerWidth`, y guarda una captura en `docs/evidencias/sprint-1/360/<ruta>.png`.
  - `keyboard.spec`: solo con Tab y Enter, abrir un tip desde la biblioteca y volver.
  - `a11y.spec`: axe en cada ruta con etiquetas `wcag2a`, `wcag2aa`, `wcag21aa` y `wcag22aa`; falla con violaciones `serious` o `critical`; guarda el resumen en `docs/evidencias/sprint-1/axe-resumen.json`.
  - `reduced-motion.spec`: con `reducedMotion: 'reduce'`, `document.getAnimations().length === 0`.
- Script `"evidence": "playwright test responsive.spec a11y.spec"`.

**Aceptación:** todo en verde en local y en CI; capturas a 360 px de cada ruta generadas.
**A mano (10 min):** con el lector de pantalla de Windows (Narrador: Ctrl + Win + Enter), recorre la portada y una ficha. Anota en `PRUEBAS.md` qué se anunció bien y qué no.

---

## WP-10 · Release del Sprint 1 · HT-03.2-B y cierre · viernes · 120 min (equipo + agente)
1. **Contenido.**
   - Si los 24 tips están aprobados en `REVISION_TIPS.md`: el agente marca la aprobación con esos datos exactos, sube `catalogVersion` a `1.0.0`, actualiza `updatedAt` y `npm run validate:tips:release` pasa.
   - Si no están todos: los tips no aprobados **se quitan** de `tips.json` para el release y se reportan como pendientes. HT-03.2-B queda parcial. **Nunca se llena `reviewedBy` sin una aprobación real.**
2. Corre `npm run check`, `npm run test:e2e`, `npm run check:links` y `npm run evidence`.
3. PR «release: v0.1.0 (Sprint 1)» → merge → `git tag -a v0.1.0 -m "Sprint 1"` → `git push --tags` → GitHub Release con notas: historias terminadas, historias pendientes y enlace a la URL.
4. Abre la URL de producción en tu celular y en la computadora.
5. Evidencias en `docs/evidencias/sprint-1/`:
   - Las capturas a 360 px y el resumen de axe ya se generaron con `npm run evidence`.
   - Video corto con teclado: Win + Alt + R graba con Xbox Game Bar.
   - Captura del CI en verde.
   - **Captura del validador fallando:** en una rama desechable, rompe un tip, corre `npm run validate:tips`, toma la captura y borra la rama.
   - Captura del tablero y burndown (de `DAILY.md`).
6. Ensaya la demo con el guion de PLAN §9.
7. Escribe el Reporte del Sprint 1 (estructura en PLAN §10), el acta de la Review y la Retrospectiva.
