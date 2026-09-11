# Graph Report - FPTecnologi-HUB  (2026-09-11)

## Corpus Check
- Scoped run: `apps/api` (código real) + docs de contexto — 88 archivos (81 código + 7 documentos). `apps/web` (plantilla Vireo, ~433 archivos, mayormente boilerplate sin usar todavía) excluido a pedido del usuario para no inflar el grafo con ruido.

## Summary
- 593 nodes · 1162 edges · 29 communities (24 shown, 4 thin omitted)
- Extraction: 94% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 68 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Guards y decoradores de autorizacion
- AuthController (endpoints)
- DTOs de Producto/Categoria
- AppModule y filtros globales
- Prisma (cliente inyectable)
- DTOs de Pedido
- Roles y asignaciones (DTOs + Controller)
- CotizacionesController
- Marcas (DTOs + Controller)
- Metadata package.json (api)
- Notificaciones (DTOs + Controller)
- Config TypeScript (api)
- Dependencias de desarrollo (api)
- Dependencias runtime (api)
- Bootstrap: Auth/Config/Mail modules
- Scripts npm (api)
- Convenciones y arquitectura documentadas
- Fases del plan y pendientes
- Config lint (api)
- MailService (Resend)
- Config build TypeScript
- Config Nest CLI
- Tests: AuthService
- JwtStrategy
- Monorepo workspaces (root)
- Fuera de alcance / fases futuras
- Config Vitest
- Costos y planes de servicios

