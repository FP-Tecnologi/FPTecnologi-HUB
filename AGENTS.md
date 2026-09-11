# FPTecnologi-HUB — contexto para agentes de IA

Este archivo es la fuente canónica de contexto del proyecto para cualquier
asistente de IA (Claude Code, GitHub Copilot, Cursor, Codex, etc.). Léelo
antes de tocar código. Otros archivos de instrucciones del repo
(`CLAUDE.md`, `.github/copilot-instructions.md`) apuntan aquí para no
duplicar contenido — si algo cambia, actualízalo solo en este archivo.

## Qué es esto

Sistema centralizado para administrar 5 marcas de una misma empresa —
`fptecnologi`, `fimavperu`, `kelqa`, `imaninki`, `quamtu` — cada una con su
propia web pública, todas administradas desde un único dashboard. Rubro:
venta de soluciones/dispositivos TI (ecommerce con stock) + servicios TI
para empresas (B2B, por cotización).

Documentación de negocio completa (alcance, fases, roles, costos) en:
- [`docs/documentacion-tecnica.md`](docs/documentacion-tecnica.md)
- [`docs/plan-trabajo.md`](docs/plan-trabajo.md) (cronograma — las fechas son
  estimadas, no tratarlas como compromiso fijo)

Mapa navegable del código + docs (comunidades, nodos más conectados,
conexiones no obvias entre la documentación y la implementación real) en
[`graphify-out/GRAPH_REPORT.md`](graphify-out/GRAPH_REPORT.md) — generado con
`graphify` (ver `~/.claude/skills/graphify`), cubre hoy `apps/api` + los docs
de contexto (no incluye `apps/web`, que es boilerplate de Vireo). Regenerar
con `/graphify --update` cuando el código avance bastante.

## Principio de arquitectura (no romper esto)

**Una sola API (NestJS), una sola base de datos (PostgreSQL/Supabase),
separación lógica por `marcaId`** — nunca por infraestructura separada. Todo
dato propio de una marca (productos, pedidos, contenido, equipo asignado)
lleva `marcaId` y se filtra **server-side**, a partir del JWT o de un
`x-marca-id` verificado contra los permisos del usuario — nunca confiando en
un `marcaId` que mande el cliente sin validar.

`Marca` (entidad de negocio) y `Sitio` (dominio → `marcaId`) son conceptos
distintos: hoy 1 marca = 1 sitio, pero el modelo permite que una marca tenga
varios sitios sin migrar nada.

Toda autenticación pasa por la API central (JWT + Refresh Token + OTP por
correo) — no se usa NextAuth ni login independiente por sitio.

## Estructura del repo

```
apps/
  api/    NestJS — API central (Prisma + PostgreSQL/Supabase)
  web/    Next.js + Vireo — HOY es el dashboard administrativo
          (el nombre "web" es heredado de la plantilla Vireo; no es la
          web pública de fptecnologi.com, esa app todavía no existe)
docs/     Documentación de negocio y planificación
```

No hay todavía `packages/shared-types` ni `turbo` — el repo usa npm
workspaces (`package.json` raíz) como monorepo mínimo. Se agrega
`shared-types` cuando exista una segunda app consumidora de los mismos DTOs
(la futura web pública de fptecnologi).

## Stack

- **API**: NestJS 12 (ESM, `"type": "module"`), Prisma 6 + PostgreSQL
  (Supabase), `@nestjs/jwt` + `passport-jwt`, `bcrypt`, `class-validator`,
  Resend (correo transaccional), Swagger en `/docs`.
- **Dashboard** (`apps/web`): Next.js 15 (App Router) + React 19 +
  Tailwind v4, plantilla comercial Vireo (Envato). Ver
  [`VIREO-REFERENCE.md`](VIREO-REFERENCE.md) antes de construir una pantalla
  nueva — probablemente Vireo ya trae un patrón parecido.
- **Testing**: Vitest (`*.spec.ts` junto al archivo que prueban).
- **Package manager**: npm (no pnpm, no yarn) en todo el repo.

## Módulos de la API y rutas

| Módulo | Rutas | Notas |
| --- | --- | --- |
| `auth` | `POST /auth/register`, `/login`, `/otp/request`, `/otp/verify`, `/refresh`, `/logout` | Login en 2 pasos: `login` valida credenciales y manda OTP; `otp/verify` recién devuelve JWT+refresh |
| `marcas` | CRUD `/marcas` | Entidad de negocio |
| `sitios` | CRUD `/sitios`, `GET /sitios/resolver/:dominio` | Dominio → marcaId |
| `roles` | `/roles`, `/roles/asignaciones`, `/marcas/:marcaId/equipo`, `/usuarios/me/marcas` | Rol por usuario+marca (`UsuarioMarcaRol`) |
| `productos` | CRUD `/productos`, `/productos/categorias*` | Filtrado server-side por marcaId |
| `pedidos` | CRUD `/pedidos`, `PATCH /pedidos/:id/estado` | `cliente` reusa el modelo `Usuario`, no hay `Cliente` aparte |
| `servicios` | CRUD `/servicios` | Catálogo de servicios TI (B2B) |
| `cotizaciones` | CRUD `/cotizaciones`, `PATCH /:id/estado` | Solicitudes de cotización sobre un servicio |
| `notificaciones` | `/notificaciones`, `PATCH /:id/leida`, `/leidas/todas` | Centro de notificaciones del dashboard |
| `public` | `GET /public/productos`, `/public/productos/:id`, `/public/servicios`, `/public/servicios/:id` | Sin auth — para las webs públicas |
| `mail` | — | Wrapper de Resend, usado por `auth` (OTP) y `pedidos` (confirmación) |
| `health` | `GET /health` | — |

