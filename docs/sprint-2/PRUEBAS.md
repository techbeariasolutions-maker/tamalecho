# Sprint 2 — Matriz de pruebas de aceptación (QA)

> Responsable: Alan Francisco Ochoa Hernández (QA). Cada criterio de aceptación comprometido (PLAN §6.1) tiene al menos un caso. Los casos de las actividades recortables se agregan cuando se activan.
> Resultados: ✅ pasa · ❌ falla (se abre un defecto) · ⏸ bloqueado (se anota por qué).
> Defectos: tarjeta en Taiga con el ID del caso, los pasos, lo esperado y lo obtenido. Si viene de un PR, también como comentario en el PR.

## 1. Cómo revisar un PR del S2 (≈ 30 min)
1. **CI en verde.** Si está en rojo, se devuelve sin revisar.
2. **Archivos tocados = los del WP** (PROMPTS). Hay que buscar en el diff estas señales de alerta:
   - `localStorage` fuera de `storage.js`.
   - `Notification`, `PushManager` o `serviceWorker` fuera de `notificationService.js` y `pushClient.js`.
   - `Date.now()` o `new Date()` sin argumentos dentro de `schedule.js`.
   - `setInterval`.
   - Colores sueltos fuera de `tokens.css`.
   - Cualquier valor que parezca una clave.
3. **Vista previa de Vercel:** seguir el «Cómo probarlo» del PR.
4. **360 px y teclado:** F12 → Ctrl+Shift+M → 360 de ancho; luego recorrer solo con Tab, Shift+Tab, Enter y Escape.
5. **Consola:** F12 → Console, sin errores en rojo.
6. Correr los casos de esta matriz que correspondan al WP y anotar el resultado.
7. **Aprobar** en GitHub (Review → Approve) solo si todo lo anterior está bien. Si no, «Request changes» con el paso exacto que falló.

**Simular la hora a mano en la vista previa:** las pruebas E2E usan `page.clock`. A mano, basta con revisar en Ajustes que la vista previa y el «Próximo consejo» sean coherentes con la hora real. No se cambia el reloj de Windows.

