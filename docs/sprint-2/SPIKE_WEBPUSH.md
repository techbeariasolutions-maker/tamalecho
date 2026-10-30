# Spike de Web Push (WP-S2-1) · Resultado

**Fecha:** viernes 30/10/2026, ≈ 00:50–01:20 · **Ejecutó:** Diego Rodríguez Álvarez, con el agente de código
**Rama:** `spike/web-push` (desechable, solo local; no se integra, D-21)
**Duración:** dentro del límite de 2 h · **Decisión resultante:** D-21 pasa a VIGENTE con la opción A

---

## 1. Las tres preguntas (D-06, D-21)

### P1 · ¿Dónde se guardan las suscripciones?
**Respuesta:** en **Upstash Redis**, conectado desde el Marketplace de Vercel, con el plan **Free**.

| Dato del plan Free | Valor | Fuente (consultada el 30/10/2026) |
|---|---|---|
| Datos | 256 MB. La página muestra «250 MB» en una tarjeta y «256MB» en la tabla comparativa | https://upstash.com/pricing/redis |
| Comandos | 500 000 por mes | ídem |
| Ancho de banda | 10 GB por mes | ídem |
| Bases de datos | 1 por cuenta gratuita | ídem (FAQ) |

**Estimación de uso.** Supuestos: unas 10 suscripciones y una corrida cada 30 min (48 al día). Cada corrida lee la lista y, por suscripción, lee y guarda la última ventana enviada: unos 25 comandos por corrida. Eso da **≈ 36 000 comandos al mes, alrededor del 7 % del límite.**

**Pendiente:** conectar el almacén al proyecto de Vercel (lo hace Diego en el dashboard) y anotar aquí los **nombres** de las variables que crea. Se hace antes de lanzar WP-S2-3. El spike guardó las suscripciones en un archivo temporal local, así que la conexión real se verifica en ese WP.

### P2 · ¿Qué dispara el envío cada 2–3 h?
**Respuesta:** un **workflow programado de GitHub Actions** que llama a `/api/push/dispatch` en **producción**, protegido con `DISPATCH_SECRET`.

| Opción | Dato verificado | Fuente | Veredicto |
|---|---|---|---|
| Cron de Vercel, plan Hobby | «Hobby accounts are limited to cron jobs that run **once per day**». Precisión «Per-hour (±59 min)». Una expresión más frecuente falla al desplegar | https://vercel.com/docs/cron-jobs/usage-and-pricing | **Descartado**: no permite avisos cada 2–3 h |
| GitHub Actions `schedule` | Mínimo «once every 5 minutes». «Can be delayed during periods of high loads»; «some queued jobs may be dropped». La hora en punto es hora pico. Solo corre en la rama por defecto. En repos públicos se desactiva tras 60 días sin actividad | https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows | **Elegido**, con el diseño tolerante de abajo |

**Diseño tolerante a retrasos y corridas perdidas** (para HT-07.2-A, recortable):
- El workflow corre cada 30 min, **fuera de la hora en punto**: `7,37 * * * *`.
- En cada corrida, y por cada suscripción, el servidor calcula la ventana **vigente** con `getCurrentWindow`, según la zona horaria y el horario de esa suscripción.
- Envía solo si esa ventana no se ha enviado. La clave `idempotencyKey` se guarda en el almacén.
- **Resultado:** si una corrida se retrasa o se pierde, la siguiente envía el aviso. Nunca se duplica y nunca se envía una ventana vieja, porque `getCurrentWindow` solo devuelve la más reciente.
- **Costo:** el aviso puede llegar hasta unos 30 min después del inicio de la ventana, más el retraso de Actions. Se declara en HU-15.2-B y en la Ayuda (S3), y es coherente con HU-13.1-B («la precisión fuera de la página depende del servicio remoto»).

