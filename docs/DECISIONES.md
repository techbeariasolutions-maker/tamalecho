# Registro de decisiones — TamalEcho Tips

> Cada decisión tiene ID, fecha, motivo y estado. Si un agente o una persona encuentra una contradicción nueva, **no la resuelve en silencio**: la agrega aquí como `PENDIENTE` y pregunta.
> Última actualización: 30/10/2026 (conexión del almacén).

## D-01 · Jerarquía de fuentes de verdad — VIGENTE
1. **Propuesta aprobada** (`TamalEcho_Propuesta_Sprints.pdf`). Manda sobre todo lo demás. Alcance cerrado.
2. **Lista de requerimientos N4** (Word + Excel): prioridades Debe / Debería / Puede y criterios medibles.
3. **Este repositorio**: `CLAUDE.md`, `docs/DECISIONES.md`, `docs/sprint-N/`.
4. El CLAUDE.md anterior (guía del Sprint 1 con nombres de integrantes) es **solo contexto**; donde contradiga a la propuesta, se descarta.

## D-02 · Catálogo base = propuesta §16 — VIGENTE
- Los 24 consejos son los de la propuesta §16: `SCR-01`…`SCR-12` y `PMI-01`…`PMI-12`.
- Formato de ID: `^(SCR|PMI)-\d{2}$`. `SCR` ⇔ `framework: "scrum"`, `PMI` ⇔ `framework: "pmbok"`.
- Se descarta la lista de temas del CLAUDE.md anterior (`scrum-001` “Empirismo”, `pmbok-001` “Acta de constitución”, etc.).

## D-03 · Fuentes y ediciones citadas — VIGENTE (cambio controlado respecto a la propuesta, 20/10/2026)
- **Decisión:** los tips PMI citan la **Guía del PMBOK, 6.ª edición (PMI, 2017)**, no la 8.ª que menciona la propuesta §18.
- **Motivo:** la regla del producto es «fuente verificable». El equipo no tiene acceso a la 8.ª ed. La 6.ª es la bibliografía oficial del programa del curso («Pmbook_guide versión 6») y la que la profesora puede comprobar. Citar una edición que nadie verificó violaría RN-04 y RNF-22.
- **Impacto:** PMI-07 «Finanzas» pasa a «Costos». Las categorías PMI siguen la estructura de la 6.ª ed.: Áreas de conocimiento · Fundamentos y entorno · Monitoreo y control. Los 24 temas no cambian.
- **Riesgo:** el material del aula indica «cap. 1-5». Si el equipo solo tiene esos capítulos, PMI-02, 03, 05, 06, 07 y 08 no se pueden verificar hasta conseguir la guía completa.
- Scrum: *La Guía Scrum*, noviembre 2020. Los tips SCR-07, SCR-08 y SCR-12 citan a Kniberg (2007) porque esas prácticas no vienen de la guía; la propuesta exige «distinguir libro de Scrum, Scrum Guide y guía PMBOK».
- Regla: solo se cita una fuente que el equipo tenga en la mano y haya verificado. La página se anota solo si se comprobó.
- Corrección hacia adelante: los documentos nuevos citan la Guía de Scrum 2020, no la de 2017 que usó el N4.
- Se declara como cambio en el reporte del Sprint 1.

## D-04 · Roles y atribución — VIGENTE
- Los roles son los de la propuesta (§11.1 y §17):

| Integrante | Rol |
|---|---|
| Obdulio Rincón Flores | Product Owner |
| Ana Clara Rocha Benassuli | Scrum Master |
| Alan Francisco Ochoa Hernández | QA y pruebas |
| Diego Rodríguez Álvarez | Developer frontend |
| Christian Salvador Gallegos | Developer contenido y funciones |
| Sinai Esquivel Elizondo | Developer interacción |
| Ian Alexander Perez | Developer backend y DevOps |

- Los entregables atribuyen el trabajo al **Equipo TamalEcho** de forma colectiva.
- La aprobación editorial de los tips se registra como «Equipo editorial TamalEcho» en `reviewedBy`.
- El acta de la Review la firma quien acepte en la Review.

