# Sprint 2 — Plan operativo

**Fecha del plan (Sprint Planning efectivo):** jueves 29/10/2026 (D-19)
**Sprint:** 24/10–13/11/2026 · **Review y entrega:** viernes 13/11/2026
**Planearon:** Diego Rodríguez Álvarez y Alan Francisco Ochoa Hernández.
**Fuente de verdad:** propuesta aprobada (D-01). Este plan **no cambia el alcance de la propuesta**: decide cuánto de él se compromete con la capacidad real (D-19, D-20) y qué se reporta como pendiente.

---

## 1. Punto de partida y capacidad

| Concepto | Propuesta | Situación al jueves 29/10 |
|---|---|---|
| Sprint Planning 2 | Lunes 26/10, con todo el equipo | No se realizó; planeación efectiva el 29/10 (D-19) |
| Spike de Web Push | Antes del 26/10 | No se realizó; se ejecuta el viernes 30/10 (WP-S2-1) |
| Integrantes que participan | 7 | 4: Diego (implementa) y Alan (QA y revisión) con código; Obdulio (PO) y Ana (SM) sin código (D-19) |
| Capacidad | La de 7 personas | ≈ 2 h por día hábil cada uno → **≈ 44 h brutas, ≈ 31 h netas** (factor 0.7, como en el S1) |
| Días hábiles restantes | 15 (26/10–13/11) | **11** (30/10–13/11). Verificar si el lunes 2/11 es inhábil en la UANL; si lo es, quedan 10 (ver §5) |
| Backlog del S2 | 13 historias · 52 actividades · 78 pts | Se comprometen **27 actividades · 47 pts** (D-20) |
| Velocidad de referencia | — | S1: 32 pts, casi todos en un día y con mucho apoyo del agente. **No es una velocidad confiable** (Reporte S1 §9) |

**Implicación.** El cuello de botella no es escribir código: el agente lo genera. Lo limitan tres cosas:
- Que Diego dirija y revise cada WP.
- Que Alan revise cada PR y haga las pruebas que el agente no puede hacer: permisos del navegador, push real, celular y lector de pantalla.
- Web Push, que depende de servicios externos.

Por eso el plan pone **el riesgo técnico primero** (spike y backend) y deja un día de colchón antes de la congelación.

## 2. Meta del Sprint

**Meta de la propuesta (sin cambios):**
> Completar el ciclo educativo de alertas cada 2/3 horas con personaje animado, preferencias, historial, búsqueda, microevaluaciones, PWA offline y Web Push probado en un navegador compatible.

**Compromiso con la capacidad real (D-20):** avisos cada 2 o 3 horas en la página, que respetan los ajustes, el silencio y la pausa, con un personaje que cambia según la hora, y **un aviso Web Push real recibido con la pestaña cerrada** en un navegador compatible. El historial completo, la búsqueda, el microquiz y la PWA sin conexión quedan como recortables (§6). Si no entran, se reportan como pendientes.

## 3. Presupuesto de horas (44 h brutas)

| Bloque | Diego | Alan | Total |
|---|---|---|---|
| Planeación y documentos del sprint (hoy) | 1.5 | 0.5 | 2 |
| Spike de Web Push (WP-S2-1) | 2 | — | 2 |
| Construcción con el agente: 10 WP de código, unos 70 min cada uno con su revisión de comportamiento | 12 | — | 12 |
| Revisión cruzada de PRs (unos 30 min por PR) | — | 6 | 6 |
| Pruebas manuales y evidencias: push real, celular, Narrador, Firefox, Lighthouse, 360 px | — | 6 | 6 |
| Pendientes heredados del S1 (§9) | 0.5 | 2 | 2.5 |
| Regresión final (jueves 12/11) | 0.5 | 2.5 | 3 |
| Release, reporte del S2 en Word, Review y Retro | 3 | 2.5 | 5.5 |
| Colchón | 2.5 | 2.5 | 5 |
| **Total** | **22** | **22** | **44** |

El colchón equivale a un día de trabajo. Si se usa antes del miércoles 11, se aplica el orden de recorte (§6) sin esperar.

