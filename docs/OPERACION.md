# Operación de TamalEcho Tips (HT-08.2-B)

> Qué hacer después de cada despliegue, cómo volver atrás si algo se rompe, dónde está el respaldo del contenido y qué vigilar.
> Producción: <https://tamalecho.vercel.app> · Hosting: Vercel (plan Hobby) · Repositorio: GitHub · Las cuentas de Vercel y de GitHub las administra Alan.
> **El acta de aceptación final no está aquí:** la redacta una persona (PLAN S3 §4).

## 1. Cómo se despliega
- Cada PR tiene una **vista previa** de Vercel; el enlace aparece en el PR. Las vistas previas están protegidas, así que `/api/push/dispatch` no se puede llamar desde Actions en ellas (D-21).
- Integrar un PR a `main` despliega **producción** automáticamente.
- El catálogo, los textos de Ayuda y Privacidad y el personaje viajan dentro de cada despliegue. No hay base de datos de contenido ni caché sin conexión que sincronizar.
- Lo único que vive fuera del despliegue son las suscripciones push (Upstash Redis) y las variables de entorno de Vercel.

## 2. Revisión después de cada despliegue a producción (≈ 5 min)
1. Abrir `/`: carga, muestra el consejo destacado y el personaje.
2. Abrir `/biblioteca/scrum` y una ficha (`/tip/SCR-01`).
3. Abrir `/ajustes`, `/ayuda` y `/privacidad`.
4. DevTools → Console: sin errores rojos.
5. Si el cambio tocó Web Push: GitHub → Actions → `push-dispatch` → *Run workflow* con un navegador suscrito, y comprobar que llega el aviso.
6. Si algo falla, ir a §3.

## 3. Volver atrás (rollback)

### 3.1 Rollback inmediato en Vercel (minutos)
Para cuando producción está rota y hay que restaurarla ya.
- **Panel:** Vercel → proyecto → *Deployments* → el despliegue de producción anterior → menú «⋯» → *Instant Rollback* (el panel puede cambiar el nombre o el lugar del menú; si no aparece, usa la CLI).
- **CLI** (si se instala con `npm i -g vercel` y se inicia sesión):
  ```powershell
  vercel rollback
  vercel rollback status
  ```
- **Límite del plan Hobby** (documentación de `vercel rollback`): solo se puede volver al despliegue de producción **inmediatamente anterior**. Para ir más atrás, usa §3.2.
- **Ojo:** después de un rollback, Vercel **deja de asignar producción automáticamente** a los despliegues nuevos. Para reactivarlo, cuando la corrección esté lista, promueve el despliegue bueno desde el panel (*Promote*) o con `vercel promote <url-del-despliegue>` (documentación de *Instant Rollback*).

### 3.2 Revertir en Git (el arreglo definitivo)
El rollback de Vercel no cambia el repositorio. Para que `main` y producción coincidan:
```powershell
git checkout main
git pull
git checkout -b revert/<lo-que-se-revierte>
git revert <hash-del-commit-del-PR>
npm run check
git push -u origin revert/<lo-que-se-revierte>
```
Abre el PR del revert. Cuando el CI esté en verde, intégralo. Si antes hiciste un rollback en Vercel, promueve el nuevo despliegue (§3.1, «Ojo»).

### 3.3 Revertir un cambio de contenido
Igual que §3.2, siguiendo `docs/EDITORIAL.md` §5: el revert regresa juntos `tips.json` y su bitácora.

## 4. Respaldo
| Qué | Dónde está el respaldo | Cómo se recupera |
|---|---|---|
| Código, catálogo, textos de Ayuda y Privacidad | Historial de Git en GitHub; cada versión entregada tiene su tag (`v0.1.0`, `v0.2.0`, `v1.0.0`) | `git checkout <tag>` o `git revert` |
| Historial de cambios del contenido | `src/data/catalog-changelog.json` y los PR enlazados | Ver la entrada y su PR |
| Despliegues anteriores | Lista de *Deployments* de Vercel | §3.1 |
| Suscripciones push | **Sin respaldo, a propósito.** No tienen datos personales y se pueden recrear: si se pierden, cada persona vuelve a pulsar «Activar avisos» | — |
| Variables de entorno (claves VAPID, secreto del disparador, token del almacén) | Solo en Vercel y en GitHub Secrets | Si se pierden, generar claves nuevas. Con claves VAPID nuevas, las suscripciones anteriores dejan de servir y hay que volver a activarlas |

## 5. Monitoreo mínimo
No hay analítica ni rastreo (CLAUDE.md §2). Se vigila con lo que ya da cada servicio:
| Qué | Dónde | Cuándo mirar | Señal de problema |
|---|---|---|---|
| Errores de las funciones `/api/push/*` | Vercel → proyecto → *Logs* (filtrar por la ruta) | Después de cada envío de push y tras un despliegue | Respuestas 5xx; el mensaje «No se pudo enviar un aviso. Código: …» |
| Resultado de cada envío | GitHub → Actions → `push-dispatch` → la corrida → paso *Call the production dispatch endpoint* | Después de cada corrida | El JSON muestra `failed` mayor que 0, o el paso termina en error (401: revisar `DISPATCH_SECRET`; 503: faltan las claves VAPID) |
| Uso del almacén | Panel de Upstash (cuenta conectada desde Vercel) | Una vez por semana | Comandos cerca del límite del plan gratuito (S-02 en `docs/sprint-3/SEGURIDAD.md`) |
| Estado del CI | GitHub → Actions → `CI` | En cada PR | Rojo en `main`: arreglar o revertir antes de integrar otra cosa |
| Dependencias vulnerables | `npm audit` | Antes de cada release | Cualquier hallazgo `high` o `critical` en producción |

## 6. Contactos y accesos
| Acceso | Quién lo tiene |
|---|---|
| Vercel (proyecto y variables) | Alan |
| GitHub (repositorio, Secrets, reglas de `main`) | Alan (dueño); Diego (colaborador) |
| Upstash (almacén) | La cuenta conectada desde Vercel |
