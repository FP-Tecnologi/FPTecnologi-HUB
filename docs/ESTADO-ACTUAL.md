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