## D-05 · Flujo Git del Sprint 1 — VIGENTE (S1)
- `main` protegida: solo entra por PR con CI en verde.
- Sin aprobación obligatoria en S1: el autor llena el checklist de DoD en el PR y hace la revisión de comportamiento (PLAN §8).
- Una rama por **paquete de trabajo** (WP), no por tarjeta: 28 PR en 4 días es burocracia sin valor. Cada commit lleva el ID de actividad.
- Se reactiva la revisión cruzada cuando haya trabajo en paralelo (S2).
- **S2 (29/10/2026):** la revisión cruzada es obligatoria. Cada PR lo aprueba un integrante distinto del autor antes del merge (ver D-19).
- **Excepción registrada (20/10):** el PR del WP-1 entra sin check automático porque el CI se crea en el WP-4. La protección de `main` se activa al terminar el WP-4; a partir de ahí no hay excepciones.

## D-06 · Hosting — VIGENTE (S1) / RESUELTA para el S2 en D-21 (30/10/2026)
- S1: **Vercel** (HTTPS, vista previa por PR, *Instant Rollback*). SPA con `vercel.json` (todas las rutas reescritas a `/index.html`).
- S2: la arquitectura del backend Web Push **no está decidida**. Antes del Sprint Planning 2 (26/10) se hace un *spike* que responda: ¿dónde corre el programador cada 2–3 h?, ¿dónde se guardan las suscripciones?, ¿funciona en un navegador real con la pestaña cerrada? Restricciones conocidas: Vercel no ofrece almacenamiento persistente propio y su cron gratuito es limitado (verificar); en iPhone, Web Push solo funciona con la PWA instalada.
- **29/10/2026:** el spike no se hizo antes del 26/10. Se ejecuta como WP-S2-1 y su resultado confirma o cambia D-21.

## D-07 · Herramientas de prueba — VIGENTE
- Unitarias y de renderizado: **Vitest + Testing Library + jsdom** en `tests/unit/`.
- E2E y accesibilidad automática: **Playwright + @axe-core/playwright** en `tests/e2e/`. Cumple RNF-02 (“herramienta automática”) y RNF-18 (“E2E de flujos críticos en el pipeline”).
- Ubicación según la propuesta §14 (`tests/unit`, `tests/e2e`), no junto al código.

## D-08 · Tablero — SUSTITUIDA por D-18 (22/10/2026)
- **GitHub Projects**, columnas de la propuesta §13: Pendiente / En curso / En prueba / Terminado.
- Una *issue* por actividad (28 en S1), con el ID de la propuesta en el título.
- Burndown por **actividades restantes** (28 → 0) en `docs/sprint-1/DAILY.md`. Los puntos se usan para velocidad, no para el burndown diario.

## D-09 · Estructura de carpetas — VIGENTE
- Base: propuesta §14 (`src/app`, `src/components`, `src/features/...`, `src/services`, `src/data`, `tests/unit`, `tests/e2e`). Se agrega `src/hooks/` para HT-02.1-B.
- En S1 **no se crean** carpetas de sprints futuros (`features/scheduler`, `features/avatar`, `server/`, service worker).
- **S2 (29/10/2026):** se crean `src/features/scheduler/`, `src/features/avatar/`, `server/`, `api/` y `public/sw.js` (CLAUDE.md §6). `api/` existe porque Vercel publica como funciones los archivos de esa carpeta. Solo contiene adaptadores HTTP, y la lógica vive en `server/`, como pide la propuesta §14.

## D-10 · Prioridad y recorte — VIGENTE
- La prioridad Debe / Debería / Puede del N4 decide qué se recorta si no alcanza el tiempo. **Nunca se recorta un “Debe”.**
- Lo no terminado se reporta como **pendiente**, nunca como terminado (propuesta §1).

## D-11 · Navegación — VIGENTE
- Menú: Inicio, Biblioteca, Historial, Progreso, Ajustes, Ayuda (RF-03 incluye Ayuda; la propuesta §14 incluye Progreso).
- Historial, Progreso y Ajustes muestran «Disponible en el Sprint 2»; Ayuda, «Disponible en el Sprint 3».
- **S2 (29/10/2026):** Ajustes deja de ser marcador (HU-07). Historial y Progreso siguen como marcadores mientras no entren HU-08.1-B y HU-10. Si no entran, en el *release* `v0.2.0` su texto se corrige para no prometer un sprint que ya terminó.

