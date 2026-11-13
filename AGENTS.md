# FPTecnologi-HUB — contexto para agentes de IA

Fuente canónica de contexto para cualquier asistente (Claude Code, Copilot, Cursor, Codex…). `CLAUDE.md` y `.github/copilot-instructions.md` apuntan
aquí. **Se mantiene corto a propósito** (se lee en cada sesión): el detalle largo vive en `docs/`. Si algo cambia en la arquitectura o las
convenciones, actualízalo aquí; el avance día a día va en `docs/ESTADO-ACTUAL.md`, no aquí.

## Qué es

Sistema para administrar 5 marcas de una misma empresa (`fptecnologi`, `fimavperu`, `kelqa`, `imaninki`, `quamtu`), cada una con su web pública y todas
desde **un único dashboard**. Rubro: soluciones/dispositivos TI (ecommerce con stock) y servicios TI B2B por cotización.

## Cómo trabajar gastando pocos tokens

1. **No leas docs largos enteros.** `docs/ESTADO-ACTUAL.md` (~140 KB) y `docs/PENDIENTES.md` son historial: busca por fecha o palabra con Grep y lee solo ese tramo.
2. **Para entender código, consulta el grafo antes de abrir archivos**: `graphify query "<pregunta>"`, `graphify explain "<nodo>"`, `graphify path "A" "B"`
   (mapa de las 6 apps + docs, regenerado el 2026-11-06; ver «Mapas» abajo). Para el resumen visual, los diagramas de `docs/arquitectura/`.
3. **Pide y lee por archivo/carpeta concretos** (`apps/kelqa-web/src/lib/lineas.ts`), no «todo el proyecto». No abras PDF, HTML generados, `public/`, `node_modules` ni `graphify-out/graph.json`.
4. **Sesiones cortas y enfocadas**: una tarea por sesión; lo importante queda en git, en `docs/` y en la memoria del proyecto.
5. Detalle por tema (léelo solo si la tarea lo pide): API y stack → [`docs/API-MODULOS.md`](docs/API-MODULOS.md); despliegue → [`docs/DESPLIEGUE-CPANEL.md`](docs/DESPLIEGUE-CPANEL.md);
   CDN → [`docs/CDN-CLOUDFLARE.md`](docs/CDN-CLOUDFLARE.md); pendientes → [`docs/PENDIENTES.md`](docs/PENDIENTES.md); negocio/plan (congelados) →
   [`docs/documentacion-tecnica.md`](docs/documentacion-tecnica.md), [`docs/plan-trabajo.md`](docs/plan-trabajo.md).

## Mapas del proyecto

- **Diagramas** (abrir en el navegador; hechos con Archify del commit `f0801a98`): [`arquitectura-hub.html`](docs/arquitectura/arquitectura-hub.html) y
  [`flujo-contenido.html`](docs/arquitectura/flujo-contenido.html). Pueden quedar desactualizados; se regeneran desde sus `.fuente.json` ([README](docs/arquitectura/README.md)).
- **Grafo de código** (graphify, 7.731 nodos): [`graphify-out/GRAPH_REPORT.md`](graphify-out/GRAPH_REPORT.md) (57 KB: no lo leas entero). `graph.json` no se sube; se regenera con
  `graphify update .` (Python 3.10+, `uv tool install graphifyy`; sin costo de modelo para código). `.graphifyignore` excluye skills, `public/`, lockfiles y generados.
  Tras cambios grandes: `graphify update .` y commit de `GRAPH_REPORT.md`.

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
  admin/            Next.js + Vireo — dashboard único (selector de marca)
  web-fptecnologi/  Next.js 16 — fptecnologi.com (catálogo, servicios, carrito, blog, chat; sin login)
  fimav-web/        Next.js 16 — fimavperu.com (puerto 3005). Categorías desde la API; resto, CMS. `/tienda`: productos de FPTecnologi (env `TIENDA_MARCA_ID`), solo lectura; carrito en localStorage (`lib/carrito.ts`) que se envía como cotización (`/cotizar?carrito=1`), sin pago en línea; selector de moneda S/ | US$ en la cabecera (tipo de cambio de FPTecnologi, respaldo 3.75)
  kelqa-web/        Next.js 16 — kelqa.com (3007). Líneas/productos desde la API; CMS: Inicio, Nosotros,
                    Contacto, Catálogos PDF y Textos legales (borrador hasta «publicado»)
  imaninki-web/     Next.js 16 — imaninki.com (3008), igual que Kelqa
  quamtu-web/       Next.js 16 — quamtu.com (3004). Exportación estática: su CMS (solo Inicio) se aplica al recompilar;
                    tienda/armador/productos aún en el código
