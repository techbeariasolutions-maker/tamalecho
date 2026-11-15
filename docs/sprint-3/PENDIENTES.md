# Backlog pendiente de la propuesta — plan posterior a `v1.0.0` (D-26)

**Fecha:** 14/11/2026 · **Pidió:** Diego Rodríguez Álvarez · **Implementa:** el agente de código, un WP a la vez · **Versión objetivo:** `v1.1.0`
**Por qué:** la entrega `v1.0.0` (D-25) dejó parciales varias historias del Sprint 2 porque sus actividades eran recortables (PLAN S2 §6.2). Diego pidió terminarlas con los días que quedan. Todas vienen del backlog de la propuesta; **no se agrega nada nuevo al alcance** (D-01).

## 1. Paquetes de trabajo (en orden)

| WP | Actividades (propuesta) | Qué debe quedar | Rama |
|---|---|---|---|
| **P0** | — | Este plan, D-26 y `CLAUDE.md` | `docs/plan-pendientes` |
| **P1 · Web Push completo** | HT-07.2-A, HU-15.2-A, HT-07.2-B, HU-15.1-B, HT-06.1-B | Envío programado por GitHub Actions cada 30 min que calcula la ventana vigente por zona horaria con clave idempotente (un aviso por ventana y suscripción). Reintento acotado ante errores temporales y registro de errores. Baja efectiva y detección de permiso revocado o suscripción caducada. Pulsar la notificación abre la ficha | `feat/HT-07-agenda` |
| **P2 · Aviso y personaje** | HU-06.1-B, HU-05.2-A, HT-05.2-B | Botón permanente para pausar desde el aviso, con foco y teclado. Gestos breves del personaje (estiramiento, comida, bostezo) sin tapar el texto y sin JavaScript de animación. Prueba de peso del personaje ≤ 100 KB | `feat/HU-06-05-gestos` |
| **P3 · Historial, favoritos y compartir** | HU-08.1-B, HU-08.2-A, HU-08.2-B | Borrar el historial. Guardar y quitar favoritos con su vista. Compartir con Web Share API o copiar la URL, sin datos del usuario | `feat/HU-08-favoritos` |
| **P4 · Búsqueda y filtros** | HU-09.1-A, HU-09.1-B, HU-09.2-A, HU-09.2-B | Formalizar la búsqueda del rediseño: incluir conceptos (área), selector único de enfoque, tema y texto, pruebas de combinaciones, y comprobar que el catálogo original no se altera | `feat/HU-09-filtros` |
| **P5 · PWA y sin conexión** | HT-06.2-A, HT-06.2-B, HU-12.1-A, HU-12.1-B, HU-12.2-A, HU-12.2-B | Manifest e íconos propios. Service worker con caché versionada de los recursos publicados que se reemplaza al actualizar. Lectura sin conexión con aviso de que no hay red. Leer sin conexión no envía nada | `feat/HU-12-pwa` |
| **P6 · Microevaluación y progreso** | HU-10.1-A, HU-10.1-B, HU-10.2-A, HU-10.2-B | Pregunta voluntaria de opción múltiple en consejos seleccionados, con retroalimentación. Nunca bloquea la lectura. Respuestas solo en el dispositivo y panel por enfoque. Reiniciar el progreso. **Las preguntas salen del texto ya aprobado de cada consejo y quedan como borrador hasta que el PO las valide (HU-10.1-B)** | `feat/HU-10-quiz` |
| **P7 · Release** | — | Textos de Ayuda y Privacidad actualizados, README y release `v1.1.0` | `release/v1.1.0` |

Cada WP sigue la Definition of Done del S3 (PLAN S3 §8): PR con CI en verde, pruebas de su lógica y de su renderizado, 360 px y axe sin violaciones `serious` o `critical`, y sin secretos. Además:
- Todo dato nuevo en el navegador pasa por `storage.js` y se declara en el aviso de privacidad.
- Todo texto educativo nuevo queda marcado como borrador hasta que el PO lo apruebe.

## 2. Reglas que no cambian
- Sin cuentas, analítica ni datos personales. El servidor solo guarda la suscripción, la zona horaria, el horario y, desde P1, la clave de la última ventana enviada (para no duplicar).
- Uno por ventana como máximo, nunca ráfagas de atrasados, silencio de 21:00 a 08:00 por defecto y la lectura siempre funciona.
- Las APIs del navegador se usan solo en sus servicios. El horario se calcula solo en `schedule.js`.

## 3. Lo que este plan NO cubre (solo pueden hacerlo personas)

| Pendiente | Quién |
|---|---|
| Aprobar textos (Ayuda, limitaciones, privacidad, personaje, Historial, Mi progreso, Ajustes y, desde P6, las preguntas) | Obdulio (PO) |
| Pruebas manuales T2-10, T2-21, T3-09, T3-12, T3-13, T3-15 y la matriz `PRUEBAS.md`. Desde P1, comprobar el envío programado con un navegador real. Desde P5, la instalación (HU-12.1-B, en la parte manual) | Alan (QA) |
| Acta de aceptación, Review y Retrospectiva | Ana (SM) y el equipo |
| DAILY, horas, burndown y reportes en Word | Cada integrante |
| D-22, D-23, S-02 y la prueba de la CSP | Diego y Alan |

## 4. Opcionales posteriores a `v1.1.0` (D-27)

| WP | Qué debe quedar | Rama |
|---|---|---|
| **O1 · Límite de frecuencia (S-02)** | Límite por IP cifrada en `/api/push/subscribe`, con respuesta 429 y `Retry-After`; declarado en el aviso de privacidad | `feat/S-02-rate-limit` |
| **O2 · CSP (S-05)** | Content-Security-Policy en `vercel.json`, comprobada con un build local; la prueba en la vista previa de Vercel la hace una persona | `feat/S-05-csp` |
| **O3 · Caducidad (S-06)** | Las suscripciones sin actividad se borran tras un plazo; se declara en el aviso de privacidad | `feat/S-06-expiry` |
| **O4 · E2E inestable** | Encontrar la causa de la falla de `settings.spec.js` («restablecer da de baja la suscripción») y corregirla | `fix/e2e-settings-flaky` |
| **O5 · Diseño más animado** | Animaciones y microinteracciones con tokens, dentro de `prefers-reduced-motion: no-preference` y sin romper contraste, 360 px ni axe | `feat/ui-motion` |