## D-13 · Definición del entregable del S1 sin rúbrica — VIGENTE
- La instrucción fue verbal: «traigan el entregable del S1 para el viernes». No hay rúbrica.
- **El contrato es la propuesta aprobada**, que ya define el entregable y la demostración del 23/10 (§10, Sprint 1) y promete «URL accesible, repositorio versionado, Word y acta de revisión» (§11).
- Entregable del S1:
  1. Incremento funcionando en una URL pública.
  2. Repositorio con `v0.1.0`.
  3. Demostración en vivo.
  4. **Reporte del Sprint 1 en Word**, con la estructura de PLAN §10.
- Se pide confirmación a la profesora por mensaje el 20/10. Si no responde antes del jueves, se entrega lo anterior.

## D-14 · Versiones de dependencias — VIGENTE (20/10/2026)
- `react-router` se fija en **^7** aunque npm ya ofrece la v8. Es la versión que pide `CLAUDE.md` §4 y la más documentada; migrar no aporta valor en el S1.
- Vite, `@vitejs/plugin-react` y Vitest: se usa la combinación más reciente **compatible entre sí**. El agente reporta en el PR del WP-1 las versiones exactas que quedaron y la versión mínima de Node que exigen.
- `.nvmrc` y el README indican esa versión mínima de Node, y el equipo verifica que su Node local la cumpla.
- Resultado del WP-1: Node mínimo **22.13.0** (lo exige jsdom 29; se descartó jsdom 30, que pide Node ≥ 22.22.2).
- **ESLint se queda en 9.x aunque ya no tiene soporte (riesgo técnico aceptado).** `eslint-plugin-jsx-a11y` 6.10.2 solo declara compatibilidad hasta ESLint 9; subir a la 10 obligaría a instalar con `--legacy-peer-deps`. ESLint solo corre en desarrollo y no llega al sitio publicado. Se revisa en el S3.

## D-15 · Entorno de los agentes — VIGENTE (20/10/2026)
- El agente de código trabaja en un entorno Linux en la nube. Sus pruebas en verde no demuestran que el proyecto funcione en Windows.
- La prueba de aceptación de HT-01.1 (caso T-15: clonar y correr en otra máquina) la hace el equipo en Windows con PowerShell y deja una captura como evidencia.
- El agente puede crear y subir las ramas de WP con la convención de `CLAUDE.md` §9.

## D-16 · Replaneación por tiempo del Sprint 1 — VIGENTE (22/10/2026)
- **Motivo:** el miércoles 21 no hubo avance en código. Al jueves 09:40 quedan 24 de 28 actividades y unas 8 h de capacidad hasta la Review.
- **Bloques en lugar de un PR por paquete:**
  - **Bloque A:** WP-3, WP-5, WP-6 y WP-7 en una sola rama y un solo PR, con al menos un commit por actividad con su ID.
  - **Bloque B:** WP-9, más WP-8 si se integra antes de las 14:00 del jueves.
  - La trazabilidad se conserva por actividad en los commits y en el tablero.
- **Punto de control 2 aplicado:** el WP-7 no estaba en `main` al inicio del jueves, así que el **WP-8 (HU-02.2-A/B, HU-01.1-B; todas «Debería») pasa a opcional**. Si no entra, se reporta como pendiente para el S2.
- **Congelación:** jueves al cierre de la sesión. El viernes solo se hacen el release, las evidencias, el reporte y la Review.

## D-17 · Enlace de la fuente PMBOK — VIGENTE (22/10/2026)
- Los tips PMI citan la Guía del PMBOK, **6.ª edición en español**; las páginas citadas son de esa edición.
- PMI ya no tiene una página pública de la 6.ª edición: sus enlaces redirigen a la de la 8.ª (2025). Se conserva `https://www.pmi.org/es-es/standards/pmbok` como enlace oficial de la editorial.
- Si alguien abre el enlace y ve la 8.ª edición, la respuesta es que la cita y sus páginas corresponden a la 6.ª (D-03) y que el enlace lleva a la página oficial del estándar.
- El enlace responde 403 a peticiones automáticas (`check:links`), pero abre normalmente en el navegador (evidencia `regresion-jueves/5-enlace-pmi-manual.png`).

