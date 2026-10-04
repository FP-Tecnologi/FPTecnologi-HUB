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
| 2 — fptecnologi.com (web pública) | 19 oct–13 nov 2026 | En curso — 6 modelos de home + guía de estilos, falta elegir modelo y conectar API | inició 2026-09-14 |
| 3 — Dashboard (núcleo) | 16 nov–11 dic 2026 | En curso — login+2FA+selector de marca reales, falta CRUD | inició 2026-09-11 |
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
- [x] **Tenant-guard a nivel Prisma** — `MarcaRolGuard` solo verifica que
      el usuario tenga acceso al `marcaId` que declara, no que la query
      que corre después lo haya usado. Se agregó una extensión de Prisma
      (`$extends`, aplicada vía Proxy en `PrismaService` para no tocar los
      12 services que ya lo usan) que tira error si una query sobre
      `Sitio`/`Categoria`/`Producto`/`Pedido`/`Servicio`/`Cotizacion`/
      `UsuarioMarcaRol` corre sin `marcaId` en el `where`/`data`.
      Verificado contra Supabase real: query con `marcaId` pasa, query sin
      `marcaId` se bloquea con error explícito. Ningún query actual viola
      la regla (todas ya incluían `marcaId`) — esto es una red de
      seguridad para código futuro, no un fix de un bug existente.
- [x] **2FA por app autenticadora (TOTP)** — método alternativo al OTP por
      correo (Google Authenticator/Authy/etc.). `POST /auth/totp/setup`
      (autenticado) genera secreto + QR; `POST /auth/totp/enable` confirma
      con un código real y activa, devolviendo 8 códigos de respaldo de un
      solo uso; `POST /auth/totp/disable` requiere un código válido (no
      alcanza con estar logueado, así un token robado no lo desactiva).
      `login` ahora responde `requiresTotp` en vez de mandar OTP por correo
      si el usuario lo tiene activado; `POST /auth/totp/verify-login` es el
      segundo paso. 9 tests nuevos con criptografía real (otplib + bcrypt,
      sin mockear). Encontré y arreglé un bug real en el camino: `otplib`
      tira excepción (no `false`) si el código no mide 6 dígitos — un
      código de respaldo (10 chars) rompía el request con 500 en vez de
      fallar limpio; ahora `safeVerifyTotp()` lo atrapa.
- [x] `/docs` (Swagger) detrás de HTTP Basic Auth cuando
      `NODE_ENV=production` (`SWAGGER_USER`/`SWAGGER_PASSWORD`) — antes
      exponía el esquema completo de la API (todas las rutas, todos los
      DTOs) sin auth a cualquiera que encontrara la URL, porque
      `SwaggerModule.setup` monta sus rutas fuera del guard stack de Nest.
      Abierto en desarrollo para no trabar el flujo local. Probado: 401
      sin credenciales / con credenciales incorrectas, 200 con las
      correctas, en `/docs` y `/docs-json`.

## Fase 3 — checklist real (arrancó antes de tiempo)

Sorpresa al revisar `apps/admin`: el login real (`AuthContext.tsx`,
`api.ts`) y el selector de marca ya estaban construidos — no quedó
registrado quién/cuándo, probablemente otra sesión trabajando en paralelo
sobre este mismo repo. Estado real hoy:

- [x] Login real (password → OTP/TOTP → tokens), refresh-on-401,
      `SignInBasic`/`TwoStepBasic` reales
- [x] Selector de marca activa + menú filtrado por rol
      (`HeaderUtils.tsx`/`Sidebar.tsx`/`manifest.ts` → `GET /usuarios/me/marcas`)
- [x] Pantalla de TOTP (`TwoStepTotp.tsx`) — agregada hoy, el backend TOTP
      existía pero no había UI
- [x] `SignInBasic` ahora bifurca `requiresOtp`/`requiresTotp` — antes
      ignoraba la respuesta y siempre mandaba al flujo de correo
- [x] `middleware.ts` — no existía, cualquier ruta era accesible sin
      sesión. Cookie liviana `ax_session` (nunca el JWT) para que el
      runtime Edge pueda redirigir
- [x] Bug real encontrado y arreglado en el backend: `issueTokens` nunca
      devolvía `usuario`, aunque el dashboard ya esperaba
      `result.usuario` — `user` quedaba `undefined` después de cualquier
      login
- [ ] `SignInCover`/`TwoStepCover`/`SignUp*`/`ResetPassword*`/
      `CreatePassword*`/`LockScreen*` — siguen siendo demo de Vireo
      (`setTimeout` fake), sin endpoint real
- [ ] CRUD real de productos/pedidos/usuarios conectado a la API —
      pendiente
- [ ] `Confiar en este dispositivo por 30 días` — hoy es solo visual
      (checkbox sin efecto, heredado de Vireo). Implementar de verdad:
      token de dispositivo 30d en cookie HttpOnly + salto de OTP en ese
      navegador + revocación al cambiar contraseña + tests

## Fase 2 — checklist real

`apps/web-fptecnologi` (Next.js 16 + React 19 + Tailwind v4, sin login,
propio `package.json`/`node_modules`, puerto 3002). Arrancó antes de lo
previsto en el cronograma — mismo patrón que Fase 1 y Fase 3.

- [x] App separada creada y registrada en `.claude/launch.json`
      (`web-fptecnologi`, puerto 3002)
- [x] 6 modelos completos de home (`/`, `/modelo-2`..`/modelo-6`): 5
      basados en las plantillas Home1-5 de la plantilla comercial Techon
      (usada solo como referencia visual, sin instalar sus dependencias)
      + 1 propuesta propia. Comparten secciones de negocio
      (`SplitPaths`, `StatsBar`, `FeaturedProducts`, `WhyChooseUs`,
      `BrandMarquee`, `PartnerSteps`, `Contact`, `Footer`) — solo difieren
      en Header/Hero/tarjetas de servicio, que es donde Techon realmente
      varía entre sus 5 Home
- [x] Contenido real relevado de fptecnologi.com en vivo (categorías,
      marcas partner, dirección, teléfonos, email, 4 productos con
      SKU/precio/descuento reales) — vive hoy en `src/lib/content.ts`,
      **no conectado a la API** todavía (pendiente, ver `AGENTS.md`)
- [x] Hero de 3 slides (Servicios/Tienda/Partners) con pestañas siempre
      visibles y nombradas (decisión de UX: se descartó un carrusel ciego)
- [x] Submenús de header con contenido real (8 slugs Servicios, 4 Tienda,
      generados desde `content.ts`) + sitemap navegable completo con
      páginas placeholder intencionales (`/servicios/[slug]`,
      `/tienda/[slug]`, `/marcas`, `/nosotros`, `/contacto`)
- [x] Carrito real: `CartContext` (Context + `localStorage`), `CartButton`
      (ícono + dropdown) en los 6 headers, página `/carrito` real
- [x] Widget de chat flotante (`ChatWidget.tsx`, global en las 6 páginas):
      glassmorfismo oscuro real (`.glass-panel`/`.glass-card` en
      `globals.css`, ADN Vireo/Aurora), look distinto por modelo
      (`chatVariants.tsx`), opciones WhatsApp real / asistente simple por
      keywords (**no es IA real conectada**, dejado explícito)
- [x] Botón "Cotizador" real (`COTIZADOR_URL` en `content.ts`) en los 6
      headers/heroes, reemplazando el antiguo "Contáctanos"
- [x] Página `/guia-estilos`: catálogo vivo (componentes reales
      embebidos, no capturas) de las 12 áreas del sistema visual —
      headers, botones (jerarquía/relleno/efectos/tonos semánticos),
      tarjetas de servicio, tarjeta de producto, tarjeta "por qué
      elegirnos", badges, acordeón FAQ, ribbons, chat, efectos/
      animaciones reutilizables, carrito (mini-carrito de header +
      tarjetas panel), comparación de productos — cada propuesta no
      aplicada está marcada explícitamente como tal, nunca mezclada con
      lo real. Pensada para que el usuario elija dirección visual antes
      de construir el resto del sitio
- [ ] Elegir 1 de los 6 modelos de home como definitivo — pendiente,
      decisión del usuario
- [ ] Conectar `content.ts` a `GET /public/productos`/`/public/servicios`
      de la API en vez de contenido hardcodeado
- [ ] Catálogo completo, fichas de producto reales, checkout real (hoy
      el carrito es solo vista previa en `localStorage`, sin pedido real
      contra la API)
- [ ] Infra (Cloudflare, Hostinger) — mismo bloqueo que Fase 0, requiere
      acceso a esas cuentas

**Notas técnicas no obvias (para no repetir el mismo bug en otra
sesión/máquina)**:
- Server Component (`app/guia-estilos/page.tsx`, sin `'use client'`) no
  puede recibir una función como children/prop desde un Client Component
  (no serializable) — pasar un `ReactNode` ya renderizado, nunca un
  render-prop.
- Importar consts/tipos planos desde un módulo con `'use client'` hacia
  un Server Component puede fallar en build/prerender sin error claro en
  desarrollo — si un valor se comparte entre un componente cliente y uno
  servidor, extraerlo a un módulo sin `'use client'` aparte (ver
  `src/components/site/chatVariants.tsx`).
- `position: relative` solo no crea un nuevo contexto de apilamiento CSS —
  hace falta un `z-index` explícito también. Un pseudo-elemento hijo con
  `z-index: -1` sin eso se escapa al contexto de apilamiento del ancestro
  posicionado más cercano en vez de quedar contenido en su propio padre.
- El glassmorfismo claro (`.glass-panel-light`) necesita un fondo con
  color/textura detrás (ej. `.brand-mesh`) para notarse — sobre blanco
  liso el contraste desaparece. El oscuro (`.glass-panel`, ~80% opaco) no
  tiene ese problema, funciona directo sobre cualquier fondo.
- La plantilla comercial Vireo (referencia de diseño para el ADN
  glass/glow) vive fuera del repo, solo en la máquina de desarrollo — ver
  nota en `VIREO-REFERENCE.md`, la ruta cambia según el perfil de
  Windows.

## Desviaciones del plan original (agregado / quitado / distinto)

- **Agregado**: módulos `Servicio`/`Cotizacion` (cotizador B2B) — ver
  arriba.
- **Distinto**: `Pedido.cliente` reutiliza el modelo `Usuario` en vez de un
  modelo `Cliente` aparte (menos duplicación, un cliente que además se
  registra como usuario no queda duplicado).
- **Distinto**: `OtpCode` es tabla propia (con expiración e historial) en
  vez de dos campos inline en `Usuario` como sugería el plan original —
  permite reintentos/expiración sin pisar el código anterior.
- **Distinto de nombres**: `apps/admin` contiene el dashboard (copia de
  Vireo), no la web pública — el plan original asumía `apps/dashboard` +
  `apps/web-fptecnologi` desde el día uno. La web pública real vive en
  `apps/web-fptecnologi` (creada en Fase 2, ver checklist arriba).
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
- Tenant-guard a nivel Prisma (segundo candado de aislamiento multi-marca,
  más allá de `MarcaRolGuard`) y `/docs` protegido con Basic Auth en
  producción — ver checklist de Fase 1 arriba.
- 2FA por app (TOTP) — backend completo y probado (endpoints + tests). La
  pantalla del dashboard para escanear el QR/activar 2FA todavía no existe
  (Fase 3, dashboard sin conectar a la API) — el backend ya está listo
  para cuando se construya.
