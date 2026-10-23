# TamalEcho Tips · Contexto completo del proyecto y del Sprint 1

> **Documento de traspaso.** Fecha de corte: viernes 23 de octubre de 2026 (día de la Sprint Review del Sprint 1).
> Ubicación en el repositorio: `docs/CONTEXTO_PROYECTO.md`. Si algo de aquí contradice al repositorio, **el repositorio manda** porque está más actualizado.

---

## 0. Cómo usar este archivo

### Si eres integrante del equipo
1. Sube este archivo a tu asistente de IA (Claude, ChatGPT, etc.).
2. Pídele algo como: *«Explícame este proyecto de forma simple. Luego explícame con detalle mi rol (soy el/la ___) y qué me toca en el Sprint 2»*.
3. Hazle preguntas hasta que puedas explicar tu parte sin leer. La ingeniera puede preguntar a cualquiera de forma individual.

### Si eres un modelo de lenguaje (LLM) que recibe este archivo
- Lee el documento completo antes de responder.
- Explica en **español de México**, en lenguaje simple y con ejemplos del proyecto, porque quien te pregunta puede no ser técnico.
- **No inventes nada:** ni fechas, ni números de página, ni resultados de pruebas, ni lo que hizo cada persona. Si algo no está aquí, dilo y sugiere dónde buscarlo (repositorio, Taiga, propuesta).
- Si te piden **conducir el Sprint 2**, usa el prompt de la **sección 12**.

---

## 1. Resumen ejecutivo (para leer en 1 minuto)

- **Qué es:** TamalEcho Tips es una página web que enseña conceptos de **Scrum** y de **PMI/PMBOK** con consejos breves y verificables. Más adelante enviará un aviso cada 2 o 3 horas, con un personaje animado que cambia según la hora del día.
- **Para qué:** es el proyecto del equipo en la materia **Administración de Proyectos de Software** (FIME-UANL, ITS Grupo 006, Ing. Leticia Amalia Neira Tovar). Se trabaja con **Scrum**.
- **Calendario fijo, 3 sprints:**
  - **S1:** 19–23 oct.
  - **S2:** 24 oct–13 nov.
  - **S3:** 14–20 nov.

  El **20/11/2026 es el cierre**. No existe Sprint 4.
- **Estado al 23/10:**
  - **Sprint 1:** las 28 actividades están integradas y verificadas. Las 7 historias esperan la aceptación del Product Owner en la Review de hoy.
  - **Sitio público:** https://tamalecho.vercel.app (versión `v0.1.0`, catálogo de consejos `1.0.0`).
  - **Herramientas:** el código está en GitHub y la gestión Scrum en **Taiga**.
- **Siguiente hito:** el **Sprint Planning 2, lunes 26/10**. El riesgo principal es el **Sprint 2**: 78 puntos en 15 días, con avisos *Web Push* (la parte técnica más difícil).

---

## 2. El curso, la entrega y las reglas del juego

| Concepto | Detalle |
|---|---|
| Universidad | UANL · Facultad de Ingeniería Mecánica y Eléctrica (FIME) |
| Materia | Administración de Proyectos de Software (PMBOK + Ágil/Scrum) |
| Grupo | Ingeniería en Tecnologías de Software (ITS) · Grupo 006 |
| Profesora | Ing. Leticia Amalia Neira Tovar |
| Entregas | **23/10** (S1), **13/11** (S2), **20/11** (S3 y cierre formal) |
| Rúbrica | **No hay rúbrica escrita.** La instrucción fue verbal («traigan el entregable del S1 el viernes»). Por eso **la propuesta aprobada es el contrato** (decisión D-13). |
| Herramienta de gestión | La profesora **no quiere ver la gestión en GitHub**. El tablero oficial está en **Taiga** (D-18). El programa del curso menciona Trello o Taiga. |
| Material de la profesora | Presentaciones de Scrum («Scrum: metodología ágil…» y «Fábrica de Software FIME»), Guía de Scrum 2017 y 2020, *Scrum y XP desde las trincheras* (Kniberg), *Análisis, estimación y planificación ágil* (Kleer), plantilla de tarjeta de historia de usuario, plantilla de Product Backlog y Guía del PMBOK 6.ª ed. |

**Formato de tarjetas que pide la profesora:**
- **Tarjeta blanca** (historia): ID · título breve · prioridad (número de importancia) · descripción «Como…, quiero…, para…» · validación · estimación en puntos.
- **Tarjeta amarilla** (actividad): ID · título · prioridad (Alta/Media/Baja) · descripción técnica · responsable · puntos de esfuerzo.

Ya están impresas las del S1 (35) y las del backlog S2/S3 (80).

---

## 3. El producto

### 3.1 Qué hace hoy (incremento del Sprint 1)
- Portada pública **sin registro**, con un consejo destacado y accesos a Scrum y PMI/PMBOK.
- **Dos bibliotecas** (Scrum y PMI/PMBOK) con categorías y filtro. El filtro se guarda en la dirección web, para que «Volver» lo conserve.
- **Ficha de cada consejo:** explicación, error frecuente, ejemplo, acción concreta y **fuente con edición y página**.
- «Siguiente consejo» y regreso a la biblioteca conservando el filtro.
- **Ejemplo comparativo** «mismo problema, dos enfoques», que explica que Scrum y PMBOK no son equivalentes.
- Uso completo **en celular (360 px), en escritorio y solo con teclado**; respeta la opción «reducir movimiento».
- Secciones Historial, Progreso y Ajustes (Sprint 2) y Ayuda (Sprint 3) como marcadores honestos: «disponible en el Sprint N».

### 3.2 Qué hará (sprints 2 y 3)
- Avisos cada 2 o 3 horas en ventanas fijas (con inicio 08:00 cada 3 h: 08, 11, 14, 17 y 20 h), uno por ventana, sin acumular atrasados, y silencio por defecto de 21:00 a 08:00.
- **Personaje animado** según la hora: despierto (05:00–11:59), con hambre (12:00–15:59), atento (16:00–19:59) y cansado (20:00–04:59).
- Preferencias, pausa y silencio; historial, favoritos y compartir; búsqueda; microquiz opcional y progreso.
- Instalación como app (**PWA**) y lectura sin conexión.
- **Web Push**: avisos aunque la página esté cerrada (con permiso del usuario).
- Ayuda, aviso de privacidad, canal de sugerencias y gestión editorial de consejos (S3).

### 3.3 Reglas del producto que no se negocian
1. Acceso público, sin registro.
2. Scrum y PMI/PMBOK son enfoques **distintos**; nunca se presentan como equivalentes.
3. Cada consejo tiene **fuente verificable con edición**; no se publica un consejo sin aprobación del Product Owner.
4. Interfaz en español de México.

