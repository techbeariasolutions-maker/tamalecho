# Sprint 1 — Plan operativo realista

**Fecha del plan (Sprint Planning efectivo):** martes 20/10/2026 · **Sprint:** 19–23/10/2026 · **Review y entrega:** viernes 23/10/2026
**Fuente de verdad:** propuesta aprobada (D-01). Este plan **no cambia el alcance comprometido**. Cambia *cómo* se ejecuta con los recursos que realmente hay.

---

## 1. Capacidad y punto de partida

| Concepto | Lo que dice la propuesta | Situación al martes 20/10 |
|---|---|---|
| Capacidad del S1 | 84 h netas | ≈ 16 h confirmadas (mar a vie) + agentes de IA |
| Avance | Lunes: repo, scripts, esquema, primeros tips | Repositorio por crear |
| Experiencia en React | «Habilidades suficientes» | Limitada; los agentes generan el código y el equipo dirige y revisa |

**Implicación.** El código lo escriben agentes. El tiempo del equipo se va en cuatro cosas: (a) dirigir y revisar el comportamiento de lo que entregan los agentes, (b) verificar el contenido, (c) generar evidencias y (d) llevar los eventos Scrum. **El cuello de botella no es programar**, sino verificar 24 fuentes y revisar lo que entrega el agente. Por eso el plan pone primero la infraestructura y el contenido.

## 2. Meta del Sprint (propuesta §10, sin cambios)
> Disponer de una plataforma pública navegable en móvil y escritorio, con dos bibliotecas y 24 consejos revisados y enlazados a sus fuentes.

Historias comprometidas: **HU-01, HU-02, HU-03, HU-11, HT-01, HT-02 y HT-03**, con 28 actividades y 32 puntos relativos.

## 3. Presupuesto de 16 horas

| Bloque | Horas |
|---|---|
| Preparación: cuentas, repo, agente (WP-0) | 0.75 |
| Construcción con agentes, incluida tu revisión (WP-1 a WP-9; el WP-5 ya lo redactó Claude) | 8.0 |
| Verificación de contenido, 24 tips (equipo editorial, D-04) | 1.5 |
| Release y evidencias (WP-10) | 2.0 |
| Eventos Scrum y Reporte del Sprint 1 (dailies, Review, Retro, Word) | 2.5 |
| Colchón | 1.25 |
| **Total** | **16** |

Este presupuesto **no tiene margen real**. Una instalación que falle se come el colchón. Por eso existen los puntos de control y la línea de corte (§6).

## 4. Calendario

### Martes 20: «esqueleto desplegado hoy»
| Orden | Paquete | Actividades | Tiempo |
|---|---|---|---|
| 1 | WP-0: preparación manual | — | 45 min |
| 2 | WP-1: base ejecutable | HT-01.1-A, HT-01.1-B | 45 min |
| 3 | WP-B: tablero en GitHub Projects | (gestión) | 15 min |
| 4 | WP-4: CI + Vercel | HT-01.2-A, HT-01.2-B | 45 min |
| 5 | WP-2: esqueleto de navegación | HT-02.1-A, HT-02.2-A, HT-02.2-B, HU-01.2-A | 60 min |
| — | Registrar el Sprint Planning y la daily en `DAILY.md` | — | 15 min |

¿Por qué el despliegue va el martes y no el jueves? Porque la infraestructura (cuentas, CI, Vercel, rutas SPA) es lo que más falla cuando no tienes experiencia, y no depende del contenido. Una URL pública el día 1 elimina el riesgo más tonto de todos: llegar al viernes con código que solo corre en tu máquina.

### Miércoles 21: «contenido y lectura»
| Orden | Paquete | Actividades | Tiempo |
|---|---|---|---|
| 1 | WP-3: contrato, validador y servicio del catálogo | HT-03.1-A, HT-03.1-B, HT-02.1-B | 45 min |
| 2 | WP-5: integrar el borrador de los 24 tips (ya redactado) | HT-03.2-A | 10 min |
| 3 | WP-6: portada, tarjeta y biblioteca | HU-03.1-A, HU-01.1-A, HU-02.1-A, HU-02.1-B | 75 min |
| 4 | WP-7: ficha, siguiente tip y estados alternos | HU-03.1-B, HU-03.2-A, HU-03.2-B | 60 min |
| 5 | **Verificar los 12 tips Scrum** (`REVISION_TIPS.md`) | HT-03.2-B (1/2) | 45 min |