- Este archivo (`ESTADO-ACTUAL.md`) creado para llevar el estado real del
  proyecto — se actualiza desde ahora en cada sesión con avance real.
- **CI/CD y seguridad del repo agregados** (PR #1, `jaimetr-ci-security-setup`,
  creado con Copilot antes de todo el hardening de arriba): GitHub Actions
  (build/lint/test), CodeQL, Dependabot, `npm audit` semanal, `SECURITY.md`.
  El review automático de Copilot en el PR marcó como faltante todo lo de
  seguridad de la API (CORS/helmet/rate limit/Swagger) — correcto en su
  momento, porque el PR se había creado *antes* de que yo lo arreglara en
  `main`. Actualicé el branch del PR con `main` (merge, sin romper nada —
  27 tests, build y lint verificados post-merge) para que quede todo junto.
  De paso encontré y arreglé un bug real de CI: `npm ci` (lo que corre en
  cada push) fallaba porque `@nestjs/throttler` declara un rango de peer
  dependency desactualizado que no incluye Nest 12 — agregado
  `apps/api/.npmrc` con `legacy-peer-deps=true`.
- Conectado el token real de Hostinger a los MCP servers (`~/.claude.json`)
  — ya estaban configurados pero sin `HOSTINGER_API_TOKEN`, por eso nunca
  conectaban. Van a estar disponibles recién en la próxima sesión (MCP se
  carga al iniciar).
- 3 conceptos de homepage para fptecnologi.com (contenido real del sitio
  actual: categorías, marcas Dell/HP/Lenovo, contacto, badges de
  confianza) — quedan los 3 para que los dueños elijan, ninguno se
  descartó.
- Dashboard: se descubrió que el login real y el selector de marca ya
  estaban construidos (no por mí, no quedó registrado quién). Cerré los
  huecos reales: pantalla de TOTP, `SignInBasic` bifurcando
  OTP/TOTP, `middleware.ts` (no existía — cualquier ruta era accesible
  sin sesión), y un bug de backend donde `issueTokens` nunca devolvía
  `usuario` pese a que el dashboard ya lo esperaba. Ver checklist de
  Fase 3 arriba.
- **Rebrand de plantilla a FPTecnologi-HUB**: `apps/admin/package.json`
  `vireo-next@1.1.0` → `fptecnologi-dashboard@0.1.0` (el terminal mostraba el
  nombre viejo en `npm run dev`), `apps/api` `backend` → `fptecnologi-api`
  (+ `package-lock.json` regenerados). Sidebar y AppBar usaban wordmark
  "VIREO" — ahora usan `/logo-fptecnologi.svg`; metadata `<title>`/
  descripción, footer (© + versión), emails/placeholders demo
  (`you@vireo.io`/`support@vireo.io`), `$schema` del nav-manifest y READMEs/
  `.env.example` actualizados. Los comentarios internos que citan a Vireo
  como origen del patrón se dejan a propósito (ver `VIREO-REFERENCE.md`).
  Build de API + Web verificado OK.
- **Emails case-insensitive**: el login comparaba el email exacto y Postgres
  distingue mayúsculas (`Dev@` ≠ `dev@`) — por eso fallaba el ingreso según
  cómo se tecleaba. Nuevo helper `normalizeEmail()` (trim + lowercase)
  aplicado en los 7 métodos de `AuthService` que buscan por email y en
  `RolesService.crearUsuarioEnMarca`; fila existente `Dev@fptecnologi.com`
  corregida a minúsculas en Supabase. 3 tests nuevos (41/41 OK).
- **Barrido total Vireo→FPTecnologi** (63 archivos, build OK): headers,
  textos y placeholders restantes; favicon nuevo (cuadro azul `#008DC5` con
  "FP"); título/meta ya estaban. Solo quedan menciones factuales
  (licencia, referencia a plantilla, nota histórica del manifest).
- **Sidebar: fuera el buscador, dentro el switch de marca**: eliminado
  `Filter menu…` + toda su lógica de filtrado; en su lugar bloque
  `Marca / Proyecto` (misma fuente que el header: `useAuth` + `x-marca-id`).
  Con 1 marca muestra etiqueta fija, con varias despliega lista con rol.
- **Menú por proyecto + Panel general**: seed de las 4 marcas restantes
  (`fimavperu`, `kelqa`, `imaninki`, `quamtu`, vacías, sin sitios todavía)
  + admin de Jaime en todas → el switch ya muestra las 5 y al cambiar va a
  `/`. Manifest con secciones GENERAL (Panel general, Usuarios y equipo y
  Configuración solo-admin) y MARCA (Productos/Pedidos/Servicios/
  Cotizaciones como placeholders hasta su CRUD). `/` ahora es Panel general
  con tarjetas por marca. Nota: no correr `next build` con el dev abierto —
  corrompe `.next` (error `317.js`); limpiar `.next` y reabrir.
- **Combo con opción Administración**: primera opción del switch (solo si
  eres admin en alguna marca) → vista global sin marca activa: solo sección
  GENERAL (Panel general, Usuarios y Configuración), se oculta Marca activa
  y no se manda `x-marca-id`. Persiste en `localStorage`, sobrevive
  recargas y se limpia al salir.
- **Limpieza de ramas + todo actualizado a main**: 14 ramas Dependabot
  revisadas — 1 ya mergeada se borró, 2 grupos menores verificados y
  mergeados a develop (react/tailwind/vite-tsconfig, build+tests OK),
  11 majors prematuros cerrados. En paralelo se mergearon por web a main
  Next 16 + TS 7 + types/node 26: se integraron a develop (único fix:
  `baseUrl` eliminado del tsconfig, TS 7 lo retiró), todo verificado
  (API 52/52, web build OK) y release develop→main pusheado. Ramas
  restantes: solo develop/main.
- **Grupo Mi cuenta con 3 módulos**: Mi perfil (/perfil: identidad, stats,
  marcas), Configuración (/configuracion: editar, seguridad, avisos) y
  Centro de ayuda (/ayuda: tickets locales por ahora). /cuenta redirige
  a /perfil. Sección MAIN → 'Cuenta'.
- **Desbloqueo 2FA por admin**: `POST /usuarios/2fa/reset` (admin de la
  marca + objetivo de esa marca; apaga TOTP, borra códigos, revoca
  sesiones; 3 tests, 52/52 OK) + tarjeta en Usuarios y equipo con correo
  y marca. Funciona como módulo dentro de esa página, sin módulo aparte.
- **Notificaciones por tipo**: enum `TipoNotificacion` (SISTEMA/PEDIDO/
  COTIZACION/EQUIPO/STOCK) + migración aplicada en Supabase (vía pooler de
  sesión :5432 — el de transacciones :6543 cuelga los comandos migrate) +
  `?tipo=` en GET /notificaciones + pestañas por tipo con contadores en la
  pantalla. 5 avisos de ejemplo sembrados para ver cada tipo.
- **Menú por marca como `{Marca} Web`**: en modo marca se oculta General
  (solo Mi cuenta + grupo de la marca); el grupo toma el nombre real
  (`FPTecnologi Web`, nombres propios en DB) con submódulos Web
  informativa, Ecommerce, Soluciones, Campañas y Blogs (placeholders por
  ahora, rutas 200).
- **4 módulos copiados de la plantilla y adaptados** (trabajo en paralelo):
  `Configuración` (/configuracion, ProfileSettings sin pestaña Billing:
  cuenta real vía PATCH /usuarios/me, seguridad con link a reset, avisos
  locales), `Ver perfil` (/perfil, identidad + stats reales, sin datos
  falsos), `Soporte y ayuda` (/soporte, traducido, formulario honesto sin
  backend + mailto real) y `Notificaciones` (/notificaciones, cableada a
  la API: listar, marcar una/todas como leídas). Iconos user/bell nuevos,
  nodos en el manifest, rutas explícitas y footer → /soporte.
- **Identidad a la izquierda + Mi cuenta editable**: el header muestra
  `Hola, {nombre}` + `{marca} · {rol}` (o `Administración`) a la izquierda,
  junto al buscador; el avatar vuelve a ser solo icono. Nuevo módulo API
  `usuarios` con `PATCH /usuarios/me` (nombre directo; correo exige
  contraseña actual + normalización + unicidad; 8 tests, 49/49 OK) y
  formulario real en Mi cuenta. La confirmación del correo nuevo por código
  queda como mejora futura.
- **Header: fuera el idioma (EN) + fix choque de marca**: eliminado el
  selector de idioma del encabezado (quedaba de la plantilla; el dashboard
  es en español). Bug real: el switch de marca del header reusaba la clase
  `ax-icon-btn` (caja cuadrada de 38px) con el nombre de la marca dentro →
  el texto se desbordaba y se incrustaba con el toggle de tema/perfil.
  Ahora usa `ax-btn ghost sm` de ancho automático.
- **Mi cuenta unificada**: Mi cuenta + Ver perfil + Configuración eran la
  misma cosa en 3 módulos → una sola página /cuenta con pestañas Perfil
  (identidad, stats reales, marcas), Cuenta (editar), Seguridad y Avisos.
  Eliminadas rutas /perfil y /configuracion, pantallas Profile.tsx y
  ProfileSettings.tsx y sus nodos del manifest.
- **Usuarios y equipo con relleno + español en el chrome**: pantalla Team
  con 10 miembros de ejemplo (buscador, filtro por rol, invitar), ruta
  /usuarios y nota de datos de ejemplo. Footer, buscador ⌘K, menú de perfil
  y páginas de error en español. Regla: interfaz siempre en español.

### 2026-09-13
- **Login con Google real** (`passport-google-oauth20`): `GET /auth/google`
  (`?marcaId=` solo para cuenta nueva) → `GET /auth/google/callback` →
  `loginOrRegisterGoogle()` — cuenta existente entra directo (Google ya es
  el factor fuerte, sin 2FA), cuenta nueva se crea rol `cliente` en la
  marca indicada con password aleatorio inutilizable. Bug real en el
  camino: `GoogleAuthGuard` necesitaba constructor propio con `super()` —
  sin eso Nest tira `UnknownDependenciesException` (una subclase de
  `AuthGuard()` sin constructor pierde los metadatos de inyección de la
  clase base).
- **"Confiar en este dispositivo por 30 días" real** (antes: checkbox sin
  efecto): tabla `DispositivoConfiable` (token random hasheado, 30 días),
  cookie httpOnly `ax_device`. `login()` la revisa antes de pedir 2FA de
  nuevo. Requirió CORS explícito (`WEB_ORIGIN`, `credentials:true`) +
  `cookie-parser`, y `credentials:'include'` en el fetch del dashboard.
  `confirmPasswordReset()` ahora revoca dispositivos confiables junto con
  refresh tokens. 8 tests nuevos.
- **Avatar real de Google**: `Usuario.avatarUrl`, sincronizado en cada
  login de Google. Componente `Avatar` compartido (foto real o iniciales)
  reemplaza los `pravatar.cc` hardcodeados (misma cara de mentira para
  cualquier cuenta) del header y el `initialsOf()` duplicado de Perfil.
- **Modal de bienvenida, una sola vez por cuenta**: `Usuario.bienvenidaVista`
  (default `true` — no afecta cuentas ya existentes; `register()`/
  `loginOrRegisterGoogle()` la ponen en `false` al crear cuenta nueva).
  `issueTokens()` la marca `true` y devuelve `primeraVez:true` solo en
  logins reales (nunca en `refresh()`, que corre en silencio). 64/64 tests
  al cierre del día.
