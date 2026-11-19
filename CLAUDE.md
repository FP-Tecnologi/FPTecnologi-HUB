# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Contexto (arquitectura, convenciones, estado) en [`AGENTS.md`](AGENTS.md): es la fuente canónica y está **corto a propósito** (~11 KB); léelo antes de tocar código y
actualízalo allí, no aquí. El detalle largo está aparte y **no se carga solo**: API y stack → [`docs/API-MODULOS.md`](docs/API-MODULOS.md); despliegue →
[`docs/DESPLIEGUE-CPANEL.md`](docs/DESPLIEGUE-CPANEL.md); avance real → [`docs/ESTADO-ACTUAL.md`](docs/ESTADO-ACTUAL.md) (140 KB: búscalo por fecha, no lo leas entero);
pendientes → [`docs/PENDIENTES.md`](docs/PENDIENTES.md); plan y negocio (congelados) → `docs/documentacion-tecnica.md`, `docs/plan-trabajo.md`.

## Gastar pocos tokens

- Entiende el código con el grafo antes de abrir archivos: `graphify query "<pregunta>"`, `graphify explain "<nodo>"`, `graphify path "A" "B"` (necesita `graphify` en el PATH, ver AGENTS.md → Mapas).
  Resumen visual en `docs/arquitectura/*.html` (no los abras como texto).
- Lee archivos o carpetas concretos; usa Grep con `head_limit` y lee solo el tramo que importa. No abras PDF, `public/`, `node_modules`, `.next`, lockfiles ni `graphify-out/graph.json`.
- Una tarea por sesión; lo que haya que recordar queda en git, en `docs/` o en la memoria del proyecto.

## Comandos

No hay workspace raíz: cada app es un proyecto npm independiente. Corre `npm install` y los
scripts **dentro de la app** (`cd apps/<app>`), siempre con npm (no pnpm/yarn).

| App | Puerto | Dev | Build | Lint |
| --- | --- | --- | --- | --- |
| `apps/api` (NestJS) | 3001 | `npm run start:dev` | `npm run build` | `npm run lint` (oxlint) |
| `apps/admin` (dashboard, Next 16) | 3000 | `npm run dev` | `npm run build` | `npm run lint` |
| `apps/web-fptecnologi` (web pública, Next 16) | 3002 | `npm run dev -- --port 3002` | `npm run build` | `npm run lint` |
| `apps/fimav-web` (web pública Fimav Perú, Next 16) | 3005 | `npm run dev -- --port 3005` | `npm run build` | `npm run lint` |
| `apps/kelqa-web` (web pública Kelqa, Next 16) | 3007 | `npm run dev -- --port 3007` | `npm run build` | `npm run lint` |
| `apps/imaninki-web` (web pública Imaninki, Next 16; negro/rojo/plata) | 3008 | `npm run dev -- --port 3008` | `npm run build` | `npm run lint` |
| `apps/imc-web` (web pública Company IMC E.I.R.L., Next 16, exportación estática; azul/naranja, hexágonos) | 3009 | `npm run dev -- --port 3009` | `npm run build` (deja `out/`) | `npm run lint` |
| `apps/quamtu-web` (web pública Quamtu, Next 16, exportación estática) | 3004 | `npm run dev -- --port 3004` | `npm run build` (deja `out/`) | `npm run lint` |

`.claude/launch.json` define estos servidores (`api`, `admin`, `web-fptecnologi`, `fimav-web`, `kelqa-web`, `imaninki-web`, `imc-web`, `leads` → repo aparte) para
`preview_start`.

Tests (solo `apps/api`, Vitest, `*.spec.ts` junto al archivo probado):
- Todos: `npm test` · watch: `npm run test:watch` · e2e: `npm run test:e2e`
- Un archivo: `npx vitest run src/auth/auth.service.spec.ts`
- Un test por nombre: `npx vitest run -t "nombre del test"`