### Jueves 22: «calidad y congelación»
| Orden | Paquete | Actividades | Tiempo |
|---|---|---|---|
| 0 | **Punto de control 2** (§6) | — | 5 min |
| 1 | **Verificar los 12 tips PMI** contra la Guía del PMBOK 6.ª ed. | HT-03.2-B (2/2) | 45 min |
| 2 | WP-8: comparación y cambio de enfoque *(Debería)* | HU-02.2-A, HU-02.2-B, HU-01.1-B | 45 min |
| 2 | WP-9: responsive, accesibilidad y suite E2E | HU-11.1-A/B, HU-11.2-A/B, HU-01.2-B | 90 min |
| — | **Congelación al terminar la sesión**: después solo se corrigen defectos | — | — |

### Viernes 23: «release, evidencias y Review»
| Orden | Paquete | Tiempo |
|---|---|---|
| 1 | WP-10: release `v0.1.0`, catálogo `1.0.0`, evidencias | 120 min |
| 2 | Reporte del Sprint 1 en Word (estructura en §10, D-13) | 90 min |
| 3 | Ensayo de la demo (§9) | 30 min |
| 4 | Sprint Review con el aceptante (D-04) y Retrospectiva | en clase |

## 5. Sprint Backlog: las 28 actividades

La prioridad sale del N4: la del requerimiento que satisface cada actividad.

| # | ID | Actividad (propuesta) | Prioridad | WP | Día |
|---|---|---|---|---|---|
| 1 | HT-01.1-A | Crear Vite + React + JS, repositorio, ramas y convenciones | Debe | WP-1 | Mar |
| 2 | HT-01.1-B | Comandos dev/build/lint/test y README | Debe | WP-1 | Mar |
| 3 | HT-01.2-A | Pipeline de build y pruebas + vista previa HTTPS | Debe | WP-4 | Mar |
| 4 | HT-01.2-B | Despliegue versionado y rollback documentado | Debe | WP-4 | Mar |
| 5 | HT-02.1-A | Rutas, Layout y carpetas por feature | Debe | WP-2 | Mar |
| 6 | HT-02.2-A | Tokens CSS (tipografía, espacios, colores, foco, breakpoints) | Debería | WP-2 | Mar |
| 7 | HT-02.2-B | Componentes base (botón, mensajes, errores) con pruebas | Debería | WP-2 | Mar |
| 8 | HU-01.2-A | Layout, Header y navegación responsiva | Debe | WP-2 | Mar |
| 9 | HT-03.1-A | Contrato del tip | Debe | WP-3 | Mié |
| 10 | HT-03.1-B | Validador (ID único, obligatorios, URL, duplicados) | Debe | WP-3 | Mié |
| 11 | HT-02.1-B | Hooks y estado mínimo; sin lógica dentro de componentes visuales | Debe | WP-3 | Mié |
| 12 | HT-03.2-A | Importar 24 tips (12 + 12) con referencias | Debe | WP-5 | Mié |
| 13 | HU-03.1-A | Tarjeta: título, resumen, área, acción, «Ver más» | Debe | WP-6 | Mié |
| 14 | HU-01.1-A | HomePage con tip destacado y accesos | Debe | WP-6 | Mié |
| 15 | HU-02.1-A | Selector Scrum/PMBOK con categorías y filtros | Debe | WP-6 | Mié |
| 16 | HU-02.1-B | Cargar los 24 tips con fuente y etiquetas | Debe | WP-6 | Mié |
| 17 | HU-03.1-B | Ficha completa con explicación, error, ejemplo y fuente | Debe | WP-7 | Mié |
| 18 | HU-03.2-A | Siguiente tip y volver conservando el filtro | Debería | WP-7 | Mié |
| 19 | HU-03.2-B | Validar enlaces externos y estados alternos | Debería | WP-7 | Mié |
| 20 | HU-02.2-A | Sugerencia inicial y cambio de enfoque sin perder la lectura | Debería | WP-8 | Jue |
| 21 | HU-02.2-B | Explicaciones diferenciadas y ejemplo comparativo | Debería | WP-8 | Jue |
| 22 | HU-01.1-B | Estados de carga y enlaces visibles; flujo con teclado | Debería | WP-8 | Jue |
| 23 | HU-11.1-A | Estilos mobile-first: tipografía, contraste, objetivos táctiles | Debe | WP-9 | Jue |
| 24 | HU-11.1-B | Revisión a 360 px y escritorio sin desplazamiento horizontal | Debe | WP-9 | Jue |
| 25 | HU-11.2-A | Etiquetas accesibles, foco visible, teclado | Debe | WP-9 | Jue |
| 26 | HU-11.2-B | Movimiento reducido, contraste, lector de pantalla básico | Debe | WP-9 | Jue |
| 27 | HU-01.2-B | Probar enlaces, regreso, menú móvil y ruta inexistente | Debería | WP-9 | Jue |
| 28 | HT-03.2-B | Aprobación del contenido y versión del catálogo | Debe | WP-10 | Vie |

