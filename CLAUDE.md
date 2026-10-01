# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Contexto completo (arquitectura, stack, módulos de la API, convenciones, estado) vive en
[`AGENTS.md`](AGENTS.md) — es la fuente canónica, compartida con otros agentes (Copilot,
Cursor, etc.). Léelo antes de tocar código; si algo cambia, actualízalo allí, no aquí.
Documentación de negocio: [`docs/documentacion-tecnica.md`](docs/documentacion-tecnica.md) y
[`docs/plan-trabajo.md`](docs/plan-trabajo.md) (congelados). Avance real:
[`docs/ESTADO-ACTUAL.md`](docs/ESTADO-ACTUAL.md) (documento vivo).

## Comandos

No hay workspace raíz: cada app es un proyecto npm independiente. Corre `npm install` y los
scripts **dentro de la app** (`cd apps/<app>`), siempre con npm (no pnpm/yarn).

| App | Puerto | Dev | Build | Lint |
| --- | --- | --- | --- | --- |
| `apps/api` (NestJS) | 3001 | `npm run start:dev` | `npm run build` | `npm run lint` (oxlint) |
| `apps/web` (dashboard, Next 15) | 3000 | `npm run dev` | `npm run build` | `npm run lint` |
| `apps/web-fptecnologi` (web pública, Next 16) | 3002 | `npm run dev -- --port 3002` | `npm run build` | `npm run lint` |

`.claude/launch.json` define estos servidores (`api`, `web`, `web-fptecnologi`, `leads` → repo aparte) para
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

## Arquitectura (lo que no se ve en un solo archivo)

- **Multi-marca en una sola API y una sola DB**, separado por `marcaId`, nunca por
  infraestructura. El `marcaId` se resuelve server-side (JWT o `x-marca-id` verificado por
  `MarcaRolGuard`), nunca desde el body.
- **Doble candado**: `MarcaRolGuard` (HTTP) valida acceso al `marcaId` declarado;
  `src/prisma/tenant-guard.extension.ts` (DB) lanza error si una query sobre un modelo con
  `marcaId` no lo incluye en `where`/`data`. Un `findMany` sin `marcaId` en un service nuevo
  falla ruidosamente: es intencional.
- `JwtAuthGuard` es global; las rutas públicas llevan `@Public()` (viven bajo `/public/*`).
  Respuestas envueltas por `ResponseInterceptor` / `AllExceptionsFilter`
  (`{ success, statusCode, data, timestamp }`).
- `Marca` (negocio) ≠ `Sitio` (dominio → `marcaId`). El dashboard es único con selector de marca;
  una web nueva solo necesita una fila en `Sitio`.
- `apps/web` parte de la plantilla Vireo: antes de una pantalla nueva revisa
  [`VIREO-REFERENCE.md`](VIREO-REFERENCE.md). Solo `SignInBasic`, `TwoStepBasic` y `TwoStepTotp`
  hablan con la API real; el resto de `src/screens/auth/` es demo.
- `apps/web-fptecnologi` aún usa contenido hardcodeado en `src/lib/content.ts` (y defaults del CMS
  en `src/lib/homeContenido.ts`) en vez de consumir `GET /public/*`.
- El sistema de leads vive solo en el repo `centralizacion-leads` (otra base Supabase); aquí no hay copia.

## Flujo de trabajo

- Se trabaja en `develop`; `main` es **producción**. Tras cada cambio terminado y verificado
  (tsc + navegador, todo bien), commit y push a `develop`, y luego fast-forward de `main`
  (`git pull --rebase origin develop`; push develop; `checkout main`; `merge --ff-only develop`;
  push main; volver a develop). No preguntar antes. Si algo no está bien, no pasa a `main`.
- Las ramas que ya no sirven (mergeadas o abandonadas) se eliminan; no dejar ramas viejas.
- Antes de `git add`, revisa `git status` por archivos de otras sesiones; nunca subas
  `envs/.env` ni `envs/.env.local`.
- Nombres de negocio (modelos, campos, rutas) en español; nombres técnicos internos en inglés.