- **Términos y Política de privacidad reales**: recuperados del template
  original de Vireo (layout TOC + scroll-spy) pero con contenido real
  adaptado a Perú (Ley 29733, Ley 29571, derechos ARCO) en vez del texto
  de ejemplo. Viven en `(bare)` (público, sin sidebar) en vez de `(shell)`
  — un visitante sin cuenta debe poder leerlos desde el registro.
- **Sidebar colapsado, arreglado**: el CSS de colapso heredado de Vireo
  nunca contempló el logo real ni el switch de marca de este proyecto
  (no existían en la referencia). Logo se recorta a un ícono cuadrado
  nuevo (`logo-fptecnologi-icon.svg`, el rombo con "FP" sin el texto,
  generado a partir del SVG real) apilado con la hamburguesa — que
  quedaba descentrada por un `margin-left:auto` pensado para el layout en
  fila, no en columna. Switch de marca oculto en colapsado (no cabe un
  botón con texto en un riel de solo íconos).
- **5 cuentas de prueba, una por marca** (`admin` solo de su propia marca,
  a diferencia de `Dev@fptecnologi.com` que es admin en las 5) —
  credenciales en `docs/credenciales-prueba.md` (gitignored, tiene
  contraseñas reales).

### 2026-09-14 — arranca Fase 2 (web pública)
- Creada `apps/web-fptecnologi` (Next.js 16 + React 19 + Tailwind v4,
  propio `package.json`/`node_modules`, sin login), registrada en
  `.claude/launch.json` (puerto 3002).
- Modelo 1 de home (`app/page.tsx` + `src/components/site/*`): estructura
  de Techon (hero slider, grid de soluciones, marquee de marcas, pasos de
  partner, contacto, footer) + contenido real relevado de fptecnologi.com
  en vivo (categorías, marcas, dirección, teléfonos, email).
- 6 modelos completos (`/`, `/modelo-2`..`/modelo-6`): 5 basados en las
  Home1-5 de la plantilla comercial Techon (solo referencia visual, no se
  instalaron sus dependencias) + 1 propuesta propia. Secciones de negocio
  compartidas entre los 6 (`SplitPaths`, `StatsBar`, `FeaturedProducts`,
  `WhyChooseUs`) para no repetir contenido — solo Header/Hero/tarjetas de
  servicio varían por modelo.
- Estructura de información del home definida como UX antes de seguir con
  visual: Header → Hero (3 slides con pestañas siempre visibles, no
  puntos ciegos) → marcas → soluciones → catálogo destacado → por qué
  elegirnos (con stats integradas) → partners → contacto → footer.
- Submenús de header con contenido real (`src/lib/nav.ts` generado desde
  `SOLUTIONS`/`TIENDA_CATEGORIES`) + sitemap navegable completo con
  páginas placeholder intencionales.
- Carrito real (`CartContext`, Context + `localStorage`) + `CartButton`
  en los 6 headers + página `/carrito`.
- Fotos del hero/categorías con fondo blanco horneado corregidas
  (flood-fill con `sharp`) o reemplazadas por stock de Unsplash real,
  revisado imagen por imagen.
- Botón "Contáctanos" → "Cotizador" real (`COTIZADOR_URL`) en los 6
  headers/heroes.
- Widget de chat flotante (`ChatWidget.tsx`, global) con glassmorfismo,
  bot simple por keywords (no IA real conectada, dejado explícito) y
  efecto de escritura letra por letra.

### 2026-09-15 — guía de estilos + refactors reales
- Estilo Vireo/Aurora traído al sitio público: `.btn-glow` (degradé
  diagonal + sombra de color, ADN real del dashboard) aplicado a
  chat/carrito/WhatsApp/agregar-al-carrito.
- Página `/guia-estilos` creada y expandida en varias pasadas hasta 12
  secciones (headers, botones, tarjetas de servicio, tarjeta de producto,
  "por qué elegirnos", badges, acordeón FAQ, ribbons, chat, efectos,
  carrito, comparación de productos) — componentes reales embebidos, no
  capturas; toda propuesta no aplicada marcada explícitamente como tal.
  Contenido siempre real (`FEATURED_PRODUCTS`, `WHY_CHOOSE_US`,
  `SOLUTIONS` de `content.ts`) — nunca specs/ratings inventados sobre
  productos de marca real (ASUS/Dell).
- Refactor real: `chatVariants.tsx` (nuevo módulo sin `'use client'`)
  separado de `ChatWidget.tsx` para poder compartir sus valores con el
  Server Component de la guía sin romper el build — ver nota técnica en
  la sección de Fase 2 arriba.
- Ícono del launcher del chat mejorado (3 puntos internos, antes vacío) y
  forma `rounded-full` → `rounded-2xl` — cambio real en producción, no
  solo de la guía.
- Submenús de header con estilo real distinto por modelo
  (`dropdownVariant` en `MainNav.tsx`, 6 variantes) — antes los 6 usaban
  la misma tarjeta blanca genérica. Bug real encontrado y arreglado de
  paso: doble `position` (`relative` + `absolute`) rompía el layout del
  header del Modelo 5 — ver nota técnica arriba.
- 2 bugs reales de stacking-context CSS en el anillo de pulso del chat
  (`.launcher-ring`) — ver nota técnica arriba, ambos con fix defensivo
  aplicado a la clase base, no solo al caso puntual.
- Carrito: variantes de mini-carrito de header (ícono + dropdown) y de
  tarjeta/panel completo agregadas a la guía, con datos reales del
  catálogo — incluye una versión de glassmorfismo claro nueva
  (`.glass-panel-light`/`.glass-card-light` en `globals.css`) sobre
  `.brand-mesh`, ver nota técnica arriba.
- Página verificada con `npm run build` limpio y en el navegador en cada
  cambio — sin regresiones en los 6 modelos ni en las rutas existentes.

### 2026-09-16 — primer commit de Fase 2 a git
- `apps/web-fptecnologi` no se había subido a git todavía (todo el
  trabajo de Fase 2 vivía sin commitear) — primer commit real de la app
  completa (6 modelos, guía de estilos, carrito, chat) a `main`.
- Este documento (`ESTADO-ACTUAL.md`) y `AGENTS.md` actualizados con el
  detalle de Fase 2 para que cualquier sesión/máquina nueva pueda
  continuar sin depender de contexto que solo vivía en memoria local.

### 2026-09-28 — Sistema de Centralización de Leads: puesta en marcha y repo propio
- Base de leads definida: Supabase `qpjxwtvmuqramhqoxkxj` (la de EXPOMINA) se migró en sitio
  sin perder datos (43 leads → fuentes EXPOMINA Perú 2026 y Semana de Ingeniería Geológica).
  El ERP sigue en `vzfdjpqvqxrooesxozjx`. El proyecto `dsanz…` era de pruebas y se abandona.
- Agregado: roles superadmin/admin/editor/lector y módulo Usuarios (invitar, editar,
  desactivar, eliminar), rediseño de Importar, CMS de landings (plantillas + asistente de
  5 pasos + página pública `/l/<slug>`), confirmaciones con diseño propio, rango de fechas,
  panel de columnas, arreglo para que la landing de EXPOMINA vuelva a guardar registros.
- Despliegue preparado para cPanel (Node.js, `output: 'standalone'`).
- **El sistema de leads pasa a su propio repo**: `FP-Tecnologi/centralizacion-leads`.
  `apps/leads` queda congelado aquí (ver AGENTS.md → Estructura del repo).
- Pendiente: desplegar Edge Functions (`admin-usuarios`, `ingresar-lead`, `api-v1`),
  SMTP de Resend en Supabase Auth, decidir cómo reciben registros las landings del CMS,
  habilitar deploy keys en la organización para conectar cPanel por Git, y rotar las
  credenciales que estuvieron versionadas en `envs/` (historial del HUB).

### 2026-09-30 — Chat de la web conectado al dashboard (módulo `chat`)

- **API** (`apps/api/src/chat`): modelos `ChatAsesor`, `ChatConversacion`,
  `ChatMensaje` (+ enums `EstadoChat`, `AutorChat`, y `CHAT` en
  `TipoNotificacion`), migración `20260930120000_chat_web` aplicada en
  Supabase. Los 3 modelos están en el tenant-guard.
  - Dashboard (`admin`/`asesores`): `GET/POST/PATCH/DELETE /chat/asesores`,
    `GET /chat/conversaciones[?estado=]`, `GET /chat/conversaciones/:id`,
    `POST /:id/tomar`, `PATCH /:id/estado`, `POST /:id/mensajes`.
  - Público (sin login, validado por `token` secreto de la conversación):
    `GET /public/chat/asesores`, `POST /public/chat/conversaciones`,
    `POST /public/chat/conversaciones/:id/mensajes` (autor solo
    `CLIENTE`/`BOT`), `GET /public/chat/conversaciones/:id?token&desde`.
  - Primer mensaje del visitante → notificación `CHAT` + correo a los
    usuarios `admin`/`asesores` de la marca, con link a la conversación.
- **Web pública**: el widget guarda cada conversación vía el proxy
  `app/api/hub/chat/[...path]` (env `HUB_API_URL`, `HUB_MARCA_ID`; sin
  CORS, la API no queda expuesta). Consulta cada 4 s si un asesor la tomó:
  entonces el asistente deja de responder y se muestran los mensajes del
  asesor. La lista de WhatsApp sale de `ChatAsesor` (fallback:
  `WHATSAPP_AREAS` de `content.ts`). WhatsApp sigue siendo `wa.me`.
- **Dashboard**: nuevo grupo "Chat y asesores" → `/chat/conversaciones`
  (bandeja + retomar/responder/cerrar/devolver al asistente, refresco cada
  5 s) y `/chat/asesores` (CRUD de perfiles de WhatsApp).
- Se marcó como aplicada `20260913141955_usuario_datos_empresa` (sus
  columnas ya existían en la base, aplicadas por fuera de `migrate`).
- Pendiente: aviso "terminó la conversación" (hoy solo avisa al iniciar),
  subir fotos de asesores (hoy es URL), rate limiting de los endpoints
  públicos cuando vuelva `@nestjs/throttler`.

### 2026-09-30 — CMS de la home (web informativa)

- **API**: módulo `contenido` + modelo `ContenidoWeb` (JSON por marca +
  página + sección; migración `20260930160000_contenido_web` aplicada).
  `GET/PUT /contenido/:pagina[/:seccion]` (admin/marketing) y público
  `GET /public/contenido/:pagina?marcaId`. Tabla en el tenant-guard.
- **Web** (`web-fptecnologi`): `src/lib/homeContenido.ts` define la forma y
  los textos por defecto de cada sección de la home; `app/page.tsx` los
  mezcla con lo guardado en cada visita (`force-dynamic`) y respeta
  mostrar/ocultar. `GET /api/cms/home` devuelve el contenido actual al
  dashboard (CORS a `DASHBOARD_ORIGIN`).
- **Dashboard**: Web informativa → Home page (`/web/home`): selector de
  sección, formulario (textos, listas, diapositivas del banner), switch
  Visible, "Guardar y publicar" y vista previa real de la web (iframe
  escritorio/celular) que salta a la sección editada.
