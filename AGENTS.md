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
- [`docs/documentacion-tecnica.md`](docs/documentacion-tecnica.md) y
  [`docs/plan-trabajo.md`](docs/plan-trabajo.md) — **congelados**, son la
  conversión literal de los docx originales del plan (fechas estimadas, no
  compromiso fijo). No se editan para reflejar avance real.
- [`docs/ESTADO-ACTUAL.md`](docs/ESTADO-ACTUAL.md) — **documento vivo**,
  se actualiza en cada sesión con fecha real: qué se hizo, qué cambió
  respecto al plan original (agregado/quitado/distinto). Léelo para saber
  dónde está el proyecto hoy sin reconstruirlo desde el git log.

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
varios sitios sin migrar nada. **El dashboard es único para todas las
marcas** (selector de marca activa) — una web/landing nueva no necesita
dashboard propio, solo una fila en `Sitio` apuntando a su `marcaId`.

`MarcaRolGuard` verifica que el usuario tenga acceso al `marcaId` que
*declara* (header/query) — no puede ver si el código que corre después
realmente filtró la query por esa marca. Ese segundo nivel lo cubre el
**tenant-guard** de Prisma (`src/prisma/tenant-guard.extension.ts`): tira
error en cualquier query sobre un modelo con `marcaId` que no lo incluya en
el `where`/`data`. Doble candado: guard de HTTP + guard de DB — un
`findMany` sin `marcaId` en cualquier service nuevo falla ruidosamente en
vez de filtrar datos de otra marca en silencio.

Toda autenticación pasa por la API central (JWT + Refresh Token + OTP por
correo) — no se usa NextAuth ni login independiente por sitio.

## Estructura del repo

```
apps/
  api/              NestJS — API central (Prisma + PostgreSQL/Supabase)
  web/              Next.js + Vireo — dashboard administrativo
                    (el nombre "web" es heredado de la plantilla Vireo)
  web-fptecnologi/  Next.js — web pública de fptecnologi.com (Fase 2,
                    sin login, catálogo/servicios/carrito/chat propios)
  leads/            COPIA CONGELADA — no editar (ver abajo)
docs/     Documentación de negocio y planificación
```