docs/               Documentación de negocio, planificación, despliegue y diagramas
```

Cada app es un proyecto npm independiente (sin workspaces, ni `shared-types`, ni turbo; motivo en `docs/API-MODULOS.md`). Las webs se publican en su propio
hosting cPanel (Perú) y la API en Hostinger. **Leads vive en otro repo** ([`FP-Tecnologi/centralizacion-leads`](https://github.com/FP-Tecnologi/centralizacion-leads),
otra base Supabase, clonado en `../centralizacion-leads`); `web-fptecnologi/app/api/contacto` le copia los contactos con `LEADS_SUPABASE_URL` y `LEADS_SUPABASE_ANON_KEY`
(solo variables de entorno).

## Cómo fluye el contenido (lo que hay que saber)

- **Webs públicas** (Next 16 + React 19 + Tailwind v4): leen `GET /public/contenido|categorias|productos|blog…` con caché de **30 s** (ISR, `revalidate = 30`): lo guardado en el
  dashboard se ve en menos de 30 s sin recompilar (salvo Quamtu). `src/lib/content.ts|contenido.ts|cms.ts` son solo el **respaldo** si la API no responde o falta `HUB_MARCA_ID`.
- **CMS**: filas `ContenidoWeb` (marca + página + sección) con `GET/PUT /contenido/:pagina/:seccion`; defaults y forma de cada sección en la web (`src/lib/cms.ts`), editor en el dashboard.
- **Catálogo**: `Categoria` = línea/categoría (`resumen`, `texto`, `icono`, `galeria[]`, `marcasComerciales[]`) y `Producto` (con `detalle`); se gestionan en Ecommerce → Catálogo y Productos. Fimav, Kelqa e Imaninki las leen de la API.
- **Dashboard** (`apps/admin`, Next 16.4.3 + Vireo; ver `VIREO-REFERENCE.md` antes de una pantalla nueva): auth real (login → OTP/TOTP → JWT en localStorage + refresh); `proxy.ts`
  protege rutas con la cookie `ax_session`; el menú sale de `nav-manifest.json` filtrado por rol y marca (`MODULOS_POR_MARCA` en `src/lib/manifest.ts`).
- **API** (NestJS 12, Prisma 6, JWT global, `@Public()` en `/public/*`, Swagger en `/docs`): módulos y rutas en `docs/API-MODULOS.md`. `GET /public/contenido|blog` manda `Cache-Control: s-maxage=30`.
- **Seguridad**: `helmet`, rate limiting propio, cabeceras en `next.config.mjs`, validación de env al arrancar, Swagger con Basic Auth en producción, tenant-guard de Prisma. Next ≥ 16.4.1, Node 22, npm.

## Modelo de datos (Prisma)

Ver [`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma) —
es la fuente de verdad, no la dupliques en prosa aquí porque se desactualiza.
Modelos clave: `Marca`, `Sitio`, `Usuario`, `OtpCode`, `RefreshToken`, `Rol`,
`UsuarioMarcaRol`, `Categoria`, `Producto`, `Pedido`/`PedidoItem`,
`Servicio`, `Proyecto`, `Cliente`, `Cotizacion`, `Notificacion`, `ChatAsesor`, `ChatConversacion`/`ChatMensaje`, `ContenidoWeb`, `BlogArticulo`, `LeadCotizador`, `Popup`, `HojaReclamacion`, `Folleto`, `VisitaWeb`, `CrmEmpresa`/`CrmOportunidad`.

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
- Antes de construir una pantalla nueva en `apps/admin`, revisar si Vireo ya
  trae un patrón parecido (ver `VIREO-REFERENCE.md`).
- **Módulos por marca en el dashboard**: cada marca ve solo lo que su web usa.
  `MODULOS_POR_MARCA` (`apps/admin/src/lib/manifest.ts`) lista los módulos de
  Quamtu, Fimav, Kelqa e Imaninki (FPTecnologi ve todos) y un nodo del menú con `marcas: ["kelqa"]`
  solo aparece en esa marca. Al sumar un módulo para una web, agrégalo ahí.
- Secrets viven en `.env` (gitignorado), nunca en el código ni en
  `.env.example`.

## Estado y pendientes

Backend funcionalmente completo y con hardening básico; Supabase real conectado. CI en `.github/` (build + tests de la API; tipos + build de las 6 apps Next; CodeQL; `npm audit`; Dependabot).
**Avance real y fecha por fecha: `docs/ESTADO-ACTUAL.md`. Lista completa de pendientes: `docs/PENDIENTES.md`.** Resumen de lo más importante:

- **Desplegar** lo último (checklist en `docs/DESPLIEGUE-CPANEL.md`) y cargar `HUB_API_URL` + `HUB_MARCA_ID` en cada web.
- **Textos legales de Kelqa/Imaninki**: borrador; revisión legal, razón social/RUC/dirección en Admin → Marcas y activar «Publicar textos legales».
- **Quamtu**: CMS sin recompilar y tienda/productos en el admin.
- **Supabase**: pooler :6543 ≈ 850 ms por consulta vs :5432 ≈ 172 ms (medido desde la PC); decidir puerto, región y unificación. **CDN** solo para archivos (`CDN_URL`).
- Settings de GitHub (Dependabot, secret scanning, branch protection) requieren rol admin; infra externa (Cloudflare, Sentry) requiere acceso a esas cuentas.