- Pendiente: imágenes (subida), listas grandes (servicios, productos,
  proyectos, clientes, marcas), borrador antes de publicar, otras páginas.

### 2026-09-30 — Blog (CMS de artículos + páginas públicas)

- **API**: módulo `blog` + modelo `BlogArticulo` (Markdown, `slug` único por
  marca, `BORRADOR`/`PUBLICADO`, destacado, etiquetas; migración
  `20260930180000_blog` aplicada). 3 artículos de ejemplo publicados.
- **Dashboard**: Blogs → Lista de blogs (`/blogs/lista`: filtro por estado,
  búsqueda, editar/ver/eliminar) y Nuevo artículo (`/blogs/nuevo[?id=]`:
  editor Markdown con barra de formato, vista previa, URL automática,
  categoría, etiquetas, autor, portada por URL, destacado, borrador/publicar).
- **Web**: `/blog` (destacado + grilla con filtro por categoría) y
  `/blog/[slug]` (portada, autor/fecha/lectura, texto con estilos
  `.blog-prose`, compartir, CTA, relacionados). `lib/markdown.ts` convierte
  Markdown escapando todo el HTML (autochequeo: `npx tsx src/lib/markdown.check.mts`).
- Pendiente: subida de imágenes (hoy portada por URL), SEO (OG/meta por
  artículo), programar publicación.

### 2026-10-01 — Cotizador (formulario público + leads + CMS)

- **API**: módulo `cotizador` + modelo `LeadCotizador` (migración
  `20261001120000_cotizador_leads`, **por aplicar en Supabase**). Público
  `POST /public/cotizador/leads` (valida DNI 8 / RUC 11, jurídica ⇒ RUC +
  empresa, celular peruano; honeypot; tope 5 envíos/10 min por IP). Dashboard
  (`admin`/`comercial`): `GET/PATCH/DELETE /cotizador/leads`. Cada lead nuevo
  genera notificación `COTIZACION` + correo a admin/comercial. Tests en
  `cotizador.service.spec.ts`.
- **Web** (`web-fptecnologi`): `/cotizador` reemplaza el placeholder: formulario
  en 3 pasos (qué necesitas → quién solicita → contacto), tarjetas de interés,
  toggle natural/jurídica, validación por paso, pantalla de gracias; acepta
  `?interes=`. Envía por el proxy `/api/hub/cotizador`. Contenido con defaults
  en `lib/cotizadorContenido.ts` + lo guardado (`/public/contenido/cotizador`).
- **Dashboard**: grupo "Cotizador" → Leads (`/cotizador/leads`: filtros por
  estado, búsqueda, detalle con WhatsApp/correo, estado, notas, CSV) y
  Formulario (`/cotizador/formulario`: CMS de textos, opciones de interés,
  beneficios y gracias con vista previa). El editor de la home se generalizó
  (`CmsEditor`) para reutilizarlo.
- Pendiente: aplicar la migración; no se pudo ver la landing de referencia
  (`landing-cotiza-tu-tiempo`, el proxy bloqueó el dominio) — el diseño sigue
  el de la web; asignar leads a un comercial; sincronizar con el repo de leads.
- **Rediseño del cotizador (misma fecha)**: la página ya no es solo el
  formulario. Formulario sobre el borde del hero + panel oscuro con beneficios
  y contacto directo (WhatsApp, ventas, correo, mapa); debajo "Cómo funciona"
  (3 pasos), servicios, marcas y preguntas frecuentes (acordeón). Nuevas
  secciones editables en el CMS: `proceso` y `faq`.

### 2026-10-01 — Contacto, navegación y boletín

- **Sección Contacto** (`home/Contact.tsx`, usada en home, servicios, contacto,
  nosotros, proyectos, blog): fondo azul de marca (se distingue del pie, que
  sigue en `ink`), campos con ícono según el dato (usuario, correo, teléfono,
  empresa, mensaje) y tarjetas de datos donde el ícono viaja de lado a lado al
  pasar el cursor (mismo gesto del botón del hero).
- **Pie de página**: el bloque "¿Tienes un proyecto en mente?" (Cotizar /
  WhatsApp) pasó a ser suscripción al boletín (`NewsletterForm`). La columna
  Navegación quedó: Nosotros, Servicios, Tienda, Blog, Contacto.
- **Encabezado**: se agregó Blog; Proyectos pasó a un submenú de Nosotros;
  Cotizador es submenú de Contacto (así sigue accesible en la tienda, donde el
  botón Cotizar no se muestra).
- **API**: módulo `boletin` + modelo `SuscriptorBoletin` (migración
  `20261001180000_boletin`, **por aplicar**). Público
  `POST /public/boletin/suscribir` (idempotente, honeypot, tope por IP);
  dashboard `GET/DELETE /boletin/suscriptores` (admin/marketing). Web: proxy
  `/api/hub/boletin`. Dashboard: Boletín → Suscriptores (lista, buscar, CSV).
- Pendiente: baja del boletín (no hay enlace de baja todavía) y envío de
  campañas (hoy solo se recolectan correos).

### 2026-10-01 — Blog: artículos de ejemplo reproducibles

- Los "3 artículos de ejemplo" del primer día se habían insertado a mano en una
  base y nunca quedaron en el repo, por eso una base nueva mostraba el blog
  vacío. Ahora existe `apps/api/prisma/seeds/blog-ejemplo.sql`: 6 artículos
  publicados (servidores, videovigilancia, videoconferencia, respaldo, nube,
  hotelería), con portada (`/images/solutions/*.jpg`) y 1 destacado.
  Idempotente (`ON CONFLICT (marcaId, slug) DO NOTHING`); se ejecuta en el SQL
  Editor de Supabase. Toma la marca cuyo nombre contenga "fptecnologi".
- Verificado de punta a punta con Postgres local: las 12 migraciones aplican en
  una base vacía, el seed inserta 6 (y 0 al repetirlo), `/public/blog` los
  devuelve y la web pinta listado, filtros y detalle. También se probó
  `POST /public/cotizador/leads` y `/public/boletin/suscribir` contra la base.

### 2026-10-01 — Ecommerce real fase 0 (API comprable + importador WooCommerce)

- **Migración `20261001190000_ecommerce_real`** (por aplicar en Supabase,
  como las de cotizador/boletín): `Categoria` +slug/orden/activo/portada;
  `Producto` +slug/imagenes/marcaComercial/precioAntes/destacado/moneda(USD);
  `Pedido` +numeroPedido/datos invitado/subtotal-igv-envío-descuento-total/
  moneda/estadoPago/metodoPago; `PedidoItem` +snapshot(nombre/sku/igv/subtotal).
  Todo aditivo con defaults; no toca el tenant-guard (sin modelos nuevos).
- **`GET /public/productos` ahora pagina/filtra** (`q`, `categoria` por slug o
  `categoriaId`, `marca`, `min/maxPrecio`, `ofertas`, `destacados`, `orden`,
  `page/limit`) + `GET /public/productos/slug/:slug` y
  `GET /public/categorias[/:slug]`. `slug` único por marca (se autogenera).
- **`POST /public/pedidos?marcaId=`** (checkout invitado sin pasarela): valida
  celular PE + stock, descuenta atómico en transacción (no sobrevende),
  totales e IGV 18% server-side, correlativo `FP-AAAA-XXXXXX`, snapshot por
  ítem, notificación `PEDIDO` a admin/ventas + correo al comprador. Honeypot
  + tope por IP como cotizador/boletín. Queda PENDIENTE/POR_CONFIRMAR (se
  coordina por WhatsApp).
- **Importador `apps/api/prisma/import-woocommerce.ts`** (`npx tsx … --csv
  … --dry-run`): parser CSV propio sin dependencias, upsert por
  (marcaId,sku), nunca borra ni toca stock en updates. CSV va en
  `prisma/seeds/woocommerce*.csv` (gitignorado). Precios se toman como USD
  sin IGV; `Publicado≠1` o sin precio → inactivo (se revisa en dashboard).
- Tests: 10 nuevos (`productos` 6 + `pedidos` 4), 81/84 OK — los 3 que fallan
  (`usuarios updatePerfil`) ya fallaban en main limpio, preexistentes.
- **Aplicado en Supabase real el 2026-10-01**: las 3 migraciones pendientes
  (cotizador, boletín, ecommerce) ya están en la base (15/15 en
  `_prisma_migrations`, columnas verificadas). `migrate deploy` y `migrate
  resolve` se cuelgan en el pooler :6543 (locks), así que se aplicó por SQL
  directo + registro manual con el mismo checksum de Prisma (sha256 LF) —
  scripts en `apps/api/prisma/apply-migrations.ts` y `mark-resolved.ts`.
  Lección para producción: nada de `$transaction` interactiva contra el
  pooler — `crearPublico` se reescribió a descuento atómico condicional +
  compensación best-effort (11 tests, 82/85 OK).

### 2026-10-01 — Importación del catálogo WooCommerce (42 productos)

- CSV real revisado (42 productos simples, 111 columnas). Hallazgos y
  correcciones al importador `prisma/import-woocommerce.ts`:
  - La columna `Marcas` viene vacía; la marca del fabricante está en el
    **atributo "Marca"** → ahora se lee de ahí (HP, Dell, Lenovo, Epson,
    ViewSonic, LG, ASUS, Brother, Samsung, i3 Technologies).
  - Las descripciones traen `\n` literales → se limpian.
  - Categoría principal = **la raíz más específica** ("Servidores > Rack" →
    "Servidores"; los laptops vienen como "Computadoras, …, Laptops" → "Laptops").
    Antes quedaba la subcategoría y `/tienda/servidores` mostraba 2 de 10.
  - `.env` se lee con `path.join` (la ruta `file://` fallaba en Windows).
  - Nuevo modo `--sql=<archivo>`: genera un script SQL idempotente sin
    conectarse a la base (`prisma/seeds/productos-woocommerce.sql`, listo para
    pegar en el SQL Editor de Supabase). Uso: `--csv=<archivo>` (con `=`).
- Resultado (probado en Postgres local, 2 corridas sin duplicar): 42 productos,
  35 activos, 39 con oferta; categorías: Proyectores & Pantallas Interactivas 13,
  Servidores 10, Monitores 7, Laptops 6, Impresión 6.
- Quedan **inactivos** (no se ven en tienda): 4 con `Publicado=-1`, 1 con
  `Publicado=2`, y 2 sin precio (`LH55QMCEBGCXGO` y el de SKU triple
  `10010730 / 10010731 / 10010732`, a corregir en el dashboard).
- Ojo: el CSV no trae inventario; `¿Existencias?=1` crea stock **100 de
  prueba** (3300 unidades en total). Ajustar el stock real en el dashboard
  antes de vender. "Proyectores" y "Pantallas Interactivas" están juntos en
  una categoría; la tienda web tiene "Pantallas" aparte (decidir si se separan).

### 2026-10-01 — Tienda real conectada a la API (Fase 1: T1.1 y T1.3)

- `src/lib/catalogo.ts` (servidor): lee `GET /public/productos` (pagina de a 100)
  y `/public/productos/slug/:slug`, cache 60 s; **sin API o sin `HUB_MARCA_ID`
  usa el catálogo local** (`catalog.ts`). `/tienda`, `/tienda/[slug]` y
  `/producto/[slug]` ya no son estáticas del catálogo fijo; las categorías y
  marcas con sus conteos salen de los datos reales.