### 3.4 Tecnología (explicada simple)
| Pieza | Qué es | Para qué la usamos |
|---|---|---|
| React + JavaScript (Vite) | Herramientas para construir páginas web por componentes | Toda la interfaz |
| react-router v7 | Manejo de las páginas (rutas) | `/`, `/biblioteca/scrum`, `/tip/SCR-01`, etc. |
| Vitest + Testing Library | Pruebas de piezas pequeñas | 137 pruebas unitarias |
| Playwright + axe | Navegador automático que usa la página como una persona + auditor de accesibilidad | Pruebas E2E y WCAG 2.2 AA |
| ESLint | Revisor automático de código | Estilo, errores y accesibilidad |
| GitHub + GitHub Actions | Repositorio y verificación automática (CI) | Ningún cambio entra sin pruebas en verde |
| Vercel | Publicación del sitio | URL pública y vista previa por cada cambio |
| Taiga | Herramienta Scrum | Backlog, sprints, tareas y burndown |

### 3.5 Direcciones importantes
- **Sitio:** https://tamalecho.vercel.app
- **Repositorio:** https://github.com/techbeariasolutions-maker/tamalecho
- **Tablero:** Taiga, proyecto «TamalEcho Tips» (lo administra el dueño del proyecto; pídele que te invite).

---

## 4. Equipo, roles y forma de trabajo

### 4.1 Roles según la propuesta aprobada
| Integrante | Rol | Ámbito principal |
|---|---|---|
| Obdulio Rincón Flores | Product Owner | Backlog, prioridades, contenido de los consejos, aceptación de historias |
| Ana Clara Rocha Benassuli | Scrum Master | Eventos Scrum, impedimentos, tablero y burndown; textos Scrum vs PMBOK |
| Alan Francisco Ochoa Hernández | QA y pruebas | Matriz de pruebas, evidencias, regresión, revisión de cambios |
| Diego Rodríguez Álvarez | Developer frontend | Portada, navegación, estilos mobile-first, tokens |
| Christian Salvador Gallegos | Developer de contenido y funciones | Catálogo, validador, biblioteca, tarjeta; en S2: historial, búsqueda, microquiz, offline |
| Sinai Esquivel Elizondo | Developer de interacción | Componentes, ficha, teclado; en S2: motor de horario, personaje, silencio |
| Ian Alexander Perez | Developer backend y DevOps | Repositorio, CI, publicación, rollback; en S2: servidor Web Push, service worker, PWA |

Decisión D-04: los entregables se atribuyen **colectivamente al Equipo TamalEcho** y las responsabilidades siguen esta tabla.

### 4.2 Forma de trabajo con asistentes de IA (declarada en el reporte)
El equipo usó asistentes de IA, y así quedó declarado en el reporte del Sprint 1:

| Papel | Quién / qué | Qué hace |
|---|---|---|
| **PM / orquestador** | Un chat de IA con el contexto completo | Planea, prioriza, decide recortes, revisa cada PR contra la Definition of Done, mantiene `DECISIONES.md`, arma reportes y guías |
| **Implementador web** | Un agente de código (Claude Code) | Ejecuta **un paquete de trabajo (WP) a la vez**, en su rama, con pruebas, y abre un PR |
| **QA revisor independiente** | Otro chat, que no escribió el código | Revisa cada PR contra la DoD y `PRUEBAS.md`; no escribe código |
| **Persona del equipo** | Integrante | Prueba el comportamiento (vista previa, 360 px, teclado, consola), aprueba e integra, hace las pruebas manuales y las que requieren Windows |

**Reglas que funcionaron:**
- **Un solo agente escribe código a la vez.** Varios en paralelo sobre el mismo repo generan conflictos.
- Cada cambio va por **PR**; el CI debe estar en verde; `main` está protegida, sin excepciones.
- **Nada se inventa:** las fuentes se verifican contra las guías originales y las páginas se anotan solo si se comprobaron.
- **Nadie firma ni aprueba a nombre de otro.** Los registros (daily, actas) los escribe una persona y dicen lo que pasó.

---

## 5. Fuentes de verdad y documentos

| Documento | Dónde | Para qué |
|---|---|---|
| **Propuesta aprobada** (`TamalEcho_Propuesta_Sprints.pdf`) | Del equipo | **Manda sobre todo** (D-01): alcance, historias, fechas |
| Lista de requerimientos N4 (Word + Excel) | Del equipo | 87 requisitos con prioridad Debe/Debería/Puede y matriz de trazabilidad |
| `CLAUDE.md` | Raíz del repo | Reglas para los agentes de código: stack, estructura, rutas, catálogo, Git, accesibilidad |
| `docs/DECISIONES.md` | Repo | Registro de decisiones D-01 a D-18 (control de cambios) |
| `docs/sprint-1/PLAN.md` | Repo | Plan operativo del S1: backlog, calendario, DoD, recortes, entregables |
| `docs/sprint-1/PROMPTS.md` | Repo | Paquetes de trabajo (WP) para los agentes |
| `docs/sprint-1/PRUEBAS.md` | Repo | Matriz de pruebas T-01 a T-22 |
| `docs/sprint-1/DAILY.md` | Repo | Daily, horas reales y burndown |
| `docs/sprint-1/REVISION_TIPS.md` | Repo | Revisión editorial de los 24 consejos (fuente, página, aprobación) |
| `docs/sprint-1/Reporte_Sprint1_TamalEcho.docx` | Repo | Reporte del S1 (se sube la versión final después de la Review) |
| `docs/agentes/PERFILES.md` | Repo | Textos de arranque de los agentes (implementador y QA) |
| `docs/evidencias/sprint-1/` | Repo | Capturas, resumen de accesibilidad y regresión |
| Taiga «TamalEcho Tips» | Web | Tablero oficial: 23 historias, 126 puntos, Sprint 1 |
| Guía de defensa y Guía del Sprint 1 (PDF) | Del equipo | Conceptos de Scrum y posibles preguntas por rol |

---

## 6. Cómo aplicamos Scrum (con adaptaciones)

- **Sprints de duración desigual** (5, 15 y 4 días hábiles) porque siguen las fechas fijas del curso. Se planea por capacidad.
- **Backlog:** 15 historias de usuario (HU) + 8 historias técnicas (HT) = 23 historias y 126 puntos. Cada historia tiene 2 subhistorias y cada subhistoria 2 actividades: **92 actividades**.
- **Importancia** (número de Kniberg, más alto = más importante): S1 de 100 a 70, S2 de 69 a 57, S3 de 50 a 48.
- **Prioridad** de cada actividad: Alta = «Debe», Media = «Debería», Baja = «Puede» (lista N4). **Nunca se recorta un «Debe»**; lo que no se termina se reporta como **pendiente**, nunca como terminado.
- **Definition of Done (actividad):**
  1. Está integrada en `main` por PR con CI en verde.
  2. Tiene pruebas de su lógica o de su renderizado.
  3. Cumple su criterio de aceptación.
  4. Funciona a 360 px y en escritorio, y con teclado.
  5. No deja errores en la consola.
  6. Pasó la revisión de comportamiento.

  **Historia:** sus 4 actividades terminadas, más la aceptación del PO en la Review.
- **Flujo Git:**
  - Una rama por paquete de trabajo, por ejemplo `feat/HU-02-biblioteca` o `content/HT-03-tips`.
  - Commits con el ID de la actividad, por ejemplo `feat(HU-02.1-A): …`.
  - PR con «cómo probarlo» y checklist de DoD; se integra con *Squash and merge*.
