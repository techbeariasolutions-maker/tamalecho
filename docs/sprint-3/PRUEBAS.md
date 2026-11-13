# Sprint 3 — Matriz de pruebas de aceptación (QA)

> La llena Alan (QA). La columna «Resultado» se marca ✅, ❌ o «no probado», con la fecha. El agente no marca resultados manuales.

## 1. Matriz
| Caso | Historia / criterio (propuesta) | Tipo | Pasos | Esperado | WP | Evidencia | Resultado |
|---|---|---|---|---|---|---|---|
| T3-01 | HU-13: «La Ayuda resuelve el permiso rechazado y la pestaña cerrada» | Unit + E2E | Abrir `/ayuda` | Hay respuesta para el permiso rechazado, la pestaña cerrada, cadencia, pausa, sin conexión y compatibilidad | S3-1 | CI | |
| T3-02 | HU-13.1-B: limitaciones | Unit | Abrir `/ayuda` | Dice que la precisión fuera de la página depende del servicio remoto, el navegador y los permisos, y que el envío programado no está activo | S3-1 | CI | |
| T3-03 | HU-13: «El usuario sabe qué se almacena y cómo eliminar o cancelar su suscripción» | Unit + manual | Abrir `/privacidad`; comparar con `storage.js` y `server/subscriptions.js` | Cada dato guardado aparece; se explica «Restablecer mis datos» y «Desactivar» | S3-2 | CI + revisión | |
| T3-04 | HU-13.2-B: canal de sugerencias | Unit + manual | Pulsar el enlace de sugerencias | Abre el formulario en otra pestaña, avisado; el formulario no pide datos personales | S3-2 | Captura | |
| T3-05 | HU-13: borradores | Unit | Textos con `approved: false` | Se ve la marca de borrador | S3-1 / S3-2 | CI | |
| T3-06 | HU-14.1-B: esquema versionado | Unit | Validar catálogo con `catalogVersion` mal formada o `updatedAt` inválida | El validador falla y dice por qué | S3-3 | CI | |
| T3-07 | HU-14.2-A: publicación registrada | Unit | `catalogVersion` sin entrada en la bitácora | El validador falla | S3-3 | CI | |
| T3-08 | HU-14: «Un revisor modifica un tip y ve su vista previa antes de publicar» | Manual | PR de prueba que cambia un texto → abrir la vista previa de Vercel | El cambio se ve en la vista previa y no en producción | S3-3 | Captura | |
| T3-09 | HU-14: «Un cambio aprobado puede revertirse sin perder el catálogo» | Unit + manual | Prueba con el catálogo anterior; `git revert` en una rama descartable | El catálogo anterior es válido y la app lo carga | S3-3 | CI + captura | |
| T3-10 | HT-08.2-A: auditoría | Revisión | Leer `SEGURIDAD.md` | Cada hallazgo tiene severidad y decisión | S3-4 | Documento | |
| T3-11 | HT-07 (regresión): claves solo en servidor | Estático | Igual que T2-18 sobre el build final | Sin coincidencias | S3-4 | Captura | |
| T3-12 | HT-08.1-B: móvil | Manual | Chrome Android: recorrer todas las rutas | Sin desplazamiento horizontal; todo usable | S3-5 | Capturas | |
| T3-13 | HT-08.1-B: teclado | E2E + manual | Recorrer Ayuda y Privacidad solo con teclado | Foco visible, orden lógico | S3-5 | Video | |
| T3-14 | HT-08: accesibilidad automática | E2E (axe) | Todas las rutas, incluidas `/ayuda` y `/privacidad` | 0 violaciones `serious` o `critical` | S3-1+ | `axe-resumen.json` | |
| T3-15 | HT-08.2-B: rollback | Manual | Seguir `OPERACION.md` en una vista previa | Se vuelve al despliegue anterior | S3-5 | Captura | |

## 2. Regresión final (jueves 19/11, en producción)
- **S1:** T-01, T-02, T-04, T-06, T-07, T-10, T-17.
- **S2:** T2-03, T2-05, T2-08, T2-11, T2-12, T2-14, T2-21 y T2-25.
- **S3:** T3-01, T3-03, T3-04, T3-13 y T3-14.
- Anotar el resultado y la hora de cada caso.
