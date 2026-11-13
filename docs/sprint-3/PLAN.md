# Sprint 3 — Plan operativo

**Fecha del plan:** viernes 13/11/2026 (borrador preparado con el agente a pedido de Diego; se confirma en el Sprint Planning del martes 17/11, D-23).
**Sprint:** 14–20/11/2026 · **Días hábiles:** 4 (mar 17, mié 18, jue 19 y vie 20; el lunes 16/11 es inhábil) · **Entrega y cierre:** viernes 20/11/2026.
**Fuente de verdad:** propuesta aprobada (D-01). Este plan **no cambia el alcance de la propuesta** para el Sprint 3: se comprometen sus 3 historias completas (D-23).

---

## 1. Punto de partida

| Concepto | Situación al 13/11 |
|---|---|
| Incremento | `v0.2.0` (Sprint 2) en preparación. Todo el código comprometido del S2 está en `main`, salvo la prueba manual HU-15.2-B (T2-21) |
| Integrantes con código | Diego (implementa con el agente) y Alan (QA y revisión), como en el S2 (D-19) |
| Capacidad | ≈ 2 h por día hábil cada uno → **≈ 16 h brutas, ≈ 11 h netas** (factor 0.7) |
| Backlog del S3 (propuesta §8.4) | 3 historias · 12 actividades · 16 pts |
| Pendientes heredados del S2 | Ver §9. No se suman al compromiso: se cierran en paralelo y se reportan como ocurran |

## 2. Meta del Sprint

**Meta de la propuesta (sin cambios):**
> Cerrar ayuda y gestión del contenido, corregir defectos críticos, aceptación integral, producto estable y cierre formal.

**Compromiso (D-23):** las 12 actividades de HT-08, HU-13 y HU-14. HU-14 se implementa **por repositorio** (lo permite la propia actividad HU-14.1-A: «flujo editorial de acceso restringido o por repositorio»): el contenido se edita con un PR, el validador corre en el CI, la vista previa de Vercel muestra el cambio antes de publicar y la reversión es un `git revert`. No se construye un editor web ni se agregan cuentas (CLAUDE.md §2).

## 3. Presupuesto de horas (16 h brutas)

| Bloque | Diego | Alan | Total |
|---|---|---|---|
| Planeación (este plan) y Sprint Planning | 0.5 | 0.5 | 1 |
| Construcción con el agente: 5 WP de código y documentación | 4 | — | 4 |
| Revisión de PRs | — | 2 | 2 |
| Pruebas manuales: móvil, teclado, Narrador, push en producción | — | 2.5 | 2.5 |
| Regresión final (jueves 19/11) | 0.5 | 1.5 | 2 |
| Release `v1.0.0`, reporte del S3, Review, acta y Retro | 2 | 1 | 3 |
| Colchón | 1 | 0.5 | 1.5 |
| **Total** | **8** | **8** | **16** |

## 4. Responsables y tareas que no son de código

Igual que en el S2: **«Responsable (plan)»** es el rol de la propuesta (D-04) y **«Lo integró»** sale del historial de PR (D-19).

| Integrante | Rol | Qué se le solicita en el S3 | Fecha | Respaldo si no llega |
|---|---|---|---|---|
| Obdulio Rincón Flores | PO | (1) Aprobar el texto de Ayuda, limitaciones y aviso de privacidad. (2) Confirmar el canal de sugerencias (D-23). (3) Aprobar las frases del personaje (pendiente del S2). (4) Aceptar o rechazar historias y firmar el acta final | (1)(2)(3) mié 18/11 · (4) vie 20/11 | Los textos se publican como borrador y se reporta que no tienen aprobación |
| Ana Clara Rocha Benassuli | SM | (1) Cargar el S3 en Taiga. (2) Facilitar la Review final y la Retro. (3) Redactar el acta de aceptación final (HT-08.2-B) | (1) mar 17/11 · (2)(3) vie 20/11 | Lo hace Alan, y así se registra |
| Christian, Sinai, Ian | Developers | No participan (D-19). Siguen como responsables por plan | — | Sus actividades las ejecutan Diego o Alan |
| Diego Rodríguez Álvarez | Developer | Dirigir al agente, abrir los PR, release y reporte | — | — |
| Alan Francisco Ochoa Hernández | QA | Revisar cada PR, pruebas manuales, `PRUEBAS.md`, regresión | — | — |