- **Daily:** por escrito, con horas reales y actividades restantes (`DAILY.md`).
- **Evidencias:** cada prueba manual deja una captura en `docs/evidencias/`.

### 6.1 Decisiones registradas (resumen de `DECISIONES.md`)
| ID | Decisión |
|---|---|
| D-01 | Jerarquía de fuentes: propuesta > N4 > repo > CLAUDE.md anterior |
| D-02 | Catálogo base = propuesta §16 (SCR-01…12, PMI-01…12) |
| D-03 | Consejos PMI citan **PMBOK 6.ª ed.** (la del curso); «Finanzas» pasó a «Costos». Scrum: Guía 2020 en español; SCR-07, 08 y 12 citan a Kniberg |
| D-04 | Roles según la propuesta; atribución colectiva al Equipo TamalEcho |
| D-05 | `main` protegida, PR con CI en verde, una rama por paquete |
| D-06 | Hosting en Vercel; **arquitectura del backend Web Push sin decidir** (spike antes del S2) |
| D-07 | Vitest + Testing Library; Playwright + axe |
| D-08 | (Sustituida por D-18) |
| D-09 | Estructura de carpetas según la propuesta §14 |
| D-10 | Recortes por prioridad; lo no terminado = pendiente |
| D-11 | Menú: Inicio, Biblioteca, Historial, Progreso, Ajustes, Ayuda |
| D-12 | Versionado: catálogo 1.0.0; producto v0.1.0 (S1), v0.2.0 (S2), v1.0.0 (final) |
| D-13 | Sin rúbrica: la propuesta es el contrato; reporte del sprint en Word |
| D-14 | react-router 7; Node ≥ 22.13; ESLint 9 como riesgo aceptado |
| D-15 | Los agentes trabajan en Linux; la prueba en Windows la hace el equipo |
| D-16 | Replaneación del S1: los paquetes se agruparon en dos bloques |
| D-17 | El enlace de PMI lleva a la 8.ª ed. (no hay página pública de la 6.ª); cita y páginas son de la 6.ª |
| D-18 | **Taiga es el tablero oficial**; GitHub solo para código |

---

## 7. Sprint 1 a detalle (19–23 de octubre de 2026)

### 7.1 Meta y resultado
- **Meta:** plataforma pública navegable en móvil y escritorio, con dos bibliotecas y 24 consejos revisados y enlazados a sus fuentes.
- **Resultado:** cumplida. 28/28 actividades integradas, 32 puntos; las 7 historias quedan pendientes de aceptación en la Review del 23/10.