## 4. Responsables y tareas que no son de código

Cada actividad tiene un **«Responsable (plan)»**, que es el rol de la propuesta (D-04), y se registra **«Lo integró»** al hacer el merge (D-19). En la tabla de §6.1 la columna «Ejecuta» es quién la hará realmente.

| Integrante | Rol | Qué se le solicita en el S2 | Fecha | Respaldo si no llega |
|---|---|---|---|---|
| Obdulio Rincón Flores | PO | (1) Visto bueno a D-20 (prioridad de HU-15). (2) Escribir las 4 frases del personaje (HU-05.1-B). (3) Aceptar o rechazar historias en la Review | (1) vie 30/10 · (2) vie 6/11 · (3) vie 13/11 | (1) Sin visto bueno, el compromiso queda en 43 pts. (2) Se usan como borrador las frases del backlog («Buen día…», «Hora de comer…», «Una pausa…», «Es hora de dormir…») y se marcan como pendientes de aprobación |
| Ana Clara Rocha Benassuli | SM | (1) Cargar el Sprint 2 en Taiga con las 27 tareas y su responsable por plan. (2) Burndown en Taiga cada viernes. (3) Facilitar la Review y la Retro | (1) vie 30/10 · (2) 6 y 13/11 · (3) 13/11 | Lo hace Alan, y así se registra |
| Christian Salvador Gallegos, Sinai Esquivel Elizondo, Ian Alexander Perez | Developers | No participan en el S2 al 29/10 (D-19). Siguen como responsables por plan | — | Sus actividades las ejecutan Diego o Alan |
| Diego Rodríguez Álvarez | Developer frontend | Dirigir al agente (un WP a la vez), abrir los PR, spike, release y reporte | — | — |
| Alan Francisco Ochoa Hernández | QA | Aprobar cada PR, pruebas manuales y evidencias, `PRUEBAS.md`, regresión | — | — |

## 5. Calendario

Cada día: Diego lanza el WP del día y abre su PR. Alan revisa y aprueba el PR del día anterior (o del mismo día) y corre sus casos de `PRUEBAS.md`.

| Día | Diego (implementa) | Alan (QA) | Actividades que cierran | Restantes al cierre |
|---|---|---|---|---|
| **Jue 29/10** | WP-S2-0: este plan (PR de documentos); mensaje al equipo | Revisa el PR de planeación | — | 27 |
| **Vie 30/10** | **WP-S2-1: spike de Web Push** (2 h máx.) → D-21 | Pendientes del S1: T-13 Narrador, T-21 Firefox, T-22 Lighthouse (§9); prepara Chrome Android | — | 27 |
| **Lun 2/11** ⚠ | WP-S2-2: motor de calendario | Revisa WP-S2-2 | HT-04.1-A, HU-04.1-B, HT-04.1-B | 24 |
| **Mar 3/11** | WP-S2-3: backend Web Push | Revisa WP-S2-3 | HT-07.1-A, HT-07.1-B | 22 |
| **Mié 4/11** | WP-S2-4: repositorio local · WP-S2-5: suscripción y service worker | Revisa ambos; primer ensayo de push en la vista previa | HT-04.2-A, HT-04.2-B, HU-15.1-A | 19 |
| **Jue 5/11** | WP-S2-6: Ajustes (horario, silencio, pausa, próximo consejo) | Revisa WP-S2-6 | HU-07.1-A, HU-07.1-B, HU-07.2-A, HU-04.1-A | 15 |
| **Vie 6/11** | WP-S2-7: avisos en la página | **HITO (PC-2): aviso Web Push real con la pestaña cerrada, en producción** (HU-15.2-B) | HU-15.2-B, HU-04.2-A, HU-04.2-B, HU-06.1-A | 11 |
| **Lun 9/11** | WP-S2-8: permiso y notificación nativa · WP-S2-9: personaje (datos y componente) | Revisa ambos | HT-06.1-A, HU-06.2-A, HU-06.2-B, HT-05.1-A, HU-05.1-B, HT-05.1-B | 5 |
| **Mar 10/11** | WP-S2-10: expresiones y movimiento reducido · WP-S2-11: silencio remoto y registro de lecturas | Revisa ambos | HU-05.1-A, HT-05.2-A, HU-05.2-B, HU-07.2-B, HU-08.1-A | 0 |
| **Mié 11/11** | Colchón; si sobra tiempo, recortables en el orden de §6 | Pruebas de los casos manuales que falten | — | 0 |
| — | **Congelación al cierre del miércoles 11** (PC-4) | | | |
| **Jue 12/11** | Corrección de defectos | **Regresión en producción** (PRUEBAS §4) | — | 0 |
| **Vie 13/11** | WP-S2-12: release `v0.2.0`, reporte | Evidencias finales, sección de pruebas del reporte | — | — |