## D-18 · Taiga como tablero oficial — VIGENTE (22/10/2026)
- Por indicación de la profesora, la gestión Scrum (backlog, sprints, tareas y burndown) se lleva en **Taiga** (proyecto «TamalEcho Tips»), una de las herramientas que nombra el programa del curso (Trello o Taiga).
- Se cargaron las 23 historias (126 puntos), el Sprint 1 con sus 28 tareas y las historias de S2 y S3 en el backlog.
- GitHub queda solo para el código, los cambios revisados y el CI. Sustituye a D-08.
- La burndown de Taiga refleja las fechas de carga (22/10); la burndown día a día del Sprint 1 es la de `docs/sprint-1/DAILY.md`.

## D-19 · Capacidad real y atribución del Sprint 2 — VIGENTE (29/10/2026)
- **Hechos al 29/10:**
  - El Sprint Planning 2 programado para el lunes 26/10 no se realizó.
  - No hay avance del S2 en el repositorio ni dailies registradas.
- **Capacidad confirmada:**
  - Diego Rodríguez Álvarez (Developer frontend) y Alan Francisco Ochoa Hernández (QA), unas **2 h por día hábil cada uno** hasta el 13/11.
  - Eso da **≈ 44 h brutas y ≈ 31 h netas**, con el factor de dedicación de 0.7 que se usó en el S1.
  - Del resto del equipo no hay capacidad confirmada para código.
- **Planeación efectiva:** jueves 29/10, por Diego y Alan (`docs/sprint-2/PLAN.md`).
- **Flujo de trabajo:**
  - Diego implementa con el agente de código y abre los PR.
  - Alan revisa y aprueba cada PR (revisión cruzada, D-05), y hace las pruebas manuales y las evidencias.
- **Atribución (complementa D-04).** Cada actividad tiene dos datos distintos:
  - **«Responsable (plan)»:** el integrante que le corresponde por su rol en la propuesta. Es una **asignación**, no una afirmación de autoría.
  - **«Lo integró»:** quién la implementó y quién la revisó, tomado del historial de PR de GitHub. Se llena al integrar, nunca antes.
- **Quién participa en el S2:**
  - Diego y Alan: código, revisión y pruebas.
  - Ana Clara Rocha Benassuli (SM) y Obdulio Rincón Flores (PO): tareas que no son de código (PLAN §4).
  - Christian Salvador Gallegos, Sinai Esquivel Elizondo e Ian Alexander Perez **no participan en el S2 al 29/10**. Conservan sus actividades como responsables por plan, según su rol (D-04); las ejecutan Diego o Alan, y así se registra en «Lo integró».
- **Registros:**
  - Dailies, horas, actas, aprobaciones y firmas solo de quien participó.
  - Nadie aprueba ni firma por otro.
  - La participación de cada integrante se declara en el reporte del Sprint 2.
- **Impacto:** el alcance se compromete según la capacidad real (D-20), no según los 78 puntos de la propuesta.

## D-20 · Alcance comprometido del Sprint 2 (opción B) — VIGENTE (29/10/2026) · visto bueno del PO pendiente
- **Compromiso: 27 actividades y 47 puntos:**
  - Todas las actividades «Debe» del S2 (prioridad Alta, 43 pts).
  - Más **HU-15.1-A** (activar suscripción) y **HU-15.2-B** (prueba con la pestaña cerrada), que suben de «Debería» a «Debe» (4 pts).
- **Motivo del cambio de prioridad:**
  - La meta del S2 en la propuesta exige «Web Push probado en un navegador compatible».
  - HT-07.1 (backend, «Debe») no tiene valor demostrable si nadie puede activar la suscripción y recibir un aviso real.
