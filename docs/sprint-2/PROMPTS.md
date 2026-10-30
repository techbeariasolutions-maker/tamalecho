# Sprint 2 — Paquetes de trabajo (WP) para el agente de código

## Cómo usar este archivo
- **Un WP a la vez, en el orden del PLAN §5.** No abras otro chat de agente sobre el mismo repo mientras uno trabaja.
- Para pedir un WP basta una línea:
  > `Ejecuta el WP-S2-2 de docs/sprint-2/PROMPTS.md siguiendo CLAUDE.md. Antes de escribir código, dime en 5 líneas qué harás y qué archivos tocarás.`
- El agente crea la rama, programa, prueba y abre el PR. **Alan lo revisa y lo aprueba** (D-19); Diego no se aprueba a sí mismo.
- Después del merge:
  - Mover la tarjeta en Taiga.
  - Anotar las horas en `DAILY.md` (lo escribe una persona).
  - Anotar «Lo integró» (autor y revisor del PR) para el reporte.
- Si el agente propone algo fuera del WP, la respuesta es «no, solo el WP».
- Un recortable (PLAN §6.2) solo se lanza después de activarlo por escrito en el PLAN.

### Convenciones que aplican a todos los WP del S2
- **Hora:**
  - Toda función de horario recibe `now` (un `Date`) como parámetro.
  - En las pruebas unitarias, las fechas se construyen a mano.
  - En E2E se usa `page.clock` de Playwright.
  - Nunca se usa `setInterval` para los avisos.
- **Almacenamiento local:** solo a través de `src/services/storage.js`.
- **APIs del navegador:** `Notification`, `PushManager` y `serviceWorker` se usan solo en `notificationService.js` y `pushClient.js`.
- **Pruebas de servidor:** van en `tests/unit/server/`, con el almacén en memoria y `web-push` simulado (mock). **Ninguna prueba del CI usa red ni claves reales.**
- **Evidencias:** van en `docs/evidencias/sprint-2/`.
- **Rutas nuevas:** se agregan a `tests/e2e/routes.js` para que las cubran las pruebas de 360 px y de axe.

---

## WP-S2-0 · Planeación del Sprint 2 · gestión · jue 29/10
**Rama:** `docs/S2-planning` · **Lo hace:** Diego con el agente · **Revisa:** Alan
- `CLAUDE.md` del S2, D-19 a D-21 en `DECISIONES.md` y `docs/sprint-2/` (PLAN, PROMPTS, PRUEBAS y la plantilla de DAILY).

**Hecho cuando:** el PR está aprobado por Alan e integrado. Ese mismo día, Diego manda al equipo el mensaje con las solicitudes de PLAN §4.

---

## WP-S2-1 · Spike de Web Push · D-21 · vie 30/10 · **máximo 2 h**
**Rama:** `spike/web-push` (**desechable, no se integra**) · **Lo hace:** Diego con el agente

**Preguntas que debe responder** (D-06, D-21):
1. ¿Dónde se guardan las suscripciones? ¿Qué límites tiene el plan gratuito? Hay que verificarlos en la documentación vigente y anotar el enlace y la fecha de consulta.
2. ¿Qué dispara el envío cada 2–3 h?
   - Comparar `schedule` de GitHub Actions (frecuencia mínima y retrasos documentados) contra el cron del plan gratuito de Vercel.
   - Se elige uno y se justifica.
3. ¿Llega un aviso real con la pestaña cerrada en Chrome o Edge de escritorio y en Chrome de Android?

**Pasos manuales de Diego (el agente los guía, no los hace por ti):**
- Generar las claves VAPID con `npx web-push generate-vapid-keys` y guardarlas **solo** en las variables de entorno de Vercel: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (`mailto:` del equipo) y `VITE_VAPID_PUBLIC_KEY` (la pública, para el cliente).
- Conectar el almacén desde Vercel → Storage / Marketplace y anotar qué variables de entorno crea.
- Crear `DISPATCH_SECRET` en Vercel y en GitHub → Settings → Secrets.

**El agente construye, en la rama desechable:**
- Una página o botón de prueba que registre `public/sw.js`, pida permiso tras un clic y envíe la suscripción a `api/push/subscribe.js`.
- `api/push/dispatch.js`: exige el header `Authorization: Bearer <DISPATCH_SECRET>` y envía un aviso fijo a las suscripciones guardadas.
- `.github/workflows/push-dispatch.yml` con `workflow_dispatch`, que llama a `dispatch` con el secreto.
- `vercel.json`: el *rewrite* a `/index.html` excluye `/api/` (por ejemplo, `"source": "/((?!api/).*)"`).

