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

Diagramas de arquitectura (abrir en el navegador), hechos con Archify a partir del código:
[`docs/arquitectura/arquitectura-hub.html`](docs/arquitectura/arquitectura-hub.html) (5 webs públicas, dashboard, API, Supabase,
correo y archivos) y [`docs/arquitectura/flujo-contenido.html`](docs/arquitectura/flujo-contenido.html) (cómo llega un cambio del
admin a la web, hasta 30 s). Cada componente cita archivo y líneas del commit en que se basó; pueden quedar desactualizados si el
código cambia, y se regeneran desde sus `.fuente.json` (ver [`docs/arquitectura/README.md`](docs/arquitectura/README.md)).

Mapa del código por comunidades (opcional): [`graphify-out/GRAPH_REPORT.md`](graphify-out/GRAPH_REPORT.md), generado con
`graphify`. **Está desactualizado**: es del 11-sep-2026, cubre solo `apps/api` + los docs y no incluye las webs públicas, el catálogo
editable ni el CMS de Kelqa/Imaninki. La skill `graphify` no está instalada en todos los equipos; para regenerarlo hay que
instalarla y correr `/graphify --update`. Ante la duda, prefiere los diagramas de arriba y `docs/ESTADO-ACTUAL.md`.

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
  admin/            Next.js + Vireo — dashboard administrativo único (selector de marca)
  web-fptecnologi/  Next.js 16 — web pública de fptecnologi.com (sin login:
                    catálogo, servicios, carrito, blog, chat propios)
  fimav-web/        Next.js 16 — fimavperu.com (marca `fimavperu`, puerto 3005, solo
                    modo claro). Categorías del catálogo desde la API (`Categoria`),
                    resto editable como CMS (Web Fimav). Cotizador vía `/api/hub/cotizador`.
  kelqa-web/        Next.js 16 — kelqa.com (marca `kelqa`, puerto 3007).
  imaninki-web/     Next.js 16 — imaninki.com (marca `imaninki`, puerto 3008; negro/rojo/plata).
                    Kelqa e Imaninki: líneas y productos desde la API (`src/lib/lineas.ts`);
                    CMS de Inicio, Nosotros, Contacto, Catálogos PDF y Textos legales
                    (`src/lib/cms.ts`; los legales son un borrador hasta activar «publicado»).
  quamtu-web/       Next.js 16 — quamtu.com (marca `quamtu`, puerto 3004). Exportación
                    estática (`output: 'export'`): el CMS (solo Inicio) se aplica al recompilar.
                    Tienda/armador/productos aún en el código, no en el admin.
  (Las webs leen `/public/*` con caché de 30 s (ISR) y, si la API no responde, usan su contenido
  de respaldo en `src/lib`. Se publican en su propio hosting cPanel; la API va en Hostinger.)