⚠ **Si el lunes 2/11 es inhábil**, todo se recorre un día y el miércoles 11 deja de ser colchón. En ese caso, el PC-3 se aplica sin esperar.

## 6. Sprint Backlog

### 6.1 Comprometido: 27 actividades · 47 pts
| # | ID | Actividad | Prioridad | Pts | Responsable (plan) | Ejecuta | WP |
|---|---|---|---|---|---|---|---|
| 1 | HT-04.1-A | Motor de calendario | Debe | 2 | Sinai Esquivel Elizondo | Diego | WP-S2-2 |
| 2 | HU-04.1-B | Ventanas sin duplicados | Debe | 2 | Sinai Esquivel Elizondo | Diego | WP-S2-2 |
| 3 | HT-04.1-B | Casos límite del horario | Debe | 2 | Alan Francisco Ochoa Hernández | Diego (pruebas) · Alan (revisión de casos) | WP-S2-2 |
| 4 | HT-07.1-A | Endpoint de suscripción | Debe | 2 | Ian Alexander Perez | Diego | WP-S2-3 |
| 5 | HT-07.1-B | Envío Web Push | Debe | 2 | Ian Alexander Perez | Diego | WP-S2-3 |
| 6 | HT-04.2-A | Repositorio local | Debe | 2 | Sinai Esquivel Elizondo | Diego | WP-S2-4 |
| 7 | HT-04.2-B | Último aviso y restablecer | Debe | 2 | Diego Rodríguez Álvarez | Diego | WP-S2-4 |
| 8 | HU-15.1-A | Activar suscripción | Debe (D-20) | 2 | Ian Alexander Perez | Diego | WP-S2-5 |
| 9 | HU-07.1-A | Panel de horario | Debe | 2 | Diego Rodríguez Álvarez | Diego | WP-S2-6 |
| 10 | HU-07.1-B | Guardado validado | Debe | 1 | Sinai Esquivel Elizondo | Diego | WP-S2-6 |
| 11 | HU-07.2-A | Silencio y pausa | Debe | 1 | Sinai Esquivel Elizondo | Diego | WP-S2-6 |
| 12 | HU-04.1-A | Cadencia y próximo consejo | Debe | 2 | Diego Rodríguez Álvarez | Diego | WP-S2-6 |
| 13 | HU-15.2-B | Prueba con pestaña cerrada | Debe (D-20) | 2 | Alan Francisco Ochoa Hernández | Alan | Manual (hito) |
| 14 | HU-04.2-A | Ejecución y reanudación | Debe | 2 | Sinai Esquivel Elizondo | Diego | WP-S2-7 |
| 15 | HU-04.2-B | Sin ráfagas atrasadas | Debe | 2 | Alan Francisco Ochoa Hernández | Diego (pruebas) · Alan (revisión de casos) | WP-S2-7 |
| 16 | HU-06.1-A | Tarjeta emergente | Debe | 2 | Diego Rodríguez Álvarez | Diego | WP-S2-7 |
| 17 | HT-06.1-A | Servicio de notificaciones | Debe | 2 | Ian Alexander Perez | Diego | WP-S2-8 |
| 18 | HU-06.2-A | Permiso explícito | Debe | 1 | Sinai Esquivel Elizondo | Diego | WP-S2-8 |
| 19 | HU-06.2-B | Alternativa sin permiso | Debe | 1 | Ian Alexander Perez | Diego | WP-S2-8 |
| 20 | HT-05.1-A | Catálogo de estados | Debe | 2 | Sinai Esquivel Elizondo | Diego | WP-S2-9 |
| 21 | HU-05.1-B | Guiones por franja | Debe | 2 | Obdulio Rincón Flores | Obdulio (frases) · Diego (código) | WP-S2-9 |
| 22 | HT-05.1-B | Componente Avatar | Debe | 1 | Diego Rodríguez Álvarez | Diego | WP-S2-9 |
| 23 | HU-05.1-A | Cuatro expresiones | Debe | 2 | Diego Rodríguez Álvarez | Diego | WP-S2-10 |
| 24 | HT-05.2-A | Movimiento reducido | Debe | 1 | Sinai Esquivel Elizondo | Diego | WP-S2-10 |
| 25 | HU-05.2-B | Expresividad accesible | Debe | 2 | Alan Francisco Ochoa Hernández | Diego (código) · Alan (prueba manual) | WP-S2-10 |
| 26 | HU-07.2-B | Silencio local y remoto | Debe | 1 | Ian Alexander Perez | Diego | WP-S2-11 |
| 27 | HU-08.1-A | Registro de lecturas | Debe | 2 | Christian Salvador Gallegos | Diego | WP-S2-11 |