**Entregable** (sí se integra, en un PR de documentos aparte):
- `docs/sprint-2/SPIKE_WEBPUSH.md` con las respuestas a las 3 preguntas, las fuentes consultadas y la evidencia del aviso recibido (captura en `docs/evidencias/sprint-2/spike/`).
- D-21 actualizada a VIGENTE.

**Punto de control PC-1** (PLAN §7) al terminar.

---

## WP-S2-2 · Motor de calendario · HT-04.1-A, HU-04.1-B, HT-04.1-B · lun 2/11
**Rama:** `feat/HT-04-motor` · **Depende de:** WP-S2-0

**Construir `src/services/schedule.js`.** Son funciones puras: sin APIs del navegador y sin `Date.now()`.
- `DEFAULT_SETTINGS`:
  - `intervalMinutes: 180`, `startTime: '08:00'`, `quietStart: '21:00'`, `quietEnd: '08:00'`.
  - `lunchStart: '12:00'`, `lunchEnd: '16:00'`.
  - `activeDays: [0,1,2,3,4,5,6]`. Que estén activos todos los días es un valor propuesto: lo confirma el PO y se anota en el PR.
  - `paused: false`.
- `validateSettings(input)`:
  - Devuelve `{ settings, errors }`. Los valores inválidos se reemplazan por los de `DEFAULT_SETTINGS`.
  - Solo acepta `intervalMinutes` igual a 120 o 180 y horas en formato `HH:MM`.
- `getDayPart(now, settings)`:
  - Devuelve `'despierto'` (05:00–11:59), `'hambre'` (de `lunchStart` a `lunchEnd`), `'atento'` (de `lunchEnd` a 19:59) o `'cansado'` (20:00–04:59).
  - Si la franja de comida se configura, `hambre` y `atento` se ajustan.
- `isQuietTime(now, settings)`: debe funcionar cuando el silencio cruza la medianoche (21:00–08:00).
- `getWindowsForDay(date, settings)`:
  - Devuelve las horas de inicio de las ventanas del día, desde `startTime`, cada `intervalMinutes`.
  - No incluye las que caen en silencio. Si el día no está en `activeDays`, devuelve `[]`.
  - Con 180 min: 08, 11, 14, 17 y 20 h. Con 120 min: 08, 10, 12, 14, 16, 18 y 20 h.
- `getCurrentWindow(now, settings)`:
  - Devuelve la última ventana de hoy que ya empezó, o `null`.
  - **Al volver de una suspensión de varias horas, devuelve una sola ventana: la más reciente.**
- `getNextWindow(now, settings)`: devuelve la siguiente ventana, aunque sea en otro día, saltando los días inactivos y el silencio.
- `idempotencyKey(windowStart)`: devuelve la clave `'YYYY-MM-DD@HH:MM'` con la fecha **local**.

**Pruebas (`tests/unit/schedule.test.js`), que cubren HT-04.1-B:**
- Ventanas con 120 y con 180 minutos.
- Días inactivos.
- Silencio que cruza la medianoche.
- 23:59 → 00:00 (cambio de fecha).
- Suspensión: `now` salta 9 h y `getCurrentWindow` devuelve solo la más reciente.
- Cambio de horario de verano en una zona que lo tenga (por ejemplo `America/Tijuana`, con `process.env.TZ` o con fechas construidas para esa zona). Verifica que la prueba también corra en Windows.
- Claves idempotentes distintas para ventanas distintas e iguales para la misma.
- `validateSettings` con entradas inválidas.

**Aceptación (HT-04.1, HU-04.1-B):** con inicio 08:00 las ventanas son correctas, nunca se generan dos ventanas con la misma clave y los casos límite pasan.

---

## WP-S2-3 · Backend de Web Push · HT-07.1-A, HT-07.1-B · mar 3/11
**Rama:** `feat/HT-07-push-backend` · **Depende de:** WP-S2-1 (D-21 vigente) y WP-S2-2