- **Service worker:** el mínimo, que solo atiende `push` y `notificationclick`, va dentro de HU-15.1-A. El caché sin conexión sigue en HT-06.2-A y HU-12 («Debería»).
- **Lo recortable:**
  - Las otras 25 actividades (31 pts) son recortables, en el orden de PLAN §6.
  - Si no entran, se reportan como **pendientes** (D-10).
- **Historias parciales:**
  - Aun cumpliendo el compromiso quedan parciales HT-05, HU-05, HU-06, HT-06, HT-07, HU-08 y HU-15.
  - Se reportan como «parcial», con detalle por actividad.
  - El orden de PLAN §6 intenta primero completar HU-06, HT-05 y HU-05 (4 pts).
- **Cambio controlado:**
  - Se pide el visto bueno del PO (Obdulio Rincón Flores).
  - Si lo rechaza, HU-15.1-A y HU-15.2-B vuelven a «Debería» y el compromiso queda en 43 pts.

## D-21 · Arquitectura de Web Push — VIGENTE (30/10/2026) · opción A confirmada por el spike (WP-S2-1)
- **Opción A (propuesta):**
  - Funciones de Vercel en `api/`, solo como adaptadores; la lógica va en `server/`.
  - Las suscripciones se guardan en un almacén clave-valor del Marketplace de Vercel (propuesto: Upstash Redis).
  - El envío se dispara desde GitHub Actions:
    - `workflow_dispatch` para el envío de prueba (HT-07.1-B, HU-15.2-B).
    - `schedule` cuando entre HT-07.2-A.
  - Ese disparo llama a `/api/push/dispatch`, protegido con un secreto compartido.
  - Las claves VAPID privadas viven solo en las variables de entorno de Vercel.
- **Opción B (respaldo):** un servidor Node aparte, en un servicio con plan gratuito.
- **Por qué A:**
  - Usa el mismo hosting y el mismo despliegue por PR.
  - No hay un servidor más que mantener.
  - El equipo ya usa GitHub Actions.
  - `server/` reutiliza `src/services/schedule.js`, así que cliente y servidor calculan el horario igual.
- **A verificar en el spike (no se asume ningún dato):**
  - Límites del plan gratuito del almacén.
  - Frecuencia mínima y retrasos de `schedule` en GitHub Actions.
  - Límites del cron del plan gratuito de Vercel, como alternativa al disparador.
  - Que la protección de las vistas previas de Vercel no bloquee `/api/`.
  - Que llegue un aviso real con la pestaña cerrada en Chrome o Edge de escritorio y en Chrome de Android.
- **Restricción conocida:** en iPhone, Web Push requiere la PWA instalada (HU-12, recortable). Si HU-12 no entra, se declara como «no soportado en el S2».
- **Resultado del spike (30/10/2026, `docs/sprint-2/SPIKE_WEBPUSH.md`):**
  - **Disparador:**
    - El cron de Vercel en Hobby solo corre una vez al día (±59 min), así que se descarta.
    - Se usa GitHub Actions: `workflow_dispatch` en el compromiso y `schedule` cada 30 min fuera de la hora en punto si entra HT-07.2-A.
    - Como `schedule` puede retrasarse o perder corridas, cada corrida envía la ventana **vigente** si no se ha enviado (clave idempotente). Un aviso puede llegar hasta unos 30 min tarde, pero no se pierde ni se duplica.
  - **Almacén:** Upstash Redis Free (256 MB, 500 000 comandos al mes). El uso estimado es de ≈ 36 000 al mes. Se conectó al proyecto el 30/10; el backend usa `KV_REST_API_URL` y `KV_REST_API_TOKEN`.
  - **Prueba real:** llegó un aviso con la pestaña cerrada en Chrome de escritorio (Windows), con un retraso de 0 s. Edge, Firefox y Chrome Android se prueban en producción en T2-21 (hito del 6/11).
  - **Vistas previas:** la protección estándar de Vercel impide que Actions las llame, así que el disparador apunta solo a producción.

## D-12 · Versionado — VIGENTE
- Catálogo: `0.9.0` mientras haya borradores; `1.0.0` solo cuando los 24 estén aprobados (HT-03.2-B).
- Producto: etiqueta Git `v0.1.0` al cierre del S1, `v0.2.0` S2, `v1.0.0` entrega final 20/11.