## 5. Calendario

| Día | Diego (implementa) | Alan (QA) | Actividades que cierran | Restantes |
|---|---|---|---|---|
| **Vie 13/11** | Preparación: WP-S3-0 (este plan) y borradores de WP-S3-1 a WP-S3-5 en PR | Revisa el release `v0.2.0` y T2-21 | — | 12 |
| **Mar 17/11** | Sprint Planning; WP-S3-1 (Ayuda y limitaciones) y WP-S3-2 (privacidad y sugerencias) | Revisa ambos; pruebas con teclado y 360 px | HU-13.1-A, HU-13.1-B, HU-13.2-A, HU-13.2-B | 8 |
| **Mié 18/11** | WP-S3-3 (flujo editorial) y WP-S3-4 (auditoría de seguridad) | Revisa; ensaya la reversión del catálogo | HU-14.1-A, HU-14.1-B, HU-14.2-A, HU-14.2-B, HT-08.2-A | 3 |
| — | **Congelación al cierre del miércoles 18** (PC-2) | | | |
| **Jue 19/11** | WP-S3-5 (pruebas automatizadas y operación); corrección de defectos | **Regresión final en producción**; móvil y teclado | HT-08.1-A, HT-08.1-B, HT-08.2-B | 0 |
| **Vie 20/11** | WP-S3-6: release `v1.0.0`, reporte | Evidencias finales; acta | — | — |

## 6. Sprint Backlog: 12 actividades · 16 pts

| # | ID | Actividad | Prioridad | Pts | Responsable (plan) | Ejecuta | WP |
|---|---|---|---|---|---|---|---|
| 1 | HU-13.1-A | Sección de Ayuda | Media | 1 | Christian Salvador Gallegos | Diego | WP-S3-1 |
| 2 | HU-13.1-B | Limitaciones | Media | ½ | Ana Clara Rocha Benassuli | Diego (código) · Obdulio (aprobación del texto) | WP-S3-1 |
| 3 | HU-13.2-A | Aviso de privacidad | Alta | 1 | Obdulio Rincón Flores | Diego (código) · Obdulio (aprobación del texto) | WP-S3-2 |
| 4 | HU-13.2-B | Canal de sugerencias | Baja | ½ | Diego Rodríguez Álvarez | Diego | WP-S3-2 |
| 5 | HU-14.1-A | Edición controlada | Media | 2 | Christian Salvador Gallegos | Diego | WP-S3-3 |
| 6 | HU-14.1-B | Esquema versionado | Media | 1 | Ian Alexander Perez | Diego | WP-S3-3 |
| 7 | HU-14.2-A | Publicación aprobada | Media | 1 | Obdulio Rincón Flores | Diego (código) · Obdulio (aprueba los cambios de contenido) | WP-S3-3 |
| 8 | HU-14.2-B | Reversión del catálogo | Media | 1 | Alan Francisco Ochoa Hernández | Diego (prueba automática) · Alan (ensayo manual) | WP-S3-3 |
| 9 | HT-08.2-A | Auditoría de seguridad | Media | 2 | Ian Alexander Perez | Diego | WP-S3-4 |
| 10 | HT-08.1-A | Pruebas automatizadas | Alta | 2 | Alan Francisco Ochoa Hernández | Diego (pruebas) · Alan (revisión de casos) | WP-S3-5 |
| 11 | HT-08.1-B | Pruebas móviles y teclado | Alta | 2 | Diego Rodríguez Álvarez | Alan (manual) · Diego (correcciones) | WP-S3-5 + manual |
| 12 | HT-08.2-B | Operación y acta | Alta | 2 | Ana Clara Rocha Benassuli | Diego (instructivo) · Ana (acta) | WP-S3-5 + manual |