Guard global: `JwtAuthGuard` corre en todas las rutas salvo `@Public()`.
`MarcaRolGuard` se aplica explícitamente donde se necesita filtrar por
marca/rol — lee `x-marca-id` (header) o `marcaId` (query), y verifica contra
`user.marcas` (viene del JWT). `@Roles('admin', ...)` restringe por rol
dentro de esa marca.

## Modelo de datos (Prisma)

Ver [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma) —
es la fuente de verdad, no la dupliques en prosa aquí porque se desactualiza.
Modelos clave: `Marca`, `Sitio`, `Usuario`, `OtpCode`, `RefreshToken`, `Rol`,
`UsuarioMarcaRol`, `Categoria`, `Producto`, `Pedido`/`PedidoItem`,
`Servicio`, `Cotizacion`, `Notificacion`.

## Roles del sistema

Admin, Dirección/Gerencia (solo lectura, reportes cruzados), Comercial
(B2B), Ventas (ecommerce), Marketing (limitado a su(s) marca(s)), Asesores,
Soporte técnico/Postventa, Logística/Almacén, Finanzas/Facturación (fase
futura), Cliente/portal (fase futura). Detalle en
[`docs/documentacion-tecnica.md`](docs/documentacion-tecnica.md#6-roles-y-permisos).

## Fuera de alcance (por ahora)

Pasarela de pago, facturación electrónica SUNAT, logística de envíos, CRM
de campañas. El modelo de datos y la API quedan preparados para sumarlos
sin rediseño — no construir nada de esto de forma anticipada.

## Convenciones

- Nombres de modelos, campos y rutas de negocio en **español** (`Marca`,
  `Pedido`, `/cotizaciones`); nombres técnicos de código (variables,
  funciones internas) en inglés donde ya es la norma de NestJS/TS.
- Toda ruta que devuelva o filtre datos propietarios de una marca DEBE
  resolver el `marcaId` server-side (JWT o `MarcaRolGuard`), nunca
  confiar en un campo `marcaId` del body.
- Tests: Vitest, unitarios primero para lo sensible (auth, guards de
  permisos) antes de sumar features nuevas encima.
- Antes de construir una pantalla nueva en `apps/web`, revisar si Vireo ya
  trae un patrón parecido (ver `VIREO-REFERENCE.md`).
- Secrets viven en `.env` (gitignorado), nunca en el código ni en
  `.env.example`.

## Estado actual / próximos pasos

Backend (Fase 1 del plan) funcionalmente completo: auth+OTP, roles,
marcas/sitios, productos/categorías, pedidos, servicios/cotizaciones,
notificaciones, endpoints públicos, Swagger, tests de `AuthService` y
`MarcaRolGuard`.

CI/CD y seguridad del repo (ya configurado, ver `.github/`):
- `workflows/ci.yml`: build + lint + test de `apps/api` y `apps/web` en
  cada push/PR a `main`.
- `workflows/codeql.yml`: análisis estático de seguridad (CodeQL) en
  push/PR a `main` y semanal.
- `workflows/dependency-audit.yml`: `npm audit` informativo en
  push/PR y semanal (no bloquea el merge todavía).
- `workflows/copilot-setup-steps.yml`: preinstala Node + deps + Prisma
  client para el entorno del Copilot coding agent (cloud).
- `dependabot.yml`: actualizaciones semanales de npm (`apps/api`,
  `apps/web`) y de GitHub Actions.
- `SECURITY.md`: política de reporte de vulnerabilidades y checklist de
  configuración recomendada a nivel de repo (branch protection, secret
  scanning, etc. — requieren rol admin, no se pueden setear por código).

Pendiente:
- Conectar `DATABASE_URL` a un proyecto Supabase real (hoy apunta a
  Postgres local en `.env.example`).
- Crear la web pública de fptecnologi.com (Next.js + shadcn/ui, sin login,
  consume `/public/*`) — todavía no existe como app separada.
- Activar en Settings → Code security: Dependabot alerts, secret scanning
  + push protection, y una branch protection rule en `main` que exija los
  checks de CI (ver `SECURITY.md`).
- Revisar manualmente las vulnerabilidades de `devDependencies` reportadas
  por `npm audit` en `apps/api` (tooling de NestJS/Prisma) — requieren
  upgrades breaking, no se resolvieron automáticamente.
- Infra externa (Cloudflare, Hostinger, Sentry) — fuera del alcance de un
  agente de código, requiere acceso a esas cuentas.