## 2. Matriz
| Caso | Historia / criterio (propuesta) | Tipo | Pasos | Esperado | WP | Evidencia | Resultado |
|---|---|---|---|---|---|---|---|
| T2-01 | HT-04.1 / HU-04: «Con inicio 08:00 las ventanas son correctas» | Unit | `schedule.test.js` | 180 min: 08, 11, 14, 17, 20 h · 120 min: 08, 10, 12, 14, 16, 18, 20 h | S2-2 | CI | |
| T2-02 | HT-04.1-B: casos límite | Unit | Medianoche, suspensión de 9 h, días inactivos, horario de verano, silencio que cruza la medianoche | Una sola ventana actual al reanudar; claves únicas; sin ventanas en silencio | S2-2 | CI | |
| T2-03 | HT-04: «Al recargar se conservan los ajustes y no se repite una ventana ya servida» | E2E | Cambiar ajustes → recargar; recibir un aviso → recargar | Ajustes iguales; el aviso de esa ventana no reaparece | S2-4 / S2-7 | CI | |
| T2-04 | HT-04.2-B: restablecer datos | E2E + manual | Ajustes → «Restablecer mis datos» → confirmar | Valores recomendados; historial vacío; sin `window.confirm` | S2-4 | Captura | |
| T2-05 | HU-04.1-A: «Mostrar la hora del Próximo consejo con la hora local» | E2E (`page.clock`) | 13:00 con cadencia de 2 h | «Próximo consejo: hoy a las 14:00» en la portada y en Ajustes | S2-6 | CI | |
| T2-06 | HU-04: «Al reabrir la pestaña aparece a lo sumo una alerta» | E2E (`page.clock`) | Saltar 9 h con varias ventanas vencidas | Exactamente 1 aviso | S2-7 | CI | |
| T2-07 | HU-04.2-B: sin ráfagas | E2E (`page.clock`) | Cambio de día; pausa; 22:00 | Sin cascadas; sin aviso en pausa ni en silencio | S2-7 | CI | |
| T2-08 | HU-05: «A las 09:00, 14:00, 17:00 y 20:00 se ven la emoción y el mensaje correctos» | E2E (`page.clock`) | Portada en las 4 horas | despierto, hambre, atento, cansado, con su frase | S2-9 | CI + 4 capturas | |
| T2-09 | HT-05 / HU-05: «Con movimiento reducido la lectura y los controles siguen disponibles» | E2E | `reducedMotion: 'reduce'` en la portada y con el aviso visible | `getAnimations().length === 0`; texto y botones presentes | S2-10 | CI | |
| T2-10 | HU-05.2-B: expresividad accesible | Manual (Narrador) | Ctrl + Win + Enter; recorrer la portada y el aviso | Se anuncian el estado del personaje y su frase; el aviso se anuncia sin robar el foco | S2-10 | Notas aquí + video corto | |
| T2-11 | HU-06: «El aviso abre la ficha y se cierra sin perder la pantalla» | E2E | Con aviso visible: «Ver consejo»; en otro aviso: «Cerrar» y Escape | Abre `/tip/:id`; al cerrar, la página y el scroll siguen igual | S2-7 | CI | |
| T2-12 | HU-06: «Rechazar el permiso no bloquea la lectura ni la programación interna» | E2E + manual | Permiso denegado → esperar ventana → navegar | Aparece el aviso de la página; mensaje explicativo en Ajustes; la lectura funciona | S2-8 | CI + captura | |
| T2-13 | HU-06.2-A: permiso solo tras acción del usuario | Unit + manual | Cargar la app en un perfil limpio | El navegador **no** pide permiso al cargar; solo al pulsar «Activar» | S2-8 | CI + captura | |
| T2-14 | HU-07: «La vista previa coincide con el motor tras recargar» | E2E | Cambiar a 2 h → recargar | La vista previa muestra las ventanas de T2-01 y se conserva | S2-6 | CI | |
| T2-15 | HU-07: «No llegan avisos durante el silencio y la lectura manual siempre funciona» (local) | E2E (`page.clock`) | 22:00 y pausa activa | Sin avisos; biblioteca y fichas navegables | S2-6 / S2-7 | CI | |
| T2-16 | HU-07.2-B: silencio remoto | Unit (servidor) | `dispatch` con suscripciones en silencio y fuera de silencio, en zonas horarias distintas | Solo se envía a las que no están en silencio ni en pausa | S2-11 | CI | |
| T2-17 | HT-07: «Se guarda y borra la suscripción» | Unit + manual | Activar y luego desactivar push; respuesta 410 simulada | La suscripción aparece y desaparece del almacén; la caducada se borra | S2-3 / S2-5 | CI + captura del almacén | |
| T2-18 | HT-07: «Claves solo en servidor» | Estático + manual | `npm run build`; buscar en `dist/` el valor de la clave privada (`Select-String`, lo hace Alan, que la generó) y el texto `VAPID_PRIVATE` | Sin coincidencias; en `src/` nadie lee `VAPID_PRIVATE_KEY` | S2-3 | Captura de la consola | |
| T2-19 | HT-07: disparador protegido | Unit + manual | Llamar a `/api/push/dispatch` sin secreto | 401; no se envía nada | S2-3 | CI + captura | |
| T2-20 | HU-15: «Se activa y desactiva Push sin perder ajustes» | E2E (parcial) + manual | Cambiar la cadencia → activar push → desactivar → recargar | La cadencia sigue igual; los estados de la sección son correctos | S2-5 | Captura | |
| T2-21 | **HU-15.2-B · HITO 6/11:** «Se acredita un aviso autorizado» con la pestaña cerrada | Manual | En **producción**: activar push → cerrar la pestaña (el navegador abierto) → GitHub → Actions → «push-dispatch» → Run → esperar | Llega la notificación; al pulsarla abre la ficha. Anotar el retraso medido | después de S2-5 | Video o capturas en `evidencias/sprint-2/push/` | |
| T2-22 | HU-08.1-A: registro de lecturas | Unit | Abrir el mismo consejo dos veces seguidas; recibir un aviso sin abrirlo | 1 entrada en el historial; el aviso no cuenta como lectura | S2-11 | CI | |
| T2-23 | HU-11 (regresión): 360 px | E2E | Rutas nuevas y aviso visible a 360 px | `scrollWidth ≤ innerWidth`; el aviso no tapa el contenido principal | S2-6 / S2-7 | `evidencias/sprint-2/360/` | |
| T2-24 | HU-11 (regresión): accesibilidad automática | E2E (axe) | Todas las rutas, incluidos Ajustes y el aviso visible | 0 violaciones `serious` o `critical` | S2-6+ | `axe-resumen.json` | |
| T2-25 | HU-11.2: «Puede consultarse un tip y cerrarse un aviso únicamente con teclado» | E2E + video | Solo teclado: cambiar ajustes; con aviso visible, abrir el consejo, volver y cerrar otro aviso con Escape | Todo sin ratón; foco visible siempre | S2-7 | Video | |

## 3. Compatibilidad de Web Push (T2-21)
| Navegador | Versión | ¿Activa la suscripción? | ¿Llega con la pestaña cerrada? | Retraso medido | Observaciones |
|---|---|---|---|---|---|
| Chrome escritorio (Windows) | | | | | |
| Edge escritorio (Windows) | | | | | |
| Firefox escritorio | | | | | |
| Chrome Android | | | | | |
| Safari iPhone | — | — | — | — | Requiere la PWA instalada (HU-12, recortable). Si no entra: **«no soportado en el S2»**, declarado, no oculto |

## 4. Regresión del jueves 12/11 (en la URL de producción)
- **Del S1:** T-01, T-02, T-04, T-06, T-07, T-10, T-17 (matriz del S1).
- **Del S2:** T2-03, T2-05, T2-08, T2-11, T2-12, T2-14, T2-21 (un envío más) y T2-25.
- Anotar el resultado y la hora de cada caso.

## 5. Pendientes del Sprint 1 (PLAN §9)
| Caso S1 | Qué falta | Resultado | Evidencia |
|---|---|---|---|
| T-11 | Video consultando un tip y regresando solo con teclado | | `docs/evidencias/sprint-1/` |
| T-13 | Narrador en la portada y en una ficha | | Notas + captura |
| T-21 | Chrome, Edge y Firefox en escritorio; Chrome Android | | Tabla de compatibilidad del S1 |
| T-22 | Lighthouse móvil en `/` (Performance ≥ 80) | | Captura |
