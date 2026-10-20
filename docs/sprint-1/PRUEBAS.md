# Sprint 1 — Matriz de pruebas de aceptación (QA)

## QA en 5 minutos (para quien nunca lo ha hecho)
- Un **caso de prueba** es la versión ejecutable de un criterio de aceptación: *haz esto → luego esto → debe pasar aquello*. Es el «Cómo probarlo» de Kniberg.
- Cada criterio de la propuesta se convierte en al menos un caso. Si un criterio no se puede convertir en caso, el criterio está mal escrito, y eso también es un hallazgo de QA.
- **Automatizado** = lo corre Playwright o Vitest en cada PR. **Manual** = lo haces tú y dejas evidencia (captura o video).
- Un caso tiene tres resultados posibles: ✅ pasa, ❌ falla (se abre un defecto) o ⏸ bloqueado (no se pudo probar; se anota por qué).
- Los defectos van al tablero como issue con la etiqueta `defecto`, el ID del caso, los pasos, lo esperado y lo obtenido.
- QA no empieza el jueves. Esta matriz existe desde el martes y cada WP debe dejar en verde sus casos.

## Matriz
| Caso | Historia / criterio (propuesta) | Tipo | Pasos | Esperado | WP | Evidencia | Resultado |
|---|---|---|---|---|---|---|---|
| T-01 | HU-01.1: «Al abrir el enlace sin cuenta aparece un tip y se puede navegar a ambos enfoques» | E2E | Abrir `/` | Se ve un TipCard y los enlaces a Scrum y a PMI/PMBOK | WP-6 | CI | |
| T-02 | HU-01.2: «Las secciones se localizan en tres clics o menos en móvil y escritorio» | E2E ×2 | Desde `/`, llegar a cada sección del menú | ≤ 3 clics a 1280 px y a 360 px | WP-2 | CI | |
| T-03 | HU-01.2-B: botón de regreso y ruta desconocida | E2E | Ir a `/xyz`; navegar y usar «atrás» | NotFound con enlace a inicio; «atrás» regresa a la página anterior | WP-9 | CI | |
| T-04 | HU-02.1: «Al seleccionar cada enfoque se visualizan sus categorías y al menos 12 conceptos revisados» | E2E + validador `--release` | Abrir `/biblioteca/scrum` y `/biblioteca/pmbok` | Categorías propias y ≥ 12 tips en cada enfoque | WP-6 / WP-10 | CI + captura | |
| T-05 | HU-02.2: «El usuario puede cambiar de enfoque y consultar un ejemplo comparativo» | E2E | En Scrum, cambiar a PMBOK desde la ficha; abrir la comparación | El cambio no obliga a volver al inicio; la comparación es visible | WP-8 | CI | |
| T-06 | HU-03.1: «Cada consejo abre una ficha con concepto, aplicación y referencia consultable» | E2E (los 24) | Abrir `/tip/{id}` de cada tip | Explicación, ejemplo y fuente con edición en todas | WP-7 | CI | |
| T-07 | HU-03.2: «La navegación entre consejos funciona» | E2E | Biblioteca filtrada → tip → «Siguiente» → «Volver» | El filtro sigue en la URL | WP-7 | CI | |
| T-08 | HU-03.2: «No se muestran enlaces rotos conocidos» | Script local | `npm run check:links` | Todas las URLs responden 2xx o 3xx | WP-7 | Captura de la consola | |
| T-09 | HU-03.2-B: tip sin ficha | E2E | Abrir `/tip/SCR-99` | Mensaje alterno y enlace a la biblioteca | WP-7 | CI | |
| T-10 | HU-11.1: «El flujo completo es legible y operable en móvil y escritorio» | E2E + manual | Cada ruta a 360 px | `scrollWidth ≤ innerWidth`; captura por ruta | WP-9 | `evidencias/360/` | |
| T-11 | HU-11.2: «Puede consultarse un tip y cerrarse un aviso únicamente con teclado» (en S1: abrir un tip y volver) | E2E + video | Solo Tab, Shift+Tab y Enter: biblioteca → tip → volver | Se logra sin ratón; el foco siempre es visible | WP-9 | Video | |
| T-12 | HU-11.2-B / RNF-02: contraste y accesibilidad automática | E2E (axe) | axe en cada ruta | 0 violaciones `serious` o `critical` | WP-9 | `axe-resumen.json` | |
| T-13 | HU-11.2-B: lector de pantalla básico | Manual | Narrador en la portada y en una ficha | Se anuncian el título, la navegación y los enlaces con nombre claro | WP-9 | Notas en esta tabla | |
| T-14 | HU-11.2-B: «Respetar preferencias de reducción de movimiento» | E2E | Emular `reduce` | Sin animaciones activas | WP-9 | CI | |
| T-15 | HT-01.1: «Otro integrante clona y ejecuta la web sin ajustes secretos» | Manual | Clonar en otra carpeta → `npm ci` → `npm run dev` | Corre sin configuración extra | WP-1 | Captura | |
| T-16 | HT-01.2: «El pipeline pasa y una versión se abre desde un enlace externo» | Manual | Ver el check del PR; abrir la URL desde el celular | CI en verde; la URL abre por HTTPS | WP-4 | `ci-verde.png` + captura del celular | |
| T-17 | HT-01.2: rutas SPA en producción | Manual | Abrir directo `https://<url>/biblioteca/pmbok` | Carga la página, no 404 | WP-4 | Captura | |
| T-18 | HT-02.2: «Un cambio de estilo base se refleja sin editar cada pantalla» | Manual (demo) | Cambiar `--color-primary` en la vista previa | Cambia en todas las pantallas | WP-2 | Captura antes/después | |
| T-19 | HT-03.1: «Un tip inválido provoca error controlado antes del despliegue» | Unit + manual | Romper un tip y correr `npm run validate:tips` | Código de salida 1; mensaje con ID y regla | WP-3 | Captura | |
| T-20 | HT-03.2: «24 fichas completas, todas con fuente y versión del catálogo» | Validador `--release` | `npm run validate:tips:release` | Pasa con `catalogVersion 1.0.0` | WP-10 | Captura | |
| T-21 | RNF-16: navegadores | Manual | Chrome, Edge y Firefox en escritorio; Chrome en Android | El recorrido de la demo funciona | WP-10 | Tabla abajo | |
| T-22 | RNF-06 (Debería): desempeño | Manual | Lighthouse móvil en `/` | Performance ≥ 80 | WP-10 | Captura | |

## Compatibilidad (T-21)
| Navegador | Versión | Recorrido de la demo | Observaciones |
|---|---|---|---|
| Chrome escritorio | | | |
| Edge escritorio | | | |
| Firefox escritorio | | | |
| Chrome Android | | | |
| Safari | — | No probado en dispositivo real | Sin equipo Apple disponible; **declararlo**, no ocultarlo |

## Regresión del viernes (antes de la Review)
Correr en la **URL de producción**, no en local: T-01, T-02, T-04, T-06, T-07, T-10, T-11, T-16 y T-17. Anotar el resultado y la hora.
