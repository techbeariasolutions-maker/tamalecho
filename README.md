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
| `npm run validate:tips` | Valida `src/data/tips.json`. *Pendiente: WP-3.* |
| `npm run validate:tips:release` | Validación estricta para el *release*. *Pendiente: WP-3.* |
| `npm run check:links` | Revisa que las URL de las fuentes respondan. Usa la red; solo local. *Pendiente: WP-7.* |
| `npm run check` | `lint` + `validate:tips` + `test` + `build`. **Debe pasar antes de abrir un PR.** |

## Flujo Git (resumen de `CLAUDE.md` §9)

- `main` está protegida: solo entra código por PR con el CI en verde.
- Una rama por paquete de trabajo (WP): `chore/HT-01-base`, `feat/HU-02-biblioteca`, `content/HT-03-tips`, `fix/HU-03-enlaces`.
- Commits con el ID de la actividad: `feat(HU-02.1-A): selector de enfoque con categorías`.
- El título del PR lleva los IDs. La descripción incluye qué cambió, cómo probarlo paso a paso, el checklist de la Definition of Done (PLAN §7) y una captura si hay interfaz.
- Squash merge y se borra la rama.
- Código, ramas y commits en inglés (salvo los IDs). Interfaz en español de México.

## Despliegue y rollback

*Pendiente: WP-4.*
