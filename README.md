# TamalEcho Tips

Web que enseña conceptos de **Scrum** y **PMI/PMBOK** con consejos breves. Hecha con React + JavaScript (Vite).
Acceso público, sin registro.

> Reglas del proyecto para personas y agentes: [`CLAUDE.md`](CLAUDE.md). Decisiones vigentes: [`docs/DECISIONES.md`](docs/DECISIONES.md). Plan del sprint: [`docs/sprint-1/PLAN.md`](docs/sprint-1/PLAN.md).

## Requisitos

| Herramienta | Versión | Cómo comprobarla |
|---|---|---|
| Node.js | **22.13.0 o superior** (ver `.nvmrc`) | `node -v` |
| npm | La que trae Node | `npm -v` |
| Git | Cualquiera reciente | `git --version` |

¿Por qué 22.13.0? Es la versión mínima que cumplen todas las dependencias; la más estricta es `jsdom` 29. Si tu `node -v` muestra algo menor, instala la versión LTS más reciente desde [nodejs.org](https://nodejs.org).

## Instalación (Windows + PowerShell)

```powershell
git clone https://github.com/techbeariasolutions-maker/tamalecho.git
cd tamalecho
npm ci
npx playwright install chromium
npm run check
npm run test:e2e
npm run dev
```

- `npm ci` instala exactamente las versiones de `package-lock.json`. Usa `npm ci` y no `npm install`, salvo que estés agregando una dependencia.
- `npx playwright install chromium` descarga el navegador de las pruebas E2E. Se hace una vez por máquina y cada vez que se actualiza Playwright.
- `npm run dev` abre la app en <http://localhost:5173>. Se detiene con `Ctrl + C`.

**Si PowerShell dice «no se puede cargar el archivo npm.ps1 porque la ejecución de scripts está deshabilitada»**, ejecuta una sola vez:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

## Scripts

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo en <http://localhost:5173>, con recarga automática. |
| `npm run build` | Compila la versión de producción en `dist/`. |
| `npm run preview` | Sirve lo que hay en `dist/` para revisarlo antes de publicar. |
| `npm run lint` | Revisa el código con ESLint, incluidas las reglas de accesibilidad (`jsx-a11y`) y de React Hooks. |
| `npm run test` | Pruebas unitarias y de renderizado (Vitest, en `tests/unit/`). |
| `npm run test:watch` | Igual que `test`, pero se repite al guardar cambios. |
| `npm run test:e2e` | Pruebas de extremo a extremo (Playwright, en `tests/e2e/`) en escritorio (1280 × 800) y móvil (360 × 740). |
| `npm run evidence` | Corre las pruebas de 360 px y de accesibilidad (axe) y guarda las evidencias: capturas en `docs/evidencias/sprint-1/360/` y `docs/evidencias/sprint-1/axe-resumen.json`. Solo este script escribe esos archivos; `test:e2e` y el CI no los tocan. |
| `npm run validate:tips` | Valida `src/data/tips.json` con las reglas de `src/data/schema.js`. Sale con código 1 y dice qué tip y qué regla fallan. La falta de aprobación es solo advertencia. |
| `npm run validate:tips:release` | Igual, pero exige al menos 12 consejos por enfoque y `reviewedBy` + `reviewedAt` en todos. |
| `npm run check:links` | Revisa que cada URL de fuente responda. Usa la red: solo local, no va en CI. Si un sitio bloquea scripts, ábrelo a mano antes de darlo por roto. |
| `npm run check` | `lint` + `validate:tips` + `test` + `build`. **Debe pasar antes de abrir un PR.** |

> **Nota:** en Windows, la primera corrida de `test:e2e` después de instalar Chromium puede exceder el tiempo límite por el arranque en frío; repetirla una vez con el puerto 4173 libre.

## Flujo Git (resumen de `CLAUDE.md` §9)

- `main` está protegida: solo entra código por PR con el CI en verde.
- Una rama por paquete de trabajo (WP): `chore/HT-01-base`, `feat/HU-02-biblioteca`, `content/HT-03-tips`, `fix/HU-03-enlaces`.
- Commits con el ID de la actividad: `feat(HU-02.1-A): selector de enfoque con categorías`.
- El título del PR lleva los IDs. La descripción incluye qué cambió, cómo probarlo paso a paso, el checklist de la Definition of Done (PLAN §7) y una captura si hay interfaz.
- Squash merge y se borra la rama.
- Código, ramas y commits en inglés (salvo los IDs). Interfaz en español de México.

## Web Push

Los avisos con la pestaña cerrada usan funciones de Vercel (`api/push/`), con la lógica en `server/` (D-21). Las suscripciones se guardan en Upstash Redis.

**Variables de entorno.** Sus nombres están en `.env.example`. Los valores se configuran en Vercel (proyecto → Settings → Environment Variables) y nunca entran al repositorio.

| Variable | Tipo en Vercel | Para qué |
|---|---|---|
| `VAPID_PUBLIC_KEY`, `VITE_VAPID_PUBLIC_KEY` | Config | Clave pública; la segunda la recibe el navegador |
| `VAPID_SUBJECT` | Config | Identifica al remitente ante los servicios de push |
| `VAPID_PRIVATE_KEY`, `DISPATCH_SECRET` | Secret | Firmar los avisos y proteger el disparador |
| `KV_REST_API_URL`, `KV_REST_API_TOKEN` | Las crea Upstash | Conexión al almacén |

`DISPATCH_SECRET` también va en GitHub → Settings → Secrets and variables → Actions.

**Envío de prueba.** GitHub → Actions → `push-dispatch` → Run workflow. Llama a `/api/push/dispatch` en producción y su registro muestra cuántos avisos se enviaron, cuántas suscripciones caducadas se borraron y cuántos envíos fallaron.

Las vistas previas de Vercel están protegidas, así que el flujo solo funciona contra producción.

## Despliegue y rollback

El sitio se publica en **Vercel**, conectado a este repositorio de GitHub.

| Rama | Qué se publica |
|---|---|
| `main` | **Producción**: la URL pública del proyecto. Cada merge a `main` se despliega solo. |
| Cualquier PR | Una **vista previa** con su propia URL `https://`. Vercel la deja como comentario en el PR. |

- `vercel.json` hace que cualquier ruta (por ejemplo `/biblioteca/pmbok`) entregue `index.html`. Sin eso, abrir o recargar una ruta interna daría 404, porque la navegación la resuelve React en el navegador, no el servidor.
- El CI (`.github/workflows/ci.yml`, check `CI`) corre lint, validador, pruebas unitarias, build y E2E en cada PR y en cada push a `main`. Si fallan las E2E, el reporte queda como artefacto `playwright-report` en la pestaña *Actions* de esa corrida.

### Rollback (volver a una versión anterior)

**Opción 1 · Vercel (inmediata, sin tocar el código).** Úsala cuando producción está rota y hay que arreglarlo ya:
1. Vercel → proyecto `tamalecho` → **Deployments**.
2. Busca el último despliegue de producción que funcionaba.
3. Menú `⋯` → **Instant Rollback** (o **Promote to Production**).
4. Abre la URL pública y comprueba que volvió la versión anterior.

**Importante después de un rollback** (según la [documentación oficial de Vercel](https://vercel.com/docs/instant-rollback)):
- Vercel **desactiva la asignación automática de los dominios de producción**. Los merges nuevos a `main` **no se publican** en la URL pública.
- Cuando el arreglo ya esté en `main`, presiona **Undo Rollback** en el recuadro de producción del proyecto para que los despliegues vuelvan a publicarse solos.
- En el plan **Hobby** (gratuito) solo se puede volver al despliegue de producción **inmediatamente anterior**. Si hay que retroceder más, usa la opción 2.

**Opción 2 · Git (deja registro en el historial).** Úsala para deshacer un cambio de forma definitiva:
1. Identifica el commit del merge que causó el problema: `git log --oneline`.
2. `git checkout main`, `git pull` y `git checkout -b fix/revert-<descripcion>`.
3. `git revert <sha>` y luego `git push -u origin fix/revert-<descripcion>`.
4. Abre un PR. Cuando el CI esté en verde, haz el merge: Vercel publica la versión corregida.