- URLs de producto: slug de la API; los enlaces viejos por SKU
  (`/producto/r360fy26q1`) siguen funcionando.
- `TIENDA_CATEGORIES` pasó a las 5 reales de la base (Monitores, Laptops,
  Proyectores y pantallas, Servidores, Impresión); el home muestra 5 tarjetas.
- Ficha: descripción real (plegable), OG/Twitter y JSON-LD `Product`.
- T1.3: el tipo de cambio ya no está fijo en el cliente: `GET /api/config`
  (variable `TIPO_CAMBIO_USD_PEN`, por defecto 3.75) → `CurrencyContext`.
- Pendiente de Fase 1: `/marcas` reales (T1.2).

### 2026-10-01 — Checkout real (Fase 2: T2.1)

- **Web** (`web-fptecnologi`): `/checkout` (datos del comprador, comprobante
  boleta/factura con DNI/RUC + razón social, recojo en tienda o envío a
  domicilio, forma de pago, notas, aceptar términos) con resumen del pedido, y
  `/checkout/gracias` (número de pedido copiable, total, WhatsApp). El carrito
  (`/carrito`) ahora lleva a "Finalizar compra"; "Cotizar este pedido" quedó
  como acción secundaria.
- **Proxy** `app/api/hub/pedidos`: el navegador manda SKU + cantidad; el
  servidor los traduce a los id del catálogo real y llama a
  `POST /public/pedidos`. La API recalcula precios, IGV 18% y stock (probado:
  un precio falso en el carrito se ignora). Con el catálogo local de respaldo
  no se vende (responde 503).
- **API**: `POST /public/pedidos` toma la IP real de `x-forwarded-for`
  (antes todos los compradores compartían la IP del servidor y el tope de
  5 pedidos / 10 min era global).
- Comprobante, razón social y tipo de entrega viajan en las `notas` del
  pedido (no hay columnas propias todavía). **Envío no incluido en el total**:
  se coordina por WhatsApp (decisión pendiente: costo por distrito).
- Verificado de punta a punta contra Postgres local: pedido creado, stock
  descontado, snapshot por ítem, carrito vaciado, errores de stock / producto
  inexistente / carrito vacío.
- Pendiente de Fase 2: dashboard de Pedidos y Productos (T2.2).

### 2026-10-01 — Dashboard de Pedidos y Productos (Fase 2: T2.2) + bug multi-tenant

- **Dashboard**: Ecommerce → **Pedidos** (`/ecommerce/pedidos`: filtro por
  estado, búsqueda, detalle con comprador, ítems con copia de la venta, totales,
  WhatsApp, cambio de estado y de pago, CSV) y Ecommerce → **Productos**
  (`/ecommerce/productos`: búsqueda, filtros por categoría / activo / sin stock,
  alta y edición en panel lateral, activar/desactivar con un clic). El grupo
  Ecommerce ahora se muestra al rol `ventas` (como exige la API) y a `admin`.
- **API**: `PATCH /pedidos/:id/estado` acepta `estado` y/o `estadoPago`
  (`PENDIENTE | POR_CONFIRMAR | PAGADO`). **Cancelar un pedido devuelve el stock**
  de sus ítems y un pedido cancelado no se puede reactivar. 4 tests nuevos.
- **Bug corregido (anterior a esta sesión)**: `update`/`delete` de `Producto`,
  `Servicio` y `update` de `Cotizacion` usaban `where: { id }` sin `marcaId` y el
  tenant-guard los rechazaba con 500: **editar un producto desde el dashboard
  nunca habría funcionado**. Ahora llevan `marcaId` (+ tests). Queda pendiente
  revisar `sitios.remove` (mismo patrón, no tocado).
- Layout: en las listas con panel de detalle (Pedidos, Productos, Leads) la
  tarjeta ya no se estira a la altura del detalle y los filtros hacen scroll.
- Verificado de punta a punta con Postgres local y el dashboard real (sesión de
  prueba): ver pedidos, cambiar pago, cancelar (stock 97→98 y 94→96), crear y
  editar producto.

### 2026-10-01 — Marcas reales (Fase 1: T1.2) — Fase 1 completa

- `/marcas`: tarjetas de las marcas aliadas (con logo) y las que tienen
  productos en la tienda, con el **conteo real** del catálogo, ordenadas por
  cantidad. `/marcas/[slug]`: grilla de productos de esa marca (con comparador,
  favoritos y carrito); si no hay productos, ofrece cotizar o WhatsApp.
  Metadatos OG por marca. Ya no son placeholders ni estáticas.
- Un producto sin marca comercial se muestra con la marca "FPTecnologi".
- Fase 1 (tienda real) completa: T1.1, T1.2 y T1.3. Fase 2: checkout (T2.1) y
  dashboard de pedidos/productos (T2.2) completos. Siguen: Fase 3 (asesores y
  equipo), Fase 4 (copy del cotizador) y Fase 5 (blog/SEO/pulido).

### 2026-10-01 — Cierre de sesión: pendientes documentados

- Se creó [`PENDIENTES.md`](PENDIENTES.md) con **todo lo que falta** para que otra
  persona continúe: integración de **envío con Shalom** (costo y sedes en el
  checkout y sumado al total — sin empezar; falta confirmar con Shalom si existe
  API), Fase 3 (fotos, equipo, quitar `api/contacto` con clave de Supabase en el
  código), Fase 4, Fase 5 (SEO/blog), deudas técnicas, y los datos y decisiones que
  dependen del dueño. `tasks/plan.md` marca lo ya hecho y agrega la Fase 2.5 (envío).
- Estado del envío hoy: "a coordinar por WhatsApp", `Pedido.envio = 0`, total sin envío.

### 2026-10-01 — Gestión de usuarios, invitaciones y autenticador

- **Invitaciones por correo**: modelo `Invitacion` (solo hash del token, vence en 7 días; migración `20261001200000_invitaciones`). API: `GET/POST /invitaciones`, `POST /invitaciones/:id/reenviar`, `DELETE /invitaciones/:id` (admin) y públicas `GET /public/invitaciones/:token`, `POST /public/invitaciones/aceptar`. Página `/auth/invitacion` (cuenta nueva: nombre+contraseña; existente: un clic). 3 tests.
- **Usuarios y equipo con datos reales** (`apps/admin/src/screens/pages/Team.tsx`): pestañas Equipo / Invitaciones / Clientes de las webs (`GET /roles/clientes`); cambiar rol, activar/desactivar, quitar de la marca y restablecer 2FA (`PATCH/DELETE /roles/equipo/:usuarioId`). No se puede desactivar a quien está en otras marcas ni auto-modificarse.
- **Fix de seguridad**: `asignar`, `quitarAsignacion` y `equipoDeMarca` aceptaban un `marcaId` distinto al de la cabecera (un admin de A podía actuar en B); ahora deben coincidir.
- **Autenticador (TOTP)**: tarjeta en Ajustes (QR → código → códigos de respaldo → desactivar) con `GET /usuarios/me/seguridad`; en el login TOTP se agregó "Recibir un código por correo".
- Arreglados los 3 tests de `updatePerfil` que fallaban desde antes.

### 2026-10-01 — Seguridad: `contacto` sin credencial en el código y módulo `sitios` multi-tenant

- `web-fptecnologi/app/api/contacto`: se quitó la clave `anon` de Supabase que estaba escrita en el código; ahora
  `LEADS_SUPABASE_URL`/`LEADS_SUPABASE_ANON_KEY` (servidor, ver `.env.example`; resuelto en el commit f36835d), y sin la
  llamada a `/cotizaciones` (siempre devolvía 401). **Pendiente del dueño: rotar la clave antigua** (queda en el historial).
- API `sitios`: `POST/GET/DELETE` ahora con `MarcaRolGuard` (crear/borrar solo `admin`), `marcaId` del servidor, 4 tests.
  El tenant-guard permite consultar `Sitio` por `dominio` (para `GET /sitios/resolver/:dominio`).


### 2026-10-01 — Equipo real (T3.2) + cierre de escalada de privilegios en `roles`

- **Seguridad (API `roles`)**: `MarcaRolGuard` solo valida la marca del header `x-marca-id`, pero tres rutas usaban
  otra marca sin validar: `POST /roles/asignaciones` (marcaId del body) y `DELETE /roles/asignaciones/:usuarioId/:marcaId/:rolId`
  (marcaId de la URL) permitían a un admin de la marca A asignarse/quitar roles en la marca B, y
  `GET /marcas/:marcaId/equipo` dejaba a cualquier miembro leer el equipo de otra marca. Ahora `asignar` y `quitar`
  usan solo la marca activa (el DTO ya no trae `marcaId`; la ruta de borrado pasó a `/roles/asignaciones/:usuarioId/:rolId`)
  y `equipo` exige que la marca de la URL coincida con la activa. `POST /roles` (crear rol) pasó a solo admin.
  4 tests nuevos.
- **Dashboard**: `Team.tsx` ya no usa datos de ejemplo (ver `PENDIENTES.md` → T3.2); menú alineado con la API.
- Tests: se arreglaron los 3 de `usuarios.service.spec.ts` (estaban desactualizados); API 99/99.

### 2026-10-01 — Asistente virtual conectado a toda la web y a la base de datos; home con productos reales

- **Asistente** (`web-fptecnologi/app/api/chat`): ya no usa un resumen fijo. `src/lib/chatConocimiento.ts` reúne, cacheado 60 s:
  empresa y contacto, Nosotros (misión/visión/valores), los 8 servicios con su detalle (qué incluye, beneficios, sectores,
  preguntas), servicios cargados en la BD (`GET /public/servicios`), la tienda (categorías, marcas y hasta 80 productos con
  marca, SKU, precio y oferta desde `GET /public/productos`, cómo comprar y envío), Partners, cotizador (CMS), artículos del
  blog, resumen de los textos legales (devoluciones completo) y el mapa de páginas. Proyectos y clientes **no** se le pasan
  (son de ejemplo). Nuevos botones que puede adjuntar: `producto:<SKU>`, `marca:<nombre>`, proyectos, blog, marcas,
  devoluciones y libro de reclamaciones. Tope de 30 mensajes / 10 min por IP.
  Ojo: el prompt pesa ~5–6 mil tokens; si Groq está en un plan con poco límite por minuto, bajar `MAX_PRODUCTOS`.
- **Home**: "Productos destacados" lee la API (`getDestacados`): marcados como destacado → primeros del catálogo → fijos.
- `NOSOTROS_PILARES` pasó a `content.ts` para que la página y el asistente compartan el texto.

### 2026-10-01 — Servicios, proyectos y clientes pasan a la base de datos (gestionables desde el dashboard)

- **Base de datos**: `Servicio` ganó el contenido de su página (slug, etiqueta, ícono, imagen, intro, incluye, beneficios,
  sectores, faqs, orden) y hay modelos nuevos `Proyecto` y `Cliente` (con `esEjemplo`). Migración
  `20261001200000_servicios_proyectos_clientes` (verificada: aplica sobre una base vacía y coincide con el esquema de
  Prisma) + seed idempotente `seeds/servicios-proyectos-clientes.sql` generado desde lo que traía la web.
  Tenant-guard extendido a los dos modelos nuevos.