### 7.2 Qué pasó cada día
| Día | Qué pasó | Horas registradas | Actividades restantes |
|---|---|---|---|
| Lun 19 | Sin Sprint Planning ni avance | 0 | 28 |
| Mar 20 | Sprint Planning; kit de documentos; repo; proyecto base (WP-1, PR #29); CI y publicación en Vercel (WP-4, PR #30); tablero con 28 issues; pruebas en Windows (T-15) y celular (T-16) | ≈ 3.25 | 24 |
| Mié 21 | Gestión: tarjetas físicas S1 y backlog S2/S3, guía de defensa. Sin actividades de código | 2 | 24 |
| Jue 22 | Replaneación D-16. WP-2 (#32); **Bloque A** (#33: catálogo, validador, portada, biblioteca, ficha); catálogo 1.0.0 verificado y aprobado (#35, #37); **Bloque B** (#36: comparación, accesibilidad, suite E2E); corrección de tiempo axe (#39); regresión en Windows; Taiga cargado; reporte | ≈ 2.75–3 | 0 |
| Vie 23 | Release `v0.1.0`; Sprint Review y Retrospectiva | — | — |

**Lección principal:** la burndown mostró dos días planos (lunes y miércoles). La replaneación permitió cerrar el sprint sin recortar nada «Debe», pero **la carga no se repartió entre todo el equipo**. La mejora comprometida en la retro es que cada integrante tenga al menos una historia asignada desde el Planning 2 y reporte el daily por escrito cada día antes de las 10:00.

### 7.3 Historias del Sprint 1
| ID | Historia | Importancia | Pts | Cómo demostrarla |
|---|---|---|---|---|
| HT-01 | Entorno, repositorio y despliegue | 100 | 3 | Otro integrante clona y ejecuta sin ajustes secretos; pipeline en verde y web desde enlace externo |
| HT-02 | Arquitectura React y diseño reutilizable | 95 | 5 | Piezas reutilizadas sin copiar lógica; un cambio de token se refleja en todas las pantallas |
| HT-03 | Datos, esquema y revisión del contenido | 90 | 5 | Un tip inválido falla la validación; 24 fichas con fuente y versión |
| HU-01 | Ingreso directo y navegación | 85 | 3 | Sin cuenta aparece un tip; cualquier sección en ≤ 3 clics |
| HU-02 | Bibliotecas Scrum y PMI/PMBOK | 80 | 5 | Cada enfoque con sus categorías y ≥ 12 conceptos; ejemplo comparativo |
| HU-03 | Ficha explicativa y fuentes | 75 | 3 | Cada consejo abre ficha con concepto, aplicación y fuente; sin enlaces rotos |
| HU-11 | Accesibilidad y diseño responsive | 70 | 8 | Operable a 360 px y en escritorio; solo con teclado |

### 7.4 Las 28 actividades (con el PR con que entraron)
| Historia | Actividad | Título | Responsable (plan) | Prioridad | Pts | PR |
|---|---|---|---|---|---|---|
| HT-01 | HT-01.1-A | Proyecto base | Ian Alexander Perez | Alta | 1 | #29 |
| HT-01 | HT-01.1-B | Scripts y README | Ian Alexander Perez | Alta | ½ | #29 |
| HT-01 | HT-01.2-A | Pipeline de CI | Ian Alexander Perez | Alta | 1 | #30 |
| HT-01 | HT-01.2-B | Despliegue y rollback | Ian Alexander Perez | Alta | ½ | #30 |
| HT-02 | HT-02.1-A | Rutas y Layout | Ian Alexander Perez | Alta | 2 | #32 |
| HT-02 | HT-02.1-B | Hooks y estado mínimo | Sinai Esquivel Elizondo | Alta | 1 | #33 |
| HT-02 | HT-02.2-A | Tokens CSS | Diego Rodríguez Álvarez | Media | 1 | #32 |
| HT-02 | HT-02.2-B | Componentes base | Sinai Esquivel Elizondo | Media | 1 | #32 |
| HT-03 | HT-03.1-A | Contrato del tip | Christian Salvador Gallegos | Alta | 1 | #33 |
| HT-03 | HT-03.1-B | Validador del catálogo | Christian Salvador Gallegos | Alta | 1 | #33 |
| HT-03 | HT-03.2-A | Carga de 24 tips | Obdulio Rincón Flores | Alta | 2 | #33 |
| HT-03 | HT-03.2-B | Aprobación y versión | Obdulio Rincón Flores | Alta | 1 | #35, #37 |
| HU-01 | HU-01.1-A | Portada | Diego Rodríguez Álvarez | Alta | 1 | #33 |
| HU-01 | HU-01.1-B | Estados de carga | Diego Rodríguez Álvarez | Media | ½ | #36 |
| HU-01 | HU-01.2-A | Navegación responsiva | Diego Rodríguez Álvarez | Alta | 1 | #32 |
| HU-01 | HU-01.2-B | Pruebas de navegación | Alan Francisco Ochoa Hernández | Media | ½ | #36 |
| HU-02 | HU-02.1-A | Selector de enfoque | Christian Salvador Gallegos | Alta | 2 | #33 |
| HU-02 | HU-02.1-B | Conectar 24 tips | Christian Salvador Gallegos | Alta | 1 | #33 |
| HU-02 | HU-02.2-A | Cambio de enfoque | Ana Clara Rocha Benassuli | Media | 1 | #36 |
| HU-02 | HU-02.2-B | Ejemplo comparativo | Ana Clara Rocha Benassuli | Media | 1 | #36 |
| HU-03 | HU-03.1-A | Tarjeta de consejo | Christian Salvador Gallegos | Alta | 1 | #33 |
| HU-03 | HU-03.1-B | Ficha completa | Sinai Esquivel Elizondo | Alta | 1 | #33 |
| HU-03 | HU-03.2-A | Siguiente consejo | Sinai Esquivel Elizondo | Media | ½ | #33 |
| HU-03 | HU-03.2-B | Enlaces y estados alternos | Alan Francisco Ochoa Hernández | Media | ½ | #33 |
| HU-11 | HU-11.1-A | Estilos mobile-first | Diego Rodríguez Álvarez | Alta | 2 | #36 |
| HU-11 | HU-11.1-B | Revisión a 360 px | Alan Francisco Ochoa Hernández | Alta | 2 | #36 |
| HU-11 | HU-11.2-A | Teclado y foco | Sinai Esquivel Elizondo | Alta | 2 | #36 |
| HU-11 | HU-11.2-B | Movimiento y contraste | Alan Francisco Ochoa Hernández | Alta | 2 | #36 |

### 7.5 Catálogo de consejos (contenido)
- **24 consejos:** SCR-01…SCR-12 y PMI-01…PMI-12, en `src/data/tips.json`, **versión 1.0.0**.
- **Categorías Scrum:** Artefactos y compromisos, Eventos, Responsabilidades, Prácticas de trabajo.
- **Categorías PMBOK (6.ª ed.):** Áreas de conocimiento, Fundamentos y entorno, Monitoreo y control.
- **Fuentes y páginas verificadas:**
  - Guía Scrum 2020 en español: SCR-01 (pp. 6, 11), 02 (9, 12), 03 (13), 04 (9–10), 05 (10), 06 (10), 09 (12), 10 (11), 11 (6).
  - Kniberg: SCR-07 (42), 08 (39–40), 12 (81–84).
  - PMBOK 6.ª: PMI-01 (7, 29–30), 02 (503), 03 (395, 397), 04 (129), 05 (210), 06 (307), 07 (231, 233), 08 (271, 274), 09 (28), 10 (43), 11 (19), 12 (26, 105).
- **Revisión:** contra las guías originales. Se ajustaron SCR-01, SCR-10 y PMI-12 (versión 2). Aprobado por el PO el 22/10/2026.
- **Validador:** ID único con formato `SCR-NN`/`PMI-NN`, campos obligatorios, resumen ≤ 160 caracteres, URL https, sin duplicados. En modo entrega exige además 12 por enfoque y aprobación.

### 7.6 Pruebas y evidencias
| Prueba | Resultado |
|---|---|
| Unitarias y de renderizado | 137/137 pasan |
| E2E en navegador (1280 px y 360 px) | 76 pasan; 14 no aplican por tamaño |
| Accesibilidad (axe, WCAG 2.2 AA) | 0 violaciones en 12 rutas |
| Validación del catálogo (modo entrega) | 0 errores, 0 advertencias |
| Enlaces de fuentes | 3/3 abren (PMI bloquea scripts; se verificó a mano) |
| Windows (clonar y correr) | Correcto (T-15) |
| Celular con datos móviles | Correcto (T-16) |
| Rutas internas en producción | Sin 404 (T-17) |
| **Pendientes** | Video con teclado (T-11), Narrador (T-13, si no se hizo), Firefox (T-21), Lighthouse (T-22, «Debería») |

**Hallazgos:**
1. La primera corrida E2E en Windows falló por el **arranque en frío** del navegador recién instalado. Se diagnosticó con una corrida limpia; no era una prueba inestable.
2. La auditoría axe tardó 34 s contra un límite de 30 s en Windows. Se amplió el límite solo para esa prueba (PR #39).

### 7.7 Entregables del 23/10
- Sitio público y release `v0.1.0`.
- Repositorio con historial de PR y CI en verde.
- Reporte del Sprint 1 en Word, con acta de Review y Retrospectiva que se llenan en clase.
- Taiga con backlog y Sprint 1.
- Tarjetas físicas.
- Evidencias.

---

## 8. Lo que falta por hacer

### 8.1 Para cerrar el Sprint 1 (hoy)
- [ ] Sprint Review: el PO acepta o rechaza cada historia en el acta (con firma).
- [ ] Retrospectiva llenada, con la mejora concreta.
- [ ] Corregir en el reporte los marcadores «[pendiente]» (T-11, T-21) y la coherencia de horas del jueves.
- [ ] Subir el Word final al repo (`docs/sprint-1/`).
- [ ] Hacer o pasar al S2: video con teclado (T-11), Firefox (T-21), Lighthouse (T-22).
- [ ] Actualizar en Taiga el estado de las historias aceptadas.

### 8.2 Antes del Sprint Planning 2 (lunes 26/10)
- [ ] **Spike de Web Push** (investigación acotada, un día). Debe responder:
  - ¿Dónde corre el programador de envíos cada 2–3 h?
  - ¿Dónde se guardan las suscripciones?
  - ¿Llega un aviso real con la pestaña cerrada en un navegador compatible?
  - Restricciones conocidas: Vercel no da almacenamiento persistente propio y su cron gratuito es limitado (verificar el plan vigente); en iPhone Web Push solo funciona con la PWA instalada. Opciones a evaluar: funciones de Vercel con un almacenamiento externo, o un servidor Node aparte. Revisar costos y límites de los planes gratuitos al momento de decidir.
- [ ] Que **cada integrante confirme sus horas reales** para el S2.

### 8.3 Sprint 2 (24 oct–13 nov · 15 días hábiles, 26/10 al 13/11)
- **Meta (propuesta):** completar el ciclo educativo de alertas cada 2/3 horas con personaje animado, preferencias, historial, búsqueda, microevaluaciones, PWA offline y Web Push probado en un navegador compatible.
- **Historias:** HT-04, HU-04, HT-05, HU-05, HT-07, HU-06, HU-07, HU-15, HT-06, HU-08, HU-12, HU-09, HU-10 · **78 puntos · 52 actividades**.
- **Hito:** primera prueba real de Web Push a más tardar el **06/11**. **Entrega 13/11.**
- **Advertencia de capacidad:** la velocidad del S1 (32 pts) se logró con mucho apoyo de agentes de IA y pocas horas humanas. **No es comparable** con un equipo de 6 personas trabajando sin ese apoyo. En el Planning 2:
  1. Confirmar horas reales por persona.
  2. Comprometer primero los «Debe».
  3. Dejar «Debería» y «Puede» (microquiz, compartir) como recortables, reportados como pendientes si no entran.
- **Orden sugerido por dependencias:** motor horario (HT-04) → avisos (HU-04) → avatar (HT-05, HU-05) → avisos en pantalla y silencio (HU-06, HU-07) → servicios y PWA (HT-06, HU-12) → backend y Web Push (HT-07, HU-15, en paralelo desde el inicio por riesgo) → historial, búsqueda y microquiz (HU-08, HU-09, HU-10).

#### HT-04 · Motor horario y almacenamiento local — importancia 69 · 8 pts

- **Historia:** Como equipo, quiero un motor horario con reglas auditables y preferencias persistentes, para decidir cuándo mostrar cada consejo.
- **Cómo demostrarla (aceptación):** Las ventanas pasan los casos límite y no se acumulan al reanudar; al recargar se conservan los ajustes y no se repite una ventana ya servida.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HT-04.1-A | Motor de calendario | Alta | 2 | Sinai Esquivel Elizondo | Implementar getDayPart, nextWindow, isQuietTime e idempotencyKey con fecha local y configuración válida. |
| HT-04.1-B | Casos límite del horario | Alta | 2 | Alan Francisco Ochoa Hernández | Probar 120/180 min, cambio de fecha, suspensión y cambio de horario; calcular desde el reloj real en cada evento. |
| HT-04.2-A | Repositorio local | Alta | 2 | Sinai Esquivel Elizondo | Centralizar ajustes, favoritos, historial y progreso en un repositorio local con migración básica de esquema. |
| HT-04.2-B | Último aviso y restablecer | Alta | 2 | Diego Rodríguez Álvarez | Guardar el último aviso por clave, limitar el almacenamiento y permitir restablecer los datos. |

#### HU-04 · Avisos automáticos cada 2 o 3 horas — importancia 68 · 8 pts

- **Historia:** Como estudiante, quiero recibir avisos periódicos, para repasar conceptos durante el día sin consultar la web a cada rato.
- **Cómo demostrarla (aceptación):** Con inicio 08:00 las ventanas son correctas y nunca se duplica un aviso; al reabrir la pestaña aparece a lo sumo una alerta.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HU-04.1-A | Cadencia y próximo consejo | Alta | 2 | Diego Rodríguez Álvarez | Elegir cadencia de 120 o 180 minutos y mostrar la hora del «Próximo consejo» con la hora local. |
| HU-04.1-B | Ventanas sin duplicados | Alta | 2 | Sinai Esquivel Elizondo | Calcular ventanas con funciones puras y clave única por fecha y hora; descartar ventanas repetidas o bloqueadas. |
| HU-04.2-A | Ejecución y reanudación | Alta | 2 | Sinai Esquivel Elizondo | Orquestar avisos con la página abierta y recalcular al recuperar el foco o volver de suspensión. |
| HU-04.2-B | Sin ráfagas atrasadas | Alta | 2 | Alan Francisco Ochoa Hernández | Evitar cascadas de alertas vencidas; probar cambio de día, reloj, huso horario y modo pausa. |

#### HT-05 · Motor de avatar con animación liviana — importancia 67 · 5 pts

- **Historia:** Como equipo, quiero animaciones expresivas sin imágenes pesadas, para no excluir usuarios ni dispositivos básicos.
- **Cómo demostrarla (aceptación):** Al cambiar la hora simulada, el mismo componente actualiza expresión y frase; con movimiento reducido la lectura y los controles siguen disponibles.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HT-05.1-A | Catálogo de estados | Alta | 2 | Sinai Esquivel Elizondo | Catálogo único de franja del día a expresión, frase, color y animación CSS/SVG. |
| HT-05.1-B | Componente Avatar | Alta | 1 | Diego Rodríguez Álvarez | Componente Avatar con estados mañana, comida, tarde y noche, y versión estática de respaldo. |
| HT-05.2-A | Movimiento reducido | Alta | 1 | Sinai Esquivel Elizondo | Quitar animaciones no indispensables con prefers-reduced-motion y dar texto alternativo correcto. |
| HT-05.2-B | Peso y fluidez | Media | 1 | Alan Francisco Ochoa Hernández | Medir peso (≤ 100 KB) y fluidez en un móvil básico, sin JavaScript de animación adicional. |

#### HU-05 · Personaje animado por momento del día — importancia 66 · 8 pts

- **Historia:** Como usuario, quiero que un personaje cambie de emoción y saludo según la hora, para que el consejo sea agradable y contextual.
- **Cómo demostrarla (aceptación):** A las 09:00, 14:00, 17:00 y 20:00 se ven la emoción y el mensaje correctos; sin animaciones el consejo sigue comprensible y operable con teclado.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HU-05.1-A | Cuatro expresiones | Alta | 2 | Diego Rodríguez Álvarez | Un solo avatar SVG/CSS con estados despierto, con hambre, atento y cansado, con transiciones suaves. |
| HU-05.1-B | Guiones por franja | Alta | 2 | Obdulio Rincón Flores | Centralizar franjas y frases: «Buen día…», «Hora de comer…», «Una pausa…» y «Es hora de dormir…». |
| HU-05.2-A | Gestos animados | Media | 2 | Diego Rodríguez Álvarez | Animaciones breves de parpadeo y estiramiento, gesto de comida y bostezo, sin tapar el texto. |
| HU-05.2-B | Expresividad accesible | Alta | 2 | Alan Francisco Ochoa Hernández | Avatar estático y texto accesible con movimiento reducido; ajustar la hora de comer según la configuración. |

#### HT-07 · Backend Node.js y Web Push — importancia 65 · 8 pts

- **Historia:** Como equipo, quiero un backend que envíe Web Push, para avisar con la web cerrada.
- **Cómo demostrarla (aceptación):** Se guarda y borra la suscripción; el envío programado no duplica; claves solo en servidor.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HT-07.1-A | Endpoint de suscripción | Alta | 2 | Ian Alexander Perez | Alta y baja de suscripción con validación, almacenamiento y claves VAPID en servidor. |
| HT-07.1-B | Envío Web Push | Alta | 2 | Ian Alexander Perez | Integrar la librería web-push, payload mínimo y borrado de suscripciones caducadas. |
| HT-07.2-A | Job de agenda | Media | 2 | Christian Salvador Gallegos | Job periódico que calcula envíos por zona horaria con claves idempotentes. |
| HT-07.2-B | Límites y reintentos | Media | 2 | Alan Francisco Ochoa Hernández | Límite de frecuencia, registro de errores, reintento acotado y prueba de no envío en silencio. |

#### HU-06 · Avisos en pantalla y notificación nativa — importancia 64 · 5 pts

- **Historia:** Como usuario, quiero avisos discretos y, si lo autorizo, notificaciones del navegador, para enterarme del consejo sin interrumpir lo que hago.
- **Cómo demostrarla (aceptación):** El aviso abre la ficha y se cierra sin perder la pantalla; rechazar el permiso no bloquea la lectura ni la programación interna.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HU-06.1-A | Tarjeta emergente | Alta | 2 | Diego Rodríguez Álvarez | Toast accesible con avatar, título, resumen, «Ver consejo» y «Cerrar»; un solo aviso a la vez. |
| HU-06.1-B | Foco y pausa | Media | 1 | Sinai Esquivel Elizondo | Asegurar foco, teclado, región anunciable y botón permanente para pausar sin impedir navegar. |
| HU-06.2-A | Permiso explícito | Alta | 1 | Sinai Esquivel Elizondo | Botón para activar notificaciones nativas solo tras una acción del usuario; encapsular la Notification API. |
| HU-06.2-B | Alternativa sin permiso | Alta | 1 | Ian Alexander Perez | Detectar soporte y permiso denegado; mantener el aviso interno y explicar que la pestaña cerrada requiere Web Push. |

#### HU-07 · Configuración, silencio y pausa — importancia 63 · 5 pts

- **Historia:** Como usuario, quiero decidir frecuencia, días y periodos silenciosos, para recibir avisos únicamente cuando los deseo.
- **Cómo demostrarla (aceptación):** La vista previa coincide con el motor tras recargar; no llegan avisos durante el silencio y la lectura manual siempre funciona.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HU-07.1-A | Panel de horario | Alta | 2 | Diego Rodríguez Álvarez | Panel de intervalo 2/3 h, inicio, días activos y franja de comida, con vista previa de avisos. |
| HU-07.1-B | Guardado validado | Alta | 1 | Sinai Esquivel Elizondo | Guardar la configuración validada, restaurar valores seguros y comprobar ventanas que cruzan medianoche. |
| HU-07.2-A | Silencio y pausa | Alta | 1 | Sinai Esquivel Elizondo | Horario silencioso inicial 21:00–08:00 y control persistente de Pausar/Reanudar. |
| HU-07.2-B | Silencio local y remoto | Alta | 1 | Ian Alexander Perez | Aplicar el silencio a avisos locales y remotos; permitir leer consejos aun con avisos pausados. |

#### HU-15 · Avisos Web Push con pestaña cerrada — importancia 62 · 8 pts

- **Historia:** Como usuario que dio permiso, quiero recibir consejos programados aunque no tenga abierta la pestaña, para no perderlos cuando el navegador lo permita.
- **Cómo demostrarla (aceptación):** En un navegador compatible se activa y desactiva Push sin perder ajustes; se acredita un aviso autorizado sin repeticiones ni avisos en silencio.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HU-15.1-A | Activar suscripción | Media | 2 | Ian Alexander Perez | Activar la suscripción Push desde un botón con explicación y registrar el endpoint de forma segura. |
| HU-15.1-B | Baja y compatibilidad | Media | 2 | Alan Francisco Ochoa Hernández | Baja efectiva, validar navegadores compatibles y detectar expiración o denegación del permiso. |
| HU-15.2-A | Entrega sin duplicados | Media | 2 | Christian Salvador Gallegos | Relacionar horario local, días activos, silencio y último envío con el planificador y una clave idempotente. |
| HU-15.2-B | Prueba con pestaña cerrada | Media | 2 | Alan Francisco Ochoa Hernández | Verificar una entrega con la pestaña cerrada, documentar retrasos del sistema y usar el aviso en página si no hay soporte. |

#### HT-06 · Servicios de notificación y PWA — importancia 61 · 5 pts

- **Historia:** Como equipo, quiero encapsular avisos internos, Notification API y service worker, para no duplicar decisiones entre canales.
- **Cómo demostrarla (aceptación):** Rechazar el permiso no rompe el aviso interno ni el historial; la PWA sirve contenido sin conexión y procesa push solo si hay suscripción.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HT-06.1-A | Servicio de notificaciones | Alta | 2 | Ian Alexander Perez | notificationService con respaldo al aviso de React y solicitud de permiso solo por interacción. |
| HT-06.1-B | Consentimiento y lectura | Media | 1 | Sinai Esquivel Elizondo | Separar el estado de consentimiento del de lectura; al pulsar un aviso, abrir la ficha del consejo. |
| HT-06.2-A | Service worker | Media | 1 | Ian Alexander Perez | Service worker con caché controlada, actualización de recursos y recepción del evento push. |
| HT-06.2-B | Pruebas de caché | Media | 1 | Alan Francisco Ochoa Hernández | Probar que una versión antigua no persiste indefinidamente y que leer sin conexión no implica envío. |

#### HU-08 · Historial, favoritos y compartir — importancia 60 · 5 pts

- **Historia:** Como estudiante, quiero revisar lo leído, guardar consejos y compartirlos, para seguir practicando.
- **Cómo demostrarla (aceptación):** Una lectura aparece en el historial sin duplicados consecutivos; un favorito se conserva al recargar y se comparte un enlace utilizable.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HU-08.1-A | Registro de lecturas | Alta | 2 | Christian Salvador Gallegos | Registrar aperturas explícitas con fecha e ID y elegir el siguiente tip reduciendo repeticiones recientes. |
| HU-08.1-B | Historial local | Media | 1 | Christian Salvador Gallegos | Mostrar el historial con opción de borrar; probar que enviar un aviso no equivale a leerlo. |
| HU-08.2-A | Favoritos | Media | 1 | Christian Salvador Gallegos | Guardar y quitar favoritos con vista de consulta y persistencia local. |
| HU-08.2-B | Compartir | Baja | 1 | Diego Rodríguez Álvarez | Web Share API o copia de URL como respaldo, sin divulgar datos del usuario. |

#### HU-12 · Instalación y lectura sin conexión — importancia 59 · 5 pts

- **Historia:** Como usuario, quiero instalar la web y conservar los consejos ya cargados, para repasarlos sin conexión.
- **Cómo demostrarla (aceptación):** Se ofrece la instalación en navegadores compatibles sin impedir el uso web; sin red se abren al menos los 24 tips precargados.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HU-12.1-A | PWA instalable | Media | 2 | Ian Alexander Perez | Manifest, íconos y service worker que almacene los recursos esenciales de la versión publicada. |
| HU-12.1-B | Prueba de instalación | Media | 1 | Alan Francisco Ochoa Hernández | Probar la instalación donde el navegador la soporte y el uso normal donde no. |
| HU-12.2-A | Catálogo sin conexión | Media | 1 | Christian Salvador Gallegos | Precargar el catálogo revisado, avisar cuando no hay red y evitar que cachés viejas oculten cambios. |
| HU-12.2-B | Actualizar datos guardados | Media | 1 | Ian Alexander Perez | Separar la lectura sin conexión del envío remoto y documentar cómo se actualizan los datos guardados. |

#### HU-09 · Búsqueda y filtrado rápido — importancia 58 · 3 pts

- **Historia:** Como usuario, quiero encontrar consejos por palabra y etiqueta, para no recorrer toda la biblioteca.
- **Cómo demostrarla (aceptación):** Una palabra conocida devuelve los tips adecuados y se puede limpiar; el listado refleja correctamente todos los filtros elegidos.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HU-09.1-A | Búsqueda por texto | Media | 1 | Christian Salvador Gallegos | Búsqueda inmediata por título, resumen, conceptos y etiquetas normalizadas. |
| HU-09.1-B | Sin resultados | Media | ½ | Christian Salvador Gallegos | Estado «Sin resultados» y opción para limpiar la búsqueda sin reiniciar la aplicación. |
| HU-09.2-A | Filtros combinados | Media | 1 | Christian Salvador Gallegos | Combinar la búsqueda con enfoque y tema usando un único selector reutilizable. |
| HU-09.2-B | Pruebas de filtros | Media | ½ | Alan Francisco Ochoa Hernández | Probar combinaciones, mayúsculas y acentos, y que el catálogo original no se altera. |

#### HU-10 · Microevaluación y progreso — importancia 57 · 5 pts

- **Historia:** Como estudiante, quiero comprobar si comprendí los consejos y ver los temas repasados, para medir mi avance sin exámenes extensos.
- **Cómo demostrarla (aceptación):** La pregunta explica el resultado y siempre se puede omitir; el tablero presenta lecturas reales y se puede restablecer.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HU-10.1-A | Preguntas voluntarias | Baja | 2 | Christian Salvador Gallegos | Asociar una pregunta breve de opción múltiple a tips seleccionados, con retroalimentación explicativa. |
| HU-10.1-B | Validar respuestas | Baja | 1 | Obdulio Rincón Flores | No bloquear la lectura si se omite el quiz y validar cada respuesta con los contenidos revisados. |
| HU-10.2-A | Resumen de avance | Baja | 1 | Christian Salvador Gallegos | Registrar localmente respuestas y temas leídos; panel sencillo por enfoque. |
| HU-10.2-B | Reiniciar progreso | Baja | 1 | Diego Rodríguez Álvarez | Reinicio del progreso sin guardar identificadores personales ni afirmar que abrir la app equivale a aprender. |


### 8.4 Sprint 3 (14–20 nov · 4 días hábiles; el 16/11 es inhábil)
- **Meta:** cerrar ayuda y gestión del contenido, corregir defectos críticos, aceptación integral, producto estable y cierre formal.
- **Historias:** HT-08, HU-13, HU-14 · **16 puntos · 12 actividades**.
- **Fechas clave:** congelación de funciones 18/11, regresión final 19/11, **entrega y cierre 20/11** con acta de aceptación.

#### HT-08 · Pruebas, seguridad y liberación final — importancia 50 · 8 pts

- **Historia:** Como equipo, quiero comprobar calidad, seguridad, accesibilidad y despliegue, para cerrar con un producto estable y aceptado.
- **Cómo demostrarla (aceptación):** Las pruebas críticas pasan en el build final publicado; la versión entregada tiene URL, README, evidencias, registro de riesgos y acta aprobada.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HT-08.1-A | Pruebas automatizadas | Alta | 2 | Alan Francisco Ochoa Hernández | Pruebas unitarias del motor y componentes, y flujos E2E de lectura, configuración, avatar y notificaciones. |
| HT-08.1-B | Pruebas móviles y teclado | Alta | 2 | Diego Rodríguez Álvarez | Ejecutar pruebas en móvil y con teclado, corregir defectos críticos y guardar evidencias en el pipeline. |
| HT-08.2-A | Auditoría de seguridad | Media | 2 | Ian Alexander Perez | Auditar dependencias, validación de datos, permisos, secretos, límites de API y política de retención. |
| HT-08.2-B | Operación y acta | Alta | 2 | Ana Clara Rocha Benassuli | Instructivo de rollback, respaldo editorial, monitoreo mínimo y acta de aceptación final. |

#### HU-13 · Ayuda, privacidad y comentarios — importancia 49 · 3 pts

- **Historia:** Como visitante, quiero entender cómo funcionan los avisos y mis datos, y comunicar mejoras, para usar la web con confianza.
- **Cómo demostrarla (aceptación):** La Ayuda resuelve el permiso rechazado y la pestaña cerrada; el usuario sabe qué se almacena y cómo eliminar o cancelar su suscripción.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HU-13.1-A | Sección de Ayuda | Media | 1 | Christian Salvador Gallegos | Ayuda con pasos para cadencia, permisos, pausa, modo sin conexión y compatibilidad de notificaciones. |
| HU-13.1-B | Limitaciones | Media | ½ | Ana Clara Rocha Benassuli | Explicar que la precisión fuera de la página depende del servicio remoto, el navegador y los permisos. |
| HU-13.2-A | Aviso de privacidad | Alta | 1 | Obdulio Rincón Flores | Aviso claro sobre preferencias locales y suscripciones push, con opción de baja de notificaciones. |
| HU-13.2-B | Canal de sugerencias | Baja | ½ | Diego Rodríguez Álvarez | Formulario simple o vínculo al canal acordado, sin recolectar datos innecesarios. |

#### HU-14 · Gestión editorial de consejos — importancia 48 · 5 pts

- **Historia:** Como responsable de contenidos, quiero corregir y publicar consejos validados, para no rehacer la interfaz.
- **Cómo demostrarla (aceptación):** Un revisor modifica un tip y ve su vista previa antes de publicar; un cambio aprobado aparece en la web y puede revertirse sin perder el catálogo.

| Actividad | Título | Prioridad | Pts | Responsable propuesto | Descripción técnica |
|---|---|---|---|---|---|
| HU-14.1-A | Edición controlada | Media | 2 | Christian Salvador Gallegos | Flujo editorial de acceso restringido o por repositorio, con validación de campos y fuentes. |
| HU-14.1-B | Esquema versionado | Media | 1 | Ian Alexander Perez | Alta, edición y vista previa de tips con el mismo esquema JSON versionado, sin exponer claves. |
| HU-14.2-A | Publicación aprobada | Media | 1 | Obdulio Rincón Flores | Registrar autor, fecha y versión de cada cambio, con aprobación previa y despliegue automatizado. |
| HU-14.2-B | Reversión del catálogo | Media | 1 | Alan Francisco Ochoa Hernández | Probar la reversión a una versión válida y la sincronización del catálogo en usuarios de la PWA. |


### 8.5 Mejoras anotadas para después
- Reforzar el ejemplo comparativo con el **Control Integrado de Cambios** del PMBOK (§4.6, pp. 113–115). Hoy una prueba exige que solo se citen páginas ya verificadas en los consejos; hay que ajustarla.
- Revisar en el S3 el paso de ESLint 9 a 10.

---

## 9. Cómo trabajamos día a día (proceso operativo)

1. **Planear:** el PM traduce las historias del sprint a paquetes de trabajo (WP) con actividades, rama, dependencias, criterios de aceptación y pruebas, en `docs/sprint-N/PROMPTS.md`.
2. **Ejecutar:** al implementador se le pide un WP por mensaje: *«Ejecuta el WP-X de docs/sprint-N/PROMPTS.md siguiendo CLAUDE.md»*. Él crea la rama, programa, prueba y abre el PR.
3. **Revisar el PR (10 min):**
   - CI en verde.
   - Archivos tocados = los del WP.
   - Vista previa de Vercel: seguir «cómo probarlo».
   - 360 px (F12 → Ctrl+Shift+M).
   - Solo teclado (Tab/Enter).
   - Consola sin errores.
   - Sin colores fuera de los tokens ni funciones de sprints futuros.
4. **Integrar:** *Squash and merge → Delete branch* y mover la tarjeta en Taiga.
5. **Registrar:** daily con horas reales; evidencia de cada prueba manual en `docs/evidencias/`.
6. **Decidir con registro:** toda contradicción o cambio de alcance se anota en `DECISIONES.md` con motivo e impacto.
7. **Cerrar el sprint:** release, reporte, Review con el PO y Retrospectiva.

**Comandos útiles (PowerShell, en la carpeta del proyecto):**
```powershell
git pull                      # traer lo último
npm ci                        # instalar dependencias
npm run dev                   # correr local en http://localhost:5173
npm run check                 # lint + validador + pruebas + build
npx playwright install chromium
npm run test:e2e              # pruebas en navegador
npm run check:links           # revisa que abran los enlaces de las fuentes
```

---

## 10. Preguntas frecuentes del equipo

- **¿Qué tengo que saber sí o sí?** La meta del S1, que se cumplió; qué es tu rol; qué actividades tuvo tu rol (sección 7.4); qué es la Definition of Done; y la diferencia entre Review y Retrospectiva.
- **¿Por qué PMBOK 6.ª y no 8.ª?** Porque es la edición del curso y la que se puede verificar (D-03).
- **¿Por qué Taiga si el código está en GitHub?** Por indicación de la profesora (D-18).
- **¿Qué pasa si algo no se termina?** Se reporta como pendiente y regresa al backlog; nunca se dice terminado.
- **¿Por qué las horas registradas son pocas?** Hubo dos días sin avance; el equipo lo detectó y replaneó. La mejora del S2 ataca eso.

---

## 11. Glosario rápido

- **PR (pull request):** solicitud para integrar un cambio; se revisa y debe pasar el CI.
- **CI:** verificación automática en cada PR.
- **Commit:** guardado con nombre de un cambio.
- **Rama:** copia paralela del código para un cambio.
- **main:** rama principal; lo que está ahí se publica.
- **Merge:** integrar un PR.
- **Build:** compilar el sitio.
- **Deploy:** publicarlo.
- **Rollback:** volver a la versión anterior.
- **E2E:** prueba con navegador automático.
- **axe / WCAG:** auditoría y norma de accesibilidad.
- **Story points:** tamaño relativo; no son horas.
- **Velocidad:** puntos terminados por sprint.
- **Burndown:** trabajo restante por día.
- **PWA:** web instalable.
- **Service worker:** programa del navegador en segundo plano.
- **Web Push:** avisos con la página cerrada.
- **Spike:** investigación acotada antes de estimar.

---

## 12. Prompt para el LLM que conducirá el Sprint 2

> Copia todo el bloque siguiente como primer mensaje en un chat nuevo, adjuntando este archivo. Si el chat tiene acceso al repositorio, pídele además que lea `CLAUDE.md` y `docs/DECISIONES.md`.

```text
Actúa como Project Manager senior de Scrum (nivel Senior) para el proyecto TamalEcho Tips,
del curso Administración de Proyectos de Software (FIME-UANL, ITS Grupo 006, Ing. Leticia
Amalia Neira Tovar). Te adjunto CONTEXTO_PROYECTO.md con todo lo realizado en el Sprint 1.
Léelo completo antes de responder.

Tu objetivo: conducir el Sprint 2 (24/10–13/11/2026, entrega 13/11) para que el equipo
cumpla la propuesta aprobada con calidad profesional, igual que en el Sprint 1.

Cómo debes trabajar:
1. Antes de planear, hazme las preguntas que necesites para no trabajar sobre supuestos
   (horas reales de cada integrante, resultado de la Review del S1, resultado del spike de
   Web Push, estado del repositorio y de Taiga).
2. No estés de acuerdo con todo. Señala fallas, riesgos y supuestos débiles con franqueza;
   el equipo tiene nivel junior en desarrollo.
3. Respeta la jerarquía de fuentes: propuesta aprobada > lista de requerimientos N4 >
   repositorio (CLAUDE.md, docs/DECISIONES.md). Toda decisión nueva va a DECISIONES.md con
   ID, motivo e impacto (continúa en D-19).
4. Planea por capacidad real, no por los 78 puntos de la propuesta. Prioriza los «Debe»;
   los «Debería» y «Puede» son recortables y se reportan como pendientes si no entran.
5. Prepara docs/sprint-2/ con el mismo formato del Sprint 1: PLAN.md (meta, capacidad,
   calendario, backlog con prioridad, puntos de control y orden de recorte, DoD),
   PROMPTS.md (paquetes de trabajo autocontenidos para el agente de código), PRUEBAS.md
   (un caso por criterio de aceptación) y DAILY.md (daily, horas reales y burndown).
6. Mantén Taiga como tablero oficial y el formato de tarjetas de la profesora.
7. Al cierre: release v0.2.0, reporte del Sprint 2 en Word, acta de Review y Retrospectiva.

Roles que debes usar o pedirme que active (uno escribe código a la vez):
- Tú: PM/orquestador. Planeas, revisas cada PR contra la Definition of Done y redactas.
- Implementador web (agente de código): ejecuta un paquete de trabajo a la vez, en su rama,
  con pruebas, y abre un PR. Usa el perfil de docs/agentes/PERFILES.md.
- Especialista backend/Web Push (agente o persona): solo para el spike y para HT-07/HU-15;
  debe decidir arquitectura (programador de envíos, almacenamiento de suscripciones,
  claves VAPID en servidor) y demostrar un aviso real con la pestaña cerrada antes del 06/11.
- QA revisor independiente (otro chat que no escribió el código): revisa cada PR contra la
  DoD y PRUEBAS.md; no escribe código.

Reglas que no se rompen:
- No inventes fuentes, páginas, resultados de pruebas ni fechas. Si no está verificado, dilo.
- No registres que una persona hizo, revisó, aprobó o firmó algo que no hizo.
- Nunca declares terminado algo que no cumple su criterio de aceptación.
- Interfaz en español de México; Scrum y PMBOK nunca como equivalentes.

Empieza con: (a) un resumen de 5 líneas de dónde estamos, (b) tus preguntas antes de planear,
y (c) los 3 riesgos principales del Sprint 2 con tu recomendación para cada uno.
```

---

## 13. Referencias

- Schwaber, K., y Sutherland, J. (2020). *La Guía Scrum* (D. H. Tardini y D. Marti, Trads.). https://scrumguides.org/docs/scrumguide/v2020/2020-Scrum-Guide-Spanish-European.pdf
- Kniberg, H. (2007). *Scrum y XP desde las trincheras* (Á. Medinilla, Trad.). C4Media; InfoQ. https://www.infoq.com/minibooks/scrum-xp-from-the-trenches/
- Project Management Institute. (2017). *Guía de los fundamentos para la dirección de proyectos (Guía del PMBOK)* (6.ª ed.). PMI.
- Alaimo, M. (s. f.). *Análisis, estimación y planificación ágil con Scrum*. Kleer.
- World Wide Web Consortium. (2023). *WCAG 2.2*. https://www.w3.org/TR/WCAG22/
- Vercel. *Instant Rollback*. https://vercel.com/docs/instant-rollback
