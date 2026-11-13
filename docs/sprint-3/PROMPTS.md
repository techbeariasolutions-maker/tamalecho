# Sprint 3 — Paquetes de trabajo (WP) para el agente de código

## Cómo usar este archivo
- Igual que en el S2: **un WP a la vez**, en el orden del PLAN §5. Para pedirlo basta una línea:
  > `Ejecuta el WP-S3-1 de docs/sprint-3/PROMPTS.md siguiendo CLAUDE.md. Antes de escribir código, dime en 5 líneas qué harás y qué archivos tocarás.`
- El agente crea la rama, programa, prueba y abre el PR. La revisión sigue lo que se decida en D-22.
- **Ningún WP del S3 se integra a `main` antes de etiquetar `v0.2.0`** (PLAN §7, PC-1).

### Convenciones que aplican a todos los WP del S3
- Las del S2 (PROMPTS S2) siguen vigentes: hora como parámetro, `storage.js`, APIs del navegador solo en sus servicios, pruebas de servidor sin red.
- **Textos para el usuario:** español de México, frases cortas, sin prometer lo que el producto no hace. Cada texto que describe datos o comportamiento se comprueba contra el código.
- **Borradores:** los textos de Ayuda, limitaciones y privacidad llevan una marca visible de «borrador pendiente de aprobación» mientras el PO no los apruebe. La marca sale de un dato, no de texto suelto, para quitarla en un solo lugar.
- **Evidencias:** van en `docs/evidencias/sprint-3/`.
- **Rutas nuevas:** se agregan a `tests/e2e/routes.js`.

---

## WP-S3-0 · Planeación del Sprint 3 · gestión · vie 13/11
**Rama:** `docs/S3-planning`
- `CLAUDE.md` del S3, D-23 en `DECISIONES.md` y `docs/sprint-3/` (PLAN, PROMPTS, PRUEBAS y la plantilla de DAILY).

**Hecho cuando:** el PR está integrado y el equipo confirma el alcance en el Sprint Planning del 17/11.

---

## WP-S3-1 · Ayuda y limitaciones · HU-13.1-A, HU-13.1-B · mar 17/11
**Rama:** `feat/HU-13-ayuda`
- `/ayuda` deja de ser marcador: `src/features/help/HelpPage.jsx`.
- Contenido en `src/data/help.json` (preguntas y respuestas, con la marca `approved`), leído con un servicio, no importado desde el componente que lo pinta.
- Preguntas mínimas (criterio de la propuesta: «la Ayuda resuelve el permiso rechazado y la pestaña cerrada»):
  - Cómo cambiar la cadencia y el horario.
  - Qué pasa si rechacé el permiso de notificaciones y cómo cambiarlo en el navegador.
  - Cómo pausar y qué es el silencio.
  - Qué pasa si cierro la pestaña (aviso en la página vs. Web Push).
  - Compatibilidad de Web Push (iPhone requiere PWA, que no entró; se dice tal cual).
  - Modo sin conexión: **no disponible** (HT-06.2-A y HU-12 no entraron); se dice tal cual.
- **Limitaciones (HU-13.1-B):** la precisión fuera de la página depende del servicio remoto, del navegador y de los permisos; el envío programado no está activo (HT-07.2-A no entró), así que con la pestaña cerrada solo llegan los envíos de prueba.
- Accesibilidad: un `h1`, preguntas como `h2` o `details/summary`, enlaces a `/ajustes` con nombre claro.

**Pruebas:** renderizado de la página, que exista cada pregunta mínima, que la marca de borrador aparezca con `approved: false`, y la ruta en 360 px y axe.

---

## WP-S3-2 · Aviso de privacidad y canal de sugerencias · HU-13.2-A, HU-13.2-B · mar 17/11
**Rama:** `feat/HU-13-privacidad`
- Ruta nueva `/privacidad` (`src/features/help/PrivacyPage.jsx`) y enlace en el pie de página y desde la Ayuda.
- El aviso dice, sin adornos y comprobado contra el código:
  - En el navegador (`storage.js`): ajustes, historial de lecturas (máximo 50), avisos ya mostrados (máximo 20) y el estado de Web Push.
  - En el servidor, solo si se activa Web Push (`server/subscriptions.js`): la suscripción del navegador, la zona horaria y el horario. Se borra al desactivar, al restablecer o cuando el servicio de push la reporta caducada.
  - No hay cuentas, analítica ni rastreo.
  - Cómo borrar: «Restablecer mis datos» y «Desactivar» en Ajustes.