**Construir (según D-21; si el spike eligió otra opción, el WP se ajusta antes de lanzarlo):**
- `server/subscriptions.js`:
  - `validateSubscription(body)`: `endpoint` `https://`, `keys.p256dh`, `keys.auth`, tamaño máximo del cuerpo, `timeZone` válido y ajustes de horario (con `validateSettings`).
  - `subscriptionId(endpoint)`: un hash, para no usar el endpoint completo como llave.
- `server/store.js`: adaptador del almacén elegido con `save`, `remove`, `list` y `get`, más un adaptador **en memoria** para las pruebas.
- `server/push.js`:
  - `sendToSubscription(sub, payload, { webpush })`, con la dependencia inyectada para poder simularla.
  - Si el servicio responde 404 o 410, borra la suscripción.
  - Payload mínimo: `{ title, body, url }`, que apunta a `/tip/:id`.
- `api/push/subscribe.js`: `POST` = alta o actualización; `DELETE` = baja. Responde 405 a otros métodos.
- `api/push/dispatch.js`:
  - Sin el header `Authorization: Bearer <DISPATCH_SECRET>` → 401.
  - Envía el consejo destacado del día (`getFeaturedTip` de `catalog.js`) a todas las suscripciones.
  - Responde un resumen con el número de enviados y de borrados.
- `.github/workflows/push-dispatch.yml`:
  - Solo `workflow_dispatch`. El `schedule` entra con HT-07.2-A, que es recortable.
  - Llama a `/api/push/dispatch` de producción con el secreto de GitHub.
- `vercel.json`: el *rewrite* excluye `/api/`.
- `.env.example`, con los nombres de las variables y sin valores.
- ESLint: globals de Node para `api/**` y `server/**`.
- README: sección «Web Push», que explica dónde se configuran las variables (sin valores) y cómo correr el envío de prueba desde GitHub → Actions.

**Pruebas (`tests/unit/server/`):**
- Validación de suscripciones válidas e inválidas.
- Alta, baja y lista con el almacén en memoria.
- Envío con `web-push` simulado.
- Una respuesta 410 borra la suscripción.
- `dispatch` sin secreto responde 401.

**Aceptación (HT-07.1):** se guarda y se borra una suscripción; la clave privada solo existe en el servidor (T2-18); una suscripción caducada se elimina.

---

## WP-S2-4 · Repositorio local · HT-04.2-A, HT-04.2-B · mié 4/11
**Rama:** `feat/HT-04-storage` · **Depende de:** WP-S2-2

**Construir:**
- `src/services/storage.js`. Es la única pieza que toca `localStorage` y lo recibe por parámetro: `createRepository(storage)`.
  - Llave única `tamalecho:v1` con `{ schemaVersion: 1, settings, history, favorites, progress, servedWindows, push }`.
  - `migrate(data)`: si no hay datos, o la versión es desconocida o el JSON está corrupto, usa valores seguros **sin lanzar errores**.
  - `getSettings()` y `saveSettings()`, que pasan siempre por `validateSettings`.
  - `markWindowServed(key)` y `wasWindowServed(key)`: guarda solo las **20** claves más recientes.
  - `addHistoryEntry({ id, at })`: máximo **50** entradas. El registro lo usa WP-S2-11.
  - `resetAll()`.
- `src/hooks/useSettings.js`: envuelve el repositorio para los componentes.
- `/ajustes`:
  - Reemplaza el marcador por `SettingsPage` (en `src/features/scheduler/`).
  - Por ahora solo tiene `h1` y la sección «Tus datos en este dispositivo». Esa sección explica qué se guarda y tiene el botón «Restablecer mis datos», que pide confirmación **dentro de la página**: nada de `window.confirm`.
  - El panel de horario llega en WP-S2-6.

**Pruebas:**
- Unitarias del repositorio con un almacenamiento falso: migración, JSON corrupto, límites de 20 y 50, y `resetAll`.
- Renderizado de `SettingsPage`.
- E2E: guardar, recargar y restablecer.

**Aceptación (HT-04.2):** al recargar se conservan los datos; una ventana servida no se vuelve a servir; el usuario puede restablecer sus datos.

---

## WP-S2-5 · Activar Web Push y service worker mínimo · HU-15.1-A · mié 4/11
**Rama:** `feat/HU-15-subscribe` · **Depende de:** WP-S2-3 y WP-S2-4

