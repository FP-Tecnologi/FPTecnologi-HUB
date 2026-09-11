# Estado actual del proyecto

Documento **vivo** — a diferencia de `docs/plan-trabajo.md` y
`docs/documentacion-tecnica.md` (que son la foto original del plan, con
fechas estimadas y no se editan), este archivo se actualiza cada vez que
avanza el proyecto: qué se hizo, cuándo (fecha real), y qué cambió respecto
al plan original (se agregó, se quitó, se pospuso). Es la fuente para
entender "dónde estamos hoy" sin tener que reconstruirlo desde el git log.

**Regla para cualquier agente/sesión futura**: al cerrar un bloque de
trabajo con impacto real (no un typo), agregar una entrada en
[Bitácora](#bitácora) con fecha real y actualizar la tabla de fases de
abajo. Ver también [`AGENTS.md`](../AGENTS.md) (contexto técnico canónico,
se actualiza junto con esto cuando cambia arquitectura/convenciones).

## Tabla de fases (real vs plan)

| Fase | Plan original (`plan-trabajo.md`) | Estado real | Fecha real |
| --- | --- | --- | --- |
| 0 — Planificación y setup | 07–18 sep 2026 | En curso (falta infra externa) | inició 2026-09-11 |
| 1 — Backend / API central | 21 sep–16 oct 2026 | Prácticamente cerrada | 2026-09-11 |
| 2 — fptecnologi.com (web pública) | 19 oct–13 nov 2026 | No iniciada | — |
| 3 — Dashboard (núcleo) | 16 nov–11 dic 2026 | No iniciada (Vireo copiado, sin conectar a la API) | — |
| 4 — QA y lanzamiento fptecnologi | 14–23 dic 2026 | No iniciada | — |
| 5 — Réplica 4 marcas | 24 dic 2026–17 feb 2027 | No iniciada | — |
| 6 — Multi-marca + pulido | 18 feb–03 mar 2027 | No iniciada | — |
| 7 — QA integral y lanzamiento | 04–17 mar 2027 | No iniciada | — |

El desarrollo real arrancó más rápido de lo que el cronograma preveía
(Fase 1 ya avanzada el mismo día que se armó el repo) — las fechas del
plan original son una referencia de alcance/orden, no un techo real de
velocidad.

## Fase 0 — checklist real

- [~] Monorepo: se probó npm workspaces en la raíz (equivalente pragmático
      al pnpm+turbo del plan original, ya que el proyecto usaba npm) y se
      **revirtió el mismo día** — hoisteaba paquetes de forma inconsistente
      entre apps y rompía el arranque en runtime (`@nestjs/throttler` no
      encontraba `@nestjs/common`). Sin un paquete compartido real
      todavía, cada app queda como proyecto npm independiente; se
      reintenta cuando exista `packages/shared-types` de verdad.
- [x] Repositorio GitHub (`FP-Tecnologi/FPTecnologi-HUB`) + rama `develop`
- [ ] GitHub Actions — **delegado a GitHub Copilot** a pedido del usuario,
      no lo configura este agente
- [x] Supabase real conectado (región `us-west-2`, vía pooler Supavisor —
      la conexión directa es IPv6-only y no sirve desde redes IPv4-only) +
      schema migrado
- [ ] Cloudflare (5 dominios) — pendiente, requiere acceso a esa cuenta
- [ ] Hostinger (hosting + entornos) — pendiente, requiere acceso a esa cuenta
- [ ] Sentry — pendiente
- [ ] Resend — `mail.service.ts` ya integrado en código, pero
      `RESEND_API_KEY` en `.env` sigue siendo un valor de ejemplo hasta que
      se cree la cuenta real (el correo de OTP no se enviará hasta entonces)

## Fase 1 — checklist real

- [x] Auth: JWT + Refresh Token + OTP por correo (2FA)
- [x] Roles y permisos multi-marca (`UsuarioMarcaRol`, `MarcaRolGuard`)
- [x] Marcas y sitios
- [x] Productos, categorías, pedidos — filtrados server-side por `marcaId`
- [x] Servicio + Cotización (catálogo B2B + solicitudes) — **no estaba en
      el plan original**, se agregó porque el negocio también vende
      servicios TI por cotización, no solo ecommerce con stock
- [x] Swagger/OpenAPI en `/docs`
- [x] Tests unitarios: `AuthService`, `MarcaRolGuard` (12 tests)
- [x] Índices de base de datos en columnas `marcaId`/`usuarioId` que se
      usan en `where` (no estaban — cada query de negocio hacía sequential
      scan; se agregaron antes de que hubiera volumen real)
- [x] Rate limiting (`@nestjs/throttler`): 5 intentos/min en
      `login`/`otp/request`/`otp/verify` — el código OTP es de 6 dígitos,
      sin límite era fuerza-bruteable dentro de su ventana de expiración
- [x] `helmet` (cabeceras de seguridad HTTP)
- [x] Validación de env al boot — la app ahora rehúsa arrancar si
      `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET`/`DATABASE_URL` quedaron con
      el valor de ejemplo o vacíos (el `.env` real tenía los tres secrets
      JWT todavía en `"change-me-..."`, el mismo texto público del repo —
      se generaron secrets reales)

## Desviaciones del plan original (agregado / quitado / distinto)

- **Agregado**: módulos `Servicio`/`Cotizacion` (cotizador B2B) — ver
  arriba.
- **Distinto**: `Pedido.cliente` reutiliza el modelo `Usuario` en vez de un
  modelo `Cliente` aparte (menos duplicación, un cliente que además se
  registra como usuario no queda duplicado).
- **Distinto**: `OtpCode` es tabla propia (con expiración e historial) en
  vez de dos campos inline en `Usuario` como sugería el plan original —
  permite reintentos/expiración sin pisar el código anterior.
- **Distinto de nombres**: `apps/web` hoy contiene el dashboard (copia de
  Vireo), no la web pública. El plan original asumía `apps/dashboard` +
  `apps/web-fptecnologi` desde el día uno; la web pública de
  fptecnologi.com **todavía no existe** como app — es lo próximo (Fase 2).
- **Quitado del alcance inmediato**: pnpm + turbo + npm workspaces (el
  plan original pedía pnpm+turbo; se probó el equivalente en npm y se
  revirtió el mismo día por romper el arranque — ver checklist de Fase 0
  arriba). Cada app es un proyecto npm independiente hasta que exista un
  paquete compartido real que justifique un workspace.

## Bitácora

### 2026-09-11
- Repo creado, conectado a `github.com/FP-Tecnologi/FPTecnologi-HUB`, commit
  inicial con API + dashboard scaffold.
- Swagger, tests de `AuthService`/`MarcaRolGuard`, `AGENTS.md` +
  `CLAUDE.md` + `.github/copilot-instructions.md` como contexto para
  cualquier agente/IA.
- `docs/documentacion-tecnica.md` y `docs/plan-trabajo.md`: conversión de
  los docx originales a markdown versionado.
- Grafo del proyecto (`graphify`) generado sobre `apps/api` + docs;
  reporte en `graphify-out/GRAPH_REPORT.md`.
- Supabase real conectado (pooler, región `us-west-2`) y migrado.
- Hardening: índices DB, rate limiting en auth/OTP, `helmet`, validación
  de env al boot, secrets JWT reales (ya no el valor de ejemplo público).
- Se probó npm workspaces en la raíz y se revirtió el mismo día (rompía el
  arranque — ver Fase 0). Reinstalado `apps/api` como proyecto npm
  independiente; boot real contra Supabase verificado (`GET /health` OK).
- Vista simplificada del grafo (`graphify-out/graph-simple.html`, 29
  nodos-comunidad en vez de 593) para lectura no técnica.
- Este archivo (`ESTADO-ACTUAL.md`) creado para llevar el estado real del
  proyecto — se actualiza desde ahora en cada sesión con avance real.