## God Nodes (most connected - your core abstractions)
1. `@nestjs/common` - 50 edges
2. `MarcaActual` - 25 edges
3. `PrismaService` - 23 edges
4. `AuthService` - 19 edges
5. `compilerOptions` - 19 edges
6. `class-validator` - 18 edges
7. `Roles()` - 18 edges
8. `Public()` - 15 edges
9. `MarcaRolGuard` - 15 edges
10. `ProductosService` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Flujo de login en 2 pasos (password + OTP)` --rationale_for--> `AuthService`  [INFERRED]
  AGENTS.md → apps/api/src/auth/auth.service.ts
- `Fase 1 — Backend / API central` --references--> `AuthService`  [INFERRED]
  docs/plan-trabajo.md → apps/api/src/auth/auth.service.ts
- `Convención MarcaRolGuard como único punto de filtrado` --rationale_for--> `MarcaRolGuard`  [INFERRED]
  AGENTS.md → apps/api/src/common/guards/marca-rol.guard.ts
- `Convención de respuesta estándar de la API` --conceptually_related_to--> `MarcaRolGuard`  [AMBIGUOUS]
  apps/api/README.md → apps/api/src/common/guards/marca-rol.guard.ts
- `Fase 1 — Backend / API central` --references--> `MarcaRolGuard`  [INFERRED]
  docs/plan-trabajo.md → apps/api/src/common/guards/marca-rol.guard.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Documentos de contexto para agentes de IA** — claude_pointer_to_agents, github_copilot_instructions_pointer, agents_multitenant_principle [EXTRACTED 1.00]
- **Módulos de la Fase 1 (backend) ya implementados** — plan_fase1_backend, apps_api_src_auth_auth_service_authservice, apps_api_src_common_guards_marca_rol_guard_marcarolguard, apps_api_src_roles_roles_service_rolesservice, apps_api_src_mail_mail_service_mailservice [INFERRED 0.85]

## Communities (29 total, 4 thin omitted)

### Community 0 - "Guards y decoradores de autorizacion"
Cohesion: 0.07
Nodes (29): MarcaActual, Roles(), ROLES_KEY, JwtAuthGuard, Injectable, MarcaRolGuard, Injectable, Body (+21 more)

### Community 1 - "AuthController (endpoints)"
Cohesion: 0.06
Nodes (31): AuthController, Body, Controller, Post, UseGuards, AuthService, Injectable, LoginDto (+23 more)

### Community 2 - "DTOs de Producto/Categoria"
Cohesion: 0.07
Nodes (25): CreateCategoriaDto, IsString, CreateProductoDto, IsBoolean, IsNumber, IsOptional, IsString, Min (+17 more)

### Community 3 - "AppModule y filtros globales"
Cohesion: 0.06
Nodes (29): AppModule, Module, AuthModule, Module, AllExceptionsFilter, ResponseInterceptor, StandardResponse, Injectable (+21 more)

### Community 4 - "Prisma (cliente inyectable)"
Cohesion: 0.08
Nodes (20): PrismaModule, Module, PrismaService, Injectable, CreateSitioDto, IsString, SitiosController, Body (+12 more)

### Community 5 - "DTOs de Pedido"
Cohesion: 0.08
Nodes (23): CreatePedidoDto, PedidoItemInput, IsNumber, IsOptional, IsString, Min, IsEnum, UpdateEstadoPedidoDto (+15 more)

### Community 6 - "Roles y asignaciones (DTOs + Controller)"
Cohesion: 0.10
Nodes (15): AsignarRolDto, IsString, CreateRolDto, IsString, RolesController, Body, Controller, Delete (+7 more)

### Community 7 - "CotizacionesController"
Cohesion: 0.13
Nodes (16): CotizacionesController, Body, Controller, Get, Param, Patch, Post, UseGuards (+8 more)

### Community 8 - "Marcas (DTOs + Controller)"
Cohesion: 0.12
Nodes (15): CreateMarcaDto, IsOptional, IsString, UpdateMarcaDto, MarcasController, Body, Controller, Delete (+7 more)

### Community 9 - "Metadata package.json (api)"
Cohesion: 0.07
Nodes (27): author, description, license, name, private, type, version, @nestjs/cli (+19 more)

### Community 10 - "Notificaciones (DTOs + Controller)"
Cohesion: 0.12
Nodes (14): CurrentUser, CreateNotificacionDto, IsOptional, IsString, NotificacionesController, Body, Controller, Get (+6 more)

### Community 11 - "Config TypeScript (api)"
Cohesion: 0.10
Nodes (19): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, incremental, isolatedModules (+11 more)

### Community 12 - "Dependencias de desarrollo (api)"
Cohesion: 0.11
Nodes (19): devDependencies, @nestjs/cli, @nestjs/mau, @nestjs/schematics, @nestjs/testing, oxlint, prettier, prisma (+11 more)

### Community 13 - "Dependencias runtime (api)"
Cohesion: 0.11
Nodes (18): dependencies, bcrypt, class-transformer, class-validator, @nestjs/common, @nestjs/config, @nestjs/core, @nestjs/jwt (+10 more)

### Community 14 - "Bootstrap: Auth/Config/Mail modules"
Cohesion: 0.25
Nodes (8): AppConfig, MailModule, Module, @nestjs/config, @nestjs/jwt, @nestjs/passport, passport-jwt, resend

### Community 15 - "Scripts npm (api)"
Cohesion: 0.14
Nodes (14): scripts, build, deploy, format, lint, start, start:debug, start:dev (+6 more)

### Community 16 - "Convenciones y arquitectura documentadas"
Cohesion: 0.18
Nodes (12): Convención MarcaRolGuard como único punto de filtrado, Modelo Marca vs Sitio, Principio multi-tenant (una API, una DB, marcaId), Convención: revisar Vireo antes de construir pantalla nueva, Convención de respuesta estándar de la API, Convención x-marca-id como marca activa, CLAUDE.md remite a AGENTS.md como fuente canónica, Arquitectura: API central única sobre PostgreSQL/Supabase (+4 more)

### Community 17 - "Fases del plan y pendientes"
Cohesion: 0.18
Nodes (12): Flujo de login en 2 pasos (password + OTP), Pendiente: CI (GitHub Actions), Pendiente: conectar Supabase real, Pendiente: crear web pública fptecnologi.com, Fase 0 — Planificación y setup, Fase 1 — Backend / API central, Fase 2 — fptecnologi.com (web pública), Fase 3 — Dashboard administrativo (núcleo) (+4 more)

### Community 18 - "Config lint (api)"
Cohesion: 0.29
Nodes (6): env, node, rules, @typescript-eslint/no-explicit-any, @typescript-eslint/no-floating-promises, $schema

### Community 20 - "Config build TypeScript"
Cohesion: 0.29
Nodes (6): compilerOptions, rootDir, exclude, extends, include, ./tsconfig.json

### Community 21 - "Config Nest CLI"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 22 - "Tests: AuthService"
Cohesion: 0.40
Nodes (4): JWT_CONFIG, OTP_CONFIG, bcrypt, vitest

### Community 24 - "Monorepo workspaces (root)"
Cohesion: 0.50
Nodes (3): name, private, workspaces

### Community 25 - "Fuera de alcance / fases futuras"
Cohesion: 1.00
Nodes (3): Fuera de alcance actual (pagos, SUNAT, logística, CRM), Fases futuras (CRM, pagos, facturación, logística, IA propia), Fuera de alcance de esta fase (pagos, SUNAT, logística)

## Ambiguous Edges - Review These
- `MarcaRolGuard` → `Convención de respuesta estándar de la API`  [AMBIGUOUS]
  apps/api/README.md · relation: conceptually_related_to
- `Principio multi-tenant (una API, una DB, marcaId)` → `Convención de respuesta estándar de la API`  [AMBIGUOUS]
  apps/api/README.md · relation: conceptually_related_to
- `Flujo de login en 2 pasos (password + OTP)` → `Pendiente: conectar Supabase real`  [AMBIGUOUS]
  AGENTS.md · relation: conceptually_related_to

## Knowledge Gaps
- **117 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `$schema` (+112 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 244 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `MarcaRolGuard` and `Convención de respuesta estándar de la API`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Principio multi-tenant (una API, una DB, marcaId)` and `Convención de respuesta estándar de la API`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Flujo de login en 2 pasos (password + OTP)` and `Pendiente: conectar Supabase real`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `@nestjs/common` connect `Guards y decoradores de autorizacion` to `AuthController (endpoints)`, `DTOs de Producto/Categoria`, `AppModule y filtros globales`, `Prisma (cliente inyectable)`, `DTOs de Pedido`, `Roles y asignaciones (DTOs + Controller)`, `CotizacionesController`, `Marcas (DTOs + Controller)`, `Metadata package.json (api)`, `Notificaciones (DTOs + Controller)`, `Bootstrap: Auth/Config/Mail modules`, `Tests: AuthService`?**
  _High betweenness centrality (0.314) - this node is a cross-community bridge._
- **Why does `MarcaActual` connect `Guards y decoradores de autorizacion` to `DTOs de Producto/Categoria`, `DTOs de Pedido`, `CotizacionesController`?**
  _High betweenness centrality (0.075) - this node is a cross-community bridge._
- **Why does `MarcaRolGuard` connect `Guards y decoradores de autorizacion` to `Convenciones y arquitectura documentadas`, `Fases del plan y pendientes`, `CotizacionesController`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `AuthService` (e.g. with `Flujo de login en 2 pasos (password + OTP)` and `Fase 1 — Backend / API central`) actually correct?**
  _`AuthService` has 2 INFERRED edges - model-reasoned connections that need verification._