**Sistema de Centralización de Leads — vive en su propio repo** desde el
2026-09-28: [`FP-Tecnologi/centralizacion-leads`](https://github.com/FP-Tecnologi/centralizacion-leads)
(clonado localmente al lado de este repo, en `../centralizacion-leads`). Es el
`git subtree split` de `apps/leads`, con su historial. `apps/leads` aquí quedó
como copia de referencia: **los cambios se hacen en el repo nuevo**. Usa otra
base Supabase (`qpjxwtvmuqramhqoxkxj`, la de leads) que la del ERP
(`vzfdjpqvqxrooesxozjx`). Para vincularlos:
- en ejecución, por API (`api-v1` para leer leads con una "aplicación
  conectada", `ingresar-lead` para enviarlos desde webs del HUB);
- en código, el remoto `leads` de este repo apunta al repo nuevo:
  `git fetch leads && git subtree pull --prefix=apps/leads leads main` trae lo
  último. Detalle en el README del repo de leads.

No hay `packages/shared-types`, `turbo` ni npm workspaces — cada app
(`apps/api`, `apps/web`, `apps/web-fptecnologi`) es un proyecto npm
independiente con su propio `node_modules`/`package-lock.json`. Se probó un
`package.json` raíz con workspaces y se revirtió: npm hoisteaba paquetes de
forma inconsistente (un paquete en `node_modules` raíz, su propia
dependencia interna en la del app) y rompía el arranque en runtime — sin un
paquete compartido real todavía, el workspace no aportaba nada y sí
agregaba ese riesgo. Se reevalúa cuando exista `packages/shared-types` de
verdad (`apps/web-fptecnologi` consumiendo los mismos DTOs que la API en
vez del contenido hardcodeado que usa hoy).

## Stack

- **API**: NestJS 12 (ESM, `"type": "module"`), Prisma 6 + PostgreSQL
  (Supabase), `@nestjs/jwt` + `passport-jwt`, `bcrypt`, `class-validator`,
  Resend (correo transaccional), Swagger en `/docs`.
- **Dashboard** (`apps/web`): Next.js 15 (App Router) + React 19 +
  Tailwind v4, plantilla comercial Vireo (Envato). Ver
  [`VIREO-REFERENCE.md`](VIREO-REFERENCE.md) antes de construir una pantalla
  nueva — probablemente Vireo ya trae un patrón parecido. **Auth ya está
  conectado de verdad** (no mock): `src/context/AuthContext.tsx` +
  `src/lib/api.ts` hablan con la API real (login → OTP/TOTP → tokens en
  localStorage + refresh-on-401), y el selector de marca
  (`HeaderUtils.tsx`/`Sidebar.tsx`/`manifest.ts`) ya filtra el menú por
  rol vía `GET /usuarios/me/marcas`. `middleware.ts` (raíz de `apps/web`)
  protege las rutas — lee una cookie liviana `ax_session` (nunca el JWT
  real, que sigue solo en localStorage) porque el runtime Edge no puede
  leer localStorage. De las 15 pantallas en `src/screens/auth/`, solo
  `SignInBasic`, `TwoStepBasic` y `TwoStepTotp` son reales — el resto
  (`*Cover`, `SignUp*`, `ResetPassword*`, `CreatePassword*`,
  `LockScreen*`) siguen siendo demo de Vireo con `setTimeout` fake, sin
  endpoint real detrás todavía.
- **Web pública** (`apps/web-fptecnologi`): Next.js 16 (App Router) +
  React 19 + Tailwind v4, propio `package.json`/`node_modules`, **sin
  login**. Puerto 3002 (`.claude/launch.json`, nombre `web-fptecnologi`).
  Contenido hoy hardcodeado en `src/lib/content.ts` (productos, marcas,
  soluciones, contacto — copiados de fptecnologi.com real, no inventados)
  en vez de consumir `GET /public/*` de la API — pendiente de conectar.
  Página `/guia-estilos` cataloga en vivo (no capturas) todos los
  componentes reales de los 6 modelos de home más propuestas de diseño
  explícitamente marcadas como no aplicadas — usarla como punto de partida
  antes de tocar el look de cualquier componente. Detalle completo (6
  modelos, carrito, chat, decisiones de diseño) en `ESTADO-ACTUAL.md` →
  Fase 2.
- **Testing**: Vitest (`*.spec.ts` junto al archivo que prueban).
- **Package manager**: npm (no pnpm, no yarn) — instalar dentro de cada
  app (`cd apps/api && npm install`), no hay workspace raíz (ver arriba).
- **Seguridad**: `helmet`, rate limiting (`@nestjs/throttler`, 5
  intentos/min en login/OTP), validación de env al boot
  (`assertRequiredEnv` en `main.ts` — la app no arranca si un secret
  crítico quedó vacío o con el valor de ejemplo), `/docs` (Swagger) detrás
  de Basic Auth cuando `NODE_ENV=production` (abierto en dev), y un
  **tenant-guard** a nivel Prisma (`src/prisma/tenant-guard.extension.ts`)
  que tira error si una query sobre un modelo con `marcaId` corre sin
  `marcaId` en el `where`/`data` — ver principio de arquitectura abajo.

## Módulos de la API y rutas

| Módulo | Rutas | Notas |
| --- | --- | --- |
| `auth` | `POST /auth/register`, `/login`, `/otp/request`, `/otp/verify`, `/refresh`, `/logout`, `/totp/setup`, `/totp/enable`, `/totp/disable`, `/totp/verify-login` | Login en 2 pasos: `login` valida credenciales y responde `requiresOtp` (correo) o `requiresTotp` (app autenticadora) según `usuario.totpEnabled`. `totp/setup`+`totp/enable` (autenticado) activan TOTP y devuelven 8 códigos de respaldo de un solo uso |
| `marcas` | CRUD `/marcas` | Entidad de negocio |
| `sitios` | CRUD `/sitios`, `GET /sitios/resolver/:dominio` | Dominio → marcaId |
| `roles` | `/roles`, `/roles/asignaciones`, `/marcas/:marcaId/equipo`, `/usuarios/me/marcas` | Rol por usuario+marca (`UsuarioMarcaRol`) |
| `productos` | CRUD `/productos`, `/productos/categorias*` | Filtrado server-side por marcaId |
| `pedidos` | CRUD `/pedidos`, `PATCH /pedidos/:id/estado` | `cliente` reusa el modelo `Usuario`, no hay `Cliente` aparte |
| `servicios` | CRUD `/servicios` | Catálogo de servicios TI (B2B) |
| `cotizaciones` | CRUD `/cotizaciones`, `PATCH /:id/estado` | Solicitudes de cotización sobre un servicio |
| `notificaciones` | `/notificaciones`, `PATCH /:id/leida`, `/leidas/todas` | Centro de notificaciones del dashboard |
| `public` | `GET /public/productos`, `/public/productos/:id`, `/public/servicios`, `/public/servicios/:id` | Sin auth — para las webs públicas |
| `chat` | `/chat/asesores` (CRUD), `/chat/conversaciones` (`GET`, `GET /:id`, `POST /:id/tomar`, `PATCH /:id/estado`, `POST /:id/mensajes`); públicos `/public/chat/asesores`, `/public/chat/conversaciones` (+ `/:id`, `/:id/mensajes`, validados por `token`) | Chat de la web: asesores de WhatsApp + conversaciones del asistente que un asesor retoma desde el dashboard. Roles `admin`/`asesores` |
| `contenido` | `GET /contenido/:pagina`, `PUT /contenido/:pagina/:seccion` (admin/marketing); público `GET /public/contenido/:pagina?marcaId` | CMS de las webs públicas: JSON por marca+página+sección. Los defaults y la forma de cada sección viven en la web (`web-fptecnologi/src/lib/homeContenido.ts`) |
| `blog` | `GET/POST /blog`, `GET/PATCH/DELETE /blog/:id` (admin/marketing); públicos `GET /public/blog`, `/public/blog/:slug` (solo PUBLICADO) | Blog de las webs: artículos en Markdown, slug único por marca, borrador/publicado, destacado |
| `cotizador` | `GET/PATCH/DELETE /cotizador/leads[/:id]` (admin/comercial); público `POST /public/cotizador/leads?marcaId` | Leads del formulario `/cotizador` de la web (`LeadCotizador`: nombres, persona natural/jurídica, DNI/RUC, empresa, correo, celular, interés). Estados NUEVO→CONTACTADO→COTIZADO→GANADO/PERDIDO + notas. Honeypot + tope por IP; avisa a admin/comercial (notificación + correo). El formulario se edita como CMS con `contenido` (página `cotizador`) |
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
`Servicio`, `Cotizacion`, `Notificacion`, `ChatAsesor`, `ChatConversacion`/`ChatMensaje`, `ContenidoWeb`, `BlogArticulo`, `LeadCotizador`.

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

Backend (Fase 1 del plan) funcionalmente completo y con hardening básico
(índices DB, rate limiting, helmet, validación de env). Supabase real
conectado y migrado.

CI/CD y seguridad del repo (ver `.github/`):
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

**Lista consolidada de pendientes (envío con Shalom, Fase 3, SEO, datos y decisiones): [`docs/PENDIENTES.md`](docs/PENDIENTES.md).** Lo de abajo es un resumen anterior.

Pendiente:
- `apps/web-fptecnologi` (Fase 2): elegir 1 de los 6 modelos de home como
  definitivo, conectar el contenido hardcodeado a `GET /public/*` en vez de
  `src/lib/content.ts`, y construir catálogo completo/fichas de
  producto/checkout real — hoy solo hay una vista previa de carrito
  (`localStorage`, sin pedido real) y páginas placeholder de sitemap.
- Activar en Settings → Code security: Dependabot alerts, secret scanning
  + push protection, y una branch protection rule en `main` que exija los
  checks de CI (ver `SECURITY.md`) — requiere rol admin, no se puede hacer
  por código.
- Revisar manualmente las vulnerabilidades de `devDependencies` reportadas
  por `npm audit` en `apps/api` (tooling de NestJS/Prisma) — requieren
  upgrades breaking, no se resolvieron automáticamente.
- Infra externa (Cloudflare, Hostinger, Sentry) — fuera del alcance de un
  agente de código, requiere acceso a esas cuentas.

**Detalle real, fecha por fecha, y qué cambió respecto al plan original:
[`docs/ESTADO-ACTUAL.md`](docs/ESTADO-ACTUAL.md) — es el documento vivo,
actualízalo ahí, no acá.** Este archivo (`AGENTS.md`) solo cambia cuando
cambia la arquitectura/convenciones en sí, no el progreso día a día.
