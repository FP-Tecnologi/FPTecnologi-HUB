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

Sorpresa al revisar `apps/web`: el login real (`AuthContext.tsx`,
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
- **Distinto de nombres**: `apps/web` contiene el dashboard (copia de
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
- **Rebrand de plantilla a FPTecnologi-HUB**: `apps/web/package.json`
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
