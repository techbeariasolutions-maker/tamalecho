# Flujo editorial del catálogo de consejos (HU-14)

> Cómo corregir, agregar, publicar y revertir consejos **sin tocar la interfaz**. El flujo usa el repositorio (D-23): no hay editor web, cuentas ni servidor de contenidos.
> Aplica a `src/data/tips.json` y a su bitácora `src/data/catalog-changelog.json`.

## 1. Quién hace qué

| Paso | Quién |
|---|---|
| Proponer el cambio (texto, fuente, consejo nuevo) | Cualquier integrante, o una sugerencia recibida en GitHub (HU-13.2-B) |
| Editar los archivos y abrir el PR | Un integrante con acceso al repositorio |
| Revisar contenido y fuente contra la guía | Quien tenga la guía en la mano (D-03) |
| **Aprobar la publicación** | **El Product Owner.** Nadie más llena `reviewedBy`, `reviewedAt` ni `approvedBy`, y un agente nunca lo hace por su cuenta (CLAUDE.md §11.8) |
| Integrar el PR | Según la regla de revisión vigente (D-05, D-22) |

## 2. Corregir o agregar un consejo

1. Crea una rama: `content/SCR-04-correccion` (o el ID que corresponda).
2. Edita `src/data/tips.json`:
   - En el consejo que cambias, sube `version` en 1. Un consejo nuevo empieza en `1`.
   - Vacía `reviewedBy` y `reviewedAt` del consejo que cambiaste: la aprobación anterior ya no aplica.
   - Sube `catalogVersion` del catálogo: *patch* (1.0.**1**) para correcciones de texto, *minor* (1.**1**.0) para consejos nuevos, *major* (**2**.0.0) si cambia la estructura del esquema.
   - Pon en `updatedAt` la fecha de hoy (`AAAA-MM-DD`).
3. Agrega al final de `src/data/catalog-changelog.json` una entrada:
   ```json
   {
     "version": "1.0.1",
     "date": "2026-11-18",
     "author": "Nombre de quien hizo el cambio",
     "tips": ["SCR-04"],
     "summary": "Qué cambió y por qué, en una o dos frases.",
     "approvedBy": "",
     "pr": 70
   }
   ```
   `approvedBy` se queda vacío hasta que el PO apruebe (paso 6). `pr` se puede agregar cuando ya existe el número del PR.
4. Corre en PowerShell:
   ```powershell
   npm run validate:tips
   npm run check
   ```
   El validador revisa los campos de cada consejo, que `catalogVersion` sea semver, que `updatedAt` sea una fecha válida y que la versión publicada tenga su entrada en la bitácora con la misma fecha. Si falla, dice qué consejo y qué regla.
5. Abre el PR con el título `content(<ID>): <qué cambió>`. El CI vuelve a correr el validador.

## 3. Vista previa antes de publicar

- Vercel crea una **vista previa del PR**: el enlace aparece en el propio PR.
- El PO abre la ficha del consejo en esa vista previa (por ejemplo `/tip/SCR-04`) y la compara con producción. **Producción no cambia** hasta que el PR se integra.

## 4. Publicación aprobada

6. Si el PO aprueba, en el mismo PR:
   - llena `reviewedBy` y `reviewedAt` del consejo que cambió;
   - llena `approvedBy` de la entrada nueva de la bitácora;
   - deja su aprobación escrita en el PR (comentario o revisión).
7. Antes de un release, `npm run validate:tips:release` **falla** si la versión publicada no tiene `approvedBy` o si algún consejo no tiene aprobación.
8. Al integrar el PR, Vercel despliega producción automáticamente. El catálogo viaja dentro del despliegue: no hay caché sin conexión que actualizar (no hay PWA, D-23).

## 5. Revertir un cambio publicado

Si un cambio publicado resulta incorrecto:

1. En GitHub, abre el PR integrado y usa **Revert**; o en PowerShell:
   ```powershell
   git checkout main
   git pull
   git checkout -b revert/content-SCR-04
   git revert <hash-del-commit-del-PR>
   npm run validate:tips
   git push -u origin revert/content-SCR-04
   ```
2. El revert regresa **juntos** `tips.json` y `catalog-changelog.json` a la versión anterior, así que el validador sigue en verde. No se pierde ningún otro consejo.
3. Abre el PR del revert, intégralo y comprueba en producción que la ficha muestra el texto anterior.
4. Si el problema es urgente y no hay tiempo para un PR, usa el rollback de Vercel descrito en `docs/OPERACION.md` y después haz el revert en Git para que el repositorio coincida con producción.

La prueba automática `tests/unit/catalog-changelog.test.js` simula este ciclo: publica un cambio, comprueba que sin entrada en la bitácora falla y que al revertir el catálogo anterior vuelve completo y válido.

## 6. Reglas que no cambian
- Cada consejo cita una fuente verificable con su edición; la página solo se anota si se comprobó (D-03).
- Se parafrasea; nunca se copia texto de las guías.
- Scrum y PMI/PMBOK no se presentan como equivalentes.