**Mientras HT-07.2-A no entre:** el compromiso del S2 usa solo `workflow_dispatch` (envío manual desde GitHub → Actions), que basta para HT-07.1-B y para el hito HU-15.2-B.

**Nota técnica para WP-S2-3 y WP-S2-11:** las funciones de Vercel corren con la hora del servidor (UTC). Para usar `schedule.js` con la zona horaria de cada suscripción hay que convertir `now` a la hora de reloj de esa zona (por ejemplo, con `Intl.DateTimeFormat(…, { timeZone })`) antes de llamar a `getCurrentWindow` e `isQuietTime`. Hace falta una prueba unitaria con dos zonas horarias distintas.

### P3 · ¿Llega un aviso real con la pestaña cerrada?
**Respuesta: sí, en Chrome de escritorio (Windows 11).**

| Envío | Hora | Respuesta de FCM | Pestaña de la página | Retraso medido | Evidencia |
|---|---|---|---|---|---|
| 1 | 01:13:19 | 201 | (no verificado) | 0 s | `notificacion-chrome-windows.png`: centro de notificaciones; «No molestar» estaba activo y ocultó el globo |
| 2 | 01:15:26 | 201 | **Cerrada**: solo «Nueva pestaña» abierta | 0 s | `notificacion-chrome-windows-banner.png` y `chrome-sin-pestana-localhost.png` |

Las evidencias están en `docs/evidencias/sprint-2/spike/`.

**Cómo se probó:**
- Un servidor Node local (`localhost` es un contexto seguro) con el service worker mínimo (`push` + `notificationclick`, sin caché) y la librería `web-push`.
- El envío se programó 15 s después del clic y la pestaña se cerró antes de que ocurriera.
- El retraso lo calcula el service worker como «recibido − enviado» con el reloj de la misma PC.

**No probado en el spike** (va a T2-21, en producción, a más tardar el 6/11):
- Edge y Firefox de escritorio.
- **Chrome Android**: necesita HTTPS, así que se prueba en producción.
- Safari iPhone: requiere la PWA instalada (HU-12, recortable).

## 2. Otros hallazgos
1. **Vistas previas protegidas.** La protección estándar de Vercel (todos los planes) exige iniciar sesión en las URLs que no son de producción (https://vercel.com/docs/deployment-protection). GitHub Actions **no** puede llamar a una vista previa, así que el disparador apunta solo a producción. En las vistas previas, la suscripción se prueba desde un navegador con sesión iniciada en Vercel.
2. **«No molestar» de Windows** oculta el globo pero entrega la notificación al centro de notificaciones. Va a la Ayuda (S3) y a las notas de T2-21.
3. **Claves.**
   - Las claves VAPID se generaron en `.env.local`, que Git ignora; la clave privada nunca se imprimió.
   - `VAPID_SUBJECT` es `https://tamalecho.vercel.app`, para no enviar un correo personal a los servicios de push.
   - Las variables van en Vercel: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `VITE_VAPID_PUBLIC_KEY` y `DISPATCH_SECRET`. `DISPATCH_SECRET` también va en GitHub Secrets.
4. **Reutilizable.** El service worker del spike (`push` + `notificationclick`, con `tag` para no apilar avisos) es la base de `public/sw.js` en WP-S2-5.
5. **Dependencia nueva.** `web-push` 3.6.7 (solo servidor; CLAUDE.md §4). `npm install` reportó 0 vulnerabilidades.

## 3. Punto de control PC-1
| Condición | Resultado |
|---|---|
| ¿Se respondieron las 3 preguntas? | ✅ P1 y P2 con fuentes oficiales; P3 con prueba real |
| ¿Llegó un aviso de prueba? | ✅ Chrome de escritorio, con la pestaña cerrada |
| Pendiente antes de WP-S2-3 | Conectar Upstash y crear las 5 variables en Vercel (Diego) |

**Acción:** D-21 pasa a VIGENTE con la opción A. Web Push sigue en el compromiso (D-20).