- **API**: `servicios` ampliado (slug único por marca, JSON validado, búsqueda por id o slug); módulos `proyectos` y
  `clientes`; públicos `GET /public/servicios[/:slug]`, `/public/proyectos`, `/public/clientes`. Probado contra Postgres
  local: permisos por rol (marketing crea, solo admin borra servicios, ventas no toca proyectos), validaciones, aislamiento
  por marca. 112 tests (13 archivos).
- **Dashboard**: pantallas Soluciones → Servicios, Web informativa → Lista de proyectos y → Clientes (lista, filtros, panel
  de edición, activar/ocultar, eliminar). Probadas en un navegador real (crear, editar, validar, eliminar).
- **Web pública**: `lib/servicios.ts` y `lib/referencias.ts` leen la API (cache 60 s) con respaldo local. El menú toma los
  servicios por un contexto (`ServiciosProvider` en el layout); home, `/servicios`, página de cada servicio, footer,
  cotizador (opciones de interés) y asistente usan la base de datos, y los servicios nuevos aparecen en todos. El asistente
  solo cita proyectos y clientes que no sean de muestra.
- **4 servicios nuevos** (borrador de texto): soporte técnico y postventa, redes y cableado estructurado, ciberseguridad,
  licenciamiento de software. Íconos nuevos en el catálogo de la web (llave inglesa, red, candado, llave).
- Se quitó del menú el nodo placeholder "Web informativa → Servicios" (duplicaba Soluciones → Servicios).

### 2026-10-01 — Envíos, catálogo, blog/SEO y limpieza (sesión de cierre)

- **Envío por Shalom (tarifario propio)**: modelo `TarifaEnvio` + columnas de envío en `Pedido` (migración `20261001230000_envios`).
  API `GET/POST/PATCH/DELETE /envios/tarifas` (admin/ventas) y pública `GET /public/envios/tarifas`; `POST /public/pedidos`
  acepta `envioDepartamento`/`envioSede` y el servidor suma el costo (nunca confía en el cliente). Checkout con tercera
  opción "Envío por Shalom" (departamento → agencia → costo y plazo en el resumen) y proxy `app/api/hub/envios`. Dashboard:
  Ecommerce → Envíos (tarifario) y, en Pedidos, courier, agencia y código de seguimiento. Verificado en el navegador
  (806 + IGV 145.08 + envío 12.50 = 963.58) y por API (departamento sin tarifa → 400; agencia inválida → 400).
- **Ecommerce → Catálogo**: categorías y marcas comerciales (`/catalogo/*`).
- **Blog y SEO**: metadatos OG/canonical, JSON-LD, `sitemap.xml`, `robots.txt`.
- **Modelos de home archivados**: `app/modelo-*`, `modelos`, `guia-estilos*`, `preview` y los componentes `site2..site11`,
  `site-claude`, `riteflow` se movieron a `temporal/modelos-home/` (ver su `LEEME.md`); fuera de build y rutas.
- **Prueba punta a punta (API real + cuenta de prueba)**: 30 comprobaciones de usuarios/invitaciones/equipo/catálogo/envíos
  y 12 de 2FA (código por correo, app autenticadora, código de respaldo, desactivar, alternativa por correo) — todas OK; los
  datos de prueba se borraron. `apps/leads` eliminado del repo (vive en `centralizacion-leads`).

### 2026-10-01 — Agencias Shalom por ubicación y blog más completo

- **Agencias Shalom reales en el checkout**: se reutilizó el directorio del proyecto MemoAI-SCROLL (544 agencias con dirección,
  horario, teléfono y coordenadas; `apps/api/src/envios/shalom-agencias.data.ts`). API pública `GET /public/envios/agencias/provincias`,
  `/agencias?departamento&provincia` y `/agencias/cercanas?lat&lng[&departamento]` (haversine). El checkout permite elegir
  departamento → provincia → agencia, o **"Usar mi ubicación"**, que propone las 5 más cercanas y autoselecciona la primera
  (la ubicación no se guarda). El servidor valida que la agencia exista y pertenezca al departamento (`EnviosService.cotizar`);
  el pedido guarda "zona — dirección (provincia, departamento)". Se quitó la carga manual de agencias del dashboard. 128 tests.
- **Blog**: detalle con barra de progreso, índice lateral (anclas en los títulos), recientes, categorías con conteo, etiquetas
  enlazadas, newsletter, autor y anterior/siguiente; listado con buscador, filtros `?categoria=`/`?etiqueta=`/`?q=`, etiquetas
  en tarjetas y 3 columnas desde 1024 px con paginación de 9.


### 2026-10-01 — Rediseño de carrito, checkout y gracias

- **Carrito** (`components/tienda/CartView.tsx`): ahora usa la franja de la tienda (`TiendaBar`) en vez del encabezado viejo; tarjetas por producto con foto, cantidad (+/−), subtotal y quitar; resumen oscuro con brillo de marca, garantías, medios de pago, "Vaciar carrito", estado vacío con CTA y barra fija con el total en móvil.
- **Checkout**: indicador de pasos (`PasosCompra`) en carrito → datos y entrega → pedido recibido; secciones con chip degradé y descripción; resumen con enlace "Editar carrito"; barra fija con total y "Confirmar pedido" en móvil.
- **Gracias** (`PedidoGracias.tsx`): confirmación con número (copiar) y total, "¿Qué sigue?" en 3 pasos, datos de contacto y CTA a WhatsApp / seguir comprando.

### 2026-10-01 — Cotizaciones de servicios, Clientes de la tienda y aviso de pedidos

- **Soluciones → Cotizaciones** (`SolucionesCotizaciones.tsx`): solicitudes del botón "Solicitar cotización" de cada servicio (`CotizarServicioForm`, proxy `/api/hub/cotizaciones`, `POST /public/cotizaciones`). El equipo arma la propuesta (texto, monto USD/PEN, vigencia), la envía **por correo** (sale del servidor) o **por WhatsApp** (abre `wa.me` con el mensaje) y cada envío queda en el historial; se ven las otras cotizaciones del mismo cliente. Modelo `Cotizacion` ampliado + `CotizacionEnvio` (migración `20261001240000_cotizaciones_servicio`). 5 tests + prueba punta a punta (8/8).
- **Ecommerce → Clientes** (`EcommerceClientes.tsx`, `GET /clientes-tienda`): compradores agrupados por correo (pedidos, gastado, cotizaciones) con detalle y contacto directo.
- **Pedido nuevo**: además de la notificación en el dashboard, ahora el equipo (admin y ventas) recibe un **correo** con el detalle y el enlace; al confirmar, la página de gracias ofrece "Enviar mi pedido por WhatsApp" con **todos los datos** (cliente, documento, entrega/agencia, pago, productos, totales, notas).
- **Ficha de producto**: el fondo de las fotos de producto es sólido (`.bg-producto`), ya no deja ver los puntitos del fondo de la página. El asistente de IA está en el layout raíz (todas las páginas) y usa el look claro en tienda, producto, marcas, carrito y checkout.

### 2026-10-01 — Cotizador y animaciones de página

- **Cotizador**: se quitó la caja "¿Quieres contarnos algo más?" del paso 1 (y sus dos campos del editor Cotizador → Formulario); el cuadro del formulario y el panel "¿Por qué cotizar con nosotros?" comparten el mismo eje horizontal (`lg:items-center`); opciones con entrada escalonada y hover (sube y sombrea), beneficios con entrada escalonada, ícono que "salta" al hover y contactos que se deslizan.
- **Transiciones de página** (todo el sitio público): entrada con `pagina-entra` sobre `main` y salida con `TransicionPagina` (al hacer clic en un enlace interno el contenido se desvanece ~220 ms antes de navegar; respeta Ctrl/Cmd, anclas, `target=_blank` y `prefers-reduced-motion`). Utilidades `.hover-lift`, `.hover-slide`, `.icon-pop` en `globals.css` para reutilizar.

### 2026-10-01 — Campañas, landing pages y subida de imágenes

- **Subida de imágenes desde el computador** (`POST /uploads`, `SubirImagen.tsx`): JPG/PNG/WEBP/GIF de hasta 5 MB, validadas por los bytes reales (SVG rechazado), guardadas en `apps/api/uploads/<marca>/` y servidas en `/uploads/…` (variables `UPLOADS_DIR` y `PUBLIC_API_URL`). Ya se usa en **productos** (galería con portada, quitar y reordenar), **categorías** y **portada del blog**, y en las landings.
- **Campañas → Landing pages**: se crea una landing eligiendo plantilla (**Evento/feria** como el registro de EXPOMINA, **Oferta/producto**, **Captación simple**); el editor tiene Contenido (textos, imagen, fecha/lugar, beneficios, programa, FAQ), Formulario (3 formularios prediseñados; campos de tipo texto, texto largo, correo, celular, DNI/RUC, lista y casilla; obligatorio; pasos con barra de avance; reordenar), Ajustes (nombre, URL pública `/l/<slug>`, campaña) y Registros (búsqueda, exportar CSV). Se publica/despublica, tiene vista previa de borrador (token de 20 min) y duplicar. La página pública la dibuja `apps/web-fptecnologi` (`/l/[slug]`, `FormularioLanding`) y el servidor valida cada registro contra el formulario (honeypot + tope por IP + aviso al equipo).
- **Campañas → Campañas**: agrupan landings con fechas, objetivo y presupuesto y muestran los registros captados por cada una.
- Modelos `Campana`, `Landing`, `LandingRegistro` (migración `20261001250000_campanas_landings`). 7 tests nuevos y prueba punta a punta (26/26).

### 2026-10-01 — Reportes, dashboard comercial, usuarios de prueba y preparación para cPanel

- **Reportes → Ventas** (`ReportesVentas.tsx`, `GET /reportes/ventas`): rango de fechas en hora de Lima con comparación contra el periodo anterior, ventas por día, pedidos por estado, medio de pago, entrega y departamento, top de productos y de clientes, y exportación a CSV. 5 tests.
- **Inicio → Dashboards** (`InicioDashboard.tsx`): tablero comercial con lo que hay que atender (pedidos, cotizaciones, leads, contactos, chats, stock bajo), ingresos, embudo leads → cotizaciones → pedidos, campañas y landings con más registros.
- **Usuarios de prueba por rol**: `apps/api/prisma/seeds/usuarios-prueba.ts` crea una cuenta por cada rol del equipo (`dev+prueba-<rol>@fptecnologi.com`, 2FA a la bandeja de dev@); las contraseñas quedan en `docs/credenciales-prueba.md` (ignorado por git). `--reset` regenera y `--borrar` las elimina.
- **Despliegue en cPanel**: archivos de arranque `apps/api/app.cjs` y `apps/*/server.cjs` (Passenger), variables nuevas en los `.env.example` y guía completa en [`DESPLIEGUE-CPANEL.md`](DESPLIEGUE-CPANEL.md) (incluye cómo funcionan las invitaciones). Verificado: `nest build` + `node app.cjs` y `next build` + `node server.cjs` arrancan.
- **Todos los módulos del menú del dashboard ya existen** (se quitó la lista de "módulos vacíos").

### 2026-10-01 — Mi cuenta del cliente (web pública)