Totales: **20 Debe, 8 Debería.**

## 6. Puntos de control y línea de corte

| Punto | Cuándo | Condición | Acción |
|---|---|---|---|
| PC-1 | Inicio del miércoles | ¿La URL pública de Vercel abre y el CI está en verde? | Si no, el miércoles empieza por arreglar eso y **WP-8 se cancela desde ese momento**. |
| PC-2 | Inicio del jueves | ¿WP-7 está en `main`? | Si no, se cancela WP-8 y WP-9 automatiza solo 3 flujos (navegación, ficha y teclado). |
| PC-3 | Fin del jueves | Congelación | Solo correcciones de defectos. No se agregan funciones. |

**Orden de recorte** (lo primero en caer va primero): HU-03.2-B (validación de enlaces) → HU-02.2-A → HU-02.2-B → HU-01.1-B → HU-03.2-A → HU-01.2-B (de automatizada a manual documentada) → pruebas de HT-02.2-B.
**Nunca se recorta un «Debe».** Lo recortado se reporta como pendiente. Ejemplo: «HU-02 parcial: HU-02.1 aceptada; HU-02.2 pendiente para el S2».

## 7. Definition of Done

**Una actividad está Terminada solo si:**
- [ ] Está integrada en `main` mediante un PR con CI en verde.
- [ ] Tiene pruebas de su lógica o de su renderizado.
- [ ] Cumple el criterio de aceptación de su subhistoria (propuesta §8–9).
- [ ] Si tiene interfaz: funciona a 360 px y en escritorio, y se usa con teclado.
- [ ] No deja errores en la consola del navegador.
- [ ] Pasó la revisión de comportamiento (§8).

**Una historia está Terminada solo si** sus actividades están terminadas, su «Cómo demostrarla» de la propuesta se demuestra en la Review y **el Product Owner la acepta en la Review**. Si no cumple, queda **pendiente**.

## 8. Cómo revisar un PR de un agente sin saber React (10 minutos)
No vas a revisar código línea por línea. Revisas **comportamiento** y **límites**:
1. **CI en verde.** Si está en rojo, no hay nada que revisar: devuélvelo al agente.
2. **Archivos tocados.** ¿Coinciden con los que dice el WP? Si un WP de interfaz modificó `tips.json`, pregunta por qué.
3. **Vista previa.** Abre la URL de Vercel del PR (o `npm run dev`) y sigue los pasos de «Cómo probarlo» que dejó el agente.
4. **360 px y teclado.** DevTools → modo dispositivo → 360 de ancho. Luego recorre la pantalla solo con Tab, Shift+Tab y Enter.
5. **Consola.** F12 → Console: sin errores en rojo.
6. **Señales de alerta en el diff:** colores `#xxxxxx` fuera de `tokens.css`, `import ... tips.json` fuera de `services/`, o palabras como `setInterval`, `Notification`, `serviceWorker` o `localStorage` (son del S2).
7. **Si algo falla, no lo arregles a mano.** Devuélveselo al agente con el paso exacto que falló y lo que viste.

## 9. Guion de la demo (viernes)
1. **HU-01:** abrir la URL en el celular sin cuenta, ver el tip destacado y llegar a cualquier sección en 3 clics o menos.
2. **HU-02:** elegir Scrum y luego PMI/PMBOK, ver sus categorías y al menos 12 tips en cada uno, y abrir el ejemplo comparativo.
3. **HU-03:** abrir una ficha, ver su fuente con la edición, pasar al siguiente tip y volver con el filtro conservado.
4. **HU-11:** repetir el recorrido a 360 px y solo con teclado.
5. **HT-01:** mostrar el pipeline en verde y el despliegue abierto desde un enlace externo.
6. **HT-02:** cambiar un token de color y ver el cambio en todas las pantallas.
7. **HT-03:** romper un tip a propósito y ver fallar el validador.