Totales: **27 actividades, 47 puntos.** Por historia:
- **Completas:** HT-04, HU-04 y HU-07.
- **Parciales:** HT-05 (3/4), HU-05 (3/4), HU-06 (3/4), HT-07 (2/4), HU-15 (2/4), HT-06 (1/4) y HU-08 (1/4).

### 6.2 Recortables: 25 actividades · 31 pts, en orden de entrada
Si sobra capacidad, entran **de arriba hacia abajo**. Si falta, se recortan **de abajo hacia arriba**. Cada una se activa por escrito en este archivo antes de lanzarla al agente.

| Orden | ID | Actividad | Prioridad | Pts | Por qué en este lugar |
|---|---|---|---|---|---|
| 1 | HU-06.1-B | Foco y pausa en el aviso | Debería | 1 | Completa HU-06 |
| 2 | HT-05.2-B | Peso y fluidez del avatar | Debería | 1 | Completa HT-05 |
| 3 | HU-05.2-A | Gestos animados | Debería | 2 | Completa HU-05 |
| 4 | HT-07.2-A | Job de agenda (envío programado) | Debería | 2 | Hace que Web Push sea periódico y no solo de prueba |
| 5 | HU-15.2-A | Entrega sin duplicados | Debería | 2 | Lo exige la aceptación completa de HU-15 |
| 6 | HU-15.1-B | Baja y compatibilidad | Debería | 2 | Completa HU-15 junto con 4 y 5 |
| 7 | HT-07.2-B | Límites y reintentos | Debería | 2 | Completa HT-07 |
| 8 | HU-08.1-B | Historial local (página) | Debería | 1 | La ruta `/historial` deja de ser marcador |
| 9 | HU-08.2-A | Favoritos | Debería | 1 | — |
| 10 | HT-06.1-B | Consentimiento y lectura | Debería | 1 | — |
| 11 | HT-06.2-A | Service worker con caché | Debería | 1 | Base de la PWA |
| 12 | HT-06.2-B | Pruebas de caché | Debería | 1 | — |
| 13 | HU-12.1-A | PWA instalable | Debería | 2 | Habilita Web Push en iPhone |
| 14 | HU-12.1-B | Prueba de instalación | Debería | 1 | — |
| 15 | HU-12.2-A | Catálogo sin conexión | Debería | 1 | — |
| 16 | HU-12.2-B | Actualizar datos guardados | Debería | 1 | — |
| 17 | HU-09.1-A | Búsqueda por texto | Debería | 1 | — |
| 18 | HU-09.1-B | Sin resultados | Debería | ½ | — |
| 19 | HU-09.2-A | Filtros combinados | Debería | 1 | — |
| 20 | HU-09.2-B | Pruebas de filtros | Debería | ½ | — |
| 21 | HU-08.2-B | Compartir | Puede | 1 | — |
| 22 | HU-10.1-A | Preguntas voluntarias | Puede | 2 | — |
| 23 | HU-10.1-B | Validar respuestas | Puede | 1 | — |
| 24 | HU-10.2-A | Resumen de avance | Puede | 1 | — |
| 25 | HU-10.2-B | Reiniciar progreso | Puede | 1 | — |