docs/     Documentación de negocio, planificación y diagramas (docs/arquitectura)
```

**Sistema de Centralización de Leads — vive en su propio repo**:
[`FP-Tecnologi/centralizacion-leads`](https://github.com/FP-Tecnologi/centralizacion-leads)
(clonado al lado de este repo, en `../centralizacion-leads`). Ya **no** hay copia en
este repo (`apps/leads` se eliminó el 2026-10-01). Usa otra base Supabase que la del
ERP. Se vincula solo en ejecución: `web-fptecnologi/app/api/contacto` copia los
contactos al sistema de leads con `LEADS_SUPABASE_URL` y `LEADS_SUPABASE_ANON_KEY`
(variables de entorno del servidor, nunca en el código).

No hay `packages/shared-types`, `turbo` ni npm workspaces — cada app
(`apps/api`, `apps/admin`, `apps/web-fptecnologi`) es un proyecto npm
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
- **Dashboard** (`apps/admin`): Next.js 16.4.3 (App Router) + React 19 +
  Tailwind v4, plantilla comercial Vireo (Envato). Ver
  [`VIREO-REFERENCE.md`](VIREO-REFERENCE.md) antes de construir una pantalla
  nueva — probablemente Vireo ya trae un patrón parecido. **Auth ya está
  conectado de verdad** (no mock): `src/context/AuthContext.tsx` +
  `src/lib/api.ts` hablan con la API real (login → OTP/TOTP → tokens en
  localStorage + refresh-on-401), y el selector de marca
  (`HeaderUtils.tsx`/`Sidebar.tsx`/`manifest.ts`) ya filtra el menú por
  rol vía `GET /usuarios/me/marcas`. `proxy.ts` (raíz de `apps/admin`; antes `middleware.ts`)
  protege las rutas — lee una cookie liviana `ax_session` (nunca el JWT
  real, que sigue solo en localStorage) porque el runtime Edge no puede
  leer localStorage. De las 15 pantallas en `src/screens/auth/`, solo
  `SignInBasic`, `TwoStepBasic` y `TwoStepTotp` son reales — el resto
  (`*Cover`, `SignUp*`, `ResetPassword*`, `CreatePassword*`,
  `LockScreen*`) siguen siendo demo de Vireo con `setTimeout` fake, sin
  endpoint real detrás todavía.
- **Webs públicas** (`apps/web-fptecnologi`, `fimav-web`, `kelqa-web`, `imaninki-web`, `quamtu-web`): Next.js 16 (App Router) + React 19 +
  Tailwind v4, cada una con su `package.json`/`node_modules`, **sin login**. Puertos en `.claude/launch.json`. Leen su contenido de la
  API (`GET /public/contenido|categorias|productos|blog…`) con caché de 30 s (ISR, `revalidate = 30`): lo que se guarda en el dashboard se ve
  en menos de 30 s sin recompilar (salvo Quamtu, estática). `src/lib/content.ts` / `contenido.ts` / `cms.ts` son el **respaldo** si la API no
  responde o falta `HUB_MARCA_ID`. Los modelos de home de web-fptecnologi están archivados en `temporal/modelos-home/`; la home oficial es
  `app/page.tsx`. `next.config.mjs` tiene `assetPrefix` con `CDN_URL` (inactivo sin la variable; ver `docs/CDN-CLOUDFLARE.md`).
- **Testing**- **Testing**: Vitest (`*.spec.ts` junto al archivo que prueban).
- **Package manager**: npm (no pnpm, no yarn) — instalar dentro de cada
  app (`cd apps/api && npm install`), no hay workspace raíz (ver arriba).
- **Versiones mínimas**: Next.js **16.4.1+** en las 5 apps Next (hoy 16.4.3; 16.0.0–16.4.0 tienen una RCE crítica),
  Node 22 (CI y hosting). `npm audit` debe dar 0 vulnerabilidades en las 6 apps; los parches que no llegan por
  `npm audit fix` se fuerzan con `overrides` en el `package.json` de cada app (API: multer, undici, fast-uri…; web:
  postcss-selector-parser). ESLint está en pausa: `typescript-eslint` no soporta TypeScript 7, así que `npm run lint`
  de las apps Next es `tsc --noEmit`.
- **Seguridad**: `helmet`, rate limiting (guard propio `LimitePeticionesGuard`, por IP; `@Limite(n)` por ruta, 5
  intentos/min en login/OTP), cabeceras de seguridad en `next.config.mjs` de las apps Next (nosniff, Referrer-Policy,
  Permissions-Policy, HSTS, sin X-Powered-By; dashboard no incrustable, webs solo en sí mismas y en el dashboard vía
  `frame-ancestors` + `DASHBOARD_ORIGIN`), subidas sin SVG (firma real del archivo), validación de env al boot
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
| `productos` | CRUD `/productos`, `/productos/categorias*`, `/catalogo/categorias*` | Filtrado server-side por marcaId. `Categoria` es también la **línea/categoría** de las webs de catálogo (Fimav, Kelqa, Imaninki): `resumen`, `texto`, `icono`, `galeria[]`, `marcasComerciales[]`, `portadaUrl`; `Producto.detalle` es el texto corto de la tarjeta. Se gestionan en Ecommerce → Catálogo y Productos |
| `pedidos` | CRUD `/pedidos`, `PATCH /pedidos/:id/estado` | `cliente` reusa el modelo `Usuario`, no hay `Cliente` aparte |
| `servicios` | CRUD `/servicios` (admin/marketing/ventas; borrar solo admin); público `GET /public/servicios[/:slug]` | Servicios TI (B2B) **con el contenido de su página** (slug, ícono, imagen, intro, qué incluye, beneficios, sectores, FAQ, orden): la web, el menú, el cotizador y el asistente los leen de aquí |
| `proyectos`, `clientes` | CRUD `/proyectos`, `/clientes` (admin/marketing); públicos `GET /public/proyectos`, `/public/clientes` | Referencias de la web (mapa/listado de proyectos y logos de clientes). `esEjemplo` = dato de muestra que el asistente no cita |
| `cotizaciones` | CRUD `/cotizaciones`, `PATCH /:id/estado` | Solicitudes de cotización sobre un servicio |
| `notificaciones` | `/notificaciones`, `PATCH /:id/leida`, `/leidas/todas` | Centro de notificaciones del dashboard |
| `public` | `GET /public/productos`, `/public/productos/:id`, `/public/categorias[/:slug]`, `/public/servicios`, `/public/servicios/:id` | Sin auth — para las webs públicas. `GET /public/contenido` y `/public/blog` mandan `Cache-Control: s-maxage=30` (CDN/proxy) |
| `chat` | `/chat/asesores` (CRUD), `/chat/conversaciones` (`GET`, `GET /:id`, `POST /:id/tomar`, `PATCH /:id/estado`, `POST /:id/mensajes`); públicos `/public/chat/asesores`, `/public/chat/conversaciones` (+ `/:id`, `/:id/mensajes`, validados por `token`) | Chat de la web: asesores de WhatsApp + conversaciones del asistente que un asesor retoma desde el dashboard. Roles `admin`/`asesores` |
| `contenido` | `GET /contenido/:pagina`, `PUT /contenido/:pagina/:seccion` (admin/marketing); público `GET /public/contenido/:pagina?marcaId` | CMS de las webs públicas: JSON por marca+página+sección. Los defaults y la forma de cada sección viven en cada web (`src/lib/cms.ts`, `homeContenido.ts`, `paginasContenido.ts`) y el editor en el dashboard (`WebHomeCms.tsx`, `WebKelqaCms.tsx`…). Páginas CMS de Kelqa/Imaninki: `inicio`, `nosotros`, `contacto`, `catalogos` (PDF), `legal` (con `estado.publicado`) |
| `blog` | `GET/POST /blog`, `GET/PATCH/DELETE /blog/:id` (admin/marketing); públicos `GET /public/blog`, `/public/blog/:slug` (solo PUBLICADO) | Blog de las webs: artículos en Markdown, slug único por marca, borrador/publicado, destacado |
| `popups` | `GET/POST /popups`, `GET /popups/plantillas`, `PATCH/DELETE /popups/:id`, `POST /popups/:id/duplicar` (admin/marketing); públicos `GET /public/popups?marcaId&pagina=`, `POST /public/popups/:id/evento` | Avisos emergentes de la web: plantilla (aviso/promoción/descuento/evento/producto) × formato (modal/esquina/barra), botón a URL/producto/WhatsApp, disparador, frecuencia, páginas y fechas inicio/fin. Contador de vistas/clics. La web los muestra con `PopupsSitio` |
| `cotizador` | `GET/PATCH/DELETE /cotizador/leads[/:id]` (admin/comercial); público `POST /public/cotizador/leads?marcaId` | Leads del formulario `/cotizador` de la web (`LeadCotizador`: nombres, persona natural/jurídica, DNI/RUC, empresa, correo, celular, interés). Estados NUEVO→CONTACTADO→COTIZADO→GANADO/PERDIDO + notas. Honeypot + tope por IP; avisa a admin/comercial (notificación + correo). El formulario se edita como CMS con `contenido` (página `cotizador`) |
| `libro-reclamaciones` | `GET /libro-reclamaciones` (filtros `estado`, `vencidas`, `q` ≤60 caracteres: código/nombres/apellidos/documento/correo; tope 1000), `GET /libro-reclamaciones/resumen` (`{ recibidas, enProceso, respondidas, vencidas, porVencer }`; `porVencer` = no respondidas con ≤3 días hábiles y no vencidas), `GET /libro-reclamaciones/:id` (ambos GET devuelven además `diasHabilesRestantes`, null si RESPONDIDO y negativo si venció, y `vencida`), `PATCH /libro-reclamaciones/:id` (`{ estado?: RECIBIDO|EN_PROCESO, notasInternas? ≤2000 }`; se puede volver de EN_PROCESO a RECIBIDO, `notasInternas: ""` borra las notas y `null` da 400;|EN_PROCESO, notasInternas? ≤2000 }`; guarda `atendidoPor`; no cambia hojas RESPONDIDO), `PATCH /libro-reclamaciones/:id/responder` (marca RESPONDIDO, guarda `atendidoPor` y envía la respuesta al consumidor; es la única vía a RESPONDIDO). `notasInternas` y `atendidoPor` son solo del dashboard: nunca salen en la consulta pública; públicos `POST /public/libro-reclamaciones`, `POST /public/libro-reclamaciones/consulta` (código + documento), `GET /public/libro-reclamaciones/proveedor?marcaId` | Libro de Reclamaciones virtual (hoja `HojaReclamacion`, correlativo `LR-0001-AAAA` por marca y año). Plazo de respuesta: **15 días hábiles** (sin excluir feriados). Los datos del proveedor salen de los campos nuevos de `Marca`: `razonSocial`, `ruc`, `direccionFiscal`. Honeypot + tope por IP; correos: copia al consumidor y aviso a los usuarios admin/comercial de la marca (si no hay, al `contactoEmail` de la marca). Retención: el reglamento exige conservar las hojas al menos 2 años; nada las borra (FK a `Marca` en ON DELETE RESTRICT) |
| `asistente` | `POST /asistente/consultar` (`{ mensajes: [{role, content}] }`, ≤12; **solo super administrador** (`SuperAdminGuard`) y con acceso a la marca de `x-marca-id`; 40 consultas/10 min por usuario) | Asistente IA del dashboard, solo en **Administración** (pantalla `/asistente`, con selector de marca; no aparece dentro de las marcas). Groq por `fetch` (`GROQ_API_KEY`, `ASISTENTE_MODEL` opcional, por defecto `openai/gpt-oss-120b`; sin key → 503). Function calling con herramientas en `asistente.herramientas.ts` (resumen del negocio, reporte de ventas, búsqueda de productos, pedidos, cotizaciones, presupuestos, leads, tickets, reclamos, contactos, chats y conocimiento), cada una con los mismos roles que el módulo que lee y siempre con `marcaId`. Devuelve `{ texto, modulos, tablas, metricas, sugerencias }`: tablas/métricas salen de la BD, no del modelo; `modulos` son IDs de `nav-manifest.json` filtrados por rol (el dashboard los vuelve a validar) |
| `reportes` | `GET /reportes/ventas` (admin/ventas/finanzas/direccion) y por área, mismo contrato `?desde&hasta` (YYYY-MM-DD, Lima, máx. 366 días) → `{ rango, kpis[{clave,label,valor,previo?,formato}], serie, tablas }`: `/reportes/marketing` (admin/marketing/direccion: tráfico, leads, conversión, boletín), `/comercial` (admin/comercial/direccion: leads, cotizaciones, presupuestos, embudo CRM por comercial), `/soporte` (admin/soporte/comercial/direccion: tickets, reclamos, chats), `/finanzas` (admin/finanzas/direccion: cobrado/por cobrar, IGV, medios de pago), `/direccion` (admin/direccion: resumen cruzado) | Reportes por área en el dashboard (menú Reportes). Una sola pantalla genérica `ReportesArea` pinta cualquier área; con varias marcas añade un comparativo por marca. Para sumar un área: método en `ReportesAreasService`, ruta en el controller, nodo en `nav-manifest.json` y `app/(shell)/reportes/<area>/page.tsx` |
| `visitas` | `GET /visitas/resumen?dias=7\|30\|90` (admin/marketing/comercial/ventas); público `POST /public/visitas?marcaId` (`{ ruta, referrer?, host?, utm? }`, 120/min por IP, siempre 204) | Contador propio de tráfico de las webs (`VisitaWeb`: una fila por página vista, sin cookies; `visitante` = hash diario de IP+navegador, no guarda la IP). Cada web lo llama desde su `/api/hub/visita` (componente `ContadorVisitas` en el layout; no cuenta iframe/`?cms`/`?equipo`); ignora bots. Dashboard: tarjetas «Tráfico web» en `ResumenMarca` (por marca; en Administración suma todas y compara webs). Herramienta `trafico_web` del asistente |
| `crm` | `/crm/oportunidades[/:id]` (+ `/etapa`, `/actividades`), `/crm/actividades/:id`, `/crm/agenda`, `/crm/reportes`, `/crm/empresas`, `/crm/contactos`, `/crm/asignables`, `/crm/por-origen` (admin/comercial; borrar solo admin) | CRM comercial por marca (`CrmEmpresa`, `CrmContacto`, `CrmOportunidad`, `CrmActividad`). Las solicitudes de la web (cotizador, cotizaciones, contacto web, presupuestos) entran solas vía `CrmService.registrarSolicitud` sin duplicar: contacto por correo, empresa por RUC, y si hay oportunidad abierta se suma a su historial (`origen`/`origenId` en la oportunidad y en la actividad `SOLICITUD`). Dashboard: sección CRM (Embudo, Oportunidades, Agenda, Empresas y contactos, Reportes) y «Ver en CRM» en las bandejas |
| `tickets` | `GET/PATCH/DELETE /tickets[/:id]`, `POST /tickets/:id/mensajes`, `GET /tickets/archivo`; públicos `POST /public/tickets?marcaId`, `/public/tickets/seguimiento`, `/public/tickets/responder` | Tickets de clientes por marca (reclamo, verificación, soporte) con conversación y evidencias privadas. Roles **por marca** (`tickets.roles.ts` + `TicketsRolGuard`; Quamtu y Kelqa solo admin, el resto admin/comercial; igual en `ROLES_POR_MARCA` del menú). Avisa al buzón `Marca.correoTickets` (o `contactoEmail`) y a los usuarios de esos roles; correos al cliente con nombre/color de su marca y enlace a su web (primer `Sitio`). Formularios: `web-fptecnologi` y `quamtu-web` (`/tickets`) |
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