**Construir:**
- `public/sw.js`:
  - Solo `push` (muestra la notificación con título, cuerpo e ícono, y guarda la URL en `data`) y `notificationclick` (enfoca una pestaña abierta o abre la URL).
  - **Sin `fetch` handler ni caché** (D-20).
- `src/services/pushClient.js`:
  - `isPushSupported()`.
  - `getPushStatus()`: `'unsupported' | 'denied' | 'off' | 'on'`.
  - `enablePush(settings, timeZone)`, que **solo se llama desde un clic**: registra el service worker, pide el permiso, se suscribe con `VITE_VAPID_PUBLIC_KEY` y envía la suscripción con `timeZone` y los ajustes de horario.
  - `disablePush()`: cancela la suscripción y la da de baja en el servidor.
  - Guarda el estado en el repositorio local.
- En `/ajustes`, la sección «Avisos con la pestaña cerrada»:
  - Explica en 2 líneas qué hace y qué se envía al servidor (solo la suscripción, la zona horaria y el horario).
  - Botón «Activar» / «Desactivar» con su estado.
  - Mensaje honesto cuando no hay soporte («Tu navegador no permite avisos con la pestaña cerrada; los avisos dentro de la página siguen funcionando»). En iPhone, menciona que requiere la app instalada.
  - Activar o desactivar **no cambia** los demás ajustes.

**Pruebas:**
- Unitarias de `pushClient` con `navigator.serviceWorker`, `PushManager` y `fetch` simulados.
- Renderizado de los 4 estados.
- E2E: en un navegador sin permiso la sección muestra el estado correcto y la página sigue funcionando. La prueba real va en T2-21.

**Aceptación (HU-15.1-A):** desde un botón con explicación se activa la suscripción y su endpoint se registra en el servidor.

**Después del merge (Alan): HITO HU-15.2-B** (PRUEBAS T2-21), el viernes 6/11 a más tardar.

---

## WP-S2-6 · Ajustes: horario, silencio, pausa y próximo consejo · HU-07.1-A, HU-07.1-B, HU-07.2-A, HU-04.1-A · jue 5/11
**Rama:** `feat/HU-07-ajustes` · **Depende de:** WP-S2-4

**Construir en `SettingsPage`:**
- Formulario accesible, con `fieldset` y `legend`:
  - Cadencia: radios de 2 h y 3 h.
  - Hora de inicio.
  - Días activos: casillas.
  - Franja de comida.
  - Silencio, con inicio y fin; por defecto 21:00–08:00.
- Guardado validado:
  - Los errores se asocian con `aria-describedby`.
  - Los valores inválidos no se guardan.
  - Hay un botón «Restaurar valores recomendados».
- **Pausar / Reanudar avisos:** un botón con `aria-pressed` y un texto que dice el estado. La pausa se conserva al recargar.
- **Vista previa** (`SchedulePreview`): lista de las ventanas de hoy calculadas con `getWindowsForDay`. Debe coincidir con el motor.
- **«Próximo consejo: hoy a las 14:00»** (HU-04.1-A), calculado con `getNextWindow`, visible en Ajustes y en la portada. En pausa dice «Avisos en pausa».
- Agregar `/ajustes` con datos a las capturas de 360 px y a axe. Además, cambiar `EVIDENCE_DIR` en `tests/e2e/routes.js` para que las evidencias del S2 vayan a `docs/evidencias/sprint-2/`.

**Pruebas:**
- Renderizado y validación.
- E2E: cambiar a 2 h → la vista previa muestra 08, 10, 12, 14, 16, 18 y 20 h → recargar → se conserva.
- E2E con `page.clock`: a las 13:00 el próximo consejo es a las 14:00 con la cadencia de 2 h.

**Aceptación (HU-07.1, HU-07.2-A, HU-04.1-A):** la vista previa coincide con el motor tras recargar; la pausa persiste; la lectura manual siempre funciona.

---

## WP-S2-7 · Avisos dentro de la página · HU-04.2-A, HU-04.2-B, HU-06.1-A · vie 6/11
**Rama:** `feat/HU-04-avisos` · **Depende de:** WP-S2-6