**Ajuste de prioridades.** En la propuesta, las actividades del S3 usan Alta/Media/Baja. Todas se comprometen; si falta capacidad, se recorta de abajo hacia arriba **solo** HU-13.2-B y después HU-14.2-A, y se reporta como pendiente (D-10).

## 7. Puntos de control

| Punto | Cuándo | Condición | Acción |
|---|---|---|---|
| PC-1 | Inicio del mar 17/11 | ¿Está etiquetado `v0.2.0`? | **No:** se etiqueta primero el commit del release del S2; ningún WP del S3 se integra antes |
| PC-2 | Cierre del mié 18/11 | Congelación | Solo corrección de defectos |
| PC-3 | Jue 19/11 | ¿La regresión final pasa en producción? | **No:** se corrige o se revierte el cambio que la rompió (instructivo de WP-S3-5) |

## 8. Definition of Done

Igual que en el S2 (PLAN S2 §8), con la regla de revisión cruzada que se decida en D-22. Además, para el S3:
- Todo texto nuevo que lee el usuario (Ayuda, limitaciones, privacidad) queda marcado como **borrador** hasta que el PO lo aprueba, y así se reporta.
- La privacidad describe solo lo que el código guarda de verdad (se revisa contra `storage.js` y `server/subscriptions.js`).

**Producto Terminado (cierre del curso):** las pruebas críticas pasan en el build publicado; la versión entregada tiene URL, README, evidencias, registro de riesgos y acta aprobada (aceptación de HT-08 en la propuesta).

## 9. Pendientes heredados del Sprint 2

| Pendiente | Qué falta | Quién |
|---|---|---|
| HU-15.2-B · T2-21 | Ejecutar `push-dispatch` en producción con la pestaña cerrada y guardar evidencia. Si no se hizo antes del 13/11, en el reporte del S2 queda como pendiente | Alan |
| Evidencias manuales del S2 | T2-10, T2-12, T2-13, T2-17, T2-20, T2-25 y la tabla de compatibilidad de push | Alan |
| Frases del personaje | `phrasesApproved: false` en `avatarStates.json` | Obdulio |
| D-22 | Decidir la regla de revisión cruzada | Diego y Alan |
| 28 issues del S1 y ramas remotas viejas | Cerrarlos y borrarlas | Diego |

## 10. Guion de la demo final (viernes 20/11)
1. Recorrido del producto completo: biblioteca, ficha, avisos, personaje, Ajustes y Web Push (lo de S1 y S2).
2. **HU-13:** Ayuda → «Rechacé el permiso» y «Cerré la pestaña»; aviso de privacidad → qué se guarda y cómo borrarlo o cancelar la suscripción; enlace de sugerencias.
3. **HU-14:** abrir un PR que corrige un consejo, ver el validador en el CI y la vista previa de Vercel; mostrar la bitácora del catálogo; revertir y comprobar que el catálogo anterior vuelve.
4. **HT-08:** CI en verde, resumen de la auditoría de seguridad, instructivo de rollback y acta.

## 11. Entregables del 20/11
- [ ] URL pública con tag `v1.0.0` (D-12) y `package.json` en `1.0.0`.
- [ ] README actualizado, evidencias en `docs/evidencias/sprint-3/`, registro de riesgos y auditoría de seguridad.
- [ ] Acta de aceptación final firmada (la redacta una persona).
- [ ] Reporte del Sprint 3 en Word con la estructura del reporte del S2.

## 12. Riesgos del Sprint 3
| Riesgo | Probabilidad | Respuesta |
|---|---|---|
| Solo 4 días hábiles y 2 personas | **Alta** | WP preparados desde el 13/11; congelación el 18; recorte definido en §6 |
| El PO no aprueba los textos a tiempo | Media | Se publican como borrador y se declara |
| El canal de sugerencias exige una cuenta de GitHub | Alta | Se declara en la Ayuda; el PO decide si se cambia (D-23) |
| Un cambio de último momento rompe producción | Media | Instructivo de rollback (WP-S3-5) y regresión el 19/11 |