- **Acceso sin contraseña**: `/cuenta` → el cliente escribe su correo, recibe un código de 6 dígitos (solo si ese correo tiene pedidos o cotizaciones; la respuesta es siempre la misma) y entra. Modelo `CodigoCuenta` (migración `20261001260000_codigo_cuenta`), endpoints `POST /public/cuenta/codigo|verificar` y `GET /public/cuenta/resumen`. No crea usuarios ni da acceso al dashboard: la sesión es un token firmado por correo (30 días) guardado en una **cookie httpOnly** de la web (proxies `app/api/cuenta/*`).
- **Qué ve**: perfil resumido, **Mis pedidos** (línea de avance Recibido → Pago confirmado → Enviado → Entregado, detalle, agencia Shalom, código de seguimiento, botón de consulta por WhatsApp) y **Mis cotizaciones** (estado y la propuesta con monto y vigencia **solo cuando el equipo ya la envió**; los borradores y notas internas nunca salen de la API). Ícono de cuenta en el menú de la tienda y enlace desde la página de gracias.
- Seguridad: código de un solo uso (bcrypt, 10 min, máx. 5 intentos), tope de pedidos de código por correo e IP, token alterado/vencido o de otra marca rechazado. 7 tests + prueba punta a punta (8/8) y verificación visual.
- **Subdominios**: `NOINDEX=1` hace que la web de pruebas no se indexe (guía de paso al dominio principal en `DESPLIEGUE-CPANEL.md`).


## 2026-10-01 — Conocimiento del asistente + índices de base de datos

- **Índices**: migración `20261001270000_indices` (Pedido, PedidoItem, Cotizacion, Notificacion, Producto por marca/estado/fecha) para que las listas y reportes no recorran tablas enteras.
- **Tercera fuente del chat** (`apps/api/src/conocimiento`): en el dashboard **Chat y asesores → Conocimiento del asistente** se suben Word (.docx), Excel (.xlsx), PDF, .txt/.md/.csv (≤10 MB). Se leen **una sola vez**, se trocean (~900 caracteres, con su título de sección; las filas de Excel quedan como «Columna: valor») y se guardan con índice de texto completo (tsvector + GIN, español, sin tildes). El archivo original no se conserva; el chat solo busca fragmentos.
- Pestañas: Documentos (activar/desactivar/borrar/ver contenido), Respuestas oficiales (tienen prioridad), Sin respuesta (preguntas que el chat no pudo responder, ordenadas por frecuencia → se responden con un clic), Probador e Instrucciones (tono y políticas).
- La web (`app/api/chat/route.ts`) consulta `POST /public/conocimiento/consultar` (tope por IP, 2,5 s de timeout; si falla, el chat sigue con web + base de datos) y agrega «INFORMACIÓN ADICIONAL OFICIAL» al prompt.
- Tests del lector/troceador/términos (`conocimiento.parser.spec.ts`) y prueba contra la base real (subir → buscar → pendiente → borrar).

## 2026-10-01 — Ajustes del sitio, textos legales y SEO editables

Todo usa el CMS genérico (`ContenidoWeb`) y el editor de Web informativa; sin cambios en la API. Valores por defecto en `apps/web-fptecnologi/src/lib/paginasContenido.ts` (páginas `sitio`, `legal`, `seo`).
- **Web informativa → Ajustes del sitio**: dirección, teléfonos, correo, WhatsApp general, redes (vacío = se oculta), cifras de la empresa y tipo de cambio USD→PEN. Lo leen `lib/sitio.ts` (servidor) y `useSitio()` (cliente, `SitioProvider` en el layout); reemplaza los antes fijos `CONTACT_INFO`/`SOCIAL_LINKS`/`STATS` y la variable `TIPO_CAMBIO_USD_PEN` (queda como valor inicial). El chat IA también usa estos datos y el horario de Contacto → Visítanos.
- **Textos legales**: privacidad, términos y devoluciones en markdown (`## Título` abre sección); vacío = texto base de `lib/legal.ts`. El asistente lee la versión editada.
- **SEO por página**: título y descripción de Inicio, Nosotros, Servicios, Proyectos, Contacto, Tienda, Cotizador y Blog (`lib/seo.ts`).
- Pendiente: los números de WhatsApp **por asesor** siguen en Chat y asesores → Asesores de WhatsApp; el aviso `ponytail` en `chatActions.ts` explica que el contacto vigente es estado de módulo (una marca por despliegue).

## 2026-10-01 — La carpeta del dashboard pasa de `apps/web` a `apps/admin`

El dashboard (administra todas las webs, no solo una) ahora vive en `apps/admin`; `apps/web-fptecnologi` sigue siendo la web pública. Se actualizaron CI, dependabot, docker-compose, `.claude/launch.json` (servidor `admin`), README, AGENTS/CLAUDE y la guía de cPanel (Application root: `fptecnologi-web/apps/admin`). Las entradas anteriores de este documento conservan el nombre antiguo.

## 2026-10-01 — Módulo Mailing (demostración) y repos separados

- **Mailing** (dashboard → Mailing → Mailings, rol marketing): se crea un correo desde plantilla (Promoción de productos, Novedades del blog, Servicio y cotización, Bienvenida, En blanco), se edita por bloques (portada, texto, imagen, botón, productos, separador), vista previa en vivo escritorio/móvil, copiar/descargar el HTML, duplicar y «Enviar…» a los suscriptores del boletín o a una lista pegada. **Es visual:** se guarda en el navegador y el envío es simulado. Falta: guardar en la API y conectar un servicio de envío masivo (Resend/SMTP con cola y baja de suscripción).
- **Repos**: el HUB tiene todo; `fptecnologi-web` pasa a ser un espejo **solo de la web pública** (`apps/web-fptecnologi` en la raíz). `scripts/publicar-snapshot.sh` lo hace.

## 2026-10-01 — Mailing: biblioteca `mailing-fp`

Se copiaron al dashboard (`apps/admin/public/mailing-fp/`, con `catalogo.json`) las 5 plantillas base y los 15 mailings de campañas del repo `FP-Tecnologi/mailing-fp` (HTML responsivo ya probado). En Mailing → «Biblioteca mailing-fp» se elige una y se abre como mailing editable: los `[marcadores]` aparecen como campos a completar, hay «Editar HTML», vista previa escritorio/móvil, copiar/descargar y envío simulado. Las imágenes siguen cargando desde jsDelivr (`FP-Tecnologi/mailing-producto@main`). Revisión con `verificar-mailing.py`: las 5 plantillas y IdeaHub/FISI pasan; fallan por «falta enlace de baja» los de EXPOMINA y sorteos (y varias propuestas EXPOMINA tienen imagen sin `width`).

## 2026-10-01 — Campanita de notificaciones en el encabezado

Junto al perfil, en el encabezado del dashboard, hay una campanita con contador de no leídas y un panel con las últimas 8 (marcar una o todas como leídas, «Ver todas» → `/notificaciones`). Consulta `GET /notificaciones?limite=30` cada 30 s (solo con la pestaña visible) y, cuando llega una nueva, muestra un aviso flotante arriba a la derecha (7 s, máx. 3). Son las mismas notificaciones del sistema (pedidos, cotizaciones, chat, equipo, stock). Código: `apps/admin/src/components/shell/NotificationBell.tsx`; la API ganó el parámetro opcional `limite` (tope 100). Sin sonido ni notificaciones del navegador por ahora.

## 2026-10-01 — Super administrador y usuarios globales

- **Super admin** = usuario con rol `admin` en **todas** las marcas (se deduce de las asignaciones; no hay un rol aparte). `SuperAdminGuard` (`apps/api/src/common/guards/super-admin.guard.ts`) protege lo que cruza marcas: **crear y borrar marcas** (antes cualquier usuario con sesión podía crear una marca por `POST /marcas`) y `GET/PATCH/POST/DELETE /usuarios/global/*`.
- **Dashboard → Configuración → Todos los usuarios** (`/admin/usuarios`): cuentas de todas las marcas con sus roles por marca, búsqueda y filtros por marca/rol, activar/desactivar la cuenta, agregar/quitar un rol en una marca (nadie se quita su propio admin ni se desactiva a sí mismo).
- **Invitaciones**: ahora guardan quién invitó (`Invitacion.invitadoPor`, migración `20261001290000`) y la pestaña Invitaciones lo muestra.
- `jaimetr1309@gmail.com` es super admin (admin de las 5 marcas); su contraseña se actualizó en la base. Quedan sin hacer: invitar con rol `cliente`, varios roles en una sola invitación y asignar asesores del chat desde Usuarios.

## 2026-10-01 — Asesores del chat desde Usuarios y arreglo de «Usar mi ubicación» en el envío

- **Asesores del chat desde Usuarios y equipo**: cada miembro tiene «Hacer asesor del chat» / «Perfil de asesor» (área, teléfono visible, WhatsApp). Crea el `ChatAsesor` ligado a la persona (`usuarioId`, migración `20261001300000`), aparece en «Habla con un asesor» de la web y se muestra con una etiqueta en la tabla; «Quitar de asesores» lo borra, y quitar al miembro de la marca borra también su perfil. Un perfil por persona.
- **Envío / ubicación**: la web NO usa una API de Shalom: el directorio de agencias (544, con coordenadas) es una foto estática y el costo sale del tarifario manual. «Usar mi ubicación» fallaba porque el tarifario tenía «Chiclayo» y «Trujillo» (ciudades) y el directorio usa departamentos («Lambayeque», «La Libertad»): nunca coincidían. Se corrigieron los datos, ahora el tarifario guarda siempre el nombre del directorio (y rechaza uno inválido) y la búsqueda por cercanía se hace solo entre los departamentos con tarifa activa. Mensajes más claros cuando no hay envío o falta el permiso de ubicación (solo funciona en https).
- **API de Shalom**: no hay API pública oficial. Existe un servicio de terceros, *Shalom API Perú* (`shalom-api-peru.com`: agencias, cotización por terminal y peso, creación de guías, tracking; sin precio publicado, la clave se pide por WhatsApp). Para crear guías pide las credenciales de Shalom Pro. Evaluarlo cuando haya volumen; mientras tanto el tarifario manual cubre el cobro.

## 2026-10-01 — Agencias Shalom en vivo (shalom-api.lat, gratis)

- Hay **dos** proveedores terceros con el mismo nombre: `shalom-api.lat` (límite 1000 req/min, endpoints `/public/*` de agencias **sin key**) y `shalom-api-peru.com` (todo con key, 60 req/min; la .lat lo desconoce públicamente). Ninguna publica precios: cotizar/crear guías requiere key con plan (solo por WhatsApp). Ninguna es oficial de Shalom.
- **API**: nuevo `ShalomApiProvider` (`apps/api/src/envios/shalom-api.provider.ts`) que consulta `/public/agencies/search` sin key (timeout 8 s, caché 24 h directorio / 10 min cercanía) y mapea a la forma canónica (ids `shalom:<ter_id>`). `GET /public/envios/agencias*` prueba lo vivo primero y **cae al directorio estático si falla**; `cotizar` acepta sedes vivas (registro en memoria, sin red en el pedido). `SHALOM_API_URL` en `.env.example` (solo URL pública, sin secreto). 8 tests nuevos; suite 169/169.
- Alcance: **solo agencias**. Tarifas y guías siguen propias hasta tener key con plan. Ojo: la API viva trae tildes rotas (mojibake, ej. `Convenci�n`) y no tiene sandbox. Detalle en `docs/PENDIENTES.md` → Envío con Shalom.

## 2026-10-01 — Checkout: distrito de recojo y agencias según el distrito