## Estado actual / próximos pasos

Backend (Fase 1 del plan) funcionalmente completo y con hardening básico
(índices DB, rate limiting, helmet, validación de env). Supabase real
conectado y migrado.

CI/CD y seguridad del repo (ver `.github/`):
- `workflows/ci.yml`: API (lint oxlint + build + tests) y, en matriz, las 5 apps Next (`admin`,
  `web-fptecnologi`, `fimav-web`, `quamtu-web`, `kelqa-web`, `imaninki-web`: tipos + build) con Node 22, en cada push/PR a `main`.
- `workflows/codeql.yml`: análisis estático de seguridad (CodeQL) en
  push/PR a `main` y semanal.
- `workflows/dependency-audit.yml`: `npm audit` informativo de las 6 apps en
  push/PR y semanal (no bloquea el merge todavía).
- `workflows/copilot-setup-steps.yml`: preinstala Node + deps + Prisma
  client para el entorno del Copilot coding agent (cloud).
- `dependabot.yml`: actualizaciones semanales de npm de las 6 apps y de
  GitHub Actions.
- `SECURITY.md`: política de reporte de vulnerabilidades y checklist de
  configuración recomendada a nivel de repo (branch protection, secret
  scanning, etc. — requieren rol admin, no se pueden setear por código).

