# Registro de decisiones — TamalEcho Tips

> Cada decisión tiene ID, fecha, motivo y estado. Si un agente o una persona encuentra una contradicción nueva, **no la resuelve en silencio**: la agrega aquí como `PENDIENTE` y pregunta.
> Última actualización: 20/10/2026.

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

## D-06 · Hosting — VIGENTE (S1) / PENDIENTE (S2)
- S1: **Vercel** (HTTPS, vista previa por PR, *Instant Rollback*). SPA con `vercel.json` (todas las rutas reescritas a `/index.html`).
- S2: la arquitectura del backend Web Push **no está decidida**. Antes del Sprint Planning 2 (26/10) se hace un *spike* que responda: ¿dónde corre el programador cada 2–3 h?, ¿dónde se guardan las suscripciones?, ¿funciona en un navegador real con la pestaña cerrada? Restricciones conocidas: Vercel no ofrece almacenamiento persistente propio y su cron gratuito es limitado (verificar); en iPhone, Web Push solo funciona con la PWA instalada.

## D-07 · Herramientas de prueba — VIGENTE
- Unitarias y de renderizado: **Vitest + Testing Library + jsdom** en `tests/unit/`.
- E2E y accesibilidad automática: **Playwright + @axe-core/playwright** en `tests/e2e/`. Cumple RNF-02 (“herramienta automática”) y RNF-18 (“E2E de flujos críticos en el pipeline”).
- Ubicación según la propuesta §14 (`tests/unit`, `tests/e2e`), no junto al código.

## D-08 · Tablero — VIGENTE
- **GitHub Projects**, columnas de la propuesta §13: Pendiente / En curso / En prueba / Terminado.
- Una *issue* por actividad (28 en S1), con el ID de la propuesta en el título.
- Burndown por **actividades restantes** (28 → 0) en `docs/sprint-1/DAILY.md`. Los puntos se usan para velocidad, no para el burndown diario.

## D-09 · Estructura de carpetas — VIGENTE
- Base: propuesta §14 (`src/app`, `src/components`, `src/features/...`, `src/services`, `src/data`, `tests/unit`, `tests/e2e`). Se agrega `src/hooks/` para HT-02.1-B.
- En S1 **no se crean** carpetas de sprints futuros (`features/scheduler`, `features/avatar`, `server/`, service worker).

## D-10 · Prioridad y recorte — VIGENTE
- La prioridad Debe / Debería / Puede del N4 decide qué se recorta si no alcanza el tiempo. **Nunca se recorta un “Debe”.**
- Lo no terminado se reporta como **pendiente**, nunca como terminado (propuesta §1).

## D-11 · Navegación — VIGENTE
- Menú: Inicio, Biblioteca, Historial, Progreso, Ajustes, Ayuda (RF-03 incluye Ayuda; la propuesta §14 incluye Progreso).
- Historial, Progreso y Ajustes muestran «Disponible en el Sprint 2»; Ayuda, «Disponible en el Sprint 3».

## D-13 · Definición del entregable del S1 sin rúbrica — VIGENTE
- La instrucción fue verbal: «traigan el entregable del S1 para el viernes». No hay rúbrica.
- **El contrato es la propuesta aprobada**, que ya define el entregable y la demostración del 23/10 (§10, Sprint 1) y promete «URL accesible, repositorio versionado, Word y acta de revisión» (§11).
- Entregable del S1:
  1. Incremento funcionando en una URL pública.
  2. Repositorio con `v0.1.0`.
  3. Demostración en vivo.
  4. **Reporte del Sprint 1 en Word**, con la estructura de PLAN §10.
- Se pide confirmación a la profesora por mensaje el 20/10. Si no responde antes del jueves, se entrega lo anterior.

## D-12 · Versionado — VIGENTE
- Catálogo: `0.9.0` mientras haya borradores; `1.0.0` solo cuando los 24 estén aprobados (HT-03.2-B).
- Producto: etiqueta Git `v0.1.0` al cierre del S1, `v0.2.0` S2, `v1.0.0` entrega final 20/11.