Prisma (en `apps/api`, requiere `.env` con `DATABASE_URL`; ver `.env.example`):
- `npx prisma generate` tras `npm install` o cambios en `prisma/schema.prisma`
- `npx prisma migrate dev --name <cambio>` para crear una migración
- Contra Supabase, las migraciones deben correr por el puerto **5432** (session mode); el pooler
  6543 deja colgado `prisma migrate`. Hay scripts auxiliares en `prisma/` (`apply-migrations.ts`,
  `db-status.ts`, `import-woocommerce.ts`, `seeds/`).
- Swagger en `http://localhost:3001/docs`; health en `GET /health`.

## Arquitectura (resumen; el detalle está en AGENTS.md)

- **Multi-marca en una API y una base**, separado por `marcaId` resuelto server-side (JWT o `x-marca-id` verificado por `MarcaRolGuard`), nunca desde el body. **Doble candado**:
  `MarcaRolGuard` (HTTP) + `src/prisma/tenant-guard.extension.ts` (DB): un `findMany` sin `marcaId` en un service nuevo falla ruidosamente, a propósito.
- `JwtAuthGuard` es global; las rutas públicas llevan `@Public()` (bajo `/public/*`). Respuestas envueltas: `{ success, statusCode, data, timestamp }`.
- `Marca` (negocio) ≠ `Sitio` (dominio → `marcaId`). Una web nueva solo necesita una fila en `Sitio`; el dashboard es único con selector de marca (parte de Vireo: revisa `VIREO-REFERENCE.md`).
- Las webs leen `/public/*` con caché de 30 s (ISR) y usan su contenido local solo como respaldo; Quamtu es estática. Leads vive en otro repo (`centralizacion-leads`).

## Flujo de trabajo

- Se trabaja en `develop`; `main` es **producción**. Tras cada cambio terminado y verificado
  (tsc + navegador, todo bien), commit y push a `develop`, y luego fast-forward de `main`
  (`git pull --rebase origin develop`; push develop; `checkout main`; `merge --ff-only develop`;
  push main; volver a develop). No preguntar antes. Si algo no está bien, no pasa a `main`.
- **Repos espejo**: el HUB (este, `FP-Tecnologi/FPTecnologi-HUB`) tiene TODO (API, dashboard, webs). Cada web pública tiene además un
  repo espejo con **solo esa web en su raíz**: `apps/web-fptecnologi` → `fptecnologi-web`, `apps/fimav-web` → `fimav-peru` (privado),
  `apps/quamtu-web` → `quamtu-web` (privado), `apps/kelqa-web` → `kelqa-web`, `apps/imaninki-web` → `imaninki-web`, `apps/imc-web` → `imc-web` (privado). Cada vez que un cambio toque una de esas apps, tras subir a `develop` y `main` del
  HUB, publicar su espejo (main y develop del repo quedan iguales): `TMPDIR=/tmp bash scripts/publicar-snapshot.sh` (fptecnologi),
  `... publicar-snapshot.sh fimav-web fimav-peru Fimav`, `... publicar-snapshot.sh quamtu-web quamtu-web Quamtu`, `... publicar-snapshot.sh kelqa-web kelqa-web Kelqa`, `... publicar-snapshot.sh imaninki-web imaninki-web Imaninki`, `... publicar-snapshot.sh imc-web imc-web "Company IMC"`. Nunca editar a mano
  esos repos. El script no crea repos: deben existir y la cuenta de git debe poder escribir en ellos.
- Multimedia sin uso (imágenes, video, audio) no se deja en `main`: se mueve a la rama de archivo `archivo-multimedia` (misma ruta) y se borra de `main`. Recuperar con `git checkout archivo-multimedia -- <ruta>`. Esa rama no se elimina ni se mezcla.
- Las ramas que ya no sirven (mergeadas o abandonadas) se eliminan; no dejar ramas viejas.
- Antes de `git add`, revisa `git status` por archivos de otras sesiones; nunca subas
  `envs/.env` ni `envs/.env.local`.
- Nombres de negocio (modelos, campos, rutas) en español; nombres técnicos internos en inglés.