- **Canal de sugerencias (HU-13.2-B), propuesta D-23:** enlace a un formulario de *issue* de GitHub (`.github/ISSUE_TEMPLATE/sugerencia.yml`) que no pide datos personales. Se avisa que se abre en otra pestaña y que pide una cuenta de GitHub.

**Pruebas:** renderizado; que la página mencione cada dato guardado y los dos botones para borrar; enlace externo con aviso de nueva pestaña; ruta en 360 px y axe.

---

## WP-S3-3 · Flujo editorial por repositorio · HU-14.1-A, HU-14.1-B, HU-14.2-A, HU-14.2-B · mié 18/11
**Rama:** `feat/HU-14-editorial`
- `docs/EDITORIAL.md`: cómo corregir o agregar un consejo con un PR (editar `tips.json`, subir `version` del consejo, `catalogVersion` y `updatedAt`, anotar el cambio, ver la vista previa de Vercel, pedir la aprobación del PO, integrar). Cómo revertir.
- **Esquema versionado (HU-14.1-B):** `catalogVersion` con formato semántico y `updatedAt` como fecha válida, validados en `schema.js`.
- **Publicación aprobada (HU-14.2-A):** bitácora `src/data/catalog-changelog.json` (versión, fecha, consejos tocados, motivo, aprobó). El validador comprueba que la `catalogVersion` del catálogo tenga su entrada en la bitácora. El campo «aprobó» lo llena una persona; el agente nunca lo inventa (CLAUDE.md §11.8).
- **Reversión (HU-14.2-B):** prueba automática que toma la versión anterior del catálogo (fixture) y comprueba que sigue siendo válida y que la app la carga; ensayo manual de `git revert` en una rama descartable. La «sincronización en usuarios de la PWA» no aplica: no hay PWA ni caché; el catálogo viaja con cada despliegue. Se declara.

**Pruebas:** validador con versión mal formada, fecha inválida y bitácora faltante; prueba de reversión.

---

## WP-S3-4 · Auditoría de seguridad · HT-08.2-A · mié 18/11
**Rama:** `chore/HT-08-seguridad`
- `docs/sprint-3/SEGURIDAD.md`: resultado de `npm audit` (producción y desarrollo), revisión de validación de datos en `api/` y `server/`, permisos (solo notificaciones, tras un clic), secretos (repo y `dist/`), límites de API y política de retención. Cada hallazgo con severidad y decisión: corregido, aceptado con motivo o pendiente.
- Correcciones de bajo riesgo si salen: encabezados de seguridad en `vercel.json` (sin romper la app), dependencias con parche.
- **No inventar** límites de servicios externos: si no se comprobaron, se dice.

**Pruebas:** las que cubran cualquier corrección; T2-18 repetida en el build final.

---

## WP-S3-5 · Pruebas automatizadas y operación · HT-08.1-A, HT-08.1-B, HT-08.2-B · jue 19/11
**Rama:** `test/HT-08-pruebas`
- **HT-08.1-A:** inventario de cobertura por flujo (lectura, configuración, avatar, notificaciones, ayuda) en `docs/sprint-3/PRUEBAS.md`; llenar los huecos con E2E (recorrido completo con teclado por Ayuda y Privacidad).
- **HT-08.1-B:** guion de la prueba manual en móvil y con teclado para Alan; corregir los defectos críticos que encuentre.
- **HT-08.2-B:** `docs/OPERACION.md`: rollback en Vercel (volver a un despliegue anterior) y en Git (`git revert`), respaldo editorial (historial de Git y bitácora), monitoreo mínimo (registros de Vercel y del workflow de push) y qué revisar después de cada despliegue. **El acta la redacta una persona.**

---

## WP-S3-6 · Release final · vie 20/11
1. Congelación respetada desde el 18/11.
2. `package.json` → `1.0.0`; `npm run check`, `npm run test:e2e`, `npm run validate:tips:release`, `npm run evidence`.
3. PR «release: v1.0.0» → merge → `git tag -a v1.0.0 -m "Entrega final"` → `git push --tags` → GitHub Release con historias completas, parciales y pendientes de todo el proyecto.
4. Regresión en producción. Reporte del S3, acta, Review y Retro las llenan las personas que participaron.
