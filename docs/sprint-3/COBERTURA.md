# Cobertura de pruebas por flujo y guion manual — HT-08.1-A y HT-08.1-B

> Inventario al 13/11/2026 sobre la rama de WP-S3-5, que incluye Ayuda y Privacidad. Unitarias: Vitest en `tests/unit/`. E2E: Playwright en `tests/e2e/`, cada caso en escritorio (1280 × 800) y en móvil (360 × 740).
> Va aparte de `PRUEBAS.md` para no mezclar la matriz de aceptación, que llena Alan, con el inventario técnico.

## 1. Inventario por flujo (propuesta HT-08.1-A: lectura, configuración, avatar y notificaciones; más Ayuda del S3)

| Flujo | Unitarias | E2E | Casos de aceptación cubiertos |
|---|---|---|---|
| **Lectura:** portada, biblioteca, filtro, ficha, fuente, siguiente, volver | `HomePage`, `LibraryPage`, `TipDetailPage`, `TipCard`, `SourceCitation`, `compare`, `catalog`, `useCatalog`, `routes` | `home` (3), `library` (5), `tip` (5), `navigation` (8), `keyboard` (2) | T-01 a T-07, T-09, T-10, T-11 |
| **Catálogo y contenido** | `schema`, `tips-data`, `validate-tips`, `catalog-changelog` (S3, llega con #62), `check-links` | — (el validador corre en el CI; `check:links` es local porque usa red) | T-08 (local), T-19, T-20, T3-06, T3-07, T3-09 (parte automática) |
| **Configuración:** horario, silencio, pausa, restablecer | `schedule`, `schedule-dst`, `storage`, `useSettings`, `ScheduleForm`, `ScheduleFormValidation`, `PauseAndQuiet`, `SettingsPage`, `SettingsPageReset`, `NextTip` | `settings` (6), `schedule` (7) | T2-01 a T2-05, T2-14, T2-15 |
| **Avisos en la página** | `useNoticeScheduler`, `NoticeHost`, `tipPicker`, `readingLog` | `notices` (6), `notice-card` (6), `reading` (2) | T2-06, T2-07, T2-11, T2-22 |
| **Personaje** | `Avatar`, `avatarStates`, `useDayPart` | `avatar` (3), `avatar-a11y` (3), `avatar-motion` (4), `reduced-motion` (2) | T-14, T2-08, T2-09 |
| **Notificaciones y Web Push (cliente)** | `notificationService`, `NotificationSection`, `pushClient`, `pushClientSync`, `pushSync`, `PushSection`, `sw` | `notifications` (5), `push` (6) | T2-12, T2-13, T2-20 (parte automática) |
| **Web Push (servidor)** | `server/handlers`, `server/subscriptions`, `server/store`, `server/push`, `server/delivery`, `server/deployment` | — (sin red en el CI) | T2-16, T2-17, T2-19 |
| **Ayuda, privacidad y sugerencias (S3)** | `HelpPage`, `PrivacyPage` | `help` (4, nuevo) | T3-01 a T3-05, T3-13 |
| **Transversal:** accesibilidad, 360 px, estructura | `App`, `Layout`, `NavMenu`, `Button`, `Message` | `a11y` (todas las rutas de `routes.js`), `responsive` (todas las rutas) | T-12, T2-23, T2-24, T3-14 |

## 2. Huecos y qué se hizo

| Hueco | Estado |
|---|---|
| Ayuda y Privacidad no tenían prueba de teclado | **Cubierto:** `tests/e2e/help.spec.js` (T3-13), con el anillo de foco revisado en cada paso |
| El pie de página no se probaba | **Cubierto:** enlace «Aviso de privacidad» por teclado (E2E) y desde cualquier ruta (unitaria) |
| `tabTo` estaba copiado dentro de `keyboard.spec.js` | Pasó a `tests/e2e/keyboard-helpers.js` para reutilizarlo |
| `reading.spec.js` fallaba a veces en el CI | **Corregido** en #58: esperaba solo la URL y no la ficha cargada |
| Web Push real con la pestaña cerrada | **No automatizable** en el CI (necesita navegador real, permiso y servicio de push): T2-21, manual |
| Lectores de pantalla (Narrador) | **No automatizable:** T2-10, manual |
| Dispositivo móvil real | **No automatizable:** los E2E usan un viewport de 360 px, no un teléfono. T3-12, manual |

## 3. Guion de la prueba manual en móvil y con teclado (HT-08.1-B) — para Alan

Anotar el resultado en `PRUEBAS.md` (T3-12, T3-13) con la fecha. Si algo falla, abrir un issue con el formulario de sugerencias o avisar a Diego; un defecto crítico se corrige antes del 19/11.

**A. Chrome en Android (T3-12), en producción:**
1. Abrir cada ruta: `/`, `/biblioteca/scrum`, `/biblioteca/pmbok`, `/tip/SCR-01`, `/ajustes`, `/ayuda`, `/privacidad`, `/historial`.
2. En cada una: ¿se puede leer sin hacer zoom? ¿hay desplazamiento horizontal? ¿los botones se pulsan sin fallar?
3. Abrir y cerrar el menú de navegación.
4. En Ajustes, cambiar la cadencia, guardar y recargar: ¿se conserva?
5. Pulsar «Enviar una sugerencia en GitHub»: ¿abre otra pestaña?
6. Captura de 3 rutas en `docs/evidencias/sprint-3/movil/`.

**B. Solo teclado en escritorio (T3-13):**
1. Desde `/`, pulsar Tab: el primer elemento es «Saltar al contenido».
2. Llegar a «Ayuda» en el menú, abrir con Enter, recorrer hasta «Leer el aviso de privacidad», Enter.
3. En Privacidad, llegar a «Ir a Ajustes para borrar tus datos», Enter.
4. En todo el recorrido: ¿el foco siempre se ve? ¿el orden tiene sentido?
5. Grabar un video corto (Win + Alt + R con la Xbox Game Bar) y guardarlo en `docs/evidencias/sprint-3/`.

**C. Narrador en Ayuda y Privacidad (complementa T2-10):**
1. Ctrl + Win + Enter para activar el Narrador.
2. Recorrer los encabezados con H: ¿se anuncian «Ayuda», «Preguntas frecuentes», cada pregunta y «Limitaciones»?
3. ¿Se anuncia la marca «Borrador»?