**Lista consolidada de pendientes (envío con Shalom, Fase 3, SEO, datos y decisiones): [`docs/PENDIENTES.md`](docs/PENDIENTES.md).** Lo de abajo es un resumen anterior.

Pendiente (resumen; la lista completa está en `docs/PENDIENTES.md` y el avance real en `docs/ESTADO-ACTUAL.md`):
- **Desplegar** lo último (webs en cPanel, API en Hostinger, dashboard) y cargar `HUB_API_URL` + `HUB_MARCA_ID` en cada web.
- **Textos legales de Kelqa/Imaninki**: son un borrador; revisarlos con un asesor legal, cargar razón social/RUC/dirección en Admin → Marcas
  (Kelqa aún no los tiene) y activar «Publicar textos legales» en el dashboard.
- **Quamtu**: su CMS no se aplica sin recompilar y su tienda/productos no están en el admin.
- **Supabase**: el pooler :6543 mide ~850 ms por consulta desde la PC y :5432 ~172 ms; decidir puerto, región (cerca de la API en Hostinger) y
  si unificar bases. Detalle en `docs/ESTADO-ACTUAL.md` (2026-11-06).
- **CDN**: elegir proveedor y definir `CDN_URL` por web (guía en `docs/CDN-CLOUDFLARE.md`).
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