**Nunca se recorta un «Debe»** (D-10). Si un «Debe» no se termina, se reporta como pendiente con su motivo, igual que cualquier recortable.

## 7. Puntos de control

| Punto | Cuándo | Condición | Acción |
|---|---|---|---|
| PC-1 | Cierre del vie 30/10 | ¿El spike respondió las 3 preguntas y llegó un aviso de prueba? | **Sí:** D-21 pasa a VIGENTE con la opción A. **No:** se evalúa la opción B en máximo 1 h el lunes. Si tampoco funciona, el PO decide si Web Push regresa a «Debería» (compromiso de 43 pts) y se registra |
| PC-2 | Vie 6/11 (hito de la propuesta) | ¿Llegó un aviso real con la pestaña cerrada en producción? | **No:** HU-15.2-B y lo que dependa de push pasan a pendiente; esas horas se van al personaje y a los avisos en la página. Se registra en DECISIONES |
| PC-3 | Inicio del mar 10/11 | ¿Están en `main` WP-S2-2 a WP-S2-8? | **No:** no se activa ningún recortable; el miércoles 11 se usa para terminar «Debe» |
| PC-4 | Cierre del mié 11/11 | Congelación | Solo corrección de defectos. No se agregan funciones |

## 8. Definition of Done

**Una actividad está Terminada solo si:**
- [ ] Está integrada en `main` mediante un PR con CI en verde.
- [ ] **El PR lo aprobó un integrante distinto del autor** (D-05, D-19).
- [ ] Tiene pruebas de su lógica o de su renderizado. La lógica de horario se prueba con fechas fijas.
- [ ] Cumple el criterio de aceptación de su subhistoria (propuesta §8–9) y su caso de `PRUEBAS.md` está en ✅.
- [ ] Si tiene interfaz: funciona a 360 px y en escritorio, se usa con teclado y axe no reporta violaciones `serious` o `critical`.
- [ ] No deja errores en la consola del navegador.
- [ ] No hay secretos en el repositorio ni en el bundle (`dist/`).

**Una historia está Terminada solo si** sus 4 actividades están terminadas, su «Cómo demostrarla» se demuestra en la Review y **el Product Owner la acepta**. Si le falta alguna actividad, se reporta como **parcial**, con el detalle de cuáles entraron.

## 9. Pendientes heredados del Sprint 1