**Construir:**
- `src/services/tipPicker.js`: `pickTipForWindow(windowKey, recentIds, tips)`. Es determinista por clave y evita los IDs recientes. WP-S2-11 le pasa el historial.
- `src/hooks/useNoticeScheduler.js`. Recalcula **desde el reloj real** en cada uno de estos momentos:
  - Al montar.
  - Con `visibilitychange` a visible.
  - Con `focus`.
  - Con **un solo** `setTimeout` programado hasta `getNextWindow`, que se reprograma después de cada cálculo.

  En cada cálculo:
  - Si hay una ventana actual no servida, fuera de silencio, sin pausa y en un día activo, emite **un** aviso y la marca como servida.
  - Nunca emite más de uno, aunque hayan pasado varias ventanas.
- `NoticeHost` en el Layout y `NoticeToast`:
  - Región `role="status"`, con título y resumen del consejo, «Ver consejo» (abre `/tip/:id`) y «Cerrar».
  - Escape también cierra.
  - No roba el foco y solo hay un aviso a la vez.
  - Deja un espacio para el personaje (WP-S2-9).
  - Usa solo tokens, y a 360 px no tapa el contenido principal.

**Pruebas (HU-04.2-B):**
- Unitarias del hook con temporizadores falsos.
- E2E con `page.clock`:
  - A las 10:59 no hay aviso; a las 11:00 aparece uno.
  - Saltar 9 h → aparece **uno** solo.
  - Cambio de día.
  - En pausa no aparece.
  - De 21:00 a 08:00 no aparece.
  - «Ver consejo» abre la ficha; «Cerrar» deja la página igual.
  - Recargar no repite la ventana ya servida.

**Aceptación (HU-04.2, HU-06.1-A):** al reabrir la pestaña aparece a lo sumo una alerta; el aviso abre la ficha y se cierra sin perder la pantalla.

---

## WP-S2-8 · Servicio de notificaciones y permiso explícito · HT-06.1-A, HU-06.2-A, HU-06.2-B · lun 9/11
**Rama:** `feat/HT-06-notifications` · **Depende de:** WP-S2-7

**Construir:**
- `src/services/notificationService.js`:
  - `getPermission()`.
  - `requestPermission()`: solo se llama desde un clic; si hay una prueba que lo verifica, mejor.
  - `notify(tip)`:
    - Con el permiso concedido y la pestaña **oculta**, muestra una notificación nativa que al pulsarse abre `/tip/:id`.
    - En cualquier otro caso, usa el aviso de la página (`NoticeToast`).
  - `pushClient` usa este servicio para pedir el permiso, así hay un solo lugar que lo hace.
- `useNoticeScheduler` emite a través de `notificationService.notify`.
- En `/ajustes`, la sección «Notificaciones del navegador»:
  - Botón «Activar notificaciones», con la explicación de para qué sirven.
  - Si el permiso está denegado o no hay soporte, un mensaje que lo explica: «Los avisos dentro de la página siguen funcionando. Para recibirlos con la pestaña cerrada se necesita Web Push» (con un enlace a la sección de push).

**Pruebas:**
- Unitarias con `Notification` simulado en los estados `default`, `granted` y `denied`, y sin soporte.
- Prueba de que cargar la app **no** pide el permiso.
- E2E con el permiso denegado: el aviso de la página sigue apareciendo y la lectura funciona.

**Aceptación (HU-06.2, HT-06.1-A):** rechazar el permiso no bloquea la lectura ni la programación interna; el permiso solo se pide tras una acción del usuario.

---

## WP-S2-9 · Personaje: estados, frases y componente · HT-05.1-A, HU-05.1-B, HT-05.1-B · lun 9/11
**Rama:** `feat/HT-05-avatar` · **Depende de:** WP-S2-2. **Antes de lanzarlo:** tener las frases del PO, o usar el respaldo de PLAN §4.

**Construir:**
- `src/data/avatarStates.json`: un solo catálogo de `despierto | hambre | atento | cansado` → `{ expression, phrase, colorToken, animation, alt }`.
  - Las frases son las que entregue el PO. Si no llegan, se usan las del backlog y el PR lo dice.
  - Una prueba verifica que existan los 4 estados y que cada uno tenga sus campos.
- Tokens nuevos del personaje en `tokens.css`: colores con contraste documentado y duraciones.
- `src/features/avatar/Avatar.jsx`:
  - Recibe `dayPart` y muestra un SVG en línea, sin imágenes externas, con `role="img"` y un `aria-label` que dice su estado.
  - La frase va visible como texto, no dentro del SVG.
  - Tiene una versión estática de respaldo.