## 10. Entregables del 23/10
Lo que la propuesta (§10, §11 y §12) compromete:
- [ ] URL pública HTTPS funcionando en celular y computadora.
- [ ] Repositorio con README, historial de PR y CI en verde; etiqueta `v0.1.0`.
- [ ] Catálogo `1.0.0` con los 24 tips aprobados (o el reporte honesto de cuántos lo están).
- [ ] Evidencias en `docs/evidencias/sprint-1/`: capturas a 360 px, video corto con teclado, captura del pipeline, captura del validador fallando y reporte de accesibilidad.
- [ ] Captura del tablero y burndown.
- [ ] Acta de la Review (aceptación por historia) y notas de la Retrospectiva.
- [ ] **Reporte del Sprint 1 en Word** (D-13). No hay rúbrica, así que la estructura sale de la propuesta y de lo que evalúa el programa del curso (presentación, contenido, esquemas, conclusiones):
  0. Datos generales: el mismo formato que el N4 (equipo, matrículas, profesora, grupo, fecha).
  1. Meta del Sprint y periodo.
  2. Sprint Backlog: comprometido contra terminado (las 28 actividades con su estado; las historias, aceptadas o pendientes).
  3. Incremento entregado: URL, repositorio, `v0.1.0`, catálogo y capturas de las pantallas.
  4. Pruebas: resultados de la matriz de `PRUEBAS.md` y compatibilidad.
  5. Burndown, horas reales y velocidad (la tabla de `DAILY.md` y una gráfica).
  6. Acta de la Sprint Review.
  7. Retrospectiva: qué funcionó, qué no y una mejora concreta para el S2.
  8. Cambios y decisiones: D-03 (PMBOK 6.ª ed.), D-04 (roles y atribución), D-05 (flujo Git) y lo recortado.
  9. Riesgos y ajustes para el Sprint 2 (§12).
  10. Conclusión y bibliografía en APA 7.

Junta las evidencias **conforme avanzas**, no el viernes: cada captura va a `docs/evidencias/sprint-1/` el mismo día en que pasa la prueba.

## 11. Riesgos del Sprint 1
| Riesgo | Probabilidad | Respuesta |
|---|---|---|
| Falla la instalación o las cuentas (Node, Vercel, permisos de GitHub) | Media | Va primero, el martes; PC-1 el miércoles |
| El contenido no se aprueba a tiempo | **Alta** | El borrador ya está hecho; la revisión se reparte entre miércoles (Scrum) y jueves (PMI). Los tips no aprobados no se publican y se reportan |
| Solo se tienen los capítulos 1–5 del PMBOK 6 | Media | Conseguir hoy la guía completa en el aula digital o la biblioteca; si no se consigue, 6 tips PMI quedan pendientes (D-03) |
| El agente genera código que no entiendes y algo se rompe | Media | PR pequeños por WP, CI obligatorio, revisión de comportamiento (§8) |
| Varios agentes trabajando en paralelo en el mismo repo | Alta si se intenta | **Un solo agente de código a la vez.** Un segundo agente solo para borradores de contenido |
| No alcanzan las 16 h | Alta | Línea de corte (§6) |

## 12. Alertas para el Sprint 2 (no son para hoy)
- **Velocidad real.** Las horas que registres en `DAILY.md` son el único dato real que tendrá el equipo el 26/10. El N4 ya calcula que 78 puntos en S2 superan la capacidad, aun con seis personas a tiempo completo. Que el alcance esté cerrado no garantiza que todo se termine: la propuesta prevé reportar como pendiente, y el Planning 2 debe usar Debe / Debería / Puede con esos datos.
- **Spike de Web Push antes del 26/10 (D-06).** Si nadie del equipo puede dedicarle tiempo real, HU-15 y HT-07 están en riesgo crítico desde el día 1, tal como prevé la propuesta en §11.3.
- **El S2 no se puede ejecutar con la capacidad del S1.** Son 13 historias en 15 días: la capacidad real del equipo tiene que confirmarse en el Planning 2.