| Pendiente | Situación encontrada el 29/10 | Acción | Quién | Cuándo |
|---|---|---|---|---|
| Acta de la Review del S1 | No hay registro en el repositorio de la aceptación de las 7 historias | Si no se aceptaron, se presentan al PO junto con la Review del S2. Se registra lo que el PO decida | Diego / Obdulio | 13/11 |
| T-11 (video con teclado), T-13 (Narrador), T-21 (Firefox) | El reporte del S1 los marca ✓, pero no hay evidencia en `docs/evidencias/sprint-1/` | Ejecutarlos y subir la evidencia; si un resultado difiere, corregir el reporte del S1 | Alan | vie 30/10 |
| T-22 (Lighthouse ≥ 80, «Debería») | No ejecutado | Ejecutarlo en producción y subir la captura | Alan | vie 30/10 |
| 28 issues del S1 abiertos en GitHub | El tablero oficial es Taiga (D-18) | Cerrarlos con un comentario que apunte al PR con que se integró cada uno | Diego | vie 30/10 |
| Rama `docs/evidencias-t17` | Ya integrada (#31) | Borrarla | Diego | vie 30/10 |
| `package.json` en versión `0.0.0` | El tag es `v0.1.0` | Se sube a `0.2.0` en el release (WP-S2-12) | Diego | 13/11 |

## 10. Guion de la demo (viernes 13/11)
1. **HT-04 / HU-07:** en Ajustes, cambiar la cadencia a 2 h, ver la vista previa de los avisos de hoy, recargar y comprobar que se conserva. Pausar y reanudar.
2. **HU-04 / HU-06:** con la hora simulada (o en vivo, si coincide con una ventana), aparece un solo aviso con el personaje. «Ver consejo» abre la ficha y «Cerrar» deja la pantalla como estaba.
3. **HU-04:** cerrar la pestaña durante varias ventanas y volver: aparece **a lo sumo un** aviso.
4. **HU-06.2:** rechazar el permiso de notificaciones: la lectura y el aviso en la página siguen funcionando, con un mensaje que lo explica.
5. **HT-05 / HU-05:** el personaje con las 4 expresiones (09:00, 14:00, 17:00, 20:00) y luego con «reducir movimiento» activado.
6. **HT-07 / HU-15:** activar Web Push, cerrar la pestaña, disparar el envío y recibir el aviso. Mostrar el video o la captura del hito del 6/11.
7. **HU-08.1-A:** abrir dos consejos y mostrar que el siguiente aviso no repite los leídos recientemente.
8. Cerrar con el tablero de Taiga, la burndown y la lista de pendientes.

## 11. Entregables del 13/11
- [ ] URL pública con el incremento del S2 y tag `v0.2.0` (D-12), con `package.json` en `0.2.0`.
- [ ] Repositorio con historial de PR, revisión cruzada y CI en verde.
- [ ] Evidencias en `docs/evidencias/sprint-2/`: hito de push (video o capturas), 360 px de las rutas nuevas, axe, Narrador en Ajustes y en el aviso, y compatibilidad de push.
- [ ] Taiga con el Sprint 2 y su burndown; burndown día a día en `docs/sprint-2/DAILY.md`.
- [ ] Acta de la Review (aceptación por historia, firmada por quien acepte) y Retrospectiva.
- [ ] **Reporte del Sprint 2 en Word**, con la estructura del reporte del S1 (PLAN S1 §10) y estos cambios:
  - En la tabla de actividades, dos columnas: **«Responsable (plan)»** y **«Lo integró»** (D-19).
  - Estado por historia: completa, parcial o pendiente, con detalle.
  - Sección de cambios y decisiones: D-19, D-20 y D-21.
  - Declaración de participación de cada integrante en el sprint, tal como ocurrió.

## 12. Riesgos del Sprint 2
| Riesgo | Probabilidad | Respuesta |
|---|---|---|
| Web Push no funciona a tiempo (servicios externos, permisos, configuración) | **Alta** | Spike el primer día (PC-1); hito el 6/11 (PC-2); el aviso en la página no depende del push |
| Solo hay 2 personas: si una falla un día, se pierde la mitad de la capacidad | **Alta** | Colchón del miércoles 11; WP pequeños; el orden de recorte ya está decidido |
| Revisión cruzada como cuello de botella: Alan revisa todo | Media | PR de 1–4 actividades; Alan revisa el mismo día o a primera hora del siguiente |
| Lógica de horario con errores sutiles (medianoche, suspensión, zona horaria) | Media | Funciones puras con fechas fijas; casos límite en HT-04.1-B y HU-04.2-B; E2E con `page.clock` |
| Una clave privada o un secreto se cuela al repositorio o al bundle | Baja | `.env*` ignorado; `.env.example` sin valores; caso de prueba que busca la clave privada en `dist/` |
| Lunes 2/11 inhábil | Por confirmar | Se recorre el calendario y el colchón se consume (§5) |
| PO o SM no entregan sus tareas a tiempo | Media | Respaldo definido en §4; se registra tal como ocurra (D-19) |
| Sin dispositivo Apple para probar Web Push en iPhone | Alta | Se declara «no probado» en la tabla de compatibilidad; requiere la PWA (recortable) |