- Integración en la portada (con `getDayPart(new Date(), settings)`) y en `NoticeToast`.

**Pruebas:**
- Renderizado de los 4 estados.
- E2E con `page.clock` a las 09:00, 14:00, 17:00 y 20:00: estado y frase correctos.

**Aceptación (HT-05.1):** al cambiar la hora simulada, el mismo componente actualiza su expresión y su frase.

---

## WP-S2-10 · Expresiones y movimiento reducido · HU-05.1-A, HT-05.2-A, HU-05.2-B · mar 10/11
**Rama:** `feat/HU-05-expresiones` · **Depende de:** WP-S2-9

**Construir:**
- Las 4 expresiones en el mismo SVG (ojos, boca, cejas) con transiciones CSS suaves entre estados. Las duraciones salen de los tokens.
- Con `prefers-reduced-motion: reduce`:
  - Sin animaciones ni transiciones.
  - El personaje queda estático y el texto y los controles siguen igual.
- La franja «hambre» respeta la franja de comida configurada en Ajustes.
- Sin JavaScript de animación: solo CSS.

**Pruebas:**
- E2E con `reducedMotion: 'reduce'`: `document.getAnimations().length === 0` en la portada y en el aviso.
- axe sin violaciones.
- Con la franja de comida configurada de 13:00 a 15:00, a las 12:30 el estado **no** es «hambre».

**Manual (Alan, HU-05.2-B):** Narrador en la portada y en el aviso: se anuncian el estado y la frase. Va a PRUEBAS T2-10.

**Aceptación (HU-05):** a las 09:00, 14:00, 17:00 y 20:00 se ven la emoción y el mensaje correctos; sin animaciones, el consejo sigue comprensible y operable con teclado.

---

## WP-S2-11 · Silencio remoto y registro de lecturas · HU-07.2-B, HU-08.1-A · mar 10/11
**Rama:** `feat/HU-07-08-silencio-lecturas` · **Depende de:** WP-S2-3, WP-S2-6 y WP-S2-7

**Construir:**
- **HU-07.2-B:**
  - Cuando cambian los ajustes de horario o la pausa y el push está activo, el cliente actualiza su suscripción en el servidor (`POST /api/push/subscribe`).
  - `dispatch` **omite** las suscripciones que están en silencio, en pausa o en un día inactivo, según su `timeZone`. Para eso usa `isQuietTime` y `getWindowsForDay` de `src/services/schedule.js`, el mismo código que el cliente.
- **HU-08.1-A:**
  - Abrir `/tip/:id` registra la lectura con `addHistoryEntry({ id, at })`, **sin duplicados consecutivos**.
  - Recibir un aviso **no** cuenta como lectura.
  - `pickTipForWindow` recibe los IDs leídos recientemente y los evita mientras haya otros disponibles.

**Pruebas:**
- `dispatch` con suscripciones en silencio y fuera de silencio en zonas horarias distintas.
- El registro no duplica dos lecturas consecutivas del mismo consejo.
- Un aviso emitido no se registra como lectura.
- `pickTipForWindow` evita los leídos recientemente.

**Aceptación (HU-07.2-B, HU-08.1-A):** no llegan avisos remotos durante el silencio y la lectura funciona con los avisos pausados; una lectura se registra sin duplicados consecutivos.

---

## WP-S2-12 · Release del Sprint 2 · vie 13/11
1. Comprobar que la congelación (PC-4) se respetó: después del miércoles 11 solo entraron correcciones.
2. Si Historial y Progreso siguen como marcadores, corregir su texto para que no prometan «Sprint 2» (D-11).
3. `package.json` → `0.2.0`. Correr `npm run check`, `npm run test:e2e`, `npm run validate:tips:release` y `npm run evidence`.
4. PR «release: v0.2.0 (Sprint 2)» → Alan lo aprueba → merge → `git tag -a v0.2.0 -m "Sprint 2"` → `git push --tags` → GitHub Release con:
   - Historias completas, parciales y pendientes.
   - Lo que sigue al Sprint 3.
5. Regresión en producción (PRUEBAS §4) y envío de prueba de Web Push desde GitHub Actions.
6. Reporte del Sprint 2 en Word (PLAN §11), acta de la Review y Retrospectiva. Las llenan las personas que participaron.
