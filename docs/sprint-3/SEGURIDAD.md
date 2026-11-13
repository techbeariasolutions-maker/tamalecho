# Auditoría de seguridad — HT-08.2-A

**Fecha:** 13/11/2026 · **Base revisada:** `main` en `9a7adfd` + release `v0.2.0` (#58) · **Hizo la revisión:** el agente de código, a pedido de Diego. **Falta la revisión de una persona** (D-22).
**Alcance (propuesta HT-08.2-A):** dependencias, validación de datos, permisos, secretos, límites de API y política de retención.

Severidad: **Alta** (explotable y con impacto en usuarios o datos), **Media** (explotable con impacto limitado), **Baja** (endurecimiento), **Info** (sin riesgo; se deja constancia).

## 1. Resumen

| # | Hallazgo | Severidad | Decisión |
|---|---|---|---|
| S-01 | `npm audit` sin vulnerabilidades | Info | — |
| S-02 | Sin límite de frecuencia en `/api/push/subscribe` | Media | **Pendiente**, la decide el equipo (§4) |
| S-03 | El cuerpo se leía completo antes de medir su tamaño | Baja | **Corregido** en este PR |
| S-04 | Faltaban encabezados de seguridad HTTP | Baja | **Corregido** en este PR (sin CSP) |
| S-05 | Sin Content-Security-Policy | Baja | **Pendiente**: se propone y debe probarse en una vista previa |
| S-06 | Suscripciones abandonadas sin caducidad en el servidor | Baja | **Aceptado**, con motivo (§3.6) |
| S-07 | Cualquiera que conozca un endpoint puede darlo de baja | Info | **Aceptado**, con motivo (§3.2) |
| S-08 | Secretos fuera del repositorio, del historial y del bundle | Info | — |

## 2. Cómo se revisó

| Revisión | Comando o archivo | Resultado |
|---|---|---|
| Dependencias de producción | `npm audit --omit=dev` | `found 0 vulnerabilities` |
| Todas las dependencias | `npm audit` | `found 0 vulnerabilities` |
| Versiones del servidor | `npm ls web-push @upstash/redis` | `web-push@3.6.7`, `@upstash/redis@1.40.0` |
| Inyección de HTML | búsqueda de `dangerouslySetInnerHTML`, `innerHTML` y `eval(` en `src/`, `public/`, `api/` y `server/` | Sin coincidencias. React escapa todo el texto |
| Enlaces externos | `target="_blank"` sin `rel` | Sin coincidencias: todos llevan `rel="noopener noreferrer"` |
| Service worker | `public/sw.js` (`notificationclick`) | Solo abre rutas del mismo origen (`safePath`); una URL externa en el aviso abre `/` |
| Secretos en el código | búsqueda de `VAPID_PRIVATE`, `DISPATCH_SECRET` y `KV_REST_API` en `src/` | Sin coincidencias |
| Secretos en el bundle (T2-18) | `npm run build` y búsqueda de esos nombres más `web-push` y `upstash` en `dist/` | Sin coincidencias |
| Secretos en el historial | `git log --all -G` con patrones de llaves privadas y asignaciones con valor | Sin coincidencias |
| Variables | `.gitignore` y `.env.example` | `.env` y `.env.*` ignorados; `.env.example` solo tiene nombres |
| CI | `.github/workflows/ci.yml` y `push-dispatch.yml` | `permissions: contents: read`; el secreto del disparador solo se usa como variable de entorno del paso |

## 3. Detalle por tema

### 3.1 Dependencias (S-01)
Sin vulnerabilidades conocidas al 13/11/2026. El resultado de `npm audit` cambia con el tiempo: se repite en la regresión final (19/11) y antes del release `v1.0.0`.

### 3.2 Validación de datos
- **`POST /api/push/subscribe`** (`server/subscriptions.js`):
  - Acepta solo endpoints `https://` de servicios de push conocidos (FCM, Mozilla, Windows, Apple). Así el servidor no sirve para hacer peticiones a direcciones arbitrarias (SSRF).
  - Valida la zona horaria con `Intl` y los ajustes con `validateSettings`, el mismo código del navegador.
  - Guarda **solo** endpoint, claves, zona horaria y ajustes. Descarta cualquier otro campo del cuerpo.
- **`DELETE /api/push/subscribe`:** borra por el hash del endpoint (S-07). El endpoint es una URL larga y aleatoria que solo conoce el navegador suscrito. Quien la tenga podría dar de baja esa suscripción, pero no leer nada ni enviar avisos. **Aceptado.**
- **`POST /api/push/dispatch`:**
  - Exige `Authorization: Bearer <DISPATCH_SECRET>` y lo compara en tiempo constante (`timingSafeEqual` sobre hashes).
  - Sin secreto configurado, rechaza todo.
  - Responde 401 **antes** de revisar el método.
- **Errores:** las respuestas no muestran detalles internos y el registro del envío solo anota el código de estado, nunca el endpoint.
- **Navegador:** `storage.js` sanea todo lo que lee (ids con formato, fechas válidas, límites de 50 y 20 entradas) y nunca lanza errores con datos corruptos.

### 3.3 Permisos
- El permiso de notificaciones solo se pide al pulsar «Activar notificaciones» o «Activar avisos» (T2-13; `notificationService.js` y `pushClient.js` son los únicos que tocan las APIs).
- **Corregido (S-04):** `vercel.json` agrega `Permissions-Policy: camera=(), microphone=(), geolocation=()`. La app no usa esas capacidades, y esta política impide que algo incrustado las pida.

### 3.4 Secretos (S-08)
Ver §2: ni el repositorio, ni su historial, ni el bundle contienen las claves. La clave VAPID privada, el secreto del disparador y el token del almacén viven solo en Vercel y en GitHub Secrets (CLAUDE.md §9).

### 3.5 Límites de la API
- **Tamaño del cuerpo:**
  - Antes ya había un límite de 4096 bytes, pero el cuerpo se leía completo antes de medirlo (S-03).
  - **Corregido:** si `Content-Length` declara más del límite, se responde 413 sin leer el cuerpo. Si no lo declara, se mide después de leer, como antes.
  - Vercel también limita el cuerpo de las funciones (4.5 MB según su documentación).
- **Frecuencia (S-02, Media):** no hay límite de solicitudes por cliente en `/api/push/subscribe`.
  - **Riesgo:** un script podría registrar muchas suscripciones falsas con hosts válidos. Gastaría la cuota del almacén (plan gratuito de Upstash: 256 MB y 500 000 comandos al mes, según el spike, D-21) y haría más lentos los envíos. Las suscripciones falsas se borran solas cuando el servicio de push responde 404 o 410 en un envío.
  - **No hay datos de usuarios expuestos.**
  - **Opciones (las decide el equipo):**
    - **A.** Regla de límite de frecuencia del firewall de Vercel para `/api/push/subscribe`. No se comprobó si el plan del proyecto la incluye; hay que revisarlo en el panel antes de decidir.
    - **B.** Límite propio con el mismo Redis (contador por IP con caducidad). Cuesta comandos del almacén y agrega código al servidor.
    - **C.** Aceptarlo para la entrega del curso y vigilar el uso del almacén en el panel de Upstash (`docs/OPERACION.md`).
  - **Recomendación del agente:** C para el 20/11, por tiempo y riesgo, y A si el plan lo permite sin costo.
- **Encabezados (S-04, corregido):** `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` y `Permissions-Policy`, en todas las rutas.
- **CSP (S-05, pendiente):**
  - Propuesta: `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; worker-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'`.
  - No se activó porque los encabezados de `vercel.json` no se aplican en `vite preview` ni en las pruebas locales: un error solo se vería en Vercel.
  - **Para activarla:** agregarla en un PR, abrir su vista previa, recorrer todas las rutas, activar y desactivar Web Push, y revisar la consola en busca de bloqueos.

### 3.6 Política de retención
- **Navegador:** los datos se quedan hasta que la persona restablece sus datos o borra los datos del sitio (aviso de privacidad, HU-13.2-A).
- **Servidor:** la suscripción se borra cuando:
  - la persona la desactiva o restablece sus datos;
  - el servicio de push responde 404 o 410 en un envío (`server/push.js`).
- **S-06 (aceptado):**
  - Una suscripción de alguien que deja de usar la página sin desactivarla se queda en el almacén hasta el siguiente envío que el servicio de push rechace.
  - Mientras el envío programado no esté activo (HT-07.2-A), eso solo pasa en los envíos de prueba.
  - El registro no tiene datos personales (CLAUDE.md §2), así que el impacto es bajo.
  - Si entra el envío programado, se propone revisar esta decisión.

## 4. Pendientes para el equipo
1. Decidir S-02 (A, B o C) y anotarlo en `DECISIONES.md`.
2. Probar la CSP (S-05) en una vista previa y activarla si no rompe nada.
3. Repetir `npm audit` y T2-18 en la regresión final (T3-11).
4. Que una persona revise esta auditoría y lo deje registrado en el PR.