- En «Envío por Shalom» el cliente elige departamento → provincia → **distrito** (los 1874 distritos del ubigeo INEI, `apps/api/src/envios/ubigeo.data.ts`). Con el distrito, la lista de agencias muestra primero **«En {distrito}»** y luego **«Más cercanas»** con la distancia (mismo departamento, que es el de la tarifa). Sin distrito sigue mostrando todas las de la provincia.
- Las agencias en vivo traen el código ubigeo (`ubi_id`): el «está en el distrito» es exacto (Miraflores ≠ San Juan de Miraflores). Con el directorio estático se compara la zona y el «DISTRITO - PROVINCIA» de la dirección.
- La ubicación del distrito se obtiene con OpenStreetMap/Nominatim (`geocodificar.ts`: gratis, 1 consulta/s en cola, caché 7 días, tope por IP; si no encuentra el distrito usa la provincia y lo marca aproximado). Rutas nuevas: `GET /public/envios/agencias/distritos` y `/por-distrito`. 176 tests.
- Pendiente conocido (de la integración en vivo): algunas direcciones traen tildes rotas («N?533»).

## 2026-10-01 — Agencias Shalom: textos dañados corregidos

Las fuentes de Shalom traían símbolos rotos («N?533», una «Â» suelta, «VILLóN» con una minúscula en medio). `limpiarTexto` (`apps/api/src/envios/agencias-shalom.ts`) los corrige en zona, dirección y horario, tanto en las agencias en vivo como en el directorio estático («N° 533», «VILLÓN»). Con test. Queda resuelto el pendiente de tildes rotas.

## 2026-10-01 — Web informativa → Popups (avisos emergentes administrables)

- **Dashboard** (`Web informativa → Popups`, `WebPopups.tsx`, rol marketing/admin): listado con estado real (borrador / en curso / programado / pausado / finalizado), vistas y clics; crear desde **plantilla** (Aviso, Promoción, Descuento con cupón, Evento, Producto destacado), duplicar, activar/pausar y editor con vista previa. Se pueden tener varios a la vez (p. ej. uno para la tienda y otro para el home).
- **Qué se configura**: contenido (sello, título, mensaje, imagen, descuento, cupón, fecha/lugar, color), **formato** (ventana central, tarjeta en la esquina, barra superior), **botón** (solo cerrar, enlace, ir a un producto —el enlace sale de la ficha real— o WhatsApp), **disparador** (al cargar, tras N segundos, al bajar N % o al intentar salir), **frecuencia** (siempre, una vez por sesión, una sola vez, cada N horas/días), **páginas** (home, tienda, producto, carrito, servicios, proyectos, nosotros, contacto, blog, otras, o todas), dispositivo, prioridad y **programación** (desde/hasta).
- **API**: `GET/POST/PATCH/DELETE /popups`, `GET /popups/plantillas`, `POST /popups/:id/duplicar` (admin/marketing); públicos `GET /public/popups?marcaId&pagina=` (solo ACTIVOS, vigentes y de esa página) y `POST /public/popups/:id/evento` (cuenta vista/clic). El contenido se recorta a una lista blanca (enlaces solo `http(s)://` o `/ruta`) y no deja activar un popup sin página, título o producto.
- **Web** (`PopupsSitio.tsx` en el layout + proxies `app/api/hub/popups`): muestra como máximo uno por página; la frecuencia se recuerda en el navegador y, si se edita el popup, vuelve a salir. No aparece en las landings `/l/…`.
- Modelo `Popup` (migración `20261001310000_popups`, tenant-guard incluido). 12 tests nuevos. Pendiente: aplicar la migración en Supabase (`prisma/apply-migrations.ts`) y probar con datos reales.

## 2026-10-01 — Web: arreglo del comparador de productos

- **Síntoma**: al marcar "comparar" el botón cambiaba de color pero el panel de comparación no se veía (inicio, y a veces en la tienda/fichas/marcas).
- **Causa**: `main` tenía `animation: pagina-entra … both`; el último fotograma dejaba un `transform` permanente en `main`, y eso hace que cualquier `position: fixed` de adentro (el `CompareDock`) se posicione respecto a `main` y no a la pantalla (quedaba a ~6000 px, fuera de vista). Ahora la animación usa `backwards` y termina limpia (`app/globals.css`).
- **Extra**: en `home/ProductCardFinal.tsx` las flechas de foto (invisibles hasta el hover) tapaban el botón de comparar en tarjetas chicas (celular); se bajaron a `top-[68%]` y no capturan clics mientras están ocultas.

## 2026-10-01 — Web: color principal `#2898ee`

- `--color-brand-primary` pasa de `#155382` a `#2898ee` (`apps/web-fptecnologi/app/globals.css`); `--color-brand-dark` (`#2181af`, hover y fondos profundos) no cambia. También se actualizaron los valores escritos a mano: sombras de color, `themeColor` del navegador, acento de los radios del libro de reclamaciones y el tema "azul"/"claro" de los popups (web y vista previa del dashboard). Nota: texto blanco sobre `#2898ee` tiene contraste ~3:1.
- El dashboard (`apps/admin`) conserva su propio acento y no se tocó.

## 2026-10-01 — Web: paleta primario `#2898ee` + secundario `#107acc`

- Se eliminan los azules oscuros: `--color-brand-primary` = `#2898ee` (base de botones) y `--color-brand-dark` = `--color-brand-petrol` = `#107acc` (hover/secundario y final de los degradados). Los turquesas (`brand-teal`, `brand-teal-light`) no cambian. Los popups "azul" usan el mismo par. Reemplaza lo anotado en la entrada anterior sobre `#2181af`.

## 2026-10-01 — Web: fondos oscuros pasan al color primario

- Todo `bg-/from-/via-/to-ink` sólido o con opacidad ≥ 20 % (footer, contacto, cotizador, carrito, checkout, landing, tienda, navegación, chat…) usa ahora `brand-primary`; `ink` se conserva como color de texto. También `.glass-panel`, los velos del hero (`home/Hero`, `PageHero`, ambos al 80 % para que el texto blanco se lea), las cabeceras `HeaderDark`, el menú móvil de `Navbar9` y el degradado de las tarjetas de servicio. Se dejan en negro los fondos de ventanas modales (galería, popups) y los velos ≤ 10 %.

## 2026-10-01 — Web: color de marca único `#107acc` (el pie de página se queda oscuro)

- Prueba de color único: `--color-brand-primary`, `--color-brand-dark` y `--color-brand-petrol` = `#107acc` (hoy el hover no cambia de tono; separar `brand-dark` en `globals.css` si se quiere uno distinto). Sombras, `themeColor`, libro de reclamaciones y popups "azul" alineados.
- Por pedido del cliente, el **pie de página** (`Footer` de `home/` y `site/`) y la sección **«Hablemos»** (`home/Contact`) vuelven al fondo oscuro de marca (`bg-ink`); solo el resto de fondos oscuros usa el primario.

## 2026-10-03 — Web: sistema de color a partir de `#107acc`

- **Escala tonal** en `apps/web-fptecnologi/app/globals.css` (`--color-brand-50 … 950`, el `600` es exactamente `#107acc`). Nombres semánticos que ya usan los componentes: `brand-primary` = 600 (botones, acentos), `brand-dark` = 700 (hover/presionado y texto de acento chico), `brand-petrol` = 700, `brand-teal` = 500 y `brand-teal-light` = 300 (reemplazan a los turquesas). `paper` (fondo de página) = 50. Sin azules oscuros fuera de la escala; `ink` (`#0b1b26`) sigue siendo el negro de marca para texto y pie de página.
- **Letras**: acentos de títulos (`title-shimmer-*`, `hero-title-shimmer`) con degradados de la escala (el celeste aqua `#8fe0ee` pasó a `brand-200`); texto de acento chico (`text-brand-primary` en `text-xs/sm/base`, 120 usos) pasa a `brand-700` (6.6:1 sobre blanco) y los títulos grandes quedan en 600; enlaces de blog y citas con 700/800.
- **Superficies y detalles**: botones sólidos en 600 (antes 700) que se oscurecen a 700 en hover; `.btn-glow` 500→600; puntitos del fondo, selección de texto (`::selection`) y foco (`:focus-visible`) en tonos de la escala; sombras con `rgba(16,122,204,…)`.
- **Contraste (auditoría con Playwright sobre inicio, tienda, nosotros, servicios, contacto, cotizador, proyectos)**: el verde de WhatsApp con letra blanca daba 2.3:1 → `--color-whatsapp-dark` `#14793e` (5.5:1) para botones y texto, `--color-whatsapp-deep` en hover. Único punto borderline: blanco sobre `#107acc` = 4.49:1 (AA pide 4.5) — es el color de marca, se deja así.

## 2026-10-04 — Presupuestos mayoristas (fase 1) y contacto por áreas

- **Web, contacto**: `/contacto` ya no muestra a los asesores por WhatsApp (verde); ahora «Contacto por área» (comercial, ventas, marketing, soporte técnico, atención al cliente, administración; datos de ejemplo en `src/lib/areasContacto.ts`) y «Soporte por tickets» (verificar producto / reclamo / soporte; mientras no exista el módulo de tickets va por `/api/contacto` con el tipo al inicio del mensaje).
- **Mayorista vs cliente final** (`CartContext.perfil`, selector en `/carrito`): mayorista = mínimo **6 unidades por producto**, precio `precioMayorista` (si el producto no lo tiene se usa `precio`), sin checkout: «Pedir presupuesto» → `/presupuesto` → documento `/presupuesto/[id]` (tipo boleta, imprimible/PDF desde el navegador). El checkout normal queda para cliente final.
- **API**: módulo `presupuestos` (`POST /public/presupuestos` recalcula precios, IGV 18 % y total en el servidor y asigna `COT-AAAA-XXXXXX`; `GET /public/presupuestos/:id`). **BD** (migración `20261002100000_presupuestos`, ya aplicada a Supabase): `Producto.precioMayorista`, tablas `Presupuesto` y `PresupuestoItem`. **Dashboard**: campo «Precio mayorista» en Ecommerce → Productos.
- **Orden de despliegue**: primero la API (nuevo módulo + DTO de producto), luego dashboard y web; si la web sale antes, «Pedir presupuesto» falla con 404.
- **Fase 2 pendiente**: PDF generado en servidor, envío por correo al cliente y pantalla de Presupuestos en el dashboard (estado, seguimiento por el área comercial).

## 2026-10-04 — Tickets en 2 pasos con evidencia; formulario de contacto simple vs completo

- **Web**: `/tickets` ahora es un formulario en 2 pasos: (1) tipo de caso + datos de contacto, (2) n.º de compra/pedido, fecha, producto, boleta/factura, descripción y **evidencia** (fotos o PDF, hasta 8 archivos de 10 MB). Las fotos suben por `POST /api/evidencia` → API `POST /public/uploads/evidencia` (imágenes JPG/PNG/WEBP/GIF o PDF ≤ 10 MB, validados por su firma real; tope 30 subidas / 10 min por IP, guardadas en `uploads/<marca>/evidencias/` con nombre UUID) y sus URLs viajan en el mensaje del ticket (sigue entrando como contacto/reclamo hasta que exista el módulo de tickets).
- **Contacto**: el formulario **completo** (selector de motivo, a todo ancho) es solo de `/contacto` (`<Contact completo />`); el resto de páginas usan el **simple** (campos básicos + tarjetas de datos) y mandan la ruta de origen en `origen`.
