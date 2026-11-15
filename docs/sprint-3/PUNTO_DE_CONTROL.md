# Punto de control — dónde vamos y qué sigue

> **Para una sesión nueva (persona o agente):** lee esto primero, después `CLAUDE.md` y el WP que toque en `docs/sprint-3/PENDIENTES.md`.
> **Actualizado:** 15/11/2026, con `main` en `b18d098`. Si `main` avanzó, revisa `git log` y los PR abiertos antes de confiar en este archivo.
> **Lo actualiza** quien termine o integre un WP: el agente al cerrar cada paso o Diego al integrar.

## 1. Por qué estamos aquí
- La entrega final **`v1.0.0`** se publicó adelantada el 13/11 (D-25). El Sprint 3 está integrado y la GitHub Release lista el estado de cada historia.
- El rediseño «Ruta diaria» (D-24) se integró **después** de `v1.0.0`. Producción ya lo muestra.
- Diego pidió terminar las actividades de la propuesta que quedaron como recortables en el S2 (**D-26**). El plan está en `PENDIENTES.md`: siete WP del P1 al P7, con release objetivo **`v1.1.0`**.

## 2. Estado de los WP de `PENDIENTES.md`

| WP | Qué | Estado | Siguiente acción |
|---|---|---|---|
| P0 | Plan, D-26 y `CLAUDE.md` | ✅ Integrado (#68) | — |
| P1 | Web Push programado sin duplicados (HT-07.2, HU-15.2-A, HU-15.1-B, HT-06.1-B) | 🟡 PR **#69**, CI en verde | **Diego lo integra a mano.** Activa el envío cada 30 min en producción, y el sistema de permisos bloquea que el agente lo integre |
| P2 | Pausa desde el aviso, gestos y peso del personaje | ✅ Integrado (#70) | — |
| P3 | Borrar historial, favoritos y compartir | ✅ Integrado (#71) | — |
| P4 | Filtros combinados y selector único (HU-09) | ✅ Integrado (#72) | — |
| P5 | PWA instalable y lectura sin conexión (HT-06.2, HU-12) | ✅ Integrado (#73) | — |
| P6 | Microevaluación y progreso (HU-10) | ✅ Integrado (#75). Preguntas en borrador (`approved: false`) | El PO las valida |
| P7 | Release `v1.1.0` | ⬜ Detenido a propósito | **Espera a que Diego integre #69** (decisión de Diego, 15/11): sin P1 el release no podría reportar el envío programado ni actualizar S-06 |

## 3. Qué sigue para el agente, en orden
1. ~~Integrar #72 y #73~~ y ~~P6~~ ya están integrados (#72, #73, #75).
2. ~~**P6 · Microevaluación**~~ (hecho; detalle de lo que se pidió):
   - Pregunta voluntaria de opción múltiple en algunos consejos, con retroalimentación. Nunca bloquea la lectura.
   - Las preguntas salen del texto ya aprobado de cada consejo y se marcan **borrador** (`approved: false`) hasta que el PO las valide (HU-10.1-B). **No inventar contenido ni fuentes.**
   - Respuestas solo en el dispositivo, vía `storage.js` (`progress`), y un panel por enfoque en Mi progreso (HU-10.2-A).
   - Botón «Reiniciar progreso» (HU-10.2-B), con confirmación en la página.
   - Declararlo en el aviso de privacidad y en «Tus datos».
3. **P7 · Release `v1.1.0`** (solo cuando #69 esté en `main`; rama `release/v1.1.0`):
   - Actualizar `SEGURIDAD.md`: S-06 cambia con el envío programado.
   - README y `package.json` a `1.1.0`.
   - `check`, `test:e2e`, `validate:tips:release` y `evidence`.
   - PR del release, tag `v1.1.0` y GitHub Release con el estado honesto de cada historia.
4. Al terminar cada paso, **actualizar este archivo** (§2 y la fecha).

**Cómo retomarlo con pocos tokens:** cambia a Sonnet (`/model sonnet`) y corre
`/loop-lite Termina los WP pendientes de docs/sprint-3/PENDIENTES.md siguiendo docs/sprint-3/PUNTO_DE_CONTROL.md`.

## 4. Lo que solo pueden hacer personas
| Quién | Qué |
|---|---|
| **Diego** | Integrar #69 (activa el envío programado). Decidir con Alan D-22 (revisión cruzada), D-23 (alcance del S3) y S-02 (límite de frecuencia de `/api/push/subscribe`) |
| **Obdulio (PO)** | Aprobar los textos marcados como borrador: Ayuda, limitaciones, Privacidad y frases del personaje (`phrasesApproved`). Después, los textos nuevos de Historial, Mi progreso y Ajustes y, desde P6, las preguntas |
| **Alan (QA)** | Pruebas manuales: T2-21 (push con la pestaña cerrada), T2-10 (Narrador), T3-09, T3-12 (Android), T3-13 (teclado), T3-15 (rollback), comprobar el envío programado tras integrar #69, la instalación de la PWA (HU-12.1-B) y la fluidez del personaje en un móvil básico |
| **Ana (SM)** | Acta de aceptación, Review y Retrospectiva |
| **Todos** | DAILY con horas reales, burndown y reportes del S2 y del S3 en Word. **No se suben al repo:** traen matrículas (#67) |

## 5. Tropiezos conocidos (para no repetirlos)
- **Merges:**
  - El sistema de permisos de Claude Code a veces bloquea `gh pr merge` (pasó con #67 y #69). No se rodea: se le pide a Diego.
  - Cada PR integrado lleva un comentario: «Integrado por el agente con autorización de Diego… sin revisión de Alan registrada (D-22)».
- **PR apilados:**
  - Borrar la rama base **cierra** los PR que dependen de ella. Hay que reasignarlos a `main` **antes** de integrar la base.
  - Con squash merge, los apilados dan conflictos *add/add*. Se verifica que el archivo de `main` sea igual a la base de la rama y luego `git checkout --ours`.
- **CI:**
  - A veces GitHub no lanza el CI tras un push o un merge. Un commit vacío lo dispara (`git commit --allow-empty`).
  - El check obligatorio se llama `CI`.
- **Pruebas locales:**
  - En la máquina de Diego, `vitest` necesita `--maxWorkers=3`.
  - Antes de `playwright test` hay que apagar cualquier `vite preview` en el puerto 4173: Playwright lo reutilizaría con un build viejo.
  - `getByRole({ name })` de Playwright busca coincidencias **parciales**.
- **Accesibilidad que ya mordió:**
  - Toda animación nueva va dentro de `@media (prefers-reduced-motion: no-preference)`.
  - No pueden existir dos controles con el mismo nombre accesible en una página.
  - Una región anunciable nueva que no sea el estado de la página usa `aria-live`, no `role="status"`.
- **Service worker:** el servidor manda `Vary: Origin`; por eso `caches.match` usa `ignoreVary: true`.
- **Shell:** en Windows, los *heredocs* largos de Bash a veces fallan («unexpected EOF»). Es más seguro escribir el script con la herramienta de archivos y ejecutarlo.
- **Datos personales:** nunca subir reportes ni guías con matrículas; el repo es público.